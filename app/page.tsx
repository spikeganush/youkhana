import { Hero } from '@/components/Hero/Hero';
import Contact from '@/components/Contact/contact';
import { About } from '@/components/About/About';
import { Instagram } from '@/components/Instagram/Instagram';

export default function Example() {
  return (
    <div className="bg-slate-50">
      <Hero />
      <About />
      <Instagram />
      <Contact />
    </div>
  );
}
