
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import { Candidate, CandidateStatus, ComplianceBadge, Tender } from '../types';

interface ResultsProps {
  tender: Tender;
  candidates: Candidate[];
  onBack: () => void;
  onRestart: () => void;
}

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

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <Stepper currentStep={3} />
      
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-10">
        <div className="bg-blue-900 p-8 border-b border-blue-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg flex items-center gap-1">
                  ⚡ Analyse IA Confirmée
                </span>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">{tender.title}</h1>
            <p className="text-blue-200 text-xs mt-2 font-bold italic">Rapport final de dépouillement technique - AREF-GON</p>
          </div>
          <div className="flex space-x-3">
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
                                      {candidate.isAiAnalyzed && <span title="Analysé par IA" className="text-blue-500">🤖</span>}
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
