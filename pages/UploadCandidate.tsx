
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import { Tender, Candidate, CandidateStatus, ComplianceBadge } from '../types';

interface UploadCandidateProps {
  tender: Tender;
  onNext: () => void;
  onBack: () => void;
}

const UploadCandidate: React.FC<UploadCandidateProps> = ({ tender, onNext, onBack }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      setAddedCount(prev => prev + 1);
      setTimeout(() => setSuccess(false), 2000);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Stepper currentStep={2} />
      
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-900 px-8 py-5 flex justify-between items-center border-b border-blue-800">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Étape 2 : Dossiers des Soumissionnaires</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Marché : {tender.title}</p>
          </div>
          <div className="bg-blue-800 px-4 py-2 rounded-lg border border-blue-700">
            <span className="text-white text-xs font-black uppercase tracking-widest">Candidats : {addedCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleAddCandidate}>
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r shadow-sm">
              <p className="text-sm text-green-800 font-black uppercase">✓ Candidat enregistré avec succès. Vous pouvez en ajouter un autre.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Dénomination de l'Entreprise</label>
              <input type="text" required className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm" placeholder="Nom complet de la société" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Identifiant Fiscal (IF)</label>
              <input type="text" required placeholder="12345678" className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Ville du Siège</label>
              <select className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm">
                <option>Guelmim</option>
                <option>Tan-Tan</option>
                <option>Assa-Zag</option>
                <option>Sidi Ifni</option>
                <option>Autre</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Dossier Numérisé (Format PDF)</label>
            <div className="border-4 border-dashed border-gray-100 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">📥</span>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Téléverser le dossier complet</p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-8 border-t border-gray-100 gap-4">
            <button 
              type="button" 
              onClick={onBack}
              className="px-8 py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-900 transition-colors"
            >
              ← Retour au Marché
            </button>
            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={isUploading}
                className={`px-8 py-4 border-2 border-blue-900 text-blue-900 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-blue-50 transition-all ${isUploading ? 'opacity-50' : ''}`}
              >
                {isUploading ? 'Chargement...' : '+ Ajouter au Marché'}
              </button>
              <button 
                type="button"
                onClick={onNext}
                disabled={addedCount === 0}
                className={`px-10 py-4 bg-blue-900 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg hover:bg-blue-800 transition-all transform hover:-translate-y-1 ${addedCount === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                Lancer l'Analyse Final →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidate;
