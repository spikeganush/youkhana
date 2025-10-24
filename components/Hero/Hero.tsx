"use client";

import { useState } from "react";
import Image from "next/image";

export function Hero() {
  const [currentImage, setCurrentImage] = useState(1);

  return (
    <section className="hero relative isolate overflow-hidden pt-24 py-8 sm:pt-32">
      <div className="mx-auto px-6 lg:px-8">
        <div className="mx-auto lg:mx-0 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-black sm:text-6xl uppercase">
            Youkhana.
          </h2>

          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => setCurrentImage(1)}
              className={`px-4 py-2 rounded ${currentImage === 1 ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentImage(2)}
              className={`px-4 py-2 rounded ${currentImage === 2 ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentImage(3)}
              className={`px-4 py-2 rounded ${currentImage === 3 ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              3
            </button>
          </div>

          <p className="mt-6 text-lg leading-8 text-black italic">
            Australian label blurring the line between fashion, art and gender.
          </p>
        </div>
      </div>
      <div className="max-[390px]:-mr-8 max-[340px]:-mr-16">
        <Image
          className="w-full h-[500px] md:h-[900px] min-[2200px]:h-[1300px] object-cover object-center lg:object-contain"
          src={`/images/hero__desktop__${currentImage}.webp`}
          alt="Youkhana art"
          width={1920}
          height={1080}
          quality={100}
          priority
        />
      </div>
    </section>
  );
}
