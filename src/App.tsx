

import React, { useState, useEffect } from 'react';
// Version: 1.0.1
import { AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { AboutUs } from './components/AboutUs';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Process } from './components/Process';
import { Portfolio } from './components/Portfolio';
import { PortfolioPage } from './components/PortfolioPage';
import { PortfolioDetail } from './components/PortfolioDetail';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { ContactUs } from './components/ContactUs';
import { Footer } from './components/Footer';

import { ServiceModal } from './components/ServiceModal';

import { QuickQuoteModal } from './components/QuickQuoteModal';

import { BlogListing } from './components/BlogListing';
import { SingleBlog } from './components/SingleBlog';
import { AdminBlogManagement } from './components/AdminBlogManagement';
import { AdminPanel } from './components/AdminPanel';
import { AdminDashboardLoader } from './components/AdminDashboardLoader';
import { SitemapModal } from './components/SitemapModal';
import { SiteLoader } from './components/SiteLoader';
import { CustomCursor } from './components/CustomCursor';

import { ServiceItem, PortfolioItem, BlogPost, BlogComment, BlogViewMode, PostStatus } from './types';
import { getStoredBlogPosts, saveBlogPostsToStorage } from './data/blogData';
import { getStoredSiteConfig, saveSiteConfigToStorage, DEFAULT_SITE_CONFIG, SiteConfig } from './data/siteConfig';

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { applyHeadMeta } from './utils/metaTags';

export default function App() {

  useEffect(() => {
    // Sync Site Config
    const configRef = doc(db, 'settings', 'main');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteConfig(data as any);
        saveSiteConfigToStorage(data as any);
      } else {
        setDoc(configRef, getStoredSiteConfig()).catch((e) => console.warn('Init config error', e));
      }
    }, (err) => {
      console.warn('Config snapshot error:', err);
    });

    // Sync Blog Posts
    const postsRef = doc(db, 'settings', 'posts');
    const unsubPosts = onSnapshot(postsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().posts || [];
        setPosts(data as any);
        saveBlogPostsToStorage(data as any);
      } else {
        setDoc(postsRef, { posts: getStoredBlogPosts() }).catch((e) => console.warn('Init posts error', e));
      }
    }, (err) => {
      console.warn('Posts snapshot error:', err);
    });

    return () => {
      unsubConfig();
      unsubPosts();
    };
  }, []);

  const handleSaveSiteConfig = async (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    saveSiteConfigToStorage(newConfig);
    try {
      await setDoc(doc(db, 'settings', 'main'), newConfig);
    } catch (err) {
      console.error('Error saving config to Firebase', err);
    }
  };

  const syncPostsToFirebase = async (newPosts: any[]) => {
    try {
      await setDoc(doc(db, 'settings', 'posts'), { posts: newPosts });
    } catch (err) {
      console.error('Error saving posts to Firebase', err);
    }
  };


  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [preselectedServiceTitle, setPreselectedServiceTitle] = useState<string>('Website Design & Development');

  // Site Configuration State (Logo, Agency info, Hero typing phrases, etc.)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getStoredSiteConfig());

  // Blog State
  const [blogView, setBlogView] = useState<BlogViewMode>('main');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [sitemapOpen, setSitemapOpen] = useState<boolean>(false);
  const [isAdminDashboardLoading, setIsAdminDashboardLoading] = useState<boolean>(false);
  const [showInitialLoader, setShowInitialLoader] = useState<boolean>(() => !sessionStorage.getItem('netronomic_loaded_once'));

  // Handle URL hash / path routes (e.g. /admin, /dashboard, /cms, #admin)
  useEffect(() => {
    if (blogView !== 'single-blog') {
      const homePage = siteConfig.pages?.find(p => p.slug === '/');
      const pageTitle = homePage?.metaTitle || 'Netronomic Web – Creative Digital Agency';
      const pageDesc = homePage?.metaDescription || 'Netronomic Web is a full-service creative agency dedicated to transforming brand ideas into powerful digital realities. We provide professional web design, graphic design, branding, SEO, and digital marketing services.';
      const pageOgImage = homePage?.ogImage || siteConfig.seo?.defaultOgImage || siteConfig.logo?.customLogoUrl;

      applyHeadMeta({
        title: pageTitle,
        description: pageDesc,
        ogImage: pageOgImage,
        canonicalUrl: siteConfig.seo?.canonicalUrl || 'https://netronomicweb.com/',
        googleSiteVerification: siteConfig.seo?.googleSiteVerification || '_bSz_UNGInG_iuZe3dvqdcm_F-AEnkLctkQLhzP_dXM'
      });
    }
    const customLogo = siteConfig.logo?.customLogoUrl;
    if (customLogo) {
      const iconLinks = document.querySelectorAll("link[rel*='icon']");
      iconLinks.forEach((el) => {
        (el as HTMLLinkElement).href = customLogo;
      });
    }
  }, [blogView, siteConfig.pages, siteConfig.seo, siteConfig.logo?.customLogoUrl]);

  useEffect(() => {
    const handleRouteCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path === '/dashboard' || path === '/cms' || hash === '#admin') {
        if (hash === '#admin') {
          window.history.replaceState(null, '', '/admin');
        }
        setBlogView('site-admin');
        setIsAdminDashboardLoading(true);
      }
    };

    handleRouteCheck();
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  const handleNavigateView = (view: BlogViewMode) => {
    setBlogView(view);
    if (view === 'site-admin' || view === 'blog-admin') {
      window.history.pushState(null, '', '/admin');
      setIsAdminDashboardLoading(true);
    } else {
      if (window.location.pathname.toLowerCase() === '/admin' || window.location.pathname.toLowerCase() === '/dashboard' || window.location.hash === '#admin') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleResetSiteConfig = async () => {
    setSiteConfig(DEFAULT_SITE_CONFIG);
    saveSiteConfigToStorage(DEFAULT_SITE_CONFIG);
    try {
      await setDoc(doc(db, 'settings', 'main'), DEFAULT_SITE_CONFIG);
    } catch (err) {
      console.error('Error resetting config to Firebase', err);
    }
  };

  // Sync state changes with localStorage
  const handleSavePost = (updatedPost: BlogPost) => {
    const existingIndex = posts.findIndex(p => p.id === updatedPost.id);
    let newPosts: BlogPost[];
    if (existingIndex >= 0) {
      newPosts = [...posts];
      newPosts[existingIndex] = updatedPost;
    } else {
      newPosts = [updatedPost, ...posts];
    }
    setPosts(newPosts);
    saveBlogPostsToStorage(newPosts);
    syncPostsToFirebase(newPosts);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      const newPosts = posts.filter(p => p.id !== postId);
      setPosts(newPosts);
      saveBlogPostsToStorage(newPosts);
    }
  };

  const handleToggleStatus = (postId: string, status: PostStatus) => {
    const newPosts = posts.map(p => (p.id === postId ? { ...p, status } : p));
    setPosts(newPosts);
    saveBlogPostsToStorage(newPosts);
  };

  const handleAddComment = (postId: string, comment: BlogComment) => {
    const newPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), comment]
        };
      }
      return p;
    });
    setPosts(newPosts);
    saveBlogPostsToStorage(newPosts);
  };

  const activeSinglePost = posts.find(p => p.slug === selectedPostSlug) || posts[0];

  const handleOpenQuote = (serviceTitle?: string) => {
    if (serviceTitle) {
      setPreselectedServiceTitle(serviceTitle);
    }
    setQuoteModalOpen(true);
  };

  const handleScrollToContactWithService = (serviceTitle: string) => {
    setPreselectedServiceTitle(serviceTitle);
    if (blogView !== 'main') {
      setBlogView('main');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        setQuoteModalOpen(true);
      }
    }
  };

  const handleAddInquiry = (inquiryData: { name: string; email: string; phone: string; service: string; budget: string; message: string }) => {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      ...inquiryData,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'new' as const,
    };
    const updatedInquiries = [newInquiry, ...(siteConfig.inquiries || [])];
    const newConfig = { ...siteConfig, inquiries: updatedInquiries };
    setSiteConfig(newConfig);
    saveSiteConfigToStorage(newConfig);
  };

  const homePageConfig = siteConfig.pages?.find(p => p.slug === '/');
  const homeSections = homePageConfig?.sections || [];
  const isSectionVisible = (secId: string) => {
    const sec = homeSections.find(s => s.id === secId);
    return sec ? sec.visible : true;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Initial Website Opening Animated Screen */}
      <AnimatePresence>
        {showInitialLoader && (
          <SiteLoader
            siteConfig={siteConfig}
            onFinish={() => {
              sessionStorage.setItem('netronomic_loaded_once', 'true');
              setShowInitialLoader(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sticky Header Nav (Only on frontend & blog pages) */}
      {blogView !== 'site-admin' && blogView !== 'blog-admin' && (
        <Navbar
          onOpenQuote={handleOpenQuote}
          currentView={blogView}
          siteConfig={siteConfig}
          onNavigate={handleNavigateView}
        />
      )}

      {/* Portfolio List View */}
      {blogView === 'portfolio-list' && (
        <PortfolioPage 
          items={siteConfig.portfolio || []} 
          onSelectPortfolio={(item) => {
            setSelectedPortfolio(item);
            setBlogView('portfolio-detail');
            window.scrollTo(0, 0);
          }}
        />
      )}

      {/* Portfolio Detail View */}
      {blogView === 'portfolio-detail' && selectedPortfolio && (
        <PortfolioDetail 
          item={selectedPortfolio}
          allItems={siteConfig.portfolio || []}
          onBack={() => {
            setBlogView('portfolio-list');
            window.scrollTo(0, 0);
          }}
          onSelectPortfolio={(item) => {
            setSelectedPortfolio(item);
            window.scrollTo(0, 0);
          }}
        />
      )}


      {/* View Switcher: Main Landing Page vs Blog Pages vs Full Site Admin */}
      {blogView === 'main' && (
        <main>
          {/* 1. Hero Section (Home) */}
          {isSectionVisible('sec-hero') && (
            <Hero
              siteConfig={siteConfig}
              onGetStarted={() => handleOpenQuote('Website Design & Development')}
              onExploreServices={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {/* 2. About Us */}
          {isSectionVisible('sec-about') && <AboutUs />}

          {/* 3. Our Services */}
          {isSectionVisible('sec-services') && (
            <Services
              onSelectService={(service) => setSelectedService(service)}
              onRequestQuoteForService={(title) => handleScrollToContactWithService(title)}
            />
          )}

          {/* 4. Our Process */}
          {isSectionVisible('sec-process') && <Process />}

          {/* 5. Portfolio */}
          {isSectionVisible('sec-portfolio') && (
            <Portfolio
              items={siteConfig.portfolio || []}
              siteConfig={siteConfig}
              onSelectPortfolio={(item) => {
                setSelectedPortfolio(item);
                setBlogView('portfolio-detail');
                window.scrollTo(0, 0);
              }}
              onViewAll={() => {
                setBlogView('portfolio-list');
                window.scrollTo(0, 0);
              }}
            />
          )}

          {/* 6. Pricing */}
          {isSectionVisible('sec-pricing') && (
            <Pricing
              onSelectPlan={(planName) => handleScrollToContactWithService(planName)}
            />
          )}

          {/* 7. Testimonials */}
          {isSectionVisible('sec-testimonials') && <Testimonials />}

          {/* 8. Contact Us */}
          {isSectionVisible('sec-contact') && (
            <ContactUs
              preselectedService={preselectedServiceTitle}
              siteConfig={siteConfig}
              onAddInquiry={handleAddInquiry}
            />
          )}
        </main>
      )}

      {/* Blog Listing Page */}
      {blogView === 'blog-list' && (
        <BlogListing
          posts={posts}
          onSelectPost={(slug) => {
            setSelectedPostSlug(slug);
            setBlogView('single-blog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdmin={() => handleNavigateView('site-admin')}
          onOpenSitemap={() => setSitemapOpen(true)}
        />
      )}

      {/* Single Blog Article View */}
      {blogView === 'single-blog' && activeSinglePost && (
        <SingleBlog
          post={activeSinglePost}
          allPosts={posts}
          onBack={() => setBlogView('blog-list')}
          onSelectPost={(slug) => {
            setSelectedPostSlug(slug);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAddComment={handleAddComment}
        />
      )}

      {/* Admin Portal (Direct access without login wall) */}
      {(blogView === 'blog-admin' || blogView === 'site-admin') && (
        isAdminDashboardLoading ? (
          <AdminDashboardLoader
            siteConfig={siteConfig}
            onFinish={() => setIsAdminDashboardLoading(false)}
          />
        ) : (
          <AdminPanel
            siteConfig={siteConfig}
            onSaveSiteConfig={handleSaveSiteConfig}
            onResetSiteConfig={handleResetSiteConfig}
            posts={posts}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onToggleStatus={handleToggleStatus}
            onExitAdmin={() => {
              setIsAdminDashboardLoading(false);
              handleNavigateView('main');
            }}
            onOpenSitemap={() => setSitemapOpen(true)}
          />
        )
      )}

      {/* Footer (Only on public site and blog pages) */}
      {blogView !== 'site-admin' && blogView !== 'blog-admin' && (
        <Footer
          onOpenQuote={handleOpenQuote}
          siteConfig={siteConfig}
          onNavigate={handleNavigateView}
        />
      )}

      {/* Floating WhatsApp Quick Action Button with Shine Effect */}
      {blogView !== 'site-admin' && blogView !== 'blog-admin' && (
        <aside aria-label="WhatsApp Contact" className="fixed bottom-6 right-6 z-40 flex items-center">
          <a
            href={(siteConfig?.agency?.whatsappNumber?.startsWith('http') ? siteConfig?.agency?.whatsappNumber : `https://wa.me/${siteConfig?.agency?.whatsappNumber || '923020487103'}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-shine-btn flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
            title="Message Netronomic web on WhatsApp"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <MessageSquare className="w-5 h-5 fill-white/20 text-white" />
            <span className="text-xs font-bold tracking-wide">
              Message Netronomic web on WhatsApp
            </span>
          </a>
        </aside>
      )}

      {/* Modals */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onRequestQuote={(title) => handleScrollToContactWithService(title)}
      />

      

      <QuickQuoteModal
        siteConfig={siteConfig}
        isOpen={quoteModalOpen}
        initialService={preselectedServiceTitle}
        onClose={() => setQuoteModalOpen(false)}
      />

      <SitemapModal
        isOpen={sitemapOpen}
        onClose={() => setSitemapOpen(false)}
        posts={posts}
      />

      {/* Modern Custom Cursor System */}
      <CustomCursor primaryColor={siteConfig.primaryColor} />
    </div>
  );
}

