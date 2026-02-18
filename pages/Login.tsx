
import React, { useState } from 'react';
import { LogoPlaceholder } from '../constants';

interface LoginProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    } else {
      setError('Veuillez renseigner tous les champs obligatoires.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[70vh]">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <LogoPlaceholder className="h-16" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Portail de Dépouillement</h2>
          <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Accès sécurisé AREF-GON</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
              <p className="text-[10px] text-red-700 font-black uppercase tracking-wider">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-xl block w-full px-4 py-4 border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm font-bold"
              placeholder="Email professionnel"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-xl block w-full px-4 py-4 border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm font-bold"
              placeholder="Mot de passe"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 text-xs font-black uppercase tracking-widest rounded-xl text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-lg"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Pas de compte ? <button onClick={onNavigateToRegister} className="text-blue-900 font-black underline">S'inscrire</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
