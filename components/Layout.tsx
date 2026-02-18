
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
      {/* Header Simplifié */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Branding Section */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => isAuthenticated && onNavigate('DASHBOARD')}
            >
              <LogoPlaceholder />
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onNavigate('DASHBOARD')}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                      currentPage === 'DASHBOARD' 
                        ? 'text-blue-900 bg-blue-50' 
                        : 'text-slate-500 hover:text-blue-900'
                    }`}
                  >
                    Tableau de bord
                  </button>
                  <button 
                    onClick={() => onNavigate('STEP_TENDER')}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                      currentPage === 'STEP_TENDER' 
                        ? 'text-blue-900 bg-blue-50' 
                        : 'text-slate-500 hover:text-blue-900'
                    }`}
                  >
                    Nouveau Marché
                  </button>
                  
                  <button 
                    onClick={onLogout}
                    className="ml-4 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer Standard */}
      <footer className="bg-slate-900 text-white py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-tight">{INSTITUTION_NAME}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">© {YEAR} - Gestion des Marchés Publics</p>
            </div>
            <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
              <a href={USER_GUIDE_URL} className="hover:text-blue-400">Guide</a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-blue-400">Support</a>
              <a href={NATIONAL_PORTAL_URL} className="text-blue-400">Portail National</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
