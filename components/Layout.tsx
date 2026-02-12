
import React from 'react';
import { LogoPlaceholder, INSTITUTION_NAME, YEAR } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated, onLogout, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => isAuthenticated && onNavigate('STEP_TENDER')}>
              <LogoPlaceholder />
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-r pr-4 border-gray-200">
                  Processus d'Analyse 2026
                </span>
                <button 
                   onClick={() => onNavigate('STEP_TENDER')}
                   className="text-sm font-bold text-blue-900 hover:text-blue-700"
                >
                  Nouveau Marché
                </button>
              </div>
            )}

            <div className="flex items-center">
              {isAuthenticated && (
                <button 
                  onClick={onLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-bold transition-colors border border-gray-300 shadow-sm"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-bold tracking-wide">© {YEAR} {INSTITUTION_NAME}</p>
              <p className="text-xs text-blue-300 mt-2 font-medium">Direction des Affaires Juridiques et de la Logistique</p>
            </div>
            <div className="flex space-x-8 text-[11px] font-bold uppercase tracking-wider text-blue-200">
              <a href="#" className="hover:text-white transition-colors">Guide Utilisateur</a>
              <a href="#" className="hover:text-white transition-colors">Support Technique</a>
              <a href="#" className="hover:text-white transition-colors">Portail National</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
