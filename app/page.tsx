import { Hero } from '@/components/Hero/Hero';
import Contact from '@/components/Contact/contact';
import { About } from '@/components/About/About';
import { Instagram } from '@/components/Instagram/Instagram';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from './seo.config';
import { constructMetadata } from './seo.config';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Home',
  description: 'Discover unique designer garments crafted for the bold and diverse community of Sydney.',
});

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FashionBrand',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo.png`,
  sameAs: [
    siteConfig.links.instagram,
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sydney',
    addressRegion: 'NSW',
    addressCountry: 'AU',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <Hero />
      <About />
      <Instagram />
      <Contact mainPage />
    </>
  );
}
