
import React, { useState, useEffect } from 'react';
import Stepper from '../components/Stepper';
import { Candidate, CandidateStatus, ComplianceBadge, Tender, CandidateEvaluation } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface ResultsProps {
  tender: Tender;
  candidates: Candidate[];
  onBack: () => void;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ tender, candidates, onBack, onRestart }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedCandidates, setEvaluatedCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const runFinalEvaluation = async () => {
    if (candidates.length === 0) return;
    
    setIsEvaluating(true);
    setError("");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const payload = {
        tender: {
          title: tender.title,
          reference: tender.reference,
          estimated_budget: tender.budget,
          technical_weight: tender.techWeight || 0.6,
          financial_weight: tender.finWeight || 0.4
        },
        candidatures: candidates.map(c => ({
          company_name: c.name,
          administrative_documents_complete: c.adminComplete,
          technical_score_raw: c.technicalScoreRaw,
          financial_offer_mad: c.financialOffer,
          years_experience: c.yearsExperience,
          past_public_projects: c.pastProjects
        }))
      };

      const systemInstruction = `Vous êtes une IA spécialisée dans l'analyse des marchés publics marocains.
      Votre tâche est d'analyser les candidatures d'entreprises soumises en réponse à un appel d'offre pour l'AREF Guelmim-Oued Noun.
      
      RÈGLES IMPORTANTES :
      1. Évaluation administrative : Si administrative_documents_complete = false, marquer comme "Non-Compliant".
      2. Score Financier : Score Financier = (Offre la plus basse / Offre de l'entreprise) × 100.
      3. Ajustement Technique : Score technique_score_raw +5/-5 selon l'expérience. Explication obligatoire.
      4. Score Total : (Score Technique × technical_weight) + (Score Financier × financial_weight).
      5. Classement : Classer par score total décroissant.
      6. Analyse de Risque : Force, Faiblesse, Niveau de Risque (Bas/Moyen/Haut), Recommandation.
      
      RETOURNEZ UNIQUEMENT DU JSON VALIDE.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [{ text: JSON.stringify(payload) }]
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company_name: { type: Type.STRING },
                    administrative_status: { type: Type.STRING },
                    technical_score_final: { type: Type.NUMBER },
                    financial_score: { type: Type.NUMBER },
                    total_score: { type: Type.NUMBER },
                    ranking: { type: Type.NUMBER },
                    risk_level: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    strengths: { type: Type.STRING },
                    weaknesses: { type: Type.STRING },
                    technical_adjustment_explanation: { type: Type.STRING }
                  },
                  required: ["company_name", "administrative_status", "total_score", "ranking"]
                }
              },
              final_decision_summary: { type: Type.STRING }
            },
            required: ["results", "final_decision_summary"]
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("Réponse d'évaluation vide.");
      const data = JSON.parse(jsonStr);

      // Merge evaluation results back into candidates
      const updated = candidates.map(c => {
        const evalData = data.results.find((r: any) => r.company_name === c.name);
        if (evalData) {
          return {
            ...c,
            score: evalData.total_score,
            status: evalData.administrative_status === "Compliant" ? CandidateStatus.ACCEPTED : CandidateStatus.REJECTED,
            compliance: evalData.risk_level === "Low" ? ComplianceBadge.CONFORME : evalData.risk_level === "Medium" ? ComplianceBadge.RISQUE : ComplianceBadge.NON_CONFORME,
            observations: evalData.technical_adjustment_explanation,
            evaluation: evalData as CandidateEvaluation
          };
        }
        return c;
      });

      // Sort by score
      updated.sort((a, b) => (b.score || 0) - (a.score || 0));

      setEvaluatedCandidates(updated);
      setSummary(data.final_decision_summary);

    } catch (e: any) {
      console.error("Evaluation Error:", e);
      setError("L'IA n'a pas pu finaliser l'évaluation globale. Vérifiez les données des candidats.");
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    runFinalEvaluation();
  }, []);

  const getStatusBadge = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.ACCEPTED: return 'bg-green-100 text-green-800 border-green-200';
      case CandidateStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <Stepper currentStep={3} />
      
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-10">
        <div className="bg-blue-900 p-8 border-b border-blue-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <span className={isEvaluating ? "animate-spin" : ""}>⚡</span> Rapport Comparatif IA
                </span>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">{tender.title}</h1>
            <p className="text-blue-200 text-xs mt-2 font-bold italic">Système d'aide à la décision - AREF-GON</p>
          </div>
          <div className="flex space-x-3">
             <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/20">Imprimer PV</button>
             <button onClick={onRestart} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xl">Nouvelle Analyse</button>
          </div>
        </div>

        {isEvaluating ? (
            <div className="p-20 text-center">
                <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Intelligence Artificielle en action...</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">Calcul des scores financiers, pondération technique et analyse comparative des risques en cours.</p>
            </div>
        ) : error ? (
            <div className="p-10 text-center text-red-600 font-bold uppercase bg-red-50">
                {error}
                <button onClick={runFinalEvaluation} className="block mx-auto mt-4 underline">Réessayer l'évaluation</button>
            </div>
        ) : (
            <>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Classement des Soumissionnaires</h3>
                        <div className="space-y-4">
                            {evaluatedCandidates.map((c) => (
                                <div key={c.id} className="border-2 border-gray-50 rounded-xl p-6 hover:border-blue-100 transition-all bg-gray-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 bg-blue-900 text-white flex items-center justify-center font-black rounded-lg text-lg">
                                                #{c.evaluation?.ranking || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase tracking-tight">{c.name}</h4>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{c.fiscalId} • Offre : {c.financialOffer.toLocaleString()} DH</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-blue-900 leading-none">{c.score?.toFixed(2)}</div>
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Score Total</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Score Tech</div>
                                            <div className="text-sm font-black text-gray-800">{c.evaluation?.technical_score_final || 0}/100</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Score Fin</div>
                                            <div className="text-sm font-black text-gray-800">{c.evaluation?.financial_score.toFixed(1) || 0}/100</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Risque</div>
                                            <div className={`text-xs font-black uppercase ${c.evaluation?.risk_level === 'Low' ? 'text-green-600' : 'text-amber-600'}`}>{c.evaluation?.risk_level || 'N/A'}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Statut Admin</div>
                                            <div className={`text-[9px] font-black uppercase ${c.evaluation?.administrative_status === 'Compliant' ? 'text-green-600' : 'text-red-600'}`}>{c.evaluation?.administrative_status}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <span>💡</span> Justification IA
                                            </p>
                                            <p className="text-[11px] text-blue-800 font-medium leading-relaxed italic">
                                                {c.evaluation?.technical_adjustment_explanation}
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-4 text-[10px]">
                                            <div className="flex-1">
                                                <span className="font-black text-green-700 uppercase block mb-1">Points Forts</span>
                                                <p className="text-gray-600 font-medium leading-tight">{c.evaluation?.strengths}</p>
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-black text-red-700 uppercase block mb-1">Points Faibles</span>
                                                <p className="text-gray-600 font-medium leading-tight">{c.evaluation?.weaknesses}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Synthèse & Décision Finale</h3>
                            <div className="bg-blue-900 text-white rounded-xl p-8 shadow-xl border-l-8 border-green-500">
                                <p className="text-xs font-black uppercase tracking-widest text-blue-300 mb-4">Recommandation de l'IA</p>
                                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap italic">
                                    "{summary}"
                                </div>
                                <div className="mt-8 pt-6 border-t border-blue-800 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-center text-xl">🤖</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase">Validation Algorithmique</p>
                                        <p className="text-[9px] text-blue-300 font-bold">Modèle : Gemini 3 Pro / Context: Public-AO-v2</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-gray-50 rounded-xl p-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Détails de Pondération</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-600 uppercase">Technique (T)</span>
                                    <span className="font-black text-blue-900">{(tender.techWeight || 0.6) * 100}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-900 h-full" style={{width: `${(tender.techWeight || 0.6) * 100}%`}}></div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-600 uppercase">Financier (F)</span>
                                    <span className="font-black text-green-700">{(tender.finWeight || 0.4) * 100}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-600 h-full" style={{width: `${(tender.finWeight || 0.4) * 100}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
                    <button onClick={onBack} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-900 transition-colors">← Retour aux Candidatures</button>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Analyse certifiée conforme aux principes de transparence et d'équité.</div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Results;
