import asyncio
import logging
import operator
from typing import Dict, Any, List, Annotated
from typing_extensions import TypedDict
from collections import defaultdict
from langgraph.graph import StateGraph, END

from .redis_pubsub import publisher
from .node_registry import NODE_REGISTRY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PipelineState(TypedDict):
    results: Annotated[Dict[str, Any], operator.ior]

class PipelineExecutor:
    def __init__(self, pipeline: Dict[str, Any]):
        self.execution_id = pipeline.get("execution_id", "local_run")
        self.nodes = {node['id']: node for node in pipeline.get('nodes', [])}
        self.edges = pipeline.get('edges', [])
        
        self.adj_list = defaultdict(list)
        self.in_degree = {node_id: 0 for node_id in self.nodes}
        self.out_degree = {node_id: 0 for node_id in self.nodes}
        self.incoming_edges = defaultdict(list)
        
        self._build_graph()

    def _build_graph(self):
        for edge in self.edges:
            source = edge.get("source")
            target = edge.get("target")
            if source in self.nodes and target in self.nodes:
                self.adj_list[source].append(target)
                self.incoming_edges[target].append(edge)
                self.in_degree[target] += 1
                self.out_degree[source] += 1

    def _make_node_func(self, node_config: dict):
        async def node_func(state: PipelineState):
            node_id = node_config['id']
            logger.info(f"Executing node {node_id}")
            publisher.publish_execution_update(self.execution_id, node_id, "RUNNING")
            
            # 1. Resolve inputs from incoming edges
            inputs = {}
            for edge in self.incoming_edges[node_id]:
                source = edge['source']
                sourceHandle = edge.get('sourceHandle')
                targetHandle = edge.get('targetHandle')
                
                source_key = sourceHandle.replace(f"{source}-", "") if sourceHandle else "output"
                target_key = targetHandle.replace(f"{node_id}-", "") if targetHandle else "input"
                
                source_outputs = state.get("results", {}).get(source, {})
                inputs[target_key] = source_outputs.get(source_key, "")

            # 2. Execute node logic
            node_type = node_config.get("type", "unknown")
            func = NODE_REGISTRY.get(node_type, NODE_REGISTRY["customInput"])
            
            try:
                output = await func(node_config, inputs)
                publisher.publish_execution_update(self.execution_id, node_id, "SUCCESS", output)
            except Exception as e:
                logger.error(f"Error in node {node_id}: {e}")
                output = {"error": str(e)}
                publisher.publish_execution_update(self.execution_id, node_id, "FAILED", output)
                
            return {"results": {node_id: output}}
            
        return node_func

    async def run(self):
        graph = StateGraph(PipelineState)
        
        # Add all nodes
        for node_id, node_config in self.nodes.items():
            graph.add_node(node_id, self._make_node_func(node_config))
            
        # Add edges
        for edge in self.edges:
            source = edge.get("source")
            target = edge.get("target")
            if source in self.nodes and target in self.nodes:
                graph.add_edge(source, target)
                
        # Define entry and finish points
        for node_id in self.nodes:
            if self.in_degree[node_id] == 0:
                graph.set_entry_point(node_id)
            if self.out_degree[node_id] == 0:
                graph.add_edge(node_id, END)
                
        app = graph.compile()
        
        # Run graph
        logger.info(f"Starting LangGraph execution for {self.execution_id}")
        final_state = await app.ainvoke({"results": {}})
        
        return final_state.get("results", {})
