import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, FolderOpen, Play, ArrowLeft, Trash2, LogOut, Users, Headset, TrendingUp, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePipelineStore } from '../store/pipelineStore';
import { templates } from '../data/templates';

export const DashboardPage = () => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const loadTemplate = usePipelineStore(state => state.loadTemplate);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchPipelines = () => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetch('http://localhost:3000/api/pipelines', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setPipelines(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent card click
    if (!confirm('Are you sure you want to delete this pipeline?')) return;
    
    try {
      await fetch(`http://localhost:3000/api/pipelines/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPipelines(); // refresh list
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };
  return (
    <div className="min-h-screen bg-base text-content flex flex-col">
      <nav className="h-14 border-b border-edge px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-dim hover:text-content transition-colors" title="Go Back">
            <ArrowLeft size={18} />
          </button>
          <div className="w-px h-5 bg-edge"></div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FlowGraph" className="w-10 h-10 rounded-lg shadow-sm" />
            <span className="font-bold tracking-tight">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-dim hover:text-content" title="Settings"><Settings size={18} /></button>
          <div className="w-8 h-8 rounded-full bg-elevated border border-edge flex items-center justify-center font-medium" title={user?.name}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button onClick={handleLogout} className="text-dim hover:text-danger ml-2" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Templates Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-xl font-bold">Business Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(t => {
              const Icon = t.icon === 'Users' ? Users : t.icon === 'Headset' ? Headset : TrendingUp;
              return (
                <div 
                  key={t.id} 
                  onClick={() => {
                    loadTemplate(t);
                    navigate('/editor/new', { state: { fromTemplate: true } });
                  }}
                  className="bg-card border border-edge rounded-xl p-5 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-primary/10"
                >
                  <div className={`w-10 h-10 rounded-lg ${t.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t.name}</h3>
                  <p className="text-sm text-dim leading-relaxed">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-edge mb-8"></div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Pipelines</h2>
            <p className="text-dim text-sm">Manage and execute your AI workflows.</p>
          </div>
          <Link to="/editor/new" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary/20">
            <Plus size={16} /> New Pipeline
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-dim">Loading pipelines...</div>
          ) : pipelines.length === 0 ? (
            <div className="text-dim">No pipelines found. Create one!</div>
          ) : (
            pipelines.map(p => (
              <PipelineCard 
                key={p.id}
                name={p.name} 
                status="IDLE" 
                time={new Date(p.updatedAt).toLocaleDateString()} 
                nodes={p.nodes ? p.nodes.length : 0} 
                onClick={() => navigate(`/editor/${p.id}`)}
                onDelete={(e) => handleDelete(e, p.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const PipelineCard = ({ name, status, time, nodes, onClick, onDelete }) => {
  const statusColor = status === 'SUCCESS' ? 'text-success bg-success/10' : status === 'FAILED' ? 'text-danger bg-danger/10' : 'text-dim bg-elevated';
  
  return (
    <div onClick={onClick} className="bg-card border border-edge rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer relative shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <FolderOpen size={20} />
        </div>
        <button 
          onClick={onDelete}
          className="text-dim hover:text-danger p-1.5 rounded-md hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Pipeline"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <h3 className="font-bold text-lg mb-1 truncate">{name}</h3>
      <div className="flex items-center gap-3 text-xs font-medium text-dim mb-6">
        <span>{nodes} Nodes</span>
        <span>•</span>
        <span>Updated {time}</span>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-edge/50">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
          {status}
        </span>
        <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <Play size={14} fill="currentColor" /> Run
        </button>
      </div>
    </div>
  );
};
