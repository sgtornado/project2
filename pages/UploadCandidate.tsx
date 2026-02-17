
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [errorDetails, setErrorDetails] = useState<{ type: string; message: string; instruction: string } | null>(null);
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
    setAiMetadata(null);
    
    try {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE");
      }

      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Vous êtes un analyste expert en marchés publics pour l'AREF (Maroc). 
      Analysez ce dossier de candidature pour le marché suivant : "${tender.title}".
      Extrayez les informations suivantes de manière précise :
      1. Raison Sociale (Nom de l'entreprise).
      2. Identifiant Fiscal (IF) ou ICE.
      3. Proposez un statut de conformité et un score technique basé sur le contenu.`;

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
              companyName: { type: Type.STRING, description: "Nom officiel de l'entreprise" },
              fiscalId: { type: Type.STRING, description: "Identifiant fiscal IF ou ICE" },
              score: { type: Type.NUMBER, description: "Score technique sur 100" },
              status: { type: Type.STRING, enum: Object.values(CandidateStatus) },
              compliance: { type: Type.STRING, enum: Object.values(ComplianceBadge) },
              observations: { type: Type.STRING, description: "Justification de l'IA" }
            },
            required: ["companyName", "fiscalId", "score", "status", "compliance", "observations"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("EMPTY_RESPONSE");
      
      const result = JSON.parse(text);
      
      // Pré-remplissage automatique du formulaire
      setFormData(prev => ({
        ...prev,
        name: result.companyName || prev.name,
        fiscalId: result.fiscalId || prev.fiscalId
      }));
      
      setAiMetadata(result);
      
    } catch (error: any) {
      console.error("Extraction error:", error);
      let type = "Échec d'analyse IA";
      let message = "Gemini n'a pas pu traiter ce document automatiquement.";
      let instruction = "Le document est peut-être protégé ou mal formaté.";

      if (error.message === "FILE_TOO_LARGE") {
        type = "Fichier Trop Lourd";
        message = "Le PDF dépasse la limite de 20 Mo.";
        instruction = "Veuillez compresser le fichier ou saisir les données manuellement.";
      } else if (error.message?.includes("429")) {
        type = "Limite Atteinte";
        message = "Le quota d'analyse est temporairement saturé.";
        instruction = "Veuillez patienter 30 secondes avant de cliquer sur 'Réessayer'.";
      }

      setErrorDetails({ type, message, instruction });
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
      alert("Le nom de l'entreprise et l'identifiant fiscal sont requis.");
      return;
    }

    const newCandidate: Candidate = {
      id: Math.random().toString(36).substr(2, 9),
      tenderRef: tender.reference,
      name: formData.name,
      fiscalId: formData.fiscalId,
      region: formData.region,
      contact: "auto-detect@plateforme.gov.ma",
      score: aiMetadata?.score || 0,
      status: (aiMetadata?.status as CandidateStatus) || CandidateStatus.REVIEW,
      compliance: (aiMetadata?.compliance as ComplianceBadge) || ComplianceBadge.NON_CONFORME,
      observations: aiMetadata?.observations || "Traitement manuel par l'évaluateur.",
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
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Dépouillement Technique</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Extraction intelligente des données de candidature</p>
          </div>
          <div className="bg-blue-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-700/50 z-10">
            <span className="text-white text-xs font-black uppercase tracking-widest">Inscrits : {candidatesCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleFinalSubmit}>
          {success && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-xl flex items-center animate-bounce">
              <span className="mr-3 text-lg">✨</span>
              <p className="text-xs text-green-800 font-black uppercase tracking-wider">Candidat ajouté avec succès au registre officiel.</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Dossier Administratif & Technique (PDF)
            </label>
            <div 
              className={`border-4 border-dashed rounded-2xl p-10 text-center transition-all relative group 
                ${isAnalyzing ? 'border-blue-300 bg-blue-50/50' : 
                  errorDetails ? 'border-red-200 bg-red-50/50' : 
                  currentFile ? 'border-green-300 bg-green-50/30' : 
                  'border-slate-100 hover:border-blue-200 hover:bg-slate-50 cursor-pointer'}`}
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-900 font-black uppercase text-[10px] tracking-widest animate-pulse">Gemini analyse le document...</p>
                </div>
              ) : errorDetails ? (
                <div className="flex flex-col items-center">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase mb-4 tracking-widest shadow-md">
                    {errorDetails.type}
                  </div>
                  <p className="text-sm text-slate-900 font-black uppercase tracking-tight mb-1">
                    {errorDetails.message}
                  </p>
                  <p className="text-xs text-slate-500 font-bold mb-6">
                    {errorDetails.instruction}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleRetry}
                      className="bg-blue-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <span>🔄</span> Réessayer l'Analyse
                    </button>
                    <button 
                      type="button"
                      onClick={() => setErrorDetails(null)}
                      className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      ⌨️ Saisie Manuelle
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
                    {currentFile ? currentFile.name : "Téléverser le dossier de candidature"}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest italic">
                    Les champs Nom et IF seront automatiquement extraits
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
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex justify-between items-center">
                Nom de l'Entreprise (Raison Sociale)
                {aiMetadata?.companyName && (
                  <span className="text-green-600 animate-pulse font-black text-[9px] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    ✓ EXTRAIT PAR IA
                  </span>
                )}
              </label>
              <input 
                type="text" 
                required
                className={`w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm uppercase tracking-tight 
                  ${aiMetadata?.companyName ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50 focus:border-blue-900'}`} 
                placeholder="EX: TRAVAUX GÉNERAUX DU SUD S.A.R.L"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 flex justify-between items-center">
                Identifiant Fiscal (IF)
                {aiMetadata?.fiscalId && (
                  <span className="text-green-600 font-black text-[9px] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    ✓ EXTRAIT PAR IA
                  </span>
                )}
              </label>
              <input 
                type="text" 
                required
                placeholder="Ex: 88776655" 
                className={`w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm uppercase
                  ${aiMetadata?.fiscalId ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50 focus:border-blue-900'}`}
                value={formData.fiscalId}
                onChange={(e) => setFormData({...formData, fiscalId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Province de Résidence</label>
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
              ← Annuler & Retour
            </button>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Effacer
              </button>
              <button 
                type="submit" 
                disabled={isAnalyzing || !formData.name || !formData.fiscalId}
                className={`px-8 py-4 bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-blue-800 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
              >
                {isAnalyzing ? 'ANALYSE...' : 'Valider Candidature'}
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
