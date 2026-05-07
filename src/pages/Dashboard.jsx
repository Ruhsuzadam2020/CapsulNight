import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { Plus, Folder, Search, Trash2, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from('projects').insert([{ name, status: 'Planlama' }]);
    if (!error) { setName(""); fetchProjects(); }
  };

  const deleteProject = async (id, e) => {
    e.preventDefault(); // Link'e tıklanmasını engelle
    if(window.confirm("Bu kapsülü yok etmek istediğine emin misin?")) {
      await supabase.from('projects').delete().eq('id', id);
      fetchProjects();
    }
  };

  // Arama Filtrelemesi
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-extrabold mb-4">Capsul<span className="text-blue-500">Night</span></h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" placeholder="Kapsüllerde ara..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#16161a] border border-white/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 bg-[#16161a] p-2 rounded-2xl border border-white/5 w-full md:w-auto">
          <input 
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Yeni Kapsül Adı..." className="bg-transparent px-4 py-2 outline-none flex-1 text-white"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold transition-all whitespace-nowrap">Yarat</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <Link to={`/project/${p.id}`} key={p.id} className="group relative bg-[#16161a] rounded-3xl p-6 border border-white/5 hover:border-blue-500/50 transition-all shadow-xl overflow-hidden">
            <div className="flex justify-between mb-6">
              <Folder size={24} className="text-blue-500" />
              <button onClick={(e) => deleteProject(p.id, e)} className="text-gray-600 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-xl font-bold mb-4">{p.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">{p.status}</span>
              <ChevronRight size={16} className="text-gray-700 group-hover:text-blue-500 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}