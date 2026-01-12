
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (key: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In Netlify, you will set APP_ACCESS_KEY in environment variables.
    // If not set, it defaults to a fallback for local testing.
    const masterKey = process.env.APP_ACCESS_KEY || 'admin123';
    
    if (accessKey === masterKey) {
      onLogin(accessKey);
    } else {
      setError(true);
      setAccessKey('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 px-6">
      <div className={`w-full max-w-md transition-all duration-300 ${error ? 'animate-bounce' : ''}`}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8">
              <i className="fas fa-shield-halved text-2xl text-white"></i>
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">RE:CNXT PRO</h1>
            <p className="text-slate-400 text-sm font-medium mb-10 text-center uppercase tracking-widest">Personal Workspace Locked</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Private Access Key"
                  className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} focus:border-indigo-500 rounded-2xl px-6 py-4 text-white text-center font-bold tracking-[0.3em] outline-none transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-500`}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  autoFocus
                />
                {error && (
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-3 text-center animate-pulse">
                    Access Denied. Incorrect Key.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 group flex items-center justify-center space-x-2"
              >
                <span>Unlock System</span>
                <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </button>
            </form>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Secure Personal Instance &bull; Agency OS v2.0
        </p>
      </div>
    </div>
  );
};

export default Login;
