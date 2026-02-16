
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header classique AREF */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => isAuthenticated && onNavigate('DASHBOARD')}>
              <LogoPlaceholder className="h-12 w-auto" />
              <div className="hidden sm:block ml-4 border-l pl-4 border-gray-200">
                <p className="text-xs font-black text-blue-900 uppercase tracking-widest leading-none">AREF</p>
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Guelmim-Oued Noun</p>
              </div>
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => onNavigate('DASHBOARD')}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    currentPage === 'DASHBOARD' ? 'text-blue-900 border-b-2 border-blue-900 pb-1' : 'text-gray-400 hover:text-blue-900'
                  }`}
                >
                  Tableau de bord
                </button>
                <button 
                  onClick={() => onNavigate('STEP_TENDER')}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    currentPage === 'STEP_TENDER' ? 'text-blue-900 border-b-2 border-blue-900 pb-1' : 'text-gray-400 hover:text-blue-900'
                  }`}
                >
                  Nouveau Marché
                </button>
              </div>
            )}

            <div className="flex items-center">
              {isAuthenticated && (
                <button 
                  onClick={onLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors border border-gray-300 shadow-sm"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-10 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-bold tracking-wide">© {YEAR} {INSTITUTION_NAME}</p>
              <p className="text-xs text-blue-300 mt-2 font-medium uppercase tracking-tight">Direction des Affaires Juridiques et de la Logistique</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold uppercase tracking-wider text-blue-200">
              <a 
                href={USER_GUIDE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>📘</span> Guide Utilisateur
              </a>
              <a 
                href={`mailto:${SUPPORT_EMAIL}`}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>✉️</span> Support Technique
              </a>
              <a 
                href={NATIONAL_PORTAL_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>🌐</span> Portail National
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
