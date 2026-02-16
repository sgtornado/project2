
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import { Tender, Candidate, CandidateStatus, ComplianceBadge } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface UploadCandidateProps {
  tender: Tender;
  onNext: () => void;
  onBack: () => void;
  onAddCandidate: (candidate: Candidate) => void;
  candidatesCount: number;
}

const UploadCandidate: React.FC<UploadCandidateProps> = ({ tender, onNext, onBack, onAddCandidate, candidatesCount }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fiscalId: '',
    region: 'Guelmim'
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyzeWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFile) {
        alert("Veuillez joindre le dossier PDF du candidat.");
        return;
    }
    
    setIsUploading(true);
    
    try {
      const base64Data = await fileToBase64(currentFile);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Vous êtes un expert en marchés publics marocains. 
      Analysez ce dossier de candidature pour le marché suivant : "${tender.title}" (Budget: ${tender.budget} DH).
      Évaluez la conformité administrative et technique.
      Retournez un score technique sur 100 et une observation concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: "application/pdf" } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score technique sur 100" },
              status: { type: Type.STRING, enum: Object.values(CandidateStatus) },
              compliance: { type: Type.STRING, enum: Object.values(ComplianceBadge) },
              observations: { type: Type.STRING, description: "Résumé de l'analyse en français" },
              companyName: { type: Type.STRING, description: "Nom de l'entreprise détecté" }
            },
            required: ["score", "status", "compliance", "observations"]
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("Réponse vide");
      const result = JSON.parse(jsonStr);
      
      const newCandidate: Candidate = {
        id: Math.random().toString(36).substr(2, 9),
        tenderRef: tender.reference,
        name: formData.name || result.companyName || "Entreprise Inconnue",
        fiscalId: formData.fiscalId || "N/A",
        region: formData.region,
        contact: "contact@detecte.ma",
        score: result.score,
        status: result.status as CandidateStatus,
        compliance: result.compliance as ComplianceBadge,
        observations: result.observations,
        isAiAnalyzed: true
      };

      onAddCandidate(newCandidate);
      setSuccess(true);
      setCurrentFile(null);
      setFormData({ name: '', fiscalId: '', region: 'Guelmim' });
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Erreur d'analyse IA:", error);
      alert("Erreur lors de l'analyse IA. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Stepper currentStep={2} />
      
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-900 px-8 py-5 flex justify-between items-center border-b border-blue-800">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Étape 2 : Analyse Inteligente IA</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Marché : {tender.title}</p>
          </div>
          <div className="bg-blue-800 px-4 py-2 rounded-lg border border-blue-700">
            <span className="text-white text-xs font-black uppercase tracking-widest">Candidats : {candidatesCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleAnalyzeWithAI}>
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r shadow-sm flex items-center">
              <span className="mr-3 text-xl">⚡</span>
              <p className="text-sm text-green-800 font-black uppercase">Candidat analysé et enregistré avec succès.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nom de l'Entreprise (Optionnel)</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm" 
                placeholder="Détection automatique via IA"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Identifiant Fiscal (IF)</label>
              <input 
                type="text" 
                placeholder="Ex: 12345678" 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                value={formData.fiscalId}
                onChange={(e) => setFormData({...formData, fiscalId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Province</label>
              <select 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
              >
                <option>Guelmim</option>
                <option>Tan-Tan</option>
                <option>Assa-Zag</option>
                <option>Sidi Ifni</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Dossier Technique (PDF)</label>
            <div className={`border-4 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer relative group ${currentFile ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
              {isUploading ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-900 font-black uppercase text-xs tracking-widest animate-pulse">L'IA analyse le dossier...</p>
                </div>
              ) : (
                <>
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{currentFile ? '📑' : '🤖'}</span>
                  <p className="text-sm text-blue-900 font-black uppercase tracking-wider">
                    {currentFile ? currentFile.name : "Cliquez ou glissez le PDF ici pour analyse IA"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Analyse automatique du score et de la conformité</p>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </>
              )}
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
                disabled={isUploading || !currentFile}
                className={`px-8 py-4 border-2 border-blue-900 text-blue-900 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-blue-900 hover:text-white transition-all shadow-md flex items-center gap-2 ${isUploading || !currentFile ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {isUploading ? 'Traitement...' : '⚡ Lancer l\'Analyse IA'}
              </button>
              <button 
                type="button"
                onClick={onNext}
                disabled={candidatesCount === 0}
                className={`px-10 py-4 bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg hover:bg-green-800 transition-all transform hover:-translate-y-1 ${candidatesCount === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                Voir les Résultats →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidate;
