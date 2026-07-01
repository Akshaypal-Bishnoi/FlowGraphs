import React from 'react';
import { DraggableNode } from './DraggableNode';
import { useUIStore } from '../../store/uiStore';
import { nodeConfigs } from '../../nodes/nodeConfigs';

const nodeGroups = [
  { label: 'I/O', types: ['customInput', 'customOutput', 'webhook'] },
  { label: 'Models & Agents', types: ['llm', 'agent'] },
  { label: 'RAG & Knowledge', types: ['ragQuery', 'webSearch'] },
  { label: 'Tools & Integrations', types: ['mcpTool', 'apiRequest', 'codeRunner', 'email'] },
  { label: 'Transform & Logic', types: ['text', 'conditional', 'merge', 'loop', 'transform'] },
  { label: 'Utility', types: ['timer', 'note'] },
];

export const Sidebar = () => {
  const sidebarOpen = useUIStore(state => state.sidebarOpen);

  return (
    <div className={`bg-card border-edge flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64 border-r opacity-100' : 'w-0 border-r-0 opacity-0'}`}>
      <div className="p-4 border-b border-edge bg-surface/50">
        <h2 className="text-sm font-bold tracking-wider text-dim uppercase">Nodes Library</h2>
        <p className="text-xs text-dim/70 mt-1">Drag and drop nodes onto the canvas to build your pipeline.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
        {nodeGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">{group.label}</h3>
            <div className="flex flex-col gap-2">
              {group.types.map(type => {
                const config = nodeConfigs[type];
                if (!config) return null; // Fallback for unimplemented nodes
                return <DraggableNode key={type} type={type} label={config.label} icon={config.icon} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
