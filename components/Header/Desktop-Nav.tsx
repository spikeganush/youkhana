import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type DesktopNavProps = {
  navigation: {
    name: string;
    href: string;
  }[];
  setMobileMenuOpen: (open: boolean) => void;
};
export function DesktopNav({ navigation, setMobileMenuOpen }: DesktopNavProps) {
  return (
    <nav
      className="flex items-center justify-between p-6 lg:px-8 text-black"
      aria-label="Global"
    >
      <div className="flex lg:flex-1">
        <Link href="/" className="-m-1.5 p-1.5">
          <span className="uppercase font-bold">Youkhana.</span>
        </Link>
      </div>
      <div className="flex lg:hidden">
        <button
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-black"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="hidden lg:flex lg:gap-x-12">
        {navigation &&
          navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-lg font-semibold leading-6 text-black"
            >
              {item.name}
            </Link>
          ))}
      </div>
    </nav>
  );
}
