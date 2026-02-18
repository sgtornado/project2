
import React from 'react';
import { MOCK_TENDERS, NATIONAL_PORTAL_URL, USER_GUIDE_URL } from '../constants';
import { Tender } from '../types';

const Dashboard: React.FC<{ onNavigate: (page: any, tender?: Tender) => void }> = ({ onNavigate }) => {
  const stats = [
    { name: 'Marchés Actifs', value: MOCK_TENDERS.length.toString(), color: 'bg-blue-600' },
    { name: 'Dossiers à Valider', value: '14', color: 'bg-green-600' },
    { name: 'Séances Programmées', value: '3', color: 'bg-amber-500' },
    { name: 'Commissions', value: '5', color: 'bg-blue-900' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tableau de Bord Stratégique</h1>
          <p className="text-slate-500 text-sm font-medium">Gestion et analyse des appels d'offres de l'AREF Guelmim-Oued Noun.</p>
        </div>
        <div className="flex gap-3">
          <a 
            href={NATIONAL_PORTAL_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-900 hover:text-blue-900 transition-all shadow-sm"
          >
            <span>🔗</span> Portail National
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-1 h-12 ${stat.color} rounded-full`}></div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.name}</dt>
                    <dd className="text-2xl font-black text-slate-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 rounded-2xl p-8 mb-10 shadow-xl border border-blue-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-white text-lg font-black uppercase tracking-tight mb-1">Portail des Marchés Publics du Maroc</h2>
          <p className="text-blue-200 text-xs font-bold opacity-80 uppercase tracking-wide">Accédez à la plateforme officielle pour consulter les textes réglementaires et les avis nationaux.</p>
        </div>
        <a 
          href={NATIONAL_PORTAL_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-blue-900 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap"
        >
          Accéder au Portail National →
        </a>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Marchés en cours d'analyse</h2>
        <button 
          onClick={() => onNavigate('UPLOAD_TENDER')}
          className="bg-green-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-all shadow-md"
        >
          + Créer un nouveau marché
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TENDERS.map((tender) => (
          <div key={tender.reference} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
            <div className="p-8 flex-grow">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-50 text-blue-900 text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest">
                  {tender.reference}
                </span>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                  tender.status === 'Ouvert' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {tender.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-4 leading-tight min-h-[3.5rem] uppercase tracking-tight group-hover:text-blue-900 transition-colors">
                {tender.title}
              </h3>
              <div className="space-y-3 mt-6 border-t border-slate-50 pt-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Budget estimé:</span>
                  <span className="font-black text-slate-900">{tender.budget.toLocaleString()} DH</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Délai d'ouverture:</span>
                  <span className="font-black text-slate-900">{tender.deadline}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex space-x-3">
              <button 
                onClick={() => onNavigate('RESULTS', tender)}
                className="flex-1 bg-blue-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md"
              >
                Lancer l'Analyse
              </button>
              <button className="bg-white border border-slate-200 px-4 rounded-xl hover:bg-slate-100 transition-all text-xl">
                ⚙️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
