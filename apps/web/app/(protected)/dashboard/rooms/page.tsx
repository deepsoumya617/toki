import { RoomsList } from '@/components/ui/rooms-list';

export default function RoomsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-3">
      <div>
        <h1 className="text-2xl font-bold sm:font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          All Rooms
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Scroll to load more rooms.
        </p>
      </div>

      <RoomsList />
    </section>
  );
}
