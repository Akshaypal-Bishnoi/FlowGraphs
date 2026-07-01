from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque
import asyncio
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
import logging
from core.mcp_manager import mcp_manager
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MCP servers and load tools on startup
    logger.info("Initializing MCP Connections...")
    await mcp_manager.connect_all()
    await mcp_manager.load_tools()
    yield
    # Cleanup on shutdown
    await mcp_manager.cleanup()

app = FastAPI(title="FlowGraphs AI Engine", lifespan=lifespan)

# Allow Gateway (or any origin) to make requests to the Engine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

def is_dag(nodes: List[Dict], edges: List[Dict]) -> bool:
    """Validate if the pipeline is a Directed Acyclic Graph (DAG) using Kahn's algorithm."""
    node_ids = {node["id"] for node in nodes}
    if not node_ids:
        return True

    adj = defaultdict(list)
    in_degree = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        source = edge.get("source", "")
        target = edge.get("target", "")
        if source in node_ids and target in node_ids:
            adj[source].append(target)
            in_degree[target] += 1

    queue = deque([nid for nid in node_ids if in_degree[nid] == 0])
    visited_count = 0

    while queue:
        node = queue.popleft()
        visited_count += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited_count == len(node_ids)

@app.get("/health")
def read_health():
    return {"status": "ok", "service": "engine"}

@app.post("/validate")
def validate_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(pipeline.nodes, pipeline.edges)
    return {"num_nodes": num_nodes, "num_edges": num_edges, "is_dag": dag}

from core.executor import PipelineExecutor

@app.post("/execute")
async def execute_pipeline(pipeline: Pipeline):
    if not is_dag(pipeline.nodes, pipeline.edges):
        return {"error": "Pipeline contains a cycle and cannot be executed."}
        
    executor = PipelineExecutor(pipeline.model_dump())
    
    # We await the run here for simplicity, but in production this might be spun off as a background task
    # while returning an immediate 202 Accepted.
    results = await executor.run()
    
    return {"status": "SUCCESS", "results": results}
