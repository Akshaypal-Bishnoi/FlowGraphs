import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Canvas } from '../components/canvas/Canvas';
import { usePipelineStore } from '../store/pipelineStore';

export const EditorPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { loadPipeline, resetPipeline } = usePipelineStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (id === 'new') {
        if (!location.state?.fromTemplate) {
          resetPipeline();
        }
      } else if (id) {
        try {
          await loadPipeline(id);
        } catch (e) {
          console.error("Failed to load pipeline:", e);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, loadPipeline, resetPipeline]);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-base text-dim">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-base text-content">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <Canvas />
      </div>
    </div>
  );
};
