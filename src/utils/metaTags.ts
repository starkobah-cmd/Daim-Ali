/**
 * Dynamically creates or updates meta tags in the document <head>
 * for Google Crawlers, social previews, and browser title bars.
 */
export function setOrUpdateMeta(attribute: 'name' | 'property', nameOrProperty: string, content: string) {
  if (typeof document === 'undefined') return;
  const selector = `meta[${attribute}="${nameOrProperty}"]`;
  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content || '');
}

export interface HeadMetaConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  googleSiteVerification?: string;
}

export function applyHeadMeta({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  googleSiteVerification
}: HeadMetaConfig) {
  if (typeof document === 'undefined') return;

  if (title) {
    document.title = title;
    setOrUpdateMeta('property', 'og:title', title);
    setOrUpdateMeta('name', 'twitter:title', title);
  }

  if (description) {
    setOrUpdateMeta('name', 'description', description);
    setOrUpdateMeta('property', 'og:description', description);
    setOrUpdateMeta('name', 'twitter:description', description);
  }

  if (keywords) {
    setOrUpdateMeta('name', 'keywords', keywords);
  }

  if (ogImage) {
    setOrUpdateMeta('property', 'og:image', ogImage);
    setOrUpdateMeta('name', 'twitter:image', ogImage);
  }

  if (googleSiteVerification) {
    setOrUpdateMeta('name', 'google-site-verification', googleSiteVerification);
  }

  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }
}
