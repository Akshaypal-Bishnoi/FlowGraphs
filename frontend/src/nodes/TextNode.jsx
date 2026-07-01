import React, { useState, useEffect } from 'react';
import { BaseNode } from './BaseNode';
import { nodeConfigs } from './nodeConfigs';
import { usePipelineStore } from '../store/pipelineStore';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

export const TextNode = ({ id, data }) => {
  const updateNodeField = usePipelineStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const [text, setText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);

  // Extract {{variables}} from text
  useEffect(() => {
    const regex = /{{(.*?)}}/g;
    const matches = [...text.matchAll(regex)].map(m => m[1].trim()).filter(Boolean);
    const uniqueVars = [...new Set(matches)];
    
    setVariables(uniqueVars);
    
    if (text !== data?.text) {
      updateNodeField(id, 'text', text);
    }
    
    // tell react flow to update handles
    updateNodeInternals(id);
  }, [text, id, updateNodeField, updateNodeInternals, data?.text]);

  // Clone config to add dynamic handles
  const config = { ...nodeConfigs.text };
  config.handles = {
    inputs: variables.map(v => ({ id: v, label: v })),
    outputs: [{ id: 'output', label: 'Output' }]
  };

  return (
    <BaseNode id={id} data={data} config={config}>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs font-semibold text-dim uppercase tracking-wider">Template Text</label>
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="bg-elevated border border-edge rounded px-3 py-2 text-sm text-content outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all nodrag resize-none w-full min-h-[80px]"
          placeholder="Use {{variable}} syntax..."
        />
      </div>
    </BaseNode>
  );
};
