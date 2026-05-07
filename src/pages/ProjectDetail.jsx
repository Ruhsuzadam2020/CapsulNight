import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { FileText, Upload, CheckCircle2, Circle, Trash2, ArrowLeft, Download, File, Loader2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAllData(); }, [id]);

  async function fetchAllData() {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single();
    if(!proj) return navigate('/');
    setProject(proj);
    
    const { data: ts } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: true });
    setTasks(ts || []);

    const { data: nt } = await supabase.from('notes').select('*').eq('project_id', id).order('created_at', { ascending: false });
    setNotes(nt || []);

    const { data: fl } = await supabase.from('files').select('*').eq('project_id', id).order('created_at', { ascending: false });
    setFiles(fl || []);
  }

  // --- Dosya İşlemleri ---
const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      // 1. Giriş yapmış kullanıcının bilgisini al (RLS hatasını çözmek için kritik adım)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum açmış kullanıcı bulunamadı.");

      // Dosya isimlendirme ve yol belirleme
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${id}/${fileName}`;

      // 2. Supabase Storage'a (fiziksel depo) yükle
      const { error: uploadError } = await supabase.storage
        .from('capsules')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('capsules')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('files').insert([
        { 
          project_id: id, 
          name: file.name, 
          url: publicUrl,
          user_id: user.id 
        }
      ]);

      if (dbError) throw dbError;

      // Listeyi tazele
      fetchAllData();
    } catch (error) {
      console.error("Hata detayı:", error);
      alert("Dosya yüklenemedi: " + error.message);
    } finally {
      setUploading(false);
    }
  };
  const deleteFile = async (fileId, fileName) => {
    if(!window.confirm("Bu dosyayı silmek istediğine emin misin?")) return;
    
    await supabase.from('files').delete().eq('id', fileId);
    fetchAllData();
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    await supabase.from('tasks').insert([{ project_id: id, text: taskText }]);
    setTaskText(""); fetchAllData();
  };

  const toggleTask = async (taskId, currentStatus) => {
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId);
    fetchAllData();
  };

  if (!project) return <div className="p-20 text-center text-gray-500">Kapsül Yükleniyor...</div>;

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboard'a Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
        
        {/* SOL PANEL */}
        <div className="lg:col-span-1 space-y-6">
          {/* Proje Bilgi Kartı */}
          <div className="p-6 bg-[#16161a] rounded-3xl border border-white/5 shadow-xl">
            <h2 className="text-3xl font-black mb-4 truncate">{project.name}</h2>
            <div className="mb-6">
              <div className="flex justify-between text-[10px] uppercase font-bold mb-2 text-gray-500 tracking-widest">
                <span>Tamamlanma</span>
                <span>%{progress}</span>
              </div>
              <div className="w-full bg-dark-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-700" style={{width: `${progress}%`}}></div>
              </div>
            </div>
            <select 
              value={project.status} 
              onChange={async (e) => {
                await supabase.from('projects').update({ status: e.target.value }).eq('id', id);
                setProject({...project, status: e.target.value});
              }}
              className="w-full bg-[#232329] p-3 rounded-xl text-sm font-semibold outline-none border border-white/5 focus:border-blue-500 transition-colors"
            >
              <option>Planlama</option><option>Geliştirme</option><option>Bitti</option>
            </select>
          </div>

          {/* GÖREV LİSTESİ */}
          <div className="p-6 bg-[#16161a] rounded-3xl border border-white/5 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-500 text-sm uppercase tracking-wider">
              <CheckCircle2 size={18}/> Görev Listesi
            </h3>
            <form onSubmit={addTask} className="mb-4 flex gap-2">
              <input 
                type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)}
                placeholder="Yeni görev..." className="flex-1 bg-[#232329] p-2 rounded-xl text-sm outline-none border border-white/5 focus:border-blue-500/50"
              />
              <button className="bg-blue-600 hover:bg-blue-500 px-3 rounded-xl transition-colors">+</button>
            </form>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scroll">
              {tasks.map(t => (
                <div key={t.id} onClick={() => toggleTask(t.id, t.is_completed)} className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
                  {t.is_completed ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-700 group-hover:text-gray-500" />}
                  <span className={`text-sm ${t.is_completed ? 'line-through text-gray-600' : 'text-gray-300'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DOSYALAR (YENİ EKLENDİ) */}
          <div className="p-6 bg-[#16161a] rounded-3xl border border-white/5 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center justify-between text-blue-500 text-sm uppercase tracking-wider">
              <span className="flex items-center gap-2"><Upload size={18}/> Dosyalar</span>
              {uploading && <Loader2 size={16} className="animate-spin" />}
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all mb-4">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={20} className="text-gray-500 mb-1" />
                <p className="text-[10px] text-gray-500">Yüklemek için tıklat</p>
              </div>
              <input type="file" onChange={uploadFile} className="hidden" disabled={uploading} />
            </label>

            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="group flex items-center justify-between p-3 bg-[#232329] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File size={16} className="text-blue-500 shrink-0" />
                    <span className="text-xs text-gray-300 truncate font-medium">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500"><Download size={14} /></a>
                    <button onClick={() => deleteFile(f.id, f.name)} className="text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: GÜNLÜK */}
        <div className="lg:col-span-2 p-8 bg-[#16161a] rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3"><FileText size={24} className="text-blue-500" /> Proje Günlüğü</h3>
            <span className="text-[10px] text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">{notes.length} Kayıt</span>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            if(!noteText.trim()) return;
            await supabase.from('notes').insert([{ project_id: id, text: noteText }]);
            setNoteText(""); fetchAllData();
          }} className="mb-10 flex gap-3">
            <input 
              type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} 
              placeholder="Bugün neler başardın?" 
              className="flex-1 bg-[#232329] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all shadow-inner" 
            />
            <button className="bg-blue-600 hover:bg-blue-500 px-8 rounded-2xl font-bold shadow-glow transition-all active:scale-95">Ekle</button>
          </form>

          <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-[1px] before:bg-white/5">
            {notes.map(n => (
              <div key={n.id} className="pl-10 relative group">
                <div className="absolute left-[13px] top-2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                <div className="p-5 bg-[#232329] rounded-2xl border border-white/5 hover:border-white/10 transition-all relative">
                  <p className="text-gray-300 leading-relaxed">{n.text}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 font-medium italic">
                      <Clock size={12}/> {new Date(n.created_at).toLocaleString('tr-TR')}
                    </div>
                    <button onClick={() => supabase.from('notes').delete().eq('id', n.id).then(fetchAllData)} className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-gray-600 py-10 italic">Henüz hiç not düşülmemiş...</p>}
          </div>
        </div>

      </div>
    </div>
  );
}