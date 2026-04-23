import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title, 
  description, 
  image = 'https://egysafe.com/og-image.jpg',
  url = 'https://egysafe.com' 
}: SEOProps) {
  const { lang } = useLanguage();
  const siteName = 'EGY SAFE | إيجي سيف';
  const fullTitle = `${title} | ${siteName}`;

  // Organization + WebSite + ContactPoint JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EGY SAFE",
    "alternateName": "إيجي سيف",
    "url": "https://egysafe.com",
    "logo": image,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+20-100-000-0000",
      "contactType": "customer service",
      "email": "contact@egysafe.com",
      "availableLanguage": ["English", "Arabic"]
    },
    "sameAs": [
      "https://linkedin.com/company/egysafe",
      "https://x.com/egysafe"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://egysafe.com",
    "name": "EGY SAFE Cybersecurity",
    "description": description
  };

  return (
    <Helmet htmlAttributes={{ lang: lang, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
}
