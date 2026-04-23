'use client';

import { useParams } from 'next/navigation';

export default function RoomIdPage() {
  const params = useParams();
  const roomId = params.roomId;

  return <p className="font-mono uppercase text-center">room {roomId}</p>;
}
