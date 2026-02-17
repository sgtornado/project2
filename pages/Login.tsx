
import React, { useState } from 'react';
import { LogoPlaceholder, INSTITUTION_NAME } from '../constants';

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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[80vh]">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Bande décorative institutionnelle */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 via-blue-800 to-green-700"></div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-xl mb-6 shadow-inner border border-slate-100">
            <LogoPlaceholder className="h-24 w-auto sm:h-32" />
          </div>
          <div className="space-y-1">
            <h2 className="text-blue-900 text-xs font-black uppercase tracking-widest leading-tight">
              {INSTITUTION_NAME}
            </h2>
            <p className="pt-4 text-slate-800 text-lg font-black uppercase tracking-tighter">
              Portail Marchés Publics
            </p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Accès Sécurisé
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
              <p className="text-[11px] text-red-700 font-black uppercase tracking-wider">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Email professionnel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
                placeholder="nom.prenom@men.gov.ma"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-xl text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all shadow-xl hover:shadow-blue-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Accéder à la plateforme
            </button>
          </div>
        </form>

        <div className="mt-10 text-center pt-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Nouvel utilisateur ?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-green-700 hover:text-green-600 font-black underline decoration-2 underline-offset-4 ml-1 transition-colors"
            >
              Demander un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
