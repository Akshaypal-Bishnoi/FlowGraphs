import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row">
      {/* Decorative Side */}
      <div className="hidden md:flex flex-1 bg-surface border-r border-edge flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="w-64 h-64 border border-primary/20 rounded-full absolute -top-20 -left-20 animate-pulse" />
        <div className="w-96 h-96 border border-blue-400/20 rounded-full absolute -bottom-32 -right-32 animate-pulse delay-700" />
        
        <div className="relative z-10 text-center max-w-sm flex flex-col items-center">
          <img src="/logo.png" alt="FlowGraph" className="w-24 h-24 rounded-2xl mb-6 shadow-lg shadow-primary/20" />
          <h2 className="text-3xl font-bold text-content mb-4">Welcome to FlowGraphs</h2>
          <p className="text-dim">The ultimate visual orchestration layer for modern AI pipelines and agents.</p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 max-w-xl w-full mx-auto relative">
        <Link to="/" className="absolute top-8 left-8 text-dim hover:text-content transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-dim mb-8">{isLogin ? 'Sign in to access your pipelines.' : 'Sign up to start building.'}</p>
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dim uppercase tracking-wider">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-elevated border border-edge rounded-lg px-4 py-2.5 text-content outline-none focus:border-primary transition-colors" placeholder="John Doe" />
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dim uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-elevated border border-edge rounded-lg px-4 py-2.5 text-content outline-none focus:border-primary transition-colors" placeholder="name@example.com" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dim uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-elevated border border-edge rounded-lg px-4 py-2.5 text-content outline-none focus:border-primary transition-colors" placeholder="••••••••" />
            </div>

            <button type="submit" className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/20">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-dim mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
