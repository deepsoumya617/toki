'use client';

import RoomsHeader from './rooms-header';
import { RoomsList } from './rooms-list';
import { useState } from 'react';

export default function RoomsContainer() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <>
      <RoomsHeader roomId={selectedRoomId} />
      <RoomsList
        selectedRoomId={selectedRoomId}
        onSelect={id => setSelectedRoomId(prev => (prev === id ? null : id))}
      />
    </>
  );
}
