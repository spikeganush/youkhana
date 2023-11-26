import React from 'react';

const Footer = () => {
  return (
    <div className="bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="pt-10 grid grid-cols-3 gap-4">
          <div className="max-w-[15rem] mb-3">
            <h3 className="text-xs tracking-tight text-slate-500">
              Set out to make a change in the industry through unique and one of
              a kind pieces, aiming to inspire individuals to empower themselves
              and live as their authentic self while radiating confidence and
              showcasing their personal style with the confidence they deserves
              to feel
            </h3>
          </div>

          {/* Copyright text in the center */}
          <div className="py-10 text-center">
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
