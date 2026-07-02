import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { usePipelineStore } from '../../store/pipelineStore';
import { Play, Save, Sun, Moon, Home, LayoutDashboard, Menu, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export const Navbar = () => {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useUIStore();
  const { undo, redo, history, future, nodes, edges, updateNodeField, pipelineName, setPipelineName, savePipeline, isSaving, currentPipelineId } = usePipelineStore();
  const [isExecuting, setIsExecuting] = React.useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const data = await savePipeline();
      if (!currentPipelineId && data.id) {
        navigate(`/editor/${data.id}`);
      }
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const executePipeline = async () => {
    setIsExecuting(true);
    
    // Reset all nodes to PENDING status before execution
    nodes.forEach(n => updateNodeField(n.id, 'executionStatus', 'PENDING'));

    try {
      const res = await api.post('/api/pipelines/execute', { nodes, edges });
      console.log('Gateway response:', res.data);
    } catch (e) {
      console.error('Execution failed:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <nav className="h-14 bg-card border-b border-edge px-4 flex items-center justify-between shadow-sm z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-dim hover:text-content transition-colors" title="Home">
          <Home size={18} />
        </Link>
        <Link to="/dashboard" className="text-dim hover:text-content transition-colors" title="Dashboard">
          <LayoutDashboard size={18} />
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-dim hover:text-content hover:bg-elevated rounded-md transition-colors"
        >
          <Menu size={18} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="FlowGraph" className="w-10 h-10 rounded-md" />
          <span className="font-bold text-content tracking-tight">FlowGraphs</span>
        </Link>
        <span className="text-dim text-sm mx-2">/</span>
        <input 
          type="text" 
          value={pipelineName}
          onChange={(e) => setPipelineName(e.target.value)}
          className="text-sm font-medium text-content bg-transparent border-b border-transparent hover:border-edge focus:border-primary outline-none transition-colors px-1 py-0.5 w-48"
        />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={undo} disabled={history.length === 0} className="p-2 text-dim hover:text-content disabled:opacity-50 transition-colors" title="Undo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button onClick={redo} disabled={future.length === 0} className="p-2 text-dim hover:text-content disabled:opacity-50 transition-colors" title="Redo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>

        <div className="w-px h-6 bg-edge mx-2" />

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-elevated text-sm font-medium text-dim hover:text-content transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <button 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-all ${isExecuting ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-indigo-600'}`}
          onClick={executePipeline}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          {isExecuting ? 'Running...' : 'Execute'}
        </button>

        <div className="w-px h-6 bg-edge mx-2" />
        
        <button onClick={toggleTheme} className="p-2 text-dim hover:text-content transition-colors rounded-full hover:bg-elevated">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
};
