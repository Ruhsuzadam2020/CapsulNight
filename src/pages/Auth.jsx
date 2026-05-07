import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Box, Lock, Mail } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isRegister 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full bg-[#16161a] p-10 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-glow">
            <Box size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-center mb-2 uppercase tracking-tighter">CapsulNight</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">{isRegister ? 'Kapsülünü oluşturmaya başla.' : 'Kapsüllerine erişmek için giriş yap.'}</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-600" size={18} />
            <input 
              type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#232329] border-none p-3 pl-10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
            <input 
              type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#232329] border-none p-3 pl-10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all shadow-glow disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
        </form>
        
        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-6 text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Henüz hesabın yok mu? Kayıt ol'}
        </button>
      </div>
    </div>
  );
}