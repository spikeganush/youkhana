"use client";

import { useState } from "react";
import { DesktopNav } from "./Desktop-Nav";
import { MobileNav } from "./Mobile-Nav";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const navigation = [
    { name: "Home", href: "/" },
    // { name: 'Shop', href: '/shop' },
    // { name: 'Media', href: '#' },
    { name: "Contact", href: "/#contact" },
  ];

  useMotionValueEvent(scrollY, "change", (latestScrollY) => {
    const previous = scrollY.getPrevious();
    if (
      previous !== undefined &&
      latestScrollY > previous &&
      latestScrollY > 150
    ) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      animate={hidden ? "hidden" : "visible"}
      className="sticky inset-x-0 top-0 z-50 bg-slate-50"
    >
      <div className="mx-auto max-w-7xl">
        <DesktopNav
          navigation={navigation}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <MobileNav
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navigation={navigation}
        />
      </div>
    </motion.header>
  );
}
