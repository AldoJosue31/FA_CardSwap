import { useState } from 'react';
import MainMenu from './pages/MainMenu';
import Match from './pages/Match';

type MenuEntryScreen = 'boot' | 'difficulty' | 'online';

// ACTUALIZADO: Añadimos el username a la sesión online
export type OnlineSession = { roomCode: string; isHost: boolean; username: string };

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'match'>('menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Normal');
  const [menuEntryScreen, setMenuEntryScreen] = useState<MenuEntryScreen>('boot');
  const [onlineSession, setOnlineSession] = useState<OnlineSession | null>(null);

  const handleStartMatch = (difficulty: string) => {
    setOnlineSession(null);
    setSelectedDifficulty(difficulty);
    setCurrentView('match');
  };

  const handleStartOnlineMatch = (roomCode: string, isHost: boolean, username: string) => {
    setOnlineSession({ roomCode, isHost, username });
    setSelectedDifficulty('Online');
    setCurrentView('match');
  };

  const handleReturnToMenu = () => {
    if (onlineSession) {
      setMenuEntryScreen('online');
    } else {
      setMenuEntryScreen('difficulty');
    }
    setOnlineSession(null);
    setCurrentView('menu');
  };

  return (
    <>
      {currentView === 'menu' && (
        <MainMenu 
          initialScreen={menuEntryScreen as any} 
          onStartMatch={handleStartMatch} 
          onStartOnlineMatch={handleStartOnlineMatch} 
        />
      )}
      {currentView === 'match' && (
        <Match 
          difficulty={selectedDifficulty} 
          onlineSession={onlineSession}
          onReturnToMenu={handleReturnToMenu}
          onNextLevel={(nextDiff) => handleStartMatch(nextDiff)}
        />
      )}
    </>
  );
}