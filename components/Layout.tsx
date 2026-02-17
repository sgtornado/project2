
import React from 'react';
import { 
  LogoPlaceholder, 
  INSTITUTION_NAME,
  YEAR, 
  NATIONAL_PORTAL_URL, 
  USER_GUIDE_URL, 
  SUPPORT_EMAIL
} from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated, onLogout, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header Institutionnel Haute Visibilité */}
      <header className="bg-white border-b-4 border-blue-900 shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Branding Section - Toujours visible et alignée à gauche */}
            <div 
              className="flex items-center gap-4 cursor-pointer group" 
              onClick={() => isAuthenticated && onNavigate('DASHBOARD')}
            >
              <LogoPlaceholder className="h-16 w-auto sm:h-20 transition-transform group-hover:scale-105" />
              <div className="hidden lg:block border-l-2 pl-4 border-slate-200">
                <h1 className="text-blue-900 text-xs font-black uppercase tracking-wider leading-tight max-w-[280px]">
                  {INSTITUTION_NAME}
                </h1>
                <p className="text-green-700 text-[10px] font-bold uppercase mt-1">Département des Marchés Publics</p>
              </div>
              <div className="lg:hidden block border-l-2 pl-3 border-slate-200">
                <p className="text-blue-900 text-[10px] font-black uppercase tracking-widest leading-none">AREF</p>
                <p className="text-green-700 text-[9px] font-bold uppercase tracking-tighter">GON</p>
              </div>
            </div>

            {/* Navigation Section - Uniquement si connecté */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
                <button 
                  onClick={() => onNavigate('DASHBOARD')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                    currentPage === 'DASHBOARD' 
                      ? 'text-white bg-blue-900 shadow-lg' 
                      : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  Tableau de bord
                </button>
                <button 
                  onClick={() => onNavigate('STEP_TENDER')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                    currentPage === 'STEP_TENDER' 
                      ? 'text-white bg-blue-900 shadow-lg' 
                      : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  Nouveau Marché
                </button>
              </div>
            )}

            {/* Action Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button 
                  onClick={onLogout}
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 px-4 py-2.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                >
                  Déconnexion
                </button>
              ) : (
                <div className="hidden sm:block text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Plateforme d'Analyse</p>
                  <p className="text-[10px] text-blue-900 font-black uppercase tracking-tight">Accès Sécurisé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer Institutionnel */}
      <footer className="bg-slate-900 text-white py-12 border-t-8 border-green-700 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left space-y-4">
              <div className="flex justify-center md:justify-start items-center gap-3">
                 <div className="bg-white p-1 rounded-sm w-12 h-12 flex items-center justify-center">
                    <LogoPlaceholder className="h-10 w-auto" />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black tracking-tight uppercase leading-tight">AREF Guelmim-Oued Noun</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Marchés Publics © {YEAR}</p>
                 </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-[9px] font-black uppercase tracking-widest">
              <a href={USER_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-blue-900 px-4 py-2 rounded transition-colors border border-slate-700">Guide</a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="bg-slate-800 hover:bg-blue-900 px-4 py-2 rounded transition-colors border border-slate-700">Support</a>
              <a href={NATIONAL_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-blue-900 px-4 py-2 rounded transition-colors border border-slate-700 text-blue-300">Portail National</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
