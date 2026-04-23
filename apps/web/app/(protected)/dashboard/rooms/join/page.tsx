import JoinRoomContent from '../_components/join-room-content';
import { Suspense } from 'react';

export default function JoinRoomsPage() {
  return (
    <Suspense fallback={null}>
      <JoinRoomContent />
    </Suspense>
  );
}
