import { useState } from 'react';
import MainMenu from './pages/MainMenu';
import Match from './pages/Match';

type MenuEntryScreen = 'boot' | 'difficulty';

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'match'>('menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Normal');
  const [menuEntryScreen, setMenuEntryScreen] = useState<MenuEntryScreen>('boot');

  const handleStartMatch = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentView('match');
  };

  const handleReturnToDifficultyMenu = () => {
    setMenuEntryScreen('difficulty');
    setCurrentView('menu');
  };

  return (
    <>
      {currentView === 'menu' && <MainMenu initialScreen={menuEntryScreen} onStartMatch={handleStartMatch} />}
      {currentView === 'match' && (
        <Match 
          difficulty={selectedDifficulty} 
          onReturnToMenu={handleReturnToDifficultyMenu}
          onNextLevel={(nextDiff) => handleStartMatch(nextDiff)}
        />
      )}
    </>
  );
}
