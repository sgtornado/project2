
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
      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Vous êtes un expert en marchés publics marocains pour l'AREF. 
      CONTEXTE DU MARCHÉ : 
      - Titre : ${tender.title}
      - Référence : ${tender.reference}
      - Budget estimé : ${tender.budget} DH

      TACHE :
      Analysez ce dossier de candidature technique et administratif (PDF) et fournissez une analyse rigoureuse.
      
      CRITÈRES D'ANALYSE :
      1. Identification : Raison sociale exacte et Identifiant Fiscal/ICE.
      2. Scoring : Évaluez de 0 à 100 la pertinence technique par rapport à l'objet du marché.
      3. Analyse Qualitative : Listez 3 points forts et les faiblesses éventuelles.
      4. Statut : Déterminez si le dossier est Acceptable, Rejetable ou nécessite un Réexamen.`;

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
              companyName: { type: Type.STRING },
              fiscalId: { type: Type.STRING },
              score: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: Object.values(CandidateStatus) },
              compliance: { type: Type.STRING, enum: Object.values(ComplianceBadge) },
              observations: { type: Type.STRING },
              report: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  technicalAnalysis: { type: Type.STRING }
                },
                required: ["strengths", "weaknesses", "technicalAnalysis"]
              }
            },
            required: ["companyName", "fiscalId", "score", "status", "compliance", "observations", "report"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("EMPTY_RESPONSE");
      
      const result = JSON.parse(text);
      
      setFormData(prev => ({
        ...prev,
        name: result.companyName || prev.name,
        fiscalId: result.fiscalId || prev.fiscalId
      }));
      
      setAiMetadata(result);
      
    } catch (error: any) {
      setErrorDetails({ 
        type: "Erreur d'analyse", 
        message: "L'IA n'a pas pu traiter ce document.", 
        instruction: "Veuillez vérifier le PDF ou saisir manuellement." 
      });
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

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCandidate: Candidate = {
      id: Math.random().toString(36).substr(2, 9),
      tenderRef: tender.reference,
      name: formData.name,
      fiscalId: formData.fiscalId,
      region: formData.region,
      contact: "auto@aref-gon.ma",
      score: aiMetadata?.score || 0,
      status: (aiMetadata?.status as CandidateStatus) || CandidateStatus.REVIEW,
      compliance: (aiMetadata?.compliance as ComplianceBadge) || ComplianceBadge.NON_CONFORME,
      observations: aiMetadata?.observations || "Traitement manuel.",
      isAiAnalyzed: !!aiMetadata,
      aiDetailedReport: aiMetadata?.report
    };

    onAddCandidate(newCandidate);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetForm();
    }, 1500);
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
        <div className="bg-blue-900 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white uppercase">Dossier de Candidature</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold italic tracking-wider">Expertise assistée par Gemini Pro</p>
          </div>
          <div className="bg-blue-800 px-4 py-2 rounded-xl border border-blue-700">
            <span className="text-white text-xs font-black uppercase tracking-widest">Total : {candidatesCount}</span>
          </div>
        </div>
        
        <form className="p-8 space-y-8" onSubmit={handleFinalSubmit}>
          {success && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-xl flex items-center">
              <span className="mr-3">✅</span>
              <p className="text-xs text-green-800 font-black uppercase tracking-wider">Candidat enregistré dans la base de données.</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Déposez le dossier technique complet (PDF)</label>
            <div className={`border-4 border-dashed rounded-2xl p-10 text-center transition-all relative ${isAnalyzing ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200 cursor-pointer'}`}>
              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-900 font-black uppercase text-[10px] tracking-widest">Analyse approfondie en cours...</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-sm text-slate-900 font-black uppercase">{currentFile ? currentFile.name : "Cliquez pour téléverser"}</p>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Extraction des données & Scoring technique</p>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Raison Sociale</label>
              <input type="text" required className="w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:border-blue-900 bg-slate-50 outline-none uppercase" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Identifiant Fiscal (IF)</label>
              <input type="text" required className="w-full border-2 rounded-xl p-4 font-black text-slate-900 focus:border-blue-900 bg-slate-50 outline-none" value={formData.fiscalId} onChange={(e) => setFormData({...formData, fiscalId: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Province</label>
              <select className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 font-black text-slate-900 appearance-none outline-none" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})}>
                <option>Guelmim</option><option>Tan-Tan</option><option>Assa-Zag</option><option>Sidi Ifni</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-8 border-t border-slate-100">
            <button type="button" onClick={onBack} className="text-slate-400 font-black text-[10px] uppercase tracking-widest">← Retour</button>
            <div className="flex gap-4">
              <button type="submit" disabled={isAnalyzing || !formData.name} className="px-8 py-4 bg-blue-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl disabled:opacity-50">Valider Candidat</button>
              <button type="button" onClick={onNext} disabled={candidatesCount === 0} className="px-8 py-4 bg-green-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl">Accéder aux Résultats →</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidate;
