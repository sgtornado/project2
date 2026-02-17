
import React, { useState } from 'react';
import { LogoPlaceholder } from '../constants';
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
      setError('Veuillez remplir tous les champs obligatoires.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[80vh]">
      <div className="max-w-2xl w-full space-y-10 bg-white p-10 sm:p-12 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Bande décorative institutionnelle */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-900 via-blue-800 to-green-700"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100 shadow-inner">
            <LogoPlaceholder className="h-16 sm:h-20" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-900 uppercase tracking-tight">Inscription Commissaire</h2>
          <p className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em]">
            Ouverture de compte AREF-GON
          </p>
        </div>
        
        <form className="mt-8 grid grid-cols-1 gap-y-7 sm:grid-cols-2 sm:gap-x-6" onSubmit={handleSubmit}>
          {error && (
            <div className="col-span-full bg-red-50 border-l-4 border-red-600 p-5 rounded-r-xl">
              <p className="text-xs text-red-700 font-black uppercase tracking-wider">{error}</p>
            </div>
          )}
          
          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Nom Complet (Fiche Personnel)</label>
            <input
              type="text"
              required
              className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Ex: Ahmed El Mansouri"
            />
          </div>

          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Email académique</label>
            <input
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="votre.nom@men.gov.ma"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Nouveau Mot de passe</label>
            <input
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Confirmation</label>
            <input
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <div className="col-span-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Profil évalué par l'Administrateur</label>
            <select
              className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:bg-white transition-all text-sm font-bold shadow-sm cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.EVALUATOR}>Membre de commission (Évaluateur)</option>
              <option value={UserRole.ADMIN}>Chef de service Marchés (Administrateur)</option>
            </select>
          </div>

          <div className="col-span-full pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-5 px-6 border border-transparent text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-green-700 hover:bg-green-800 transition-all shadow-2xl hover:shadow-green-900/30 transform hover:-translate-y-1 active:translate-y-0"
            >
              Soumettre la demande d'accès
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-8">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Compte déjà activé ?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-black text-blue-900 hover:text-blue-800 underline decoration-2 underline-offset-4 ml-1 transition-colors"
            >
              S'authentifier ici
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
