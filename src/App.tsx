import { useState } from 'react';
import MainMenu from './pages/MainMenu';
import Match from './pages/Match';

// Añadimos 'online' como una de las pantallas de entrada válidas
type MenuEntryScreen = 'boot' | 'difficulty' | 'online';
type OnlineSession = { roomCode: string; isHost: boolean };

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

  const handleStartOnlineMatch = (roomCode: string, isHost: boolean) => {
    setOnlineSession({ roomCode, isHost });
    setSelectedDifficulty('Online');
    setCurrentView('match');
  };

  // CORRECCIÓN: Función inteligente que sabe de qué modo de juego vienes
  const handleReturnToMenu = () => {
    if (onlineSession) {
      setMenuEntryScreen('online'); // Regresamos al menú multijugador
    } else {
      setMenuEntryScreen('difficulty'); // Regresamos al menú local (CPU)
    }
    
    // Limpiamos la sesión HASTA DESPUÉS de haber leído de dónde veníamos
    setOnlineSession(null);
    setCurrentView('menu');
  };

  return (
    <>
      {currentView === 'menu' && (
        <MainMenu 
          // Forzamos el tipado por la compatibilidad con el tipo amplio de MainMenu
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