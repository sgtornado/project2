
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadTender from './pages/UploadTender';
import UploadCandidate from './pages/UploadCandidate';
import Results from './pages/Results';
import { Page, Tender, Candidate } from './types';
import { MOCK_TENDERS } from './constants';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<Page>('LOGIN');
  const [currentTender, setCurrentTender] = useState<Tender | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("App: Initializing Supabase session...");
        
        // Vérifier la session actuelle au chargement
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        setIsAuthenticated(!!session);
        if (session) {
          setCurrentPage('DASHBOARD');
        } else {
          setCurrentPage('LOGIN');
        }
      } catch (err: any) {
        console.error("App: Initialization failed", err);
        setInitError(err.message || "Erreur de connexion aux services d'authentification.");
      } finally {
        // Crucial: S'assurer que le loader s'arrête quoi qu'il arrive
        setIsLoading(false);
      }
    };

    initializeApp();

    // Écouter les changements d'état (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("App: Auth state changed", _event);
      setIsAuthenticated(!!session);
      if (session) {
        setCurrentPage('DASHBOARD');
      } else {
        setCurrentPage('LOGIN');
        setCurrentTender(null);
        setCandidates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleTenderCreated = (tender: Tender) => {
    setCurrentTender(tender);
    setCurrentPage('STEP_CANDIDATES');
  };

  const handleNavigate = (page: Page, tender?: Tender) => {
    if (tender) {
      setCurrentTender(tender);
    }
    setCurrentPage(page);
  };

  const handleAddCandidate = (candidate: Candidate) => {
    setCandidates(prev => [...prev, candidate]);
  };

  // Affichage de l'erreur d'initialisation si présente
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-black text-slate-900 uppercase mb-2">Erreur de Connexion</h2>
          <p className="text-sm text-slate-500 mb-6">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation sécurisée...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'LOGIN':
        return <Login onLogin={() => setCurrentPage('DASHBOARD')} onNavigateToRegister={() => setCurrentPage('REGISTER')} />;
      case 'REGISTER':
        return <Register onRegister={() => setCurrentPage('DASHBOARD')} onNavigateToLogin={() => setCurrentPage('LOGIN')} />;
      case 'DASHBOARD':
        return (
          <Dashboard 
            onNavigate={(page, tender) => {
              if (page === 'UPLOAD_TENDER') handleNavigate('STEP_TENDER');
              else if (page === 'RESULTS' && tender) handleNavigate('STEP_RESULTS', tender);
            }} 
          />
        );
      case 'STEP_TENDER':
        return <UploadTender onComplete={handleTenderCreated} />;
      case 'STEP_CANDIDATES':
        return (
          <UploadCandidate 
            tender={currentTender || MOCK_TENDERS[0]} 
            onNext={() => setCurrentPage('STEP_RESULTS')}
            onBack={() => setCurrentPage('DASHBOARD')}
            onAddCandidate={handleAddCandidate}
            candidatesCount={candidates.length}
          />
        );
      case 'STEP_RESULTS':
        return (
          <Results 
            tender={currentTender || MOCK_TENDERS[0]} 
            candidates={candidates}
            onBack={() => {
              if (currentTender) setCurrentPage('STEP_CANDIDATES');
              else setCurrentPage('DASHBOARD');
            }}
            onRestart={() => {
                setCurrentTender(null);
                setCandidates([]);
                setCurrentPage('DASHBOARD');
            }}
          />
        );
      default:
        return <Login onLogin={() => setCurrentPage('DASHBOARD')} onNavigateToRegister={() => setCurrentPage('REGISTER')} />;
    }
  };

  return (
    <Layout 
      isAuthenticated={isAuthenticated} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={(p) => handleNavigate(p as Page)}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;