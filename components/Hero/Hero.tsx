import Image from 'next/image';

export function Hero() {
  return (
    <section className="hero relative isolate overflow-hidden bg-gray-900 py-24 min-h-[770px] sm:py-32 md:min-h-[800px]">
      <Image
        src="/images/hero.webp"
        alt="Youkhana"
        layout="fill"
        quality={90}
        priority
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center opacity-70"
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl uppercase">
            Youkhana.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300 italic">
            A Australian label blurring the line between fashion, art and
            gender.
          </p>
        </div>
      </div>
    </section>
  );
}
