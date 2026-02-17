
import React, { useState, useCallback, useRef } from 'react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ type: string; message: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [aiMetadata, setAiMetadata] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const runAiExtraction = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setErrorDetails(null);
    
    try {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE");
      }

      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Vous êtes un analyste expert en marchés publics pour l'AREF (Maroc). 
      Analysez ce dossier de candidature pour le marché suivant : "${tender.title}".
      Instructions :
      1. Identifiez la Raison Sociale (nom officiel de l'entreprise).
      2. Trouvez l'Identifiant Fiscal (IF) ou l'ICE.
      3. Évaluez la conformité globale du dossier technique.
      4. Attribuez un score de qualité technique (0-100).
      5. Fournissez une brève observation sur les points forts/faibles.`;

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
              companyName: { type: Type.STRING, description: "Nom de l'entreprise" },
              fiscalId: { type: Type.STRING, description: "Identifiant fiscal" },
              score: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: Object.values(CandidateStatus) },
              compliance: { type: Type.STRING, enum: Object.values(ComplianceBadge) },
              observations: { type: Type.STRING }
            },
            required: ["companyName", "fiscalId", "score", "status", "compliance", "observations"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      setFormData(prev => ({
        ...prev,
        name: result.companyName || prev.name,
        fiscalId: result.fiscalId || prev.fiscalId
      }));
      
      setAiMetadata(result);
      
    } catch (error: any) {
      console.error("Extraction error:", error);
      let type = "ERREUR TECHNIQUE";
      let message = "Une erreur inattendue est survenue lors de l'analyse du document.";

      if (error.message === "FILE_TOO_LARGE") {
        type = "FICHIER VOLUMINEUX";
        message = "Le document dépasse la limite de 20 Mo autorisée pour l'analyse IA.";
      } else if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY")) {
        type = "CONFIGURATION API";
        message = "La plateforme d'analyse est momentanément indisponible (Erreur de clé).";
      } else if (error.message?.includes("429") || error.message?.toLowerCase().includes("quota")) {
        type = "LIMITE ATTEINTE";
        message = "Le quota d'analyse est saturé. Veuillez patienter une minute avant de réessayer.";
      } else if (!navigator.onLine) {
        type = "DÉCONNEXION";
        message = "Vérifiez votre connexion internet pour utiliser l'analyse automatique.";
      }

      setErrorDetails({ type, message });
    } finally {
      setIsAnalyzing(false);
    }
  }, [tender]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentFile(file);
      await runAiExtraction(file);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentFile) {
      runAiExtraction(currentFile);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.fiscalId) {
      alert("Le nom et l'IF sont requis pour valider le dossier.");
      return;
    }

    const newCandidate: Candidate = {
      id: Math.random().toString(36).substr(2, 9),
      tenderRef: tender.reference,
      name: formData.name,
      fiscalId: formData.fiscalId,
      region: formData.region,
      contact: "detecte@plateforme.ma",
      score: aiMetadata?.score || 0,
      status: (aiMetadata?.status as CandidateStatus) || CandidateStatus.REVIEW,
      compliance: (aiMetadata?.compliance as ComplianceBadge) || ComplianceBadge.NON_CONFORME,
      observations: aiMetadata?.observations || "Traitement manuel sans analyse IA complète.",
      isAiAnalyzed: !!aiMetadata
    };

    onAddCandidate(newCandidate);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setCurrentFile(null);
    setAiMetadata(null);
    setErrorDetails(null);
    setFormData({ name: '', fiscalId: '', region: 'Guelmim' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <Stepper currentStep={2} />
      
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 px-8 py-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="z-10">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Analyse des Dossiers</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Dépouillement technique assisté par IA</p>
          </div>
          <div className="bg-blue-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-700/50 z-10">
            <span className="text-white text-xs font-black uppercase tracking-widest">Inscrits : {candidatesCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleFinalSubmit}>
          {success && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-xl flex items-center animate-bounce">
              <span className="mr-3 text-lg">✨</span>
              <p className="text-xs text-green-800 font-black uppercase tracking-wider">Candidat ajouté avec succès au registre.</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Dossier PDF (Candidature)
            </label>
            <div 
              className={`border-4 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative group 
                ${isAnalyzing ? 'border-blue-300 bg-blue-50/50' : currentFile && !errorDetails ? 'border-green-300 bg-green-50/30' : errorDetails ? 'border-red-300 bg-red-50/30' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-900 font-black uppercase text-[10px] tracking-widest animate-pulse">Extraction des données par IA...</p>
                </div>
              ) : errorDetails ? (
                <div className="flex flex-col items-center">
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase mb-3 tracking-widest">
                    ⚠️ {errorDetails.type}
                  </div>
                  <p className="text-xs text-slate-700 font-bold uppercase tracking-tight mb-2 text-center max-w-sm">
                    {errorDetails.message}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium italic mb-6">
                    L'analyse a échoué. Vous pouvez réessayer ou remplir le formulaire ci-dessous manuellement.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleRetry}
                      className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-800 transition-all shadow-lg active:scale-95"
                    >
                      Réessayer l'analyse
                    </button>
                    <button 
                      type="button"
                      onClick={() => setErrorDetails(null)}
                      className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                    >
                      Saisie Manuelle
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {currentFile ? (
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <span className="text-3xl">📄</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-inner">
                        <span className="text-3xl">🤖</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-900 font-black uppercase tracking-wider">
                    {currentFile ? currentFile.name : "Glissez le dossier de candidature ici"}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest italic">
                    Gemini extraira automatiquement le nom et l'identifiant fiscal
                  </p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="md:col-span-2 relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex justify-between">
                Nom de l'Entreprise (Raison Sociale)
                {aiMetadata?.companyName && <span className="text-green-600 animate-fade-in">✓ Extrait par IA</span>}
              </label>
              <input 
                type="text" 
                required
                className={`w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm uppercase tracking-tight 
                  ${aiMetadata?.companyName ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50 focus:border-blue-900'}`} 
                placeholder="EX: ATLAS TRAVAUX MAROC S.A.R.L"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex justify-between">
                Identifiant Fiscal (IF)
                {aiMetadata?.fiscalId && <span className="text-green-600">✓ Extrait</span>}
              </label>
              <input 
                type="text" 
                required
                placeholder="IFXXXXXXXX" 
                className={`w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm uppercase
                  ${aiMetadata?.fiscalId ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50 focus:border-blue-900'}`}
                value={formData.fiscalId}
                onChange={(e) => setFormData({...formData, fiscalId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Province (Siège)</label>
              <select 
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 font-black text-slate-900 focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm appearance-none"
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

          <div className="flex flex-col sm:flex-row justify-between pt-8 border-t border-slate-100 gap-4">
            <button 
              type="button" 
              onClick={onBack}
              className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              ← Annuler et Retourner
            </button>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Vider
              </button>
              <button 
                type="submit" 
                disabled={isAnalyzing || !formData.name || !formData.fiscalId}
                className={`px-8 py-4 bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-blue-800 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
              >
                {isAnalyzing ? 'ANALYSE...' : 'Valider & Ajouter'}
              </button>
              <button 
                type="button"
                onClick={onNext}
                disabled={candidatesCount === 0}
                className={`px-10 py-4 bg-green-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-green-800 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:grayscale`}
              >
                Résultats →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidate;
