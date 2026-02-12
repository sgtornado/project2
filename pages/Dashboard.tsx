
import React from 'react';
import { MOCK_TENDERS } from '../constants';
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Appels d'Offres</h1>
        <p className="text-gray-600">Suivi et analyse des marchés publics de l'AREF Guelmim-Oued Noun.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-1 h-10 ${stat.color} rounded`}></div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Marchés en cours d'analyse</h2>
        <button 
          onClick={() => onNavigate('UPLOAD_TENDER')}
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-800 transition-colors"
        >
          + Créer un nouveau marché
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TENDERS.map((tender) => (
          <div key={tender.reference} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100">
                  REF: {tender.reference}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                  tender.status === 'Ouvert' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {tender.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight h-14 overflow-hidden">
                {tender.title}
              </h3>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Budget estimé:</span>
                  <span className="font-bold text-gray-900">{tender.budget.toLocaleString()} DH</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Délai:</span>
                  <span className="font-bold text-gray-900">{tender.deadline}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex space-x-2">
              <button 
                onClick={() => onNavigate('RESULTS', tender)}
                className="flex-1 bg-blue-900 text-white py-2 rounded text-xs font-bold hover:bg-blue-800 transition-colors"
              >
                Analyser Candidatures
              </button>
              <button className="bg-white border border-gray-300 p-2 rounded hover:bg-gray-100">
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
