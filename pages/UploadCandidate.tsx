
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

  const handleExtractWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFile) {
        alert("Veuillez joindre le dossier PDF du candidat.");
        return;
    }
    
    setIsUploading(true);
    
    try {
      const base64Data = await fileToBase64(currentFile);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const extractionPrompt = `Vous êtes un agent d'extraction de données spécialisé dans les marchés publics. 
      Analysez le document PDF du soumissionnaire et extrayez UNIQUEMENT les informations factuelles suivantes.
      Soyez précis sur les chiffres.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: extractionPrompt },
            { inlineData: { data: base64Data, mimeType: "application/pdf" } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              administrative_documents_complete: { type: Type.BOOLEAN, description: "Est-ce que tous les documents obligatoires sont présents ?" },
              technical_score_raw: { type: Type.NUMBER, description: "Score technique auto-évalué ou déduit (sur 100)" },
              financial_offer_mad: { type: Type.NUMBER, description: "Montant total de l'offre en Dirhams (TTC)" },
              years_experience: { type: Type.NUMBER, description: "Nombre d'années d'existence ou d'expérience" },
              past_public_projects: { type: Type.NUMBER, description: "Nombre de projets similaires réalisés avec le secteur public" },
              fiscal_id: { type: Type.STRING }
            },
            required: ["companyName", "administrative_documents_complete", "technical_score_raw", "financial_offer_mad", "years_experience", "past_public_projects"]
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("Réponse vide de l'IA.");
      const result = JSON.parse(jsonStr);
      
      const newCandidate: Candidate = {
        id: Math.random().toString(36).substr(2, 9),
        tenderRef: tender.reference,
        name: formData.name || result.companyName || "Entreprise Inconnue",
        fiscalId: formData.fiscalId || result.fiscal_id || "N/A",
        region: formData.region,
        contact: "contact@entreprise.ma",
        // Initial values before global evaluation
        score: result.technical_score_raw,
        status: CandidateStatus.REVIEW,
        compliance: result.administrative_documents_complete ? ComplianceBadge.CONFORME : ComplianceBadge.NON_CONFORME,
        observations: "Données extraites du PDF. En attente de l'analyse comparative globale.",
        isAiAnalyzed: true,
        // Detailed extraction
        financialOffer: result.financial_offer_mad,
        yearsExperience: result.years_experience,
        pastProjects: result.past_public_projects,
        adminComplete: result.administrative_documents_complete,
        technicalScoreRaw: result.technical_score_raw
      };

      onAddCandidate(newCandidate);
      setSuccess(true);
      setCurrentFile(null);
      setFormData({ name: '', fiscalId: '', region: 'Guelmim' });
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Erreur d'extraction IA:", error);
      alert("Erreur lors de l'extraction des données. Veuillez vérifier le fichier PDF.");
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
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Étape 2 : Dépôt & Extraction IA</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Dossiers pour : {tender.title}</p>
          </div>
          <div className="bg-blue-800 px-4 py-2 rounded-lg border border-blue-700">
            <span className="text-white text-xs font-black uppercase tracking-widest">Candidats : {candidatesCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleExtractWithAI}>
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r shadow-sm flex items-center">
              <span className="mr-3 text-xl">✓</span>
              <p className="text-sm text-green-800 font-black uppercase">Données extraites avec succès. Candidat ajouté à la liste.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Saisie manuelle (Optionnel)</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg p-4 font-bold text-gray-900 focus:border-blue-900 focus:bg-white outline-none transition-all shadow-sm" 
                placeholder="Nom de l'entreprise (détecté si vide)"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Identifiant Fiscal (SIRET/IF)</label>
              <input 
                type="text" 
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
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Dossier Complet (PDF)</label>
            <div className={`border-4 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer relative group ${currentFile ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
              {isUploading ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-900 font-black uppercase text-[10px] tracking-widest animate-pulse">Extraction des données financières et techniques...</p>
                </div>
              ) : (
                <>
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{currentFile ? '📑' : '📥'}</span>
                  <p className="text-sm text-blue-900 font-black uppercase tracking-wider">
                    {currentFile ? currentFile.name : "Cliquez pour téléverser le PDF"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">L'IA pré-remplira les scores et offres</p>
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
                className={`px-8 py-4 border-2 border-blue-900 text-blue-900 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-blue-900 hover:text-white transition-all ${isUploading || !currentFile ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {isUploading ? 'Analyse...' : '+ Ajouter Candidat'}
              </button>
              <button 
                type="button"
                onClick={onNext}
                disabled={candidatesCount === 0}
                className={`px-10 py-4 bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg hover:bg-green-800 transition-all transform hover:-translate-y-1 ${candidatesCount === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                Générer Rapport Final →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidate;
