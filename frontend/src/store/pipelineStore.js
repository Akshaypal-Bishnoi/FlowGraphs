import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow';

export const usePipelineStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  history: [],
  future: [],
  loadedWorkflowTrigger: 0,
  currentPipelineId: null,
  pipelineName: 'Untitled Pipeline',
  isSaving: false,
  
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    get().saveHistory();
    set({ nodes: [...get().nodes, node] });
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get().saveHistory();
    set({
      edges: addEdge({
        ...connection, 
        type: 'custom', 
        animated: true, 
        markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
      }, get().edges),
    });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    get().saveHistory();
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, [fieldName]: fieldValue };
        }
        return node;
      }),
    });
  },

  removeNode: (nodeId) => {
    get().saveHistory();
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },

  removeEdge: (edgeId) => {
    get().saveHistory();
    set({ edges: get().edges.filter((edge) => edge.id !== edgeId) });
  },

  saveHistory: () => {
    const { nodes, edges, nodeIDs } = get();
    set((state) => ({
      history: [...state.history, { nodes, edges, nodeIDs }].slice(-50),
      future: []
    }));
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        history: state.history.slice(0, -1),
        future: [{ nodes: state.nodes, edges: state.edges, nodeIDs: state.nodeIDs }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
        nodeIDs: previous.nodeIDs
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        future: state.future.slice(1),
        history: [...state.history, { nodes: state.nodes, edges: state.edges, nodeIDs: state.nodeIDs }],
        nodes: next.nodes,
        edges: next.edges,
        nodeIDs: next.nodeIDs
      };
    });
  },

  setPipelineName: (name) => set({ pipelineName: name }),

  savePipeline: async () => {
    const state = get();
    set({ isSaving: true });
    try {
      const payload = {
        name: state.pipelineName,
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs
      };
      
      const url = state.currentPipelineId 
        ? `http://localhost:3000/api/pipelines/${state.currentPipelineId}`
        : `http://localhost:3000/api/pipelines`;
      
      const method = state.currentPipelineId ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('flowgraphs_token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save pipeline');
      const data = await res.json();
      
      set({ currentPipelineId: data.id, pipelineName: data.name });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  loadPipeline: async (id) => {
    try {
      const token = localStorage.getItem('flowgraphs_token');
      const res = await fetch(`http://localhost:3000/api/pipelines/${id}`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
      });
      if (!res.ok) throw new Error('Failed to load pipeline');
      const data = await res.json();
      
      set({
        currentPipelineId: data.id,
        pipelineName: data.name,
        nodes: data.nodes || [],
        edges: data.edges || [],
        nodeIDs: data.nodeIDs || {},
        history: [],
        future: []
      });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  loadTemplate: (template) => {
    set({
      currentPipelineId: null,
      pipelineName: template.name + ' (Copy)',
      nodes: template.nodes,
      edges: template.edges,
      nodeIDs: template.nodeIDs,
      history: [],
      future: []
    });
  },

  resetPipeline: () => {
    set({
      currentPipelineId: null,
      pipelineName: 'Untitled Pipeline',
      nodes: [],
      edges: [],
      nodeIDs: {},
      history: [],
      future: []
    });
  }
}));
