'use client';

import Image from 'next/image';
import { useState } from 'react';

const ImageSelection = () => {
  const [folder, setFolder] = useState('white');
  const [variant, setVariant] = useState<'left' | 'center' | 'right'>('center');

  const handleFolder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFolder(e.target.value);
  };

  const handleVariant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVariant(e.target.value as 'left' | 'center' | 'right');
  };

  return (
    <>
      <div className="flex justify-center">
        <select
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          onChange={handleFolder}
        >
          <option value="white">White</option>
          <option value="white2">White 2</option>
          <option value="orange">Orange</option>
          <option value="blue">Blue</option>
          <option value="blue2">Blue2</option>
        </select>
      </div>
      <div className="hidden md:flex justify-center">
        <select
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          onChange={handleVariant}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <Image
        className={`
      w-full h-[500px] md:h-[900px] min-[2200px]:h-[1300px] object-cover
      object-center
      ${
        variant === 'left'
          ? 'md:object-left'
          : variant === 'center'
          ? 'md:object-center'
          : 'md:object-right'
      }`}
        src={`/images/${folder}/${variant}.png`}
        alt="hero"
        width={1920}
        height={1080}
        quality={100}
        unoptimized
      />
    </>
  );
};

export default ImageSelection;
