export type MenuScreen =
  | 'boot'
  | 'title'
  | 'main'
  | 'quickplay'
  | 'local'
  | 'difficulty'
  | 'online'
  | 'join_room'
  | 'waiting_room'
  | 'options'
  | 'credits'
  | 'support'
  | 'gallery';

export type OnlineRoom = {
  short_code: string;
  status: 'waiting' | 'playing' | 'finished';
};

export type MainMenuProps = {
  initialScreen?: MenuScreen;
  onStartMatch?: (diff: string) => void;
  onStartOnlineMatch?: (roomId: string, isHost: boolean, username: string) => void;
};