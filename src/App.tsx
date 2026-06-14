import { useState } from 'react';
import MainMenu from './pages/MainMenu';
import Match from './pages/Match';

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'match'>('menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Normal');

  const handleStartMatch = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentView('match');
  };

  return (
    <>
      {currentView === 'menu' && <MainMenu onStartMatch={handleStartMatch} />}
      {currentView === 'match' && (
        <Match 
          difficulty={selectedDifficulty} 
          onReturnToMenu={() => setCurrentView('menu')}
          onNextLevel={(nextDiff) => handleStartMatch(nextDiff)}
        />
      )}
    </>
  );
}