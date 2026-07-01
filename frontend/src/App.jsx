import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { io } from 'socket.io-client'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditorPage } from './pages/EditorPage'
import { useUIStore } from './store/uiStore'
import { usePipelineStore } from './store/pipelineStore'

const socket = io('http://localhost:3000');

function App() {
  const theme = useUIStore((state) => state.theme);
  const updateNodeField = usePipelineStore((state) => state.updateNodeField);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Socket.IO event listeners
    socket.on('connect', () => console.log('Connected to Gateway WS'));
    
    socket.on('execution_update', (data) => {
      console.log('Real-time node update:', data);
      if (data.node_id) {
        updateNodeField(data.node_id, 'executionStatus', data.status);
        if (data.data) {
          updateNodeField(data.node_id, 'executionResult', data.data);
        }
      }
    });

    return () => {
      socket.off('connect');
      socket.off('execution_update');
    };
  }, [theme, updateNodeField]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base text-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
