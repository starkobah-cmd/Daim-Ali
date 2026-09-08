import { ServiceItem, PortfolioItem, PricingPlan, Testimonial, FAQItem, ProcessStep, WhyChooseItem } from '../types';
import { agencyInfo, servicesData, portfolioData, pricingData, testimonialsData, faqData, whyChooseData, processSteps, aboutUsData } from './agencyData';

export interface SiteLogoConfig {
  brandName: string;
  brandDotColor: string;
  showDot: boolean;
  taglineText: string;
  showTagline: boolean;
  customLogoUrl: string;
  glowStyle: 'subtle' | 'medium' | 'vibrant' | 'none';
  iconVariant: 'network-orb' | 'custom-image' | 'none';
  logoSize?: number;
  gap?: number;
  showCustomButton?: boolean;
  customButtonText?: string;
  customButtonUrl?: string;
  customButtonColor?: string;
  customButtonShine?: boolean;
  customButtonBorder?: boolean;
}

export interface SiteHeroConfig {
  titlePrefix: string;
  typingPhrases: string[];
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  showAnnouncementBadge: boolean;
  announcementText: string;
}

export interface SiteAgencyInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  hours: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    github: string;
  };
  stats: Array<{ label: string; value: string }>;
}

export interface PageSectionConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText?: string;
  ctaUrl?: string;
  visible: boolean;
  order: number;
}

export interface SitePageConfig {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  ogImage?: string;
  seoScore?: number;
  noIndex: boolean;
  sections: PageSectionConfig[];
}

export interface SiteSeoConfig {
  canonicalUrl: string;
  googleSiteVerification?: string;
  defaultOgTitle: string;
  defaultOgDescription: string;
  defaultOgImage: string;
  twitterCardType: 'summary_large_image' | 'summary';
  globalNoIndex: boolean;
  globalNoFollow: boolean;
  robotsTxt: string;
  headerScripts: string;
  footerScripts: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

export interface SiteConfig {
  logo: SiteLogoConfig;
  hero: SiteHeroConfig;
  agency: SiteAgencyInfo;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  pricing: PricingPlan[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  whyChooseUs: WhyChooseItem[];
  processSteps: ProcessStep[];
  aboutUs: typeof aboutUsData;
  seo: SiteSeoConfig;
  pages: SitePageConfig[];
  inquiries: InquiryItem[];
  primaryColorHex?: string;
}

export const DEFAULT_PAGE_SECTIONS: PageSectionConfig[] = [
  { id: 'sec-hero', name: 'Hero Banner', title: 'Accelerate Your Brand with Digital Growth', subtitle: 'Full-stack engineering & branding', badge: '1. Hero', visible: true, order: 1, ctaText: 'Get Started Today', ctaUrl: '#contact' },
  { id: 'sec-services', name: 'Services Grid', title: 'High-Impact Digital Solutions', subtitle: 'Crafted for scalable business performance', badge: '2. Services', visible: true, order: 2, ctaText: 'View All Services', ctaUrl: '#services' },
  { id: 'sec-about', name: 'About Agency', title: 'Engineering Excellence & Creative Power', subtitle: 'Your trusted partner in digital transformation', badge: '3. About Us', visible: true, order: 3 },
  { id: 'sec-why', name: 'Why Choose Us', title: 'Why Leaders Choose Netronomic', subtitle: 'Data-driven results and bulletproof quality', badge: '4. Why Choose Us', visible: true, order: 4 },
  { id: 'sec-process', name: 'Our Work Process', title: '4 Simple Steps to Launch', subtitle: 'From strategy to seamless deployment', badge: '5. Process', visible: true, order: 5 },
  { id: 'sec-portfolio', name: 'Featured Portfolio', title: 'Our Latest Digital Masterpieces', subtitle: 'Case studies across web, mobile, and video', badge: '6. Portfolio', visible: true, order: 6 },
  { id: 'sec-pricing', name: 'Transparent Pricing', title: 'Flexible Plans for Every Stage', subtitle: 'No hidden fees, standard commercial rights', badge: '7. Pricing', visible: true, order: 7 },
  { id: 'sec-testimonials', name: 'Client Testimonials', title: 'What Our Clients Say', subtitle: 'Real reviews from growing brands', badge: '8. Reviews', visible: true, order: 8 },
  { id: 'sec-faq', name: 'Frequently Asked Questions', title: 'Got Questions? We Have Answers', subtitle: 'Everything you need to know before getting started', badge: '9. FAQ', visible: true, order: 9 },
  { id: 'sec-contact', name: 'Contact Us', title: "Let's Build Something Extraordinary", subtitle: 'Interactive project estimator & fast response', badge: '10. Contact', visible: true, order: 10, ctaText: 'Submit Inquiry', ctaUrl: '#contact' },
];

export const DEFAULT_SITE_PAGES: SitePageConfig[] = [
  {
    id: 'page-home',
    title: 'Home Page',
    slug: '/',
    status: 'published',
    metaTitle: 'Netronomic Web – Creative Digital Agency',
    metaDescription: 'Netronomic Web is a full-service creative agency dedicated to transforming brand ideas into powerful digital realities. We provide professional web design, graphic design, branding, SEO, and digital marketing services.',
    focusKeyword: 'Web Agency',
    secondaryKeywords: 'Mobile Apps, SEO Backlinks, Logo Design, Video Reels',
    noIndex: false,
    sections: DEFAULT_PAGE_SECTIONS,
  },
  {
    id: 'page-about',
    title: 'About Us',
    slug: '/about',
    status: 'published',
    metaTitle: 'About Netronomic Web Agency — Digital Excellence & Vision',
    metaDescription: 'Learn about our team of engineers, designers, and SEO specialists dedicated to brand acceleration.',
    focusKeyword: 'Digital Agency About',
    secondaryKeywords: 'Engineering team, Branding specialists',
    noIndex: false,
    sections: DEFAULT_PAGE_SECTIONS.filter(s => ['sec-about', 'sec-why', 'sec-testimonials'].includes(s.id)),
  },
  {
    id: 'page-services',
    title: 'Services Overview',
    slug: '/services',
    status: 'published',
    metaTitle: 'Our Digital Services — Websites, Apps, Branding & SEO',
    metaDescription: 'Explore our full suite of web design, mobile development, logo creation, video editing, and SEO backlink packages.',
    focusKeyword: 'Digital Services',
    secondaryKeywords: 'Web design packages, SEO backlinks',
    noIndex: false,
    sections: DEFAULT_PAGE_SECTIONS.filter(s => ['sec-services', 'sec-pricing', 'sec-process'].includes(s.id)),
  },
  {
    id: 'page-portfolio',
    title: 'Portfolio & Case Studies',
    slug: '/portfolio',
    status: 'published',
    metaTitle: 'Featured Case Studies & Client Work — Netronomic Web',
    metaDescription: 'Browse our portfolio of high-performing web applications, mobile apps, brand identity designs, and viral video reels.',
    focusKeyword: 'Portfolio Case Studies',
    secondaryKeywords: 'Web app showreel, Brand logo showcase',
    noIndex: false,
    sections: DEFAULT_PAGE_SECTIONS.filter(s => ['sec-portfolio', 'sec-testimonials'].includes(s.id)),
  },
  {
    id: 'page-contact',
    title: 'Contact Us',
    slug: '/contact',
    status: 'published',
    metaTitle: 'Contact Netronomic Web Agency — Get a Free Quote Today',
    metaDescription: 'Get in touch with our team for custom web quotes, project estimates, or immediate WhatsApp consultation.',
    focusKeyword: 'Contact Web Agency',
    secondaryKeywords: 'Get quote, Web development inquiry',
    noIndex: false,
    sections: DEFAULT_PAGE_SECTIONS.filter(s => ['sec-contact', 'sec-faq'].includes(s.id)),
  }
];

export const DEFAULT_INQUIRIES: InquiryItem[] = [
  {
    id: 'inq-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@apextech.io',
    phone: '+1 (555) 234-5678',
    service: 'Website Design & Development',
    budget: '$1,000 - $2,500',
    message: 'We are looking to rebuild our SaaS marketing portal with fast loading times and modern sky blue branding.',
    createdAt: '2026-08-03 14:22',
    status: 'new',
  },
  {
    id: 'inq-2',
    name: 'Marcus Vance',
    email: 'marcus@vancemedia.com',
    phone: '+1 (555) 876-5432',
    service: 'Full-Scale SEO & Backlink Campaign',
    budget: '$500 - $1,000',
    message: 'Need high DA profile backlinks and Google SEO optimization for our e-commerce platform.',
    createdAt: '2026-08-02 09:15',
    status: 'contacted',
  },
  {
    id: 'inq-3',
    name: 'Elena Rostova',
    email: 'elena@luxebrand.co',
    phone: '+1 (555) 345-6789',
    service: 'Logo & Brand Identity Suite',
    budget: '$250 - $500',
    message: 'Requesting brand guidelines, vector logos, and social media media templates.',
    createdAt: '2026-08-01 18:40',
    status: 'closed',
  }
];

export const DEFAULT_SEO_CONFIG: SiteSeoConfig = {
  canonicalUrl: 'https://netronomic.com',
  googleSiteVerification: '_bSz_UNGInG_iuZe3dvqdcm_F-AEnkLctkQLhzP_dXM',
  defaultOgTitle: 'Netronomic Web Agency — Digital Growth Engine',
  defaultOgDescription: 'Full-service web development, mobile apps, branding, video editing, and high-DA SEO backlinks.',
  defaultOgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  twitterCardType: 'summary_large_image',
  globalNoIndex: false,
  globalNoFollow: false,
  robotsTxt: `User-agent: *\nAllow: /\nSitemap: https://netronomic.com/sitemap.xml`,
  headerScripts: `<!-- Google Tag Manager / Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-NETRONOMIC"></script>`,
  footerScripts: `<!-- Custom Chat Widget Script -->\n<!-- <script src="https://chat.netronomic.com/widget.js"></script> -->`,
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  logo: {
    brandName: 'NETRONOMIC',
    brandDotColor: '#0284c7',
    showDot: true,
    taglineText: 'WEB AGENCY',
    showTagline: true,
    customLogoUrl: '',
    glowStyle: 'subtle',
    iconVariant: 'network-orb',
  },
  hero: {
    titlePrefix: 'Accelerate Your Brand with',
    typingPhrases: [
      'Web Build',
      'Logo Design',
      'Viral Video Reels',
      'Google SEO',
      'SEO Backlinks',
      'Digital Growth'
    ],
    subtitle: 'Full-stack engineering, custom branding, high-DA backlinks, and viral reel editing engineered for fast growth and maximum ROI.',
    primaryCtaText: 'Get Started Today',
    secondaryCtaText: 'Explore Our Services',
    showAnnouncementBadge: false,
    announcementText: 'Netronomic Web Agency — Digital Excellence',
  },
  agency: agencyInfo,
  services: servicesData,
  portfolio: portfolioData,
  pricing: pricingData,
  testimonials: testimonialsData,
  faqs: faqData,
  whyChooseUs: whyChooseData,
  processSteps: processSteps,
  aboutUs: aboutUsData,
  seo: DEFAULT_SEO_CONFIG,
  pages: DEFAULT_SITE_PAGES,
  inquiries: DEFAULT_INQUIRIES,
  primaryColorHex: '#0284c7',
};

export const SITE_CONFIG_STORAGE_KEY = 'netronomic_site_config_v2';

export function getStoredSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const agency = { ...DEFAULT_SITE_CONFIG.agency, ...(parsed.agency || {}) };
    if (!agency.whatsappNumber || agency.whatsappNumber === '919876543210') {
      agency.whatsappNumber = '923020487103';
    }
    let services = parsed.services || servicesData;
    if (Array.isArray(services)) {
      servicesData.forEach((s) => {
        if (!services.some((existing: any) => existing.id === s.id)) {
          services.push(s);
        }
      });
    } else {
      services = servicesData;
    }
    return {
      ...DEFAULT_SITE_CONFIG,
      ...parsed,
      logo: { ...DEFAULT_SITE_CONFIG.logo, ...(parsed.logo || {}) },
      hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
      agency,
      services,
      seo: { ...DEFAULT_SITE_CONFIG.seo, ...(parsed.seo || {}) },
      pages: parsed.pages || DEFAULT_SITE_PAGES,
      inquiries: parsed.inquiries || DEFAULT_INQUIRIES,
    };
  } catch (err) {
    console.error('Error loading site config:', err);
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveSiteConfigToStorage(config: SiteConfig): void {
  try {
    localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving site config:', err);
  }
}
