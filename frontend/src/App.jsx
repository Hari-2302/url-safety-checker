import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import HistoryPage from './pages/History';
import AutomataPage from './pages/Automata';
import AboutPage from './pages/About';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sharedUrl, setSharedUrl] = useState('');

  const handleSelectUrlForAnalysis = (url) => {
    setSharedUrl(url);
    setActivePage('analyzer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-950 text-slate-100 cyber-grid">
      
      {/* Top Navigation */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'dashboard' && (
          <Dashboard 
            setActivePage={setActivePage} 
            setSharedUrl={handleSelectUrlForAnalysis} 
          />
        )}

        {activePage === 'analyzer' && (
          <Analyzer 
            initialUrl={sharedUrl} 
            onAnalysisComplete={() => {}} 
          />
        )}

        {activePage === 'history' && (
          <HistoryPage 
            onSelectUrl={handleSelectUrlForAnalysis} 
          />
        )}

        {activePage === 'automata' && (
          <AutomataPage />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
