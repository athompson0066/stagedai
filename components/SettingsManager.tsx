
import React, { useState, useEffect } from 'react';
import { initializeSupabase } from '../services/supabaseClient';

interface SettingsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ isOpen, onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setSupabaseUrl(localStorage.getItem('STAGEDAI_SUPABASE_URL') || '');
    setSupabaseKey(localStorage.getItem('STAGEDAI_SUPABASE_ANON_KEY') || '');
    setPaypalClientId(localStorage.getItem('STAGEDAI_PAYPAL_CLIENT_ID') || '');

    // Reset auth state on open
    if (isOpen) {
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      setLoginError('');
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'athompson' && password === 'Beachzipper66$') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleSave = () => {
    initializeSupabase(supabaseUrl, supabaseKey);
    localStorage.setItem('STAGEDAI_PAYPAL_CLIENT_ID', paypalClientId);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all stored credentials?")) {
      localStorage.removeItem('STAGEDAI_SUPABASE_URL');
      localStorage.removeItem('STAGEDAI_SUPABASE_ANON_KEY');
      localStorage.removeItem('STAGEDAI_PAYPAL_CLIENT_ID');
      setSupabaseUrl('');
      setSupabaseKey('');
      setPaypalClientId('');
      initializeSupabase('', '');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Admin Settings</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Infrastructure Configuration</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {!isAuthenticated ? (
          <form className="p-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition shadow-lg mt-4"
            >
              Verify Access
            </button>
          </form>
        ) : (
          <>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Supabase Integration</h3>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-id.supabase.co"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Anon Public Key</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="your-anon-key"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">PayPal Live Mode</h3>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Live Client ID</label>
                  <input
                    type="text"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    placeholder="Live Production Client ID"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                  <p className="text-[9px] text-gray-400 mt-2 italic px-1">Note: This will override the default sandbox 'sb' key in Results view.</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`flex-grow py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-lg ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
              >
                {isSaved ? <><i className="fas fa-check mr-2"></i> Settings Saved</> : 'Apply Configuration'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                Reset All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsManager;
