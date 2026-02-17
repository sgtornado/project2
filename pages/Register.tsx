
import React, { useState } from 'react';
import { LogoPlaceholder, INSTITUTION_NAME } from '../constants';
import { UserRole } from '../types';

interface RegisterProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.EVALUATOR,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (Object.values(formData).every(val => val !== '')) {
      onRegister();
    } else {
      setError('Veuillez remplir tous les champs.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[80vh]">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Bande décorative institutionnelle */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 via-blue-800 to-green-700"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-slate-50 rounded-lg mb-6 border border-slate-100">
            <LogoPlaceholder className="h-20 w-auto" />
          </div>
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Création de compte</h2>
          <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Accès Administratif AREF
          </p>
        </div>
        
        <form className="mt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4" onSubmit={handleSubmit}>
          {error && (
            <div className="col-span-full bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <p className="text-[11px] text-red-700 font-black uppercase tracking-wider">{error}</p>
            </div>
          )}
          
          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Nom Complet</label>
            <input
              type="text"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Email professionnel</label>
            <input
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Mot de passe</label>
            <input
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Confirmation</label>
            <input
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Rôle assigné</label>
            <select
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.EVALUATOR}>Évaluateur (Analyse)</option>
              <option value={UserRole.ADMIN}>Administrateur (Gestion)</option>
            </select>
          </div>

          <div className="col-span-full pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-xl text-white bg-green-700 hover:bg-green-800 transition-all shadow-xl hover:shadow-green-900/20 transform hover:-translate-y-0.5"
            >
              Créer mon compte
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Déjà un compte ?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-black text-blue-900 hover:text-blue-800 underline decoration-2 underline-offset-4"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
