export const nodeConfigs = {
  customInput: {
    label: 'Input',
    icon: '📥',
    category: 'input',
    description: 'Provide dynamic input values (text or file) that feed into the pipeline.',
    fields: [
      { name: 'inputName', type: 'text', label: 'Name' },
      { name: 'inputType', type: 'select', label: 'Type', options: ['Text', 'File'], default: 'Text' },
      { name: 'value', type: 'textarea', label: 'Value' },
    ],
    handles: { inputs: [], outputs: [{ id: 'value', label: 'Value' }] },
    getDefaults: (id) => ({ inputName: id.replace('customInput-', 'input_'), inputType: 'Text', value: '' }),
  },
  
  customOutput: {
    label: 'Output',
    icon: '📤',
    category: 'output',
    description: 'Capture and format the final output of the pipeline (e.g., Text or Image).',
    fields: [
      { name: 'outputName', type: 'text', label: 'Name' },
      { name: 'outputType', type: 'select', label: 'Type', options: ['Text', 'Image'], default: 'Text' },
    ],
    handles: { inputs: [{ id: 'value', label: 'Value' }], outputs: [] },
    getDefaults: (id) => ({ outputName: id.replace('customOutput-', 'output_'), outputType: 'Text' }),
  },

  llm: {
    label: 'LLM',
    icon: '🤖',
    category: 'model',
    description: 'Generates text using an LLM (OpenAI / Gemini).',
    fields: [
      { name: 'model', type: 'select', label: 'Model', options: ['gpt-4o-mini', 'gpt-4o', 'gemini-1.5-flash'], default: 'gpt-4o-mini' }
    ],
    handles: {
      inputs: [{ id: 'system', label: 'System' }, { id: 'prompt', label: 'Prompt' }],
      outputs: [{ id: 'response', label: 'Response' }],
    },
    getDefaults: () => ({ model: 'gpt-4o-mini' })
  },

  text: {
    label: 'Text',
    icon: '📝',
    category: 'transform',
    description: 'A dynamic text template. Wrap words in {{ }} to automatically create input variables.',
    fields: [], // Dynamic fields managed by component
    handles: { inputs: [], outputs: [{ id: 'output', label: 'Output' }] },
    getDefaults: () => ({ text: '{{input}}' }),
  },

  apiRequest: {
    label: 'API Request',
    icon: '🌐',
    category: 'transform',
    description: 'Make outbound HTTP requests to external APIs.',
    fields: [
      { name: 'method', type: 'select', label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { name: 'url', type: 'text', label: 'URL' },
    ],
    handles: {
      inputs: [{ id: 'body', label: 'Body' }],
      outputs: [{ id: 'response', label: 'Response' }],
    },
    getDefaults: () => ({ method: 'GET', url: 'https://api.example.com' }),
  },

  conditional: {
    label: 'Conditional',
    icon: '🔀',
    category: 'logic',
    description: 'Branch the pipeline based on logical conditions.',
    fields: [
      { name: 'operator', type: 'select', label: 'Operator', options: ['equals', 'not equals', 'contains', 'greater than', 'less than'], default: 'equals' },
      { name: 'compareValue', type: 'text', label: 'Compare Value' },
    ],
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }],
    },
    getDefaults: () => ({ operator: 'equals', compareValue: '' }),
  },

  merge: {
    label: 'Merge',
    icon: '🔗',
    category: 'transform',
    description: 'Combine multiple inputs into a single output.',
    fields: [
      { name: 'strategy', type: 'select', label: 'Strategy', options: ['Concatenate', 'JSON Merge', 'Array'], default: 'Concatenate' },
    ],
    handles: {
      inputs: [{ id: 'inputA', label: 'Input A' }, { id: 'inputB', label: 'Input B' }, { id: 'inputC', label: 'Input C' }],
      outputs: [{ id: 'combined', label: 'Combined' }],
    },
    getDefaults: () => ({ strategy: 'Concatenate' }),
  },

  note: {
    label: 'Note',
    icon: '📌',
    category: 'utility',
    description: 'Add comments or annotations to your pipeline canvas.',
    fields: [
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'color', type: 'select', label: 'Color', options: ['yellow', 'blue', 'green', 'pink'], default: 'yellow' },
    ],
    handles: { inputs: [], outputs: [] },
    getDefaults: () => ({ content: 'Add your notes here...', color: 'yellow' }),
  },

  timer: {
    label: 'Timer',
    icon: '⏱️',
    category: 'utility',
    description: 'Pause the pipeline execution.',
    fields: [
      { name: 'duration', type: 'slider', label: 'Duration', min: 0, max: 60, step: 1, default: 5 },
      { name: 'unit', type: 'select', label: 'Unit', options: ['ms', 's', 'min'], default: 's' },
    ],
    handles: { inputs: [{ id: 'trigger', label: 'Trigger' }], outputs: [{ id: 'done', label: 'Done' }] },
    getDefaults: () => ({ duration: 5, unit: 's' }),
  },

  // some advanced node.
  
  ragQuery: {
    label: 'RAG Query',
    icon: '📚',
    category: 'ai',
    description: 'Query a ChromaDB vector store collection.',
    fields: [
      { name: 'collection', type: 'text', label: 'Collection Name' },
      { name: 'topK', type: 'slider', label: 'Top K Results', min: 1, max: 10, step: 1, default: 3 },
    ],
    handles: {
      inputs: [{ id: 'query', label: 'Query' }],
      outputs: [{ id: 'context', label: 'Context' }, { id: 'sources', label: 'Sources' }],
    },
    getDefaults: () => ({ collection: 'default', topK: 3 }),
  },

  agent: {
    label: 'Agent',
    icon: '🧠',
    category: 'ai',
    description: 'Run an autonomous LangGraph ReAct Agent.',
    fields: [
      { name: 'agentType', type: 'select', label: 'Agent Type', options: ['Standard ReAct', 'CRAG (Corrective)'], default: 'Standard ReAct' }
    ],
    handles: {
      inputs: [{ id: 'prompt', label: 'Prompt' }, { id: 'tools', label: 'Tools Array' }],
      outputs: [{ id: 'response', label: 'Response' }],
    },
    getDefaults: () => ({ agentType: 'Standard ReAct' }),
  },

  webSearch: {
    label: 'Web Search',
    icon: '🔍',
    category: 'ai',
    description: 'Perform a web search using Tavily.',
    fields: [
      { name: 'searchDepth', type: 'select', label: 'Depth', options: ['basic', 'advanced'], default: 'basic' }
    ],
    handles: {
      inputs: [{ id: 'query', label: 'Query' }],
      outputs: [{ id: 'results', label: 'Results' }],
    },
    getDefaults: () => ({ searchDepth: 'basic' }),
  },

  mcpTool: {
    label: 'MCP Tool',
    icon: '🔧',
    category: 'ai',
    description: 'Invoke an external Model Context Protocol tool.',
    fields: [
      { name: 'server', type: 'text', label: 'MCP Server' },
      { name: 'toolName', type: 'text', label: 'Tool Name' },
    ],
    handles: {
      inputs: [{ id: 'args', label: 'Arguments (JSON)' }],
      outputs: [{ id: 'result', label: 'Result' }],
    },
    getDefaults: () => ({ server: 'github-mcp', toolName: 'search_repos' }),
  },

  webhook: {
    label: 'Webhook',
    icon: '🪝',
    category: 'input',
    description: 'Trigger the pipeline via external webhook.',
    fields: [
      { name: 'route', type: 'text', label: 'Custom Route' }
    ],
    handles: {
      inputs: [],
      outputs: [{ id: 'payload', label: 'Payload' }],
    },
    getDefaults: () => ({ route: '/my-webhook' }),
  },

  codeRunner: {
    label: 'Code Runner',
    icon: '💻',
    category: 'utility',
    description: 'Execute Python code in a secure sandbox.',
    fields: [], // Typically has an integrated code editor component
    handles: {
      inputs: [{ id: 'input', label: 'Input' }],
      outputs: [{ id: 'output', label: 'Output' }],
    },
    getDefaults: () => ({ code: 'def main(input):\n    return input' }),
  }
};
