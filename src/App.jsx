import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabase';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Auth from './pages/Auth';
import { Box, LogOut } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Mevcut oturumu al
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-gray-100">
        <nav className="border-b border-white/5 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-glow">
              <Box size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">CAPSULNIGHT</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden md:block">{session.user.email}</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <LogOut size={16} /> Çıkış
            </button>
          </div>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;