
import React, { useState } from 'react';
import { LogoPlaceholder, COLORS } from '../constants';
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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-block mb-4">
            <LogoPlaceholder />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-blue-900">Création de compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez la plateforme administrative de l'AREF
          </p>
        </div>
        
        <form className="mt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4" onSubmit={handleSubmit}>
          {error && (
            <div className="col-span-full bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="col-span-full">
            <label className="text-xs font-semibold text-gray-600 uppercase">Nom Complet</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="text-xs font-semibold text-gray-600 uppercase">Email professionnel</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Mot de passe</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Confirmation</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="text-xs font-semibold text-gray-600 uppercase">Rôle assigné</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.EVALUATOR}>Évaluateur (Lecture & Analyse)</option>
              <option value={UserRole.ADMIN}>Administrateur (Gestion complète)</option>
            </select>
          </div>

          <div className="col-span-full pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-green-700 hover:bg-green-800 transition-all shadow-lg"
            >
              Créer mon compte
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-medium text-blue-900 hover:text-blue-800 underline"
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
