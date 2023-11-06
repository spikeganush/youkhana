'use client';

import { useState } from 'react';
import { DesktopNav } from './Desktop-Nav';
import { MobileNav } from './Mobile-Nav';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Shop', href: '#' },
    { name: 'Media', href: '#' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <DesktopNav
        navigation={navigation}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigation={navigation}
      />
    </header>
  );
}
