import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Code, Bot, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const LandingPage = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="min-h-screen bg-base text-content flex flex-col relative overflow-hidden">
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse delay-1000"></div>

      {/* Glassmorphism Navbar */}
      <nav className="h-16 border-b border-edge/50 bg-base/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="FlowGraph" className="w-10 h-10 rounded-xl object-cover shadow-md shadow-primary/20" />
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-content to-dim">FlowGraphs</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-md hover:bg-surface text-dim hover:text-content transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/dashboard" className="p-2 rounded-md hover:bg-surface text-dim hover:text-content transition-colors" title="Dashboard">
            <LayoutDashboard size={18} />
          </Link>
          <div className="w-px h-5 bg-edge"></div>
          <Link to="/auth" className="px-5 py-2 text-sm font-semibold hover:text-primary transition-colors">Login</Link>
          <Link to="/editor/new" className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">Try Editor</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto relative z-10 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated border border-edge text-sm font-medium text-dim mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          Now with MCP Integration & CRAG Agents
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Build AI Workflows <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Without Writing Code</span>
        </h1>
        
        <p className="text-lg md:text-xl text-dim mb-12 max-w-2xl leading-relaxed">
          Design, connect, and execute production-grade AI pipelines. Featuring parallel DAG execution, autonomous LangGraph agents, and real-time execution streaming.
        </p>

        <div className="flex gap-4">
          <Link to="/editor/new" className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-indigo-600 text-white font-semibold text-lg rounded-2xl transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:-translate-y-1">
            Start Building Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Floating preview graphic */}
        <div className="w-full h-80 md:h-[450px] mt-16 rounded-3xl border border-edge/30 bg-gradient-to-t from-surface to-transparent shadow-2xl relative overflow-hidden flex items-end justify-center">
            <div className="w-[90%] h-[90%] bg-base border border-edge rounded-t-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Fake Canvas Workflow */}
                <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center p-4 gap-4 md:gap-8 select-none pointer-events-none scale-75 md:scale-100 transform origin-bottom md:origin-center">
                  
                  {/* Fake Input Node */}
                  <div className="w-64 bg-card border border-edge rounded-xl shadow-lg flex flex-col relative z-10 shrink-0">
                    <div className="h-10 border-b border-edge flex items-center px-4 justify-between bg-surface/50 rounded-t-xl">
                      <span className="text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Custom Input</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3 text-left">
                      <div className="text-[10px] font-semibold text-dim uppercase">Prospect Info</div>
                      <div className="bg-elevated px-3 py-2 rounded text-xs border border-edge text-content">lead_data</div>
                      <div className="text-[10px] font-semibold text-dim uppercase mt-1">Value</div>
                      <div className="bg-elevated px-3 py-2 rounded text-xs border border-edge text-content text-dim italic truncate">"Akshay, VP Marketing at DynGraph"</div>
                    </div>
                    <div className="absolute right-[-7px] top-[50%] mt-[-6px] w-3 h-3 bg-edge border-2 border-card rounded-full hidden md:block"></div>
                  </div>

                  {/* Wire 1 */}
                  <div className="hidden md:block w-12 h-1 bg-edge rounded-full relative">
                     <div className="absolute inset-0 bg-primary/60 rounded-full w-full animate-pulse"></div>
                  </div>

                  {/* Fake Agent Node */}
                  <div className="w-72 bg-card border border-primary/40 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col relative z-10 shrink-0 md:-translate-y-4">
                    <div className="h-10 border-b border-primary/20 flex items-center px-4 justify-between bg-primary/10 rounded-t-xl">
                      <span className="text-sm font-bold flex items-center gap-2 text-primary"><Bot size={14}/> ReAct Agent</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-primary/20 text-primary rounded animate-pulse">Running</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3 text-left">
                      <div className="text-[10px] font-semibold text-dim uppercase">System Prompt</div>
                      <div className="bg-elevated/50 px-3 py-2 rounded text-[11px] border border-edge/50 text-dim italic">"Research this prospect and draft a personalized cold email..."</div>
                      <div className="text-[10px] font-semibold text-dim uppercase mt-1">Tools Mounted</div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-surface border border-edge rounded text-[10px] text-content">mcp_web_search</span>
                        <span className="px-2 py-1 bg-surface border border-edge rounded text-[10px] text-content">mcp_linkedin</span>
                      </div>
                    </div>
                    <div className="absolute left-[-7px] top-[50%] mt-[-6px] w-3 h-3 bg-primary/50 border-2 border-card rounded-full hidden md:block"></div>
                    <div className="absolute right-[-7px] top-[50%] mt-[-6px] w-3 h-3 bg-primary border-2 border-card rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] hidden md:block"></div>
                  </div>

                  {/* Wire 2 */}
                  <div className="hidden md:block w-12 h-1 bg-primary/50 rounded-full relative">
                     <div className="absolute inset-0 bg-primary rounded-full w-full animate-pulse delay-75"></div>
                  </div>

                  {/* Fake Output Node */}
                  <div className="w-64 bg-card border border-edge rounded-xl shadow-lg flex flex-col relative z-10 shrink-0">
                    <div className="h-10 border-b border-edge flex items-center px-4 justify-between bg-surface/50 rounded-t-xl">
                      <span className="text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Custom Output</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3 text-left">
                      <div className="text-[10px] font-semibold text-dim uppercase">Email Draft</div>
                      <div className="bg-success/10 px-3 py-3 rounded text-[10px] border border-success/30 text-success/90 leading-relaxed italic">
                        "Hi Akshay, loved your recent post on DynGraph's Q3 growth. I noticed your team is scaling fast..."
                      </div>
                    </div>
                    <div className="absolute left-[-7px] top-[50%] mt-[-6px] w-3 h-3 bg-primary/50 border-2 border-card rounded-full hidden md:block"></div>
                  </div>
                  
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full text-left">
          <FeatureCard icon={<Zap className="text-primary" />} title="Parallel Execution" desc="Topological sort + asyncio ensures nodes run concurrently whenever possible." />
          <FeatureCard icon={<Bot className="text-success" />} title="Agentic Workflows" desc="Built-in ReAct and Corrective RAG agents powered by LangGraph." />
          <FeatureCard icon={<Code className="text-blue-400" />} title="MCP Integration" desc="Connect to any external Model Context Protocol server instantly." />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-card/80 backdrop-blur-sm border border-edge/50 rounded-3xl hover:border-primary/50 hover:bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group cursor-default">
    <div className="w-14 h-14 rounded-2xl bg-surface border border-edge/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-dim text-sm leading-relaxed">{desc}</p>
  </div>
);
