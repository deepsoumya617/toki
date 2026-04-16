import type { Cursor } from '@apps/api/src/modules/room/room-handlers';

export interface Room {
  id: string;
  name: string;
  membersCount: number;
  createdAt: string;
  expiresAt: string | null;
  isOwner: boolean;
}

export interface SidebarRoom {
  id: string;
  name: string;
}

export interface SidebarRoomsCache {
  success: boolean;
  rooms: SidebarRoom[];
}

export interface RoomsPage {
  allRooms: Room[];
  nextCursor: Cursor | null;
  hasNextPage: boolean;
}
