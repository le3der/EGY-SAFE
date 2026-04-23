export default function generateSitemap() {
  const baseUrl = 'https://egysafe.com';
  
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/blog',
    '/case-studies',
    '/careers'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map((route) => {
      return `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>
      `.trim();
    })
    .join('\n  ')}
</urlset>
  `.trim();

  return sitemap;
}
