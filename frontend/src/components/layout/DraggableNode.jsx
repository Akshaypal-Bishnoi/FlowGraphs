import React from 'react';

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 bg-elevated border border-edge rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all group"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-surface text-dim group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-content">{label}</span>
    </div>
  );
};
