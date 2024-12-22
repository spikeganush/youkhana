import { Metadata } from 'next'

const siteConfig = {
  name: 'Youkhana',
  description: 'Youkhana is a Sydney based designer that specialises in making one of a kind garments for the bold and diverse community in which we live in today',
  url: 'https://youkhana.info',
  ogImage: '/images/og-image.jpg',    
  links: {
    instagram: 'https://www.instagram.com/__youkhana__/', 
  }
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const constructMetadata = ({
  title = {
    absolute: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title?: string | { absolute: string; template: string }
  description?: string
  image?: string
  noIndex?: boolean
} = {}): Metadata => ({
  metadataBase: defaultMetadata.metadataBase,
  title,
  description,
  openGraph: {
    ...defaultMetadata.openGraph,
    title: typeof title === 'string' ? title : title?.absolute,
    description,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: typeof title === 'string' ? title : title?.absolute,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    ...defaultMetadata.twitter,
    title: typeof title === 'string' ? title : title?.absolute,
    description,
    images: [image],
  },
  robots: {
    index: !noIndex,
    follow: !noIndex,
    googleBot: {
      index: !noIndex,
      follow: !noIndex,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: defaultMetadata.icons,
  manifest: defaultMetadata.manifest,
})

export default siteConfig
