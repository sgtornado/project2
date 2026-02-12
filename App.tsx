
import React, { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadTender from './pages/UploadTender';
import UploadCandidate from './pages/UploadCandidate';
import Results from './pages/Results';
import { Page, Tender, Candidate } from './types';
import { MOCK_TENDERS, MOCK_CANDIDATES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('LOGIN');
  const [currentTender, setCurrentTender] = useState<Tender | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('STEP_TENDER');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('LOGIN');
    setCurrentTender(null);
    setCandidates([]);
  };

  const handleTenderCreated = (tender: Tender) => {
    setCurrentTender(tender);
    setCurrentPage('STEP_CANDIDATES');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'LOGIN':
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('REGISTER')} />;
      case 'REGISTER':
        return <Register onRegister={handleLogin} onNavigateToLogin={() => setCurrentPage('LOGIN')} />;
      case 'STEP_TENDER':
        return <UploadTender onComplete={handleTenderCreated} />;
      case 'STEP_CANDIDATES':
        return (
          <UploadCandidate 
            tender={currentTender || MOCK_TENDERS[0]} 
            onNext={() => setCurrentPage('STEP_RESULTS')}
            onBack={() => setCurrentPage('STEP_TENDER')}
          />
        );
      case 'STEP_RESULTS':
        return (
          <Results 
            tender={currentTender || MOCK_TENDERS[0]} 
            onBack={() => setCurrentPage('STEP_CANDIDATES')}
            onRestart={() => {
                setCurrentTender(null);
                setCandidates([]);
                setCurrentPage('STEP_TENDER');
            }}
          />
        );
      default:
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('REGISTER')} />;
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
