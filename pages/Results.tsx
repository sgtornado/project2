
import React, { useState, useRef, useEffect } from 'react';
import Stepper from '../components/Stepper';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ResultsProps {
  tender: Tender;
  candidates: Candidate[];
  onBack: () => void;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ tender, candidates, onBack, onRestart }) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [globalSummary, setGlobalSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const filteredCandidates = candidates.filter(c => filter === 'all' || c.status === filter);

  const generateGlobalSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Générez une synthèse professionnelle pour un procès-verbal de commission de dépouillement technique.
      MARCHÉ : ${tender.title}
      RÉSUMÉ DES CANDIDATS :
      ${candidates.map(c => `- ${c.name} : Score ${c.score}%, Statut ${c.status}, Observations: ${c.observations}`).join('\n')}
      
      Structure de la réponse (en français soutenu) :
      1. Aperçu de la participation.
      2. Analyse des meilleures offres.
      3. Synthèse des motifs de rejet.
      4. Recommandation finale pour le comité de décision.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setGlobalSummary(response.text || "Impossible de générer la synthèse.");
    } catch (error) {
      console.error(error);
      setGlobalSummary("Erreur lors de la génération de la synthèse.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <Stepper currentStep={3} />
      
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-10">
        <div className="bg-blue-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">⚡ Analyse IA Déployée</span>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">{tender.title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
             <button onClick={generateGlobalSummary} className="bg-amber-500 hover:bg-amber-600 text-blue-900 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
               {isGeneratingSummary ? 'Génération...' : '✨ Synthèse du PV'}
             </button>
             <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/20">Imprimer Rapport</button>
          </div>
        </div>

        {globalSummary && (
          <div className="p-8 bg-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-blue-900 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>📜</span> Synthèse de Commission Générée par l'IA
            </h3>
            <div className="prose prose-sm max-w-none text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
              {globalSummary}
            </div>
          </div>
        )}

        <div className="p-8">
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex gap-2">
                    {['all', CandidateStatus.ACCEPTED, CandidateStatus.REVIEW, CandidateStatus.REJECTED].map((stat) => (
                    <button key={stat} onClick={() => setFilter(stat)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === stat ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}>
                        {stat === 'all' ? 'Tous' : stat}
                    </button>
                    ))}
                </div>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Dossiers : {filteredCandidates.length}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidat</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score IA</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Décision</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise IA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{candidate.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{candidate.fiscalId} • {candidate.region}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className={`text-sm font-black ${candidate.score >= 80 ? 'text-green-600' : 'text-blue-900'}`}>{candidate.score}%</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2 py-1 text-[9px] font-black rounded border uppercase tracking-widest ${
                                      candidate.status === CandidateStatus.ACCEPTED ? 'bg-green-50 text-green-700 border-green-200' : 
                                      candidate.status === CandidateStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' : 
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                      onClick={() => setSelectedCandidate(candidate)}
                                      className="text-blue-900 font-black text-[9px] uppercase tracking-widest hover:underline flex items-center gap-1 ml-auto"
                                    >
                                      <span>🧠</span> Voir Rapport
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Side Panel pour Détails IA */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in duration-300" onClick={() => setSelectedCandidate(null)}>
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-blue-900 uppercase leading-tight">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Détails de l'Analyse Technique</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-300 hover:text-slate-900 text-3xl">×</button>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Scoring de Conformité</h4>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full border-8 border-blue-900 flex items-center justify-center">
                    <span className="text-xl font-black text-blue-900">{selectedCandidate.score}%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-slate-700">Conformité : <span className="text-green-600">{selectedCandidate.compliance}</span></p>
                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">Score basé sur la complétude du dossier technique et l'adéquation des références fournies.</p>
                  </div>
                </div>
              </section>

              {selectedCandidate.aiDetailedReport && (
                <>
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Points Forts du Dossier</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiDetailedReport.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                          <span className="text-green-600">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Observations de Vigilance</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiDetailedReport.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                          <span className="text-red-500">⚠</span> {w}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3">Commentaire Technique Gemini</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectedCandidate.aiDetailedReport.technicalAnalysis}"</p>
                  </section>
                </>
              )}

              <div className="pt-10 border-t border-slate-100">
                <button onClick={() => setSelectedCandidate(null)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Fermer le Rapport</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
