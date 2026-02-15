
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import { Tender } from '../types';

interface UploadTenderProps {
  onComplete: (tender: Tender) => void;
}

const UploadTender: React.FC<UploadTenderProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
      reference: '',
      title: '',
      budget: 0,
      deadline: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTender: Tender = {
      ...formData,
      status: 'En analyse'
    };
    // On pourrait ici gérer le fichier PDF (FormData)
    onComplete(newTender);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Stepper currentStep={1} />
      
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-900 px-8 py-5 border-b border-blue-800">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Étape 1 : Informations du Marché Public</h2>
          <p className="text-blue-200 text-xs mt-1 font-bold">Veuillez saisir les références officielles et joindre le CPS/RC</p>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Intitulé Officiel du Marché</label>
              <input 
                type="text" 
                required 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="Ex: Aménagement des espaces verts du siège AREF..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Référence AO (Appel d'Offre)</label>
              <input 
                type="text" 
                required 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="AO N° 00/2026/GON"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Budget Estimé (DH)</label>
              <input 
                type="number" 
                required 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="0.00"
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Date d'Ouverture des Plis</label>
              <input 
                type="date" 
                required 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Type de Prestation</label>
                <select className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm">
                    <option>Travaux</option>
                    <option>Fournitures</option>
                    <option>Services / Etudes</option>
                </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Documents de Référence (CPS, RC, Plans - PDF)</label>
            <div className={`border-4 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative group ${file ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}>
              <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">{file ? '📄' : '📁'}</span>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                {file ? file.name : "Téléverser le dossier technique du marché"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">Format PDF uniquement - Max 50Mo</p>
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              className="px-10 py-4 bg-green-700 text-white font-black text-sm uppercase tracking-widest rounded-lg shadow-lg hover:bg-green-800 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              Étape Suivante : Candidatures →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadTender;
