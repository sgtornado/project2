
import React, { useState, useRef } from 'react';
import Stepper from '../components/Stepper';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from '../types';
import { GoogleGenAI } from "@google/genai";
import { INSTITUTION_NAME, YEAR } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredCandidates = candidates.filter(c => filter === 'all' || c.status === filter);

  const generateGlobalSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Générez une synthèse professionnelle pour un procès-verbal de commission de dépouillement technique.
      MARCHÉ : ${tender.title}
      RÉFÉRENCE : ${tender.reference}
      NOMBRE DE CANDIDATS : ${candidates.length}
      
      DÉTAILS DES OFFRES :
      ${candidates.map(c => `- ${c.name} : Score ${c.score}%, Statut ${c.status}, Observations: ${c.observations}`).join('\n')}
      
      Structure de la réponse (en français administratif soutenu) :
      1. État de la participation (nombre de plis reçus).
      2. Analyse comparative des offres techniques.
      3. Synthèse des motifs d'acceptation ou de rejet selon le règlement de consultation.
      4. Avis final motivé de la commission.`;

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

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    // Attendre un court instant pour que le DOM se mette à jour avec isExporting = true
    setTimeout(async () => {
      try {
        const element = reportRef.current!;
        const canvas = await html2canvas(element, {
          scale: 2, // Haute qualité
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Rapport_AREF_GON_${tender.reference}.pdf`);
      } catch (error) {
        console.error("Erreur lors de l'export PDF:", error);
        alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.");
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="no-print">
        <Stepper currentStep={3} />
      </div>
      
      <div 
        ref={reportRef}
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-10 transition-all ${isExporting ? 'p-10' : ''}`}
      >
        
        {/* En-tête Institutionnel (Visible si export ou print) */}
        {(isExporting) && (
          <div className="mb-8 border-b-2 border-slate-900 pb-6">
            <div className="flex justify-between items-start">
                <div className="text-[10px] font-bold leading-tight uppercase text-slate-800">
                    Royaume du Maroc<br/>
                    Ministère de l'Éducation Nationale,<br/>
                    du Préscolaire et des Sports<br/>
                    {INSTITUTION_NAME}
                </div>
                <div className="text-right text-[10px] text-slate-500">
                    Date: {new Date().toLocaleDateString('fr-FR')}<br/>
                    Session: {YEAR}
                </div>
            </div>
            <div className="mt-8 text-center">
                <h1 className="text-lg font-black uppercase border-y border-slate-900 py-3 inline-block px-10 text-slate-900">
                    Procès-Verbal de la Commission de Dépouillement
                </h1>
            </div>
          </div>
        )}

        {/* Header UI */}
        <div className={`p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExporting ? 'bg-transparent text-slate-900 px-0' : 'bg-blue-900 text-white'}`}>
          <div>
            {!isExporting && (
              <div className="flex items-center gap-3 mb-2 no-print">
                  <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">⚡ Analyse IA Déployée</span>
                  <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
              </div>
            )}
            <h1 className={`text-2xl font-black uppercase leading-tight ${isExporting ? 'text-slate-900 text-xl' : 'text-white'}`}>
                {tender.title}
            </h1>
            {isExporting && <p className="text-xs font-bold mt-2 text-slate-500">Référence : {tender.reference}</p>}
          </div>
          
          {!isExporting && (
            <div className="flex flex-wrap gap-3 no-print">
               <button 
                  onClick={generateGlobalSummary} 
                  disabled={isGeneratingSummary}
                  className="bg-amber-500 hover:bg-amber-600 text-blue-900 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
               >
                 {isGeneratingSummary ? 'Génération...' : '✨ Synthèse IA'}
               </button>
               <button 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                  className="bg-white hover:bg-slate-50 text-blue-900 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-slate-200 flex items-center gap-2"
               >
                 <span>📥</span> {isExporting ? 'Exportation...' : 'Exporter PDF'}
               </button>
            </div>
          )}
        </div>

        {/* Synthèse IA */}
        {globalSummary && (
          <div className={`p-8 ${isExporting ? 'px-0 py-6' : 'bg-blue-50 border-b border-blue-100'}`}>
            <h3 className="text-blue-900 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>📜</span> Synthèse de la Commission
            </h3>
            <div className={`prose prose-sm max-w-none text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-xl border border-blue-200 shadow-sm ${isExporting ? 'border-slate-300 shadow-none' : ''}`}>
              {globalSummary}
            </div>
          </div>
        )}

        {/* Liste des Candidats */}
        <div className={`p-8 ${isExporting ? 'px-0' : ''}`}>
            {!isExporting && (
              <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100 no-print">
                  <div className="flex gap-2">
                      {['all', CandidateStatus.ACCEPTED, CandidateStatus.REVIEW, CandidateStatus.REJECTED].map((stat) => (
                      <button key={stat} onClick={() => setFilter(stat)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === stat ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}>
                          {stat === 'all' ? 'Tous' : stat}
                      </button>
                      ))}
                  </div>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Dossiers : {filteredCandidates.length}</p>
              </div>
            )}

            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-1 ${isExporting ? 'block' : 'hidden md:block'}`}>Tableau Récapitulatif des Soumissionnaires</h3>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidat</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                            <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Décision</th>
                            {!isExporting && <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest no-print">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-5">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{candidate.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{candidate.fiscalId}</p>
                                </td>
                                <td className="px-4 py-5 text-center">
                                    <div className="text-sm font-black text-blue-900">{candidate.score}%</div>
                                </td>
                                <td className="px-4 py-5">
                                    <span className={`px-2 py-1 text-[9px] font-black rounded border uppercase tracking-widest ${
                                      candidate.status === CandidateStatus.ACCEPTED ? 'bg-green-50 text-green-700 border-green-200' : 
                                      candidate.status === CandidateStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' : 
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                {!isExporting && (
                                  <td className="px-4 py-5 text-right no-print">
                                      <button 
                                        onClick={() => setSelectedCandidate(candidate)}
                                        className="text-blue-900 font-black text-[9px] uppercase tracking-widest hover:underline"
                                      >
                                        Voir Détails
                                      </button>
                                  </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Zone de signatures (Visible si export) */}
            {isExporting && (
              <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-slate-200">
                  <div className="text-center">
                      <p className="text-[9px] font-black uppercase text-slate-900 mb-16">Le Président de Commission</p>
                      <div className="w-full border-b border-dashed border-slate-400"></div>
                  </div>
                  <div className="text-center">
                      <p className="text-[9px] font-black uppercase text-slate-900 mb-16">Membre 1</p>
                      <div className="w-full border-b border-dashed border-slate-400"></div>
                  </div>
                  <div className="text-center">
                      <p className="text-[9px] font-black uppercase text-slate-900 mb-16">Membre 2</p>
                      <div className="w-full border-b border-dashed border-slate-400"></div>
                  </div>
              </div>
            )}
        </div>
      </div>

      <div className="flex justify-center no-print">
          <button 
            onClick={onRestart}
            className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-900 transition-colors"
          >
            ← Retour au Tableau de Bord
          </button>
      </div>

      {/* Side Panel (No Print) */}
      {selectedCandidate && !isExporting && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-[100] flex justify-end no-print" onClick={() => setSelectedCandidate(null)}>
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-2xl font-black text-blue-900 uppercase leading-tight">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Détails de l'Analyse Technique</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-300 hover:text-slate-900 text-3xl">×</button>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Scoring</h4>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-900 flex items-center justify-center">
                    <span className="text-lg font-black text-blue-900">{selectedCandidate.score}%</span>
                  </div>
                  <p className="text-xs font-black uppercase text-slate-700">Conformité : <span className="text-green-600">{selectedCandidate.compliance}</span></p>
                </div>
              </section>

              {selectedCandidate.aiDetailedReport && (
                <>
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Points Forts</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiDetailedReport.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                          <span className="text-green-600">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Analyse Technique</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectedCandidate.aiDetailedReport.technicalAnalysis}"</p>
                  </section>
                </>
              )}

              <button onClick={() => setSelectedCandidate(null)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
