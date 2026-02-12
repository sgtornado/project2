
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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-block mb-6">
            <LogoPlaceholder className="h-24 w-auto" />
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-blue-900 uppercase tracking-tight">Portail de Gestion</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Marchés Publics - AREF Guelmim-Oued Noun
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Email professionnel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-900 focus:border-blue-900 focus:bg-white focus:z-10 sm:text-sm font-bold transition-all"
                placeholder="nom@aref.ma"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-900 focus:border-blue-900 focus:bg-white focus:z-10 sm:text-sm font-bold transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs">
              <a href="#" className="font-bold text-blue-900 hover:text-blue-700 underline">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-lg text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Se connecter au portail
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
            Pas de compte ?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-green-700 hover:text-green-600 underline ml-1"
            >
              Demander un accès
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
