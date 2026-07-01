import React, { useRef, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, NodeResizeControl } from 'reactflow';
import { usePipelineStore } from '../store/pipelineStore';

const categoryColors = {
  input:     { accent: '#6366f1', bg: 'rgba(99, 102, 241, 0.06)' },
  model:     { accent: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.06)' },
  ai:        { accent: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.06)' },
  output:    { accent: '#22c55e', bg: 'rgba(34, 197, 94, 0.06)' },
  transform: { accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.06)' },
  logic:     { accent: '#f43f5e', bg: 'rgba(244, 63, 94, 0.06)' },
  utility:   { accent: '#06b6d4', bg: 'rgba(6, 182, 212, 0.06)' },
};

export const BaseNode = ({ id, data, config, children }) => {
  const updateNodeField = usePipelineStore((state) => state.updateNodeField);
  const removeNode = usePipelineStore((state) => state.removeNode);
  const selected = usePipelineStore((state) => state.nodes.find(n => n.id === id)?.selected || false);
  const updateNodeInternals = useUpdateNodeInternals();

  const {
    label,
    icon,
    category = 'input',
    fields = [],
    description,
    handles = {},
  } = config;

  const colors = categoryColors[category] || categoryColors.input;
  const inputHandles = handles.inputs || [];
  const outputHandles = handles.outputs || [];

  const renderField = (field) => {
    const value = data?.[field.name] ?? field.default ?? '';
    const onChange = (newValue) => updateNodeField(id, field.name, newValue);

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="node-field">
            <label className="node-field-label">{field.label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="node-field-input nodrag"
              placeholder={field.placeholder || ''}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="node-field">
            <label className="node-field-label">{field.label}</label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="node-field-input nodrag"
            >
              {field.options.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={optVal} value={optVal}>
                    {optLabel}
                  </option>
                );
              })}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="node-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="node-field-label">{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                updateNodeInternals(id);
                onChange(e.target.value);
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                updateNodeInternals(id);
              }}
              className="node-field-input node-field-textarea nodrag"
              rows={3}
              placeholder={field.placeholder || ''}
              style={{ width: '100%', minHeight: '60px', overflowY: 'hidden', resize: 'none' }}
            />
          </div>
        );

      case 'slider':
        return (
          <div key={field.name} className="node-field">
            <div className="node-field-slider-header">
              <label className="node-field-label">{field.label}</label>
              <span className="node-field-slider-value">{value}</span>
            </div>
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="node-field-slider nodrag"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <NodeResizeControl 
        minWidth={280} 
        maxWidth={600}
        position="right"
        style={{ 
          width: '12px', 
          height: '100%',
          border: 'none', 
          background: 'transparent', 
          right: '-6px', 
          top: 0,
          cursor: 'ew-resize', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 100 
        }}
      >
        <div style={{ width: '4px', height: '24px', background: 'var(--color-primary)', borderRadius: '2px' }} />
      </NodeResizeControl>
      <div 
        className="base-node" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          ...(data?.executionStatus === 'RUNNING' && {
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.4), 0 0 24px rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 0.8)'
          }),
          ...(data?.executionStatus === 'SUCCESS' && {
            boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.4), 0 0 24px rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 0.8)'
          })
        }}
      >
        <div className="node-accent" style={{ backgroundColor: colors.accent }} />

      {inputHandles.map((handle, index) => {
        const topPercent = ((index + 1) / (inputHandles.length + 1)) * 100;
        return (
          <Handle
            key={handle.id}
            type="target"
            position={Position.Left}
            id={`${id}-${handle.id}`}
            style={{ top: `${topPercent}%` }}
            className="handle-dot handle-input"
            title={handle.label || handle.id}
          />
        );
      })}

      <div className="node-header custom-drag-handle" style={{ background: colors.bg }}>
        <div
          className="node-icon relative"
          style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}
        >
          {icon}
          {data?.executionStatus === 'RUNNING' && (
            <div className="absolute inset-0 rounded-lg border-2 border-t-primary animate-spin" />
          )}
        </div>
        <span className="node-title">{label}</span>
        
        <div className="node-actions">
          {description && (
            <button className="node-action-btn info" data-tooltip={description}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
          )}
          <button className="node-action-btn delete" onClick={() => removeNode(id)} title="Delete Node">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      {(inputHandles.length > 0 || outputHandles.length > 0) && (
        <div className="node-handles-row">
          <div className="node-handles-left">
            {inputHandles.map((h) => (
              <span key={h.id} className="node-handle-tag input-tag">
                <span className="tag-dot" />
                {h.label}
              </span>
            ))}
          </div>
          <div className="node-handles-right">
            {outputHandles.map((h) => (
              <span key={h.id} className="node-handle-tag output-tag">
                {h.label}
                <span className="tag-dot" />
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="node-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {fields.map(renderField)}
        {children}
        {data?.executionResult && (
          <div className="mt-3 pt-3 border-t border-edge/50">
            <span className="text-[10px] font-bold text-dim mb-1.5 block uppercase tracking-wider">Output</span>
            <div className="text-xs bg-surface/50 p-2 rounded border border-edge font-mono text-content whitespace-pre-wrap overflow-hidden text-ellipsis max-h-48 overflow-y-auto">
              {typeof data.executionResult === 'object' 
                ? (data.executionResult.response || data.executionResult.value || data.executionResult.output || JSON.stringify(data.executionResult, null, 2))
                : String(data.executionResult)}
            </div>
          </div>
        )}
      </div>

      {outputHandles.map((handle, index) => {
        const topPercent = ((index + 1) / (outputHandles.length + 1)) * 100;
        return (
          <Handle
            key={handle.id}
            type="source"
            position={Position.Right}
            id={`${id}-${handle.id}`}
            style={{ top: `${topPercent}%` }}
            className="handle-dot handle-output"
            title={handle.label || handle.id}
          />
        );
      })}
      </div>
    </>
  );
};
