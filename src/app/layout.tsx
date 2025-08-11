import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

// Font optimization
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Base metadata configuration
export const metadata: Metadata = {
  title: {
    template: '%s | BorderlessBits - Cloud Architecture & Healthcare Software Consulting',
    default: 'BorderlessBits - Expert Cloud Architecture & Healthcare Software Consulting',
  },
  description: 'Expert cloud architecture consulting for enterprise and healthcare organizations. Specializing in AWS, Azure, HIPAA compliance, and scalable software solutions that drive business growth.',
  keywords: [
    'cloud architecture',
    'healthcare software',
    'enterprise consulting',
    'AWS consulting',
    'Azure consulting',
    'HIPAA compliance',
    'cloud migration',
    'software consulting',
    'Richard Mosley',
    'BorderlessBits'
  ],
  authors: [{ name: 'Richard Mosley', url: 'https://borderlessbits.com' }],
  creator: 'Richard Mosley',
  publisher: 'BorderlessBits',
  
  // Open Graph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://borderlessbits.com',
    siteName: 'BorderlessBits',
    title: 'BorderlessBits - Expert Cloud Architecture & Healthcare Software Consulting',
    description: 'Transform your enterprise with expert cloud architecture and healthcare software consulting. Specializing in AWS, Azure, and HIPAA-compliant solutions.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BorderlessBits - Cloud Architecture Consulting',
      },
    ],
  },
  
  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: 'BorderlessBits - Expert Cloud Architecture Consulting',
    description: 'Transform your enterprise with expert cloud architecture and healthcare software consulting.',
    creator: '@borderlessbits',
    images: ['/images/twitter-image.jpg'],
  },
  
  // Additional metadata
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
  
  // Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  
  // App-specific metadata
  category: 'Technology',
  classification: 'Business',
  
  // Additional SEO
  alternates: {
    canonical: 'https://borderlessbits.com',
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'BorderlessBits Blog RSS Feed' },
      ],
    },
  },
};

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* App manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetching for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//cdn.emailjs.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured data for business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "BorderlessBits",
              "description": "Expert cloud architecture and healthcare software consulting services",
              "url": "https://borderlessbits.com",
              "logo": "https://borderlessbits.com/images/logo.png",
              "image": "https://borderlessbits.com/images/og-image.jpg",
              "telephone": "+1-555-0199", // Replace with actual phone number
              "email": "richard@borderlessbits.com",
              "founder": {
                "@type": "Person",
                "name": "Richard Mosley",
                "jobTitle": "Senior Cloud Architect",
                "url": "https://borderlessbits.com/about"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://www.linkedin.com/company/borderlessbits",
                "https://twitter.com/borderlessbits"
              ],
              "serviceType": [
                "Cloud Architecture Consulting",
                "Healthcare Software Development",
                "Enterprise Technology Consulting",
                "AWS Consulting",
                "Azure Consulting",
                "HIPAA Compliance Consulting"
              ],
              "areaServed": {
                "@type": "Country",
                "name": "United States"
              },
              "potentialAction": {
                "@type": "ContactAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://borderlessbits.com/contact"
                }
              }
            }),
          }}
        />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    anonymize_ip: true,
                    allow_ad_personalization_signals: false,
                    allow_google_signals: false
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body 
        className={`${inter.className} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        
        <div className="min-h-screen bg-white">
          {children}
        </div>
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Core Web Vitals tracking
              new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                  if (window.gtag && entry.name) {
                    window.gtag('event', entry.name, {
                      event_category: 'Web Vitals',
                      value: Math.round(entry.name === 'CLS' ? entry.value * 1000 : entry.value),
                      event_label: entry.id,
                      non_interaction: true,
                    });
                  }
                }
              }).observe({type: 'navigation', buffered: true});
            `,
          }}
        />
        
        {/* Service Worker registration for offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}