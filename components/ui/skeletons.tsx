export const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function InstagramCardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden bg-white border-gray-300 w-80 mx-auto md:w-96 border rounded-lg shadow-sm`}
    >
      <header className="grid grid-cols-6 items-center p-3 border-b border-b-gray-300">
        <div className="bg-gray-100 h-10 w-10 rounded-full" />
        <div className="bg-gray-100 col-span-4 h-4 rounded " />
      </header>
      <div className="bg-gray-100 h-60" />
      {/* Placeholder for InstagramMedia */}
      <section className="flex flex-col p-4 gap-3">
        <div className="bg-gray-100 h-14 rounded" />
        {/* Placeholder for caption */}
        <div className="flex justify-between">
          <div className="bg-gray-100 h-4 w-24 rounded" />
          {/* Placeholder for formattedDate */}
          <div className="bg-gray-100 h-4 w-24 rounded" />
          {/* Placeholder for link to the post */}
        </div>
      </section>
    </div>
  );
}

export function InstagramCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 grid-rows-1">
      <InstagramCardSkeleton />
      <InstagramCardSkeleton />
      <InstagramCardSkeleton />
    </div>
  );
}
