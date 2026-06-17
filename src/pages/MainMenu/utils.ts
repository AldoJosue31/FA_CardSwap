import { ROOM_CODE_LENGTH } from './constants';

export const createRoomCode = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/gi, '')
    .slice(2, 2 + ROOM_CODE_LENGTH)
    .toUpperCase()
    .padEnd(ROOM_CODE_LENGTH, '0');

export const normalizeRoomCode = (value: string) =>
  value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);
