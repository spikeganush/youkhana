import Image from 'next/image';
import ImageSelection from './Image-Selection';

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
      <ImageSelection />
    </section>
  );
}
