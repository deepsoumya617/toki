'use client';

import { RoomsList } from '@/components/ui/rooms-list';
import { useRoomsAll } from '@/hooks/use-rooms-all';

export default function RoomsPage() {
  const { data } = useRoomsAll();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-3">
      <div>
        <h1 className="text-2xl font-bold sm:font-semibold tracking-tight text-stone-900">
          Rooms
          <span className="text-lg ml-1 text-stone-500">
            ({data?.totalRooms})
          </span>
        </h1>
      </div>
      <RoomsList />
    </section>
  );
}
