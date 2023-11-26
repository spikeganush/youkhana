import Image from 'next/image';

export function Hero() {
  return (
    <section className="hero relative isolate overflow-hidden pt-24 py-8 sm:pt-32">
      <div className="mx-auto px-6 lg:px-8">
        <div className="mx-auto lg:mx-0 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-black sm:text-6xl uppercase">
            Youkhana.
          </h2>

          <p className="mt-6 text-lg leading-8 text-black italic">
            Australian label blurring the line between fashion, art and gender.
          </p>
        </div>
      </div>
      <Image
        className="w-full h-[900px] object-cover"
        src="/images/test1.png"
        alt="hero"
        width={1920}
        height={1080}
        quality={100}
      />
    </section>
  );
}
