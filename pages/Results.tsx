
import React, { useState, useRef, useEffect } from 'react';
import Stepper from '../components/Stepper';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from '../types';

interface ResultsProps {
  tender: Tender;
  candidates: Candidate[];
  onBack: () => void;
  onRestart: () => void;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block ml-1" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black hover:bg-blue-200 transition-colors cursor-help"
        aria-label="Information sur l'analyse"
      >
        i
      </button>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 uppercase tracking-wider leading-relaxed text-center">
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
          {text}
        </div>
      )}
    </div>
  );
};

const Results: React.FC<ResultsProps> = ({ tender, candidates, onBack, onRestart }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredCandidates = candidates.filter(c => {
    const matchesStatus = filter === 'all' || c.status === filter;
    return matchesStatus;
  });

  const getStatusStyle = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.ACCEPTED: return 'bg-green-100 text-green-800 border-green-200';
      case CandidateStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
      case CandidateStatus.REVIEW: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = [
      "Raison Sociale",
      "Identifiant Fiscal",
      "Province",
      "Score Technique (%)",
      "Decision",
      "Conformite",
      "Observations"
    ];

    // CSV Data rows
    const rows = candidates.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.fiscalId}"`,
      `"${c.region}"`,
      c.score,
      `"${c.status}"`,
      `"${c.compliance}"`,
      `"${c.observations.replace(/"/g, '""')}"`
    ]);

    // Combine with semicolon for Excel compatibility in FR/MA locales
    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.join(";"))
    ].join("\n");

    // Add BOM for UTF-8 Excel compatibility
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PV_Depouillement_${tender.reference}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const AI_DISCLAIMER = "Ces scores et statuts sont générés par l'IA et doivent être impérativement validés par un expert humain.";

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <Stepper currentStep={3} />
      
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-10">
        <div className="bg-blue-900 p-8 border-b border-blue-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg gap-1">
                  <span>⚡ Analyse IA Confirmée</span>
                  <InfoTooltip text={AI_DISCLAIMER} />
                </div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">{tender.title}</h1>
            <p className="text-blue-200 text-xs mt-2 font-bold italic">Rapport final de dépouillement technique - AREF-GON</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
                onClick={handleExportCSV}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/20 flex items-center gap-2"
             >
               <span>📥</span> Export CSV
             </button>
             <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/20">Imprimer PV</button>
             <button onClick={onRestart} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xl">Clôturer Marché</button>
          </div>
        </div>

        <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex space-x-2">
                    {['all', CandidateStatus.ACCEPTED, CandidateStatus.REVIEW, CandidateStatus.REJECTED].map((stat) => (
                    <button 
                        key={stat}
                        onClick={() => setFilter(stat)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 transition-all ${filter === stat ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                    >
                        {stat === 'all' ? 'Tous' : stat}
                    </button>
                    ))}
                </div>
                <div className="text-blue-900 font-black text-xs uppercase tracking-widest">
                    Candidatures traitées : {filteredCandidates.length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidat</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Score IA</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Décision</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Observations IA</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Conformité</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                      {candidate.name}
                                      {candidate.isAiAnalyzed && (
                                        <div className="flex items-center gap-0.5">
                                          <span title="Analysé par IA" className="text-blue-500">🤖</span>
                                          <InfoTooltip text={AI_DISCLAIMER} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{candidate.fiscalId} • {candidate.region}</div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-center">
                                    <div className={`text-sm font-black ${candidate.score >= 80 ? 'text-green-700' : 'text-blue-900'}`}>{candidate.score}%</div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 inline-flex text-[9px] font-black rounded border-2 uppercase tracking-widest ${getStatusStyle(candidate.status)}`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="max-w-xs text-[10px] font-bold text-gray-600 uppercase leading-relaxed italic line-clamp-2">
                                        {candidate.observations}
                                    </div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-right">
                                    <span className={`text-[9px] font-black uppercase ${candidate.compliance === ComplianceBadge.CONFORME ? 'text-green-600' : 'text-red-600'}`}>
                                        {candidate.compliance}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs italic">
                              Aucun dossier correspondant.
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
            <button onClick={onBack} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-900 transition-colors">← Retour aux Candidatures</button>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Analyse assistée par Intelligence Artificielle - Académie Régionale GON</div>
        </div>
      </div>
    </div>
  );
};

export default Results;
