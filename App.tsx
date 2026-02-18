
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

  useEffect(() => {
    // Vérifier la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) setCurrentPage('DASHBOARD');
      setIsLoading(false);
    });

    // Écouter les changements d'état (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    await supabase.auth.signOut();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
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