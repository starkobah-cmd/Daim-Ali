export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  category: 'development' | 'design' | 'marketing' | 'editing';
  features: string[];
  startingPrice: string;
  deliveryTime: string;
  badge?: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  desc: string;
  details: string[];
  icon: string;
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight: string;
}

export type PortfolioCategory = string;


export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  categoryLabel?: string;
  image: string;
  description: string;
  detailedDescription?: string;
  images?: string[];
  tags: string[];
  technologies?: string[];
  client?: string;
  stats?: string;
  link?: string;
  videoUrl?: string;
  date?: string;
  featured?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceOneTime: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  comment: string;
  serviceUsed: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

// Blog Module Interfaces
export interface BlogComment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
}

export type PostStatus = 'published' | 'draft' | 'scheduled';

export type BlogBlockType = 'heading' | 'paragraph' | 'introduction' | 'image' | 'table' | 'quote' | 'bullet-list' | 'numbered-list' | 'faq' | 'custom-html' | 'custom-code';

export interface BlogBlock {
  id: string;
  type: BlogBlockType;
  data: {
    text?: string;
    level?: number;
    imageUrl?: string;
    altText?: string;
    caption?: string;
    link?: string;
    alignment?: 'left' | 'center' | 'right';
    rows?: string[][];
    columns?: string[];
    questions?: { question: string; answer: string }[];
    items?: string[];
    html?: string;
    code?: string;
    language?: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  blocks?: BlogBlock[];
  featuredImage: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  isFeatured?: boolean;
  status: PostStatus;
  scheduledDate?: string;
  focusKeyword?: string;
  secondaryKeywords?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  customSchema?: string;
  seoScore?: number;
  comments: BlogComment[];
}

export type BlogViewMode = 'main' | 'blog-list' | 'single-blog' | 'blog-admin' | 'site-admin' | 'portfolio-list' | 'portfolio-detail';

