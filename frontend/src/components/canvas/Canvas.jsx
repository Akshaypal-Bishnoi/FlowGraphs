import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { usePipelineStore } from '../../store/pipelineStore';
import { useUIStore } from '../../store/uiStore';
import { shallow } from 'zustand/shallow';
import { nodeConfigs } from '../../nodes/nodeConfigs';
import { CustomEdge } from './CustomEdge';
import { TextNode } from '../../nodes/TextNode';
import {
  InputNode, OutputNode, LLMNode, APIRequestNode, ConditionalNode,
  MergeNode, NoteNode, TimerNode, RAGNode, AgentNode, WebSearchNode,
  MCPToolNode, WebhookNode, CodeRunnerNode
} from '../../nodes/GenericNodes';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const categoryAccentColors = {
  input:     '#6366f1',
  model:     '#8b5cf6',
  ai:        '#8b5cf6',
  output:    '#22c55e',
  transform: '#f59e0b',
  logic:     '#f43f5e',
  utility:   '#06b6d4',
};

const nodeColor = (node) => {
  const nodeType = node.data?.nodeType || node.type;
  const config = nodeConfigs[nodeType];
  if (config) {
    return categoryAccentColors[config.category] || '#6366f1';
  }
  return '#6366f1';
};

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  apiRequest: APIRequestNode,
  conditional: ConditionalNode,
  merge: MergeNode,
  note: NoteNode,
  timer: TimerNode,
  ragQuery: RAGNode,
  agent: AgentNode,
  webSearch: WebSearchNode,
  mcpTool: MCPToolNode,
  webhook: WebhookNode,
  codeRunner: CodeRunnerNode
};

const edgeTypes = {
  custom: CustomEdge,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  loadedWorkflowTrigger: state.loadedWorkflowTrigger,
});

export const Canvas = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const theme = useUIStore(state => state.theme);
  
  const {
    nodes, edges, getNodeID, addNode, onNodesChange,
    onEdgesChange, onConnect, loadedWorkflowTrigger,
  } = usePipelineStore(selector, shallow);

  useEffect(() => {
    if (reactFlowInstance && loadedWorkflowTrigger > 0) {
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 50);
    }
  }, [loadedWorkflowTrigger, reactFlowInstance]);

  const getInitNodeData = useCallback((nodeID, type) => {
    const config = nodeConfigs[type];
    const defaults = config?.getDefaults?.(nodeID) || {};
    const fieldDefaults = {};
    if (config?.fields) {
      config.fields.forEach((field) => {
        if (field.default !== undefined) fieldDefaults[field.name] = field.default;
      });
    }
    return { id: nodeID, nodeType: type, ...fieldDefaults, ...defaults };
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const appDataStr = event.dataTransfer?.getData('application/reactflow');
      if (!appDataStr) return;
      
      const appData = JSON.parse(appDataStr);
      const type = appData?.nodeType;
      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(type);
      addNode({
        id: nodeID,
        type,
        position,
        data: getInitNodeData(nodeID, type),
        dragHandle: '.custom-drag-handle',
      });
    },
    [reactFlowInstance, getNodeID, addNode, getInitNodeData]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) usePipelineStore.getState().undo();
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) usePipelineStore.getState().redo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        deleteKeyCode={['Backspace', 'Delete']}
        elementsSelectable={true}
      >
        <Background variant="dots" color={theme === 'light' ? '#94a3b8' : '#3f3f46'} gap={gridSize} size={1.5} />
        <Controls 
          showInteractive={false}
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme === 'light' ? '#d0d7de' : '#27272a',
          }}
        />
        <MiniMap 
          nodeColor={nodeColor}
          nodeStrokeWidth={0}
          nodeBorderRadius={4}
          maskColor={theme === 'light' ? 'rgba(203, 213, 225, 0.75)' : 'rgba(0, 0, 0, 0.72)'}
          style={{ 
            backgroundColor: theme === 'light' ? '#ffffff' : '#161620', 
            border: theme === 'light' ? '1px solid #94a3b8' : '1px solid #3f3f46',
            borderRadius: '12px', 
            overflow: 'hidden',
          }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Node/Edge Count Badge */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-elevated/80 backdrop-blur border border-edge rounded-full px-4 py-1.5 shadow-lg text-xs font-medium text-dim">
          <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
          <span className="w-1 h-1 rounded-full bg-edge-hover" />
          <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};
