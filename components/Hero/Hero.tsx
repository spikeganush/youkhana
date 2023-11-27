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
        className="w-full h-[500px] max-[390px]:h-[400px] md:h-[900px] min-[2200px]:h-[1300px] object-cover object-right"
        src="/images/hero__desktop.webp"
        alt="Youkhana art"
        width={1920}
        height={1080}
        priority={true}
        quality={100}
      />
    </section>
  );
}
