import React from 'react';

const Footer = () => {
  return (
    <div className="bg-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="pt-10 grid grid-cols-3 grid-rows-2 md:grid-rows-1 gap-4">
          <div className="md:max-w-[15rem] mb-3 row-start-2 md:row-start-1 col-span-full">
            <h3 className="text-xs tracking-tight text-slate-500">
              Set out to make a change in the industry through unique and one of
              a kind pieces, aiming to inspire individuals to empower themselves
              and live as their authentic self while radiating confidence and
              showcasing their personal style with the confidence they deserves
              to feel
            </h3>
          </div>

          {/* Copyright text in the center */}
          <div className="py-10 text-center col-span-full row-start-1 md:col-start-2 md:col-span-1">
            <h1 className="text-xs tracking-tight text-slate-500">
              © 2023 Youkhana. All rights reserved. By{' '}
              <a
                href="https://callmespike.me"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Spike
              </a>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
