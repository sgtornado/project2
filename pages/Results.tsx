
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import { MOCK_CANDIDATES } from '../constants';
import { CandidateStatus, ComplianceBadge, Tender } from '../types';

interface ResultsProps {
  tender: Tender;
  onBack: () => void;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ tender, onBack, onRestart }) => {
  const [filter, setFilter] = useState<string>('all');

  // Simulation : On utilise le mock mais on filtre par le tender actuel (pour la démo on prend AO-2026-001)
  const filteredCandidates = MOCK_CANDIDATES.filter(c => {
    const matchesStatus = filter === 'all' || c.status === filter;
    return matchesStatus;
  });

  const getStatusStyle = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.ACCEPTED: return 'bg-green-100 text-green-800 border-green-200 shadow-sm';
      case CandidateStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200 shadow-sm';
      case CandidateStatus.REVIEW: return 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Stepper currentStep={3} />
      
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-10">
        <div className="bg-blue-900 p-8 border-b border-blue-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">Rapport Automatisé</span>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">{tender.reference}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase leading-tight">{tender.title}</h1>
            <p className="text-blue-200 text-xs mt-2 font-bold italic tracking-wide">Résultats d'analyse générés le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="flex space-x-3">
             <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/20">Exporter PDF</button>
             <button onClick={onRestart} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xl">Nouveau Marché</button>
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
                        {stat === 'all' ? 'Toutes les offres' : stat}
                    </button>
                    ))}
                </div>
                <div className="text-blue-900 font-black text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    Soumissionnaires analysés : {filteredCandidates.length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Entreprise</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Technique</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Observations</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{candidate.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{candidate.fiscalId} • {candidate.region}</div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-center">
                                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                                        <span className={`text-sm font-black ${candidate.score >= 80 ? 'text-green-700' : 'text-blue-900'}`}>{candidate.score}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 inline-flex text-[9px] font-black rounded border-2 uppercase tracking-widest ${getStatusStyle(candidate.status)}`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex items-center text-[10px] font-bold text-gray-500 italic uppercase">
                                        {candidate.compliance === ComplianceBadge.CONFORME ? '✓ Dossier Complet' : candidate.compliance === ComplianceBadge.RISQUE ? '⚠ Pièces manquantes' : '✖ Non Conforme'}
                                    </div>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-right">
                                    <button className="text-blue-900 hover:text-blue-700 font-black text-[10px] uppercase tracking-tighter underline underline-offset-4">Voir Fiche</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
            <button 
                onClick={onBack}
                className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-blue-900 transition-colors"
            >
                ← Corriger les Candidatures
            </button>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                Signature : Commission d'Ouverture et d'Analyse des Plis
            </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
