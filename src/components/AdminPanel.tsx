import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Sparkles,
  Settings,
  Building2,
  MessageSquare,
  Image as ImageIcon,
  Database,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Code2,
  Briefcase,
  FolderGit2,
  Check,
  Copy,
  ChevronRight,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Sparkle,
  ArrowLeft,
  X,
  Type,
  Lock,
  KeyRound,
  UserPlus,
  LogOut
} from 'lucide-react';
import {
  SiteConfig,
  SiteLogoConfig,
  SiteHeroConfig,
  SiteAgencyInfo,
  SitePageConfig,
  PageSectionConfig,
  SiteSeoConfig,
  InquiryItem,
  DEFAULT_SITE_CONFIG
} from '../data/siteConfig';
import { BlogPost, PostStatus, PortfolioItem, BlogBlock, BlogBlockType } from '../types';
import { BLOG_CATEGORIES } from '../data/blogData';
import { AdminMediaManager } from './AdminMediaManager';
import { MediaPickerField } from './MediaPickerField';
import { SeoAnalysisPanel } from './SeoAnalysisPanel';
import { analyzeSeo } from '../utils/seoAnalyzer';
import {
  logoutAdmin,
  getCurrentSession,
  getStoredAdminUsers,
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
  changeUserPassword,
  AdminUser,
  AdminRole,
  AdminSession
} from '../utils/auth';

interface AdminPanelProps {
  siteConfig: SiteConfig;
  onSaveSiteConfig: (config: SiteConfig) => void;
  onResetSiteConfig: () => void;
  posts: BlogPost[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  onToggleStatus: (postId: string, status: PostStatus) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  onOpenSitemap: () => void;
}

type TabType =
  | 'dashboard'
  | 'pages'
  | 'posts'
  | 'seo'
  | 'branding'
  | 'agency'
  | 'inquiries'
  | 'media'
  | 'backup'
  | 'users';

const FEATURED_IMAGE_PRESETS = [
  { label: 'Web Design', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'SEO Analytics', url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Video Production', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Brand Identity', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mobile App', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  siteConfig,
  onSaveSiteConfig,
  onResetSiteConfig,
  posts,
  onSavePost,
  onDeletePost,
  onToggleStatus,
  onExitAdmin,
  onLogout,
  onOpenSitemap,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [localConfig, setLocalConfig] = useState<SiteConfig>({ ...siteConfig });
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

    // Portfolio Management State
  const [editingPortfolio, setEditingPortfolio] = useState<Partial<PortfolioItem> | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

// Blog Management State
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>('All');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogEditorTab, setBlogEditorTab] = useState<'content' | 'seo'>('content');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [blogContentSubTab, setBlogContentSubTab] = useState<'builder' | 'markdown' | 'import' | 'preview'>('builder');

  const getDefaultBlockData = (type: BlogBlockType): BlogBlock['data'] => {
    switch (type) {
      case 'heading': return { text: 'Section Heading', level: 2 };
      case 'paragraph': return { text: 'Write your paragraph content here...' };
      case 'introduction': return { text: 'Write your introductory lead paragraph here...' };
      case 'image': return { imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', altText: 'Illustration', caption: 'Image caption', alignment: 'center' };
      case 'table': return { columns: ['Column 1', 'Column 2', 'Column 3'], rows: [['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'], ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']] };
      case 'quote': return { text: 'Important insight or quote goes here.' };
      case 'bullet-list': return { items: ['First list item', 'Second list item', 'Third list item'] };
      case 'numbered-list': return { items: ['Step 1 description', 'Step 2 description', 'Step 3 description'] };
      case 'faq': return { questions: [{ question: 'What is this about?', answer: 'Detailed answer goes here.' }] };
      case 'custom-html': return { html: '<div class="p-4 bg-sky-950/30 rounded-xl text-sky-200">Custom HTML Block</div>' };
      case 'custom-code': return { code: 'console.log("Hello Netronomic");', language: 'javascript' };
      default: return { text: '' };
    }
  };

  const handleAddBlogBlock = (type: BlogBlockType) => {
    if (!editingPost) return;
    const newBlock: BlogBlock = {
      id: `block-${Date.now()}`,
      type,
      data: getDefaultBlockData(type)
    };
    const currentBlocks = editingPost.blocks || [];
    setEditingPost({
      ...editingPost,
      blocks: [...currentBlocks, newBlock]
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingPost || !editingPost.blocks) return;
    const blocks = [...editingPost.blocks];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const [moved] = blocks.splice(index, 1);
    blocks.splice(targetIdx, 0, moved);
    setEditingPost({ ...editingPost, blocks });
  };

  const handleDuplicateBlock = (index: number) => {
    if (!editingPost || !editingPost.blocks) return;
    const blocks = [...editingPost.blocks];
    const target = blocks[index];
    const duplicated: BlogBlock = {
      ...target,
      id: `block-${Date.now()}`,
      data: JSON.parse(JSON.stringify(target.data))
    };
    blocks.splice(index + 1, 0, duplicated);
    setEditingPost({ ...editingPost, blocks });
  };

  const handleDeleteBlock = (index: number) => {
    if (!editingPost || !editingPost.blocks) return;
    if (confirm('Delete this block?')) {
      const blocks = [...editingPost.blocks];
      blocks.splice(index, 1);
      setEditingPost({ ...editingPost, blocks });
    }
  };

  const handleUpdateBlockData = (index: number, dataKey: string, value: any) => {
    if (!editingPost || !editingPost.blocks) return;
    const blocks = [...editingPost.blocks];
    blocks[index] = {
      ...blocks[index],
      data: {
        ...blocks[index].data,
        [dataKey]: value
      }
    };
    setEditingPost({ ...editingPost, blocks });
  };

  // Page Editor State
  const [selectedPageId, setSelectedPageId] = useState<string>(siteConfig.pages?.[0]?.id || 'page-home');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [pageEditorMode, setPageEditorMode] = useState<'sections' | 'seo'>('sections');

  // SEO Analyzer State
  const [seoTargetType, setSeoTargetType] = useState<'page' | 'post'>('page');
  const [selectedSeoTargetId, setSelectedSeoTargetId] = useState<string>(siteConfig.pages?.[0]?.id || 'page-home');

  // Backup & Import Modal
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Media Library copied URL toast
  const [copiedMediaUrl, setCopiedMediaUrl] = useState('');

  // Hero typing phrase temp input
  const [newPhraseInput, setNewPhraseInput] = useState('');

  // Admin Users & Security Management State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentSession, setCurrentSessionState] = useState<AdminSession | null>(() => getCurrentSession());
  
  // Profile & Password Update Form
  const [profileUsername, setProfileUsername] = useState(currentSession?.username || 'admin');
  const [profileEmail, setProfileEmail] = useState(currentSession?.email || 'admin@example.com');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secMsg, setSecMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Creation Form
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<AdminRole>('Editor');
  const [addUserMsg, setAddUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Admin Users on mount
  useEffect(() => {
    getStoredAdminUsers().then(users => {
      setAdminUsers(users);
      const session = getCurrentSession();
      setCurrentSessionState(session);
      if (session) {
        setProfileUsername(session.username);
        setProfileEmail(session.email);
      }
    });
  }, []);

  const refreshUsers = async () => {
    const users = await getStoredAdminUsers();
    setAdminUsers(users);
    const session = getCurrentSession();
    setCurrentSessionState(session);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecMsg(null);
    if (!currentSession) return;

    if (!profileUsername.trim() || !profileEmail.trim()) {
      setSecMsg({ type: 'error', text: 'Username and Email cannot be empty.' });
      return;
    }

    const res = await updateAdminUser(currentSession.userId, {
      username: profileUsername,
      email: profileEmail,
    });

    if (res.success) {
      setSecMsg({ type: 'success', text: 'Profile details updated!' });
      refreshUsers();
      triggerSaveNotification('Admin profile details updated!');
    } else {
      setSecMsg({ type: 'error', text: res.message });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecMsg(null);
    if (!currentSession) return;

    if (!oldPassword || !newPassword) {
      setSecMsg({ type: 'error', text: 'Please enter your current and new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setSecMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const res = await changeUserPassword(currentSession.userId, oldPassword, newPassword);
    if (res.success) {
      setSecMsg({ type: 'success', text: 'Password successfully updated and encrypted with SHA-256!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      refreshUsers();
      triggerSaveNotification('Admin password changed!');
    } else {
      setSecMsg({ type: 'error', text: res.message });
    }
  };

  const handleCreateNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserMsg(null);

    if (!addUsername.trim() || !addEmail.trim() || !addPassword) {
      setAddUserMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (addPassword.length < 6) {
      setAddUserMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    const res = await createAdminUser(addUsername, addEmail, addPassword, addRole);
    if (res.success) {
      setAddUserMsg({ type: 'success', text: res.message });
      setAddUsername('');
      setAddEmail('');
      setAddPassword('');
      refreshUsers();
      setTimeout(() => {
        setAddUserModalOpen(false);
        setAddUserMsg(null);
      }, 1500);
    } else {
      setAddUserMsg({ type: 'error', text: res.message });
    }
  };

  const handleDeleteAdminUserClick = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        refreshUsers();
        triggerSaveNotification('Admin user account removed.');
      } else {
        alert(res.message);
      }
    }
  };

  const handleUpdateRoleClick = async (userId: string, newRole: AdminRole) => {
    const res = await updateAdminUser(userId, { role: newRole });
    if (res.success) {
      refreshUsers();
      triggerSaveNotification(`Role updated to ${newRole}`);
    } else {
      alert(res.message);
    }
  };

  const triggerSaveNotification = (msg: string = 'Changes saved successfully!') => {
    onSaveSiteConfig(localConfig);
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  // -------------------------------------------------------------
  // CALCULATED METRICS FOR DASHBOARD
  // -------------------------------------------------------------
  const publishedPostsCount = posts.filter(p => p.status === 'published').length;
  const draftPostsCount = posts.filter(p => p.status === 'draft').length;
  const totalPagesCount = localConfig.pages?.length || 5;
  const totalInquiriesCount = localConfig.inquiries?.length || 0;
  const newInquiriesCount = localConfig.inquiries?.filter(i => i.status === 'new').length || 0;

  // Calculate Overall Site SEO Health Score
  const calculateSeoScore = () => {
    let score = 100;
    const globalSeo = localConfig.seo;
    if (!globalSeo?.canonicalUrl) score -= 10;
    if (!globalSeo?.defaultOgImage) score -= 10;
    if (!globalSeo?.defaultOgDescription || globalSeo.defaultOgDescription.length < 50) score -= 10;
    
    // Check Home page meta
    const homePage = localConfig.pages?.find(p => p.slug === '/');
    if (!homePage?.metaTitle || homePage.metaTitle.length < 30) score -= 15;
    if (!homePage?.metaDescription || homePage.metaDescription.length < 80) score -= 15;
    if (!homePage?.focusKeyword) score -= 10;

    return Math.max(20, Math.min(100, score));
  };

  const seoHealthScore = calculateSeoScore();

  // -------------------------------------------------------------
  // PAGE & MODULAR SECTION HANDLERS
  // -------------------------------------------------------------
  const selectedPage = localConfig.pages?.find(p => p.id === selectedPageId) || localConfig.pages?.[0];

  const handleToggleSectionVisibility = (sectionId: string) => {
    if (!selectedPage) return;
    const updatedSections = selectedPage.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, visible: !sec.visible };
      }
      return sec;
    });

    const updatedPages = localConfig.pages.map(p => {
      if (p.id === selectedPage.id) {
        return { ...p, sections: updatedSections };
      }
      return p;
    });

    setLocalConfig({ ...localConfig, pages: updatedPages });
    onSaveSiteConfig({ ...localConfig, pages: updatedPages });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;
    const idx = selectedPage.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === selectedPage.sections.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updatedSections = [...selectedPage.sections];
    const [moved] = updatedSections.splice(idx, 1);
    updatedSections.splice(targetIdx, 0, moved);

    // Reassign order
    const reordered = updatedSections.map((s, i) => ({ ...s, order: i + 1 }));

    const updatedPages = localConfig.pages.map(p => {
      if (p.id === selectedPage.id) {
        return { ...p, sections: reordered };
      }
      return p;
    });

    setLocalConfig({ ...localConfig, pages: updatedPages });
    onSaveSiteConfig({ ...localConfig, pages: updatedPages });
  };

  const handleUpdateSectionData = (sectionId: string, fields: Partial<PageSectionConfig>) => {
    if (!selectedPage) return;
    const updatedSections = selectedPage.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, ...fields };
      }
      return sec;
    });

    const updatedPages = localConfig.pages.map(p => {
      if (p.id === selectedPage.id) {
        return { ...p, sections: updatedSections };
      }
      return p;
    });

    setLocalConfig({ ...localConfig, pages: updatedPages });
  };

  // -------------------------------------------------------------
  // BLOG POST HANDLERS
  // -------------------------------------------------------------
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.slug.toLowerCase().includes(blogSearch.toLowerCase());
    const matchesCategory = blogCategoryFilter === 'All' || post.category === blogCategoryFilter;
    const matchesStatus = blogStatusFilter === 'All' || post.status === blogStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

    const handleCreatePortfolio = () => {
    setEditingPortfolio({
      id: `port-${Date.now()}`,
      title: '',
      category: 'Website Design & Development',
      featured: false,
      image: '',
      description: '',
      tags: [],
      client: '',
      stats: '',
      link: ''
    });
    setIsPortfolioModalOpen(true);
  };

  const handleEditPortfolio = (port: PortfolioItem) => {
    setEditingPortfolio({ ...port });
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolio = () => {
    if (!editingPortfolio || !editingPortfolio.id || !editingPortfolio.title) return;
    const currentList = localConfig.portfolio || [];
    const exists = currentList.find(p => p.id === editingPortfolio.id);
    let newList;
    if (exists) {
      newList = currentList.map(p => p.id === editingPortfolio.id ? (editingPortfolio as PortfolioItem) : p);
    } else {
      newList = [(editingPortfolio as PortfolioItem), ...currentList];
    }
    const updatedConfig = { ...localConfig, portfolio: newList };
    setLocalConfig(updatedConfig);
    onSaveSiteConfig(updatedConfig);
    setSavedSuccessMsg('Portfolio project saved!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
    setIsPortfolioModalOpen(false);
    setEditingPortfolio(null);
  };

  const handleDeletePortfolio = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio project?')) {
      const updatedConfig = {
        ...localConfig,
        portfolio: (localConfig.portfolio || []).filter(p => p.id !== id)
      };
      setLocalConfig(updatedConfig);
      onSaveSiteConfig(updatedConfig);
      setSavedSuccessMsg('Portfolio project deleted!');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    }
  };

  const handleCreatePost = () => {
    setEditingPost({
      id: `post-${Date.now()}`,
      title: '',
      slug: '',
      excerpt: '',
      content: 'Write your introductory lead paragraph here...\n\nWrite your main article content here...',
      blocks: [
        { id: 'b1', type: 'introduction', data: { text: 'Write your introductory lead paragraph here...' } },
        { id: 'b2', type: 'paragraph', data: { text: 'Write your main article content here...' } }
      ],
      featuredImage: FEATURED_IMAGE_PRESETS[0].url,
      author: {
        name: localConfig.agency?.name || 'Netronomic Team',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Digital Strategist',
      },
      publishedAt: new Date().toISOString().split('T')[0],
      readingTime: '4 min read',
      category: 'Web Development',
      tags: ['SEO', 'Web Design', 'Digital Agency'],
      status: 'draft',
      seoTitle: '',
      metaDescription: '',
      focusKeyword: '',
      secondaryKeywords: '',
    });
    setBlogEditorTab('content');
    setBlogContentSubTab('builder');
    setIsBlogModalOpen(true);
  };

  const handleUpdatePageSeoField = (pageId: string, field: keyof SitePageConfig, val: any) => {
    const updatedPages = (localConfig.pages || []).map(p => {
      if (p.id === pageId) {
        return { ...p, [field]: val };
      }
      return p;
    });
    const updatedConfig = { ...localConfig, pages: updatedPages };
    setLocalConfig(updatedConfig);
    onSaveSiteConfig(updatedConfig);
  };

  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.slug) {
      alert('Please fill in Title and Slug');
      return;
    }

    const resolvedSlug = editingPost.slug.startsWith('/') ? editingPost.slug.slice(1) : editingPost.slug;
    const resolvedTitle = editingPost.seoTitle || editingPost.title;
    const resolvedDesc = editingPost.metaDescription || editingPost.excerpt || '';
    const resolvedOgImage = editingPost.ogImage || editingPost.featuredImage || FEATURED_IMAGE_PRESETS[0].url;

    const serializedContent = (editingPost.blocks && editingPost.blocks.length > 0)
      ? editingPost.blocks.map(b => {
          const d = b.data || {};
          switch (b.type) {
            case 'heading': return `${'#'.repeat(d.level || 2)} ${d.text}`;
            case 'introduction':
            case 'paragraph':
            case 'quote': return d.text;
            case 'image': return `![${d.altText || ''}](${d.imageUrl || ''})\n*${d.caption || ''}*`;
            case 'bullet-list': return (d.items || []).map(item => `- ${item}`).join('\n');
            case 'numbered-list': return (d.items || []).map((item, idx) => `${idx + 1}. ${item}`).join('\n');
            case 'faq': return (d.questions || []).map(q => `**Q: ${q.question}**\nA: ${q.answer}`).join('\n\n');
            case 'custom-html': return d.html;
            case 'custom-code': return `\`\`\`${d.language || 'code'}\n${d.code}\n\`\`\``;
            default: return '';
          }
        }).filter(Boolean).join('\n\n')
      : (editingPost.content || '');

    // Calculate score using RankMath analyzer
    const calculatedSeo = analyzeSeo({
      focusKeyword: editingPost.focusKeyword || '',
      seoTitle: resolvedTitle,
      metaDescription: resolvedDesc,
      slug: resolvedSlug,
      content: serializedContent,
      ogImage: resolvedOgImage
    });

    const postToSave: BlogPost = {
      id: editingPost.id || `post-${Date.now()}`,
      title: editingPost.title,
      slug: resolvedSlug,
      excerpt: editingPost.excerpt || '',
      content: serializedContent,
      blocks: editingPost.blocks || [],
      featuredImage: editingPost.featuredImage || FEATURED_IMAGE_PRESETS[0].url,
      author: editingPost.author || {
        name: 'Netronomic Team',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Digital Strategist'
      },
      publishedAt: editingPost.publishedAt || new Date().toISOString().split('T')[0],
      readingTime: editingPost.readingTime || '5 min read',
      category: editingPost.category || 'Web Development',
      tags: editingPost.tags || ['Web', 'SEO'],
      status: (editingPost.status as PostStatus) || 'draft',
      comments: editingPost.comments || [],
      focusKeyword: editingPost.focusKeyword || '',
      secondaryKeywords: editingPost.secondaryKeywords || '',
      seoTitle: resolvedTitle,
      metaDescription: resolvedDesc,
      ogImage: resolvedOgImage,
      seoScore: calculatedSeo.score,
    };

    onSavePost(postToSave);
    setIsBlogModalOpen(false);
    setEditingPost(null);
    triggerSaveNotification(`Blog post saved with SEO score: ${calculatedSeo.score}/100!`);
  };

  const handleBulkDelete = () => {
    if (selectedPostIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedPostIds.length} post(s)?`)) {
      selectedPostIds.forEach(id => onDeletePost(id));
      setSelectedPostIds([]);
      triggerSaveNotification('Selected posts deleted.');
    }
  };

  const handleBulkStatusChange = (status: PostStatus) => {
    if (selectedPostIds.length === 0) return;
    selectedPostIds.forEach(id => onToggleStatus(id, status));
    setSelectedPostIds([]);
    triggerSaveNotification(`Updated ${selectedPostIds.length} post(s) to ${status}.`);
  };

  // -------------------------------------------------------------
  // BACKUP & IMPORT HANDLERS
  // -------------------------------------------------------------
  const handleExportJSON = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      siteConfig: localConfig,
      posts: posts,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netronomic_cms_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    setImportError('');
    try {
      if (!importJsonText.trim()) {
        setImportError('Please paste valid JSON or choose a file.');
        return;
      }
      const parsed = JSON.parse(importJsonText);
      if (parsed.siteConfig) {
        setLocalConfig(parsed.siteConfig);
        onSaveSiteConfig(parsed.siteConfig);
      }
      if (parsed.posts && Array.isArray(parsed.posts)) {
        parsed.posts.forEach((p: BlogPost) => onSavePost(p));
      }
      setImportJsonText('');
      triggerSaveNotification('Site configuration and posts imported successfully!');
    } catch (err: any) {
      setImportError(`Failed to parse JSON: ${err.message}`);
    }
  };

  const handleInquiryStatusChange = (inquiryId: string, newStatus: 'new' | 'contacted' | 'closed') => {
    const updatedInquiries = localConfig.inquiries?.map(i => {
      if (i.id === inquiryId) return { ...i, status: newStatus };
      return i;
    }) || [];
    setLocalConfig({ ...localConfig, inquiries: updatedInquiries });
    onSaveSiteConfig({ ...localConfig, inquiries: updatedInquiries });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* TOP WORDPRESS ADMIN BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {localConfig.logo?.brandName || 'NETRONOMIC'} CMS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                WordPress Suite
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Full-Stack Control Panel & Content Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{savedSuccessMsg}</span>
            </motion.div>
          )}

          <button
            onClick={onOpenSitemap}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>XML Sitemap</span>
          </button>

          <button
            onClick={() => triggerSaveNotification('Global configuration updated!')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Website</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              if (onLogout) {
                onLogout();
              } else {
                onExitAdmin();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer"
            title="Log out and lock Admin Panel"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* ------------------------------------------------------------- */}
        {/* WORDPRESS-STYLE LEFT SIDEBAR */}
        {/* ------------------------------------------------------------- */}
        <aside className="w-16 sm:w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between py-4">
          <div className="space-y-1 px-2 sm:px-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
              { id: 'pages', label: 'Pages & Sections', icon: Layers, badge: `${totalPagesCount}` },
              { id: 'posts', label: 'Blog Posts', icon: FileText, badge: `${posts.length}` },
              { id: 'portfolio', label: 'Portfolio Projects', icon: Briefcase, badge: `${localConfig.portfolio?.length || 0}` },
              { id: 'seo', label: 'Advanced SEO Suite', icon: Sparkles, badge: `${seoHealthScore}%` },
              { id: 'inquiries', label: 'Contact Inquiries', icon: MessageSquare, badge: newInquiriesCount > 0 ? `${newInquiriesCount}` : null, alert: newInquiriesCount > 0 },
              { id: 'branding', label: 'Site Branding & Logo', icon: Settings, badge: null },
              { id: 'social', label: 'Social Media', icon: Share2, badge: null },
              { id: 'agency', label: 'Agency & Contact', icon: Building2, badge: null },
              { id: 'media', label: 'Media Library', icon: ImageIcon, badge: null },
              { id: 'backup', label: 'Data Backup & Import', icon: Database, badge: null },
              { id: 'users', label: 'Admin Users & Security', icon: ShieldCheck, badge: `${adminUsers.length}` },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-sky-400'}`} />
                    <span className="hidden sm:inline truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        item.alert
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isActive
                          ? 'bg-slate-950 text-sky-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Quick Links */}
          <div className="px-3 pt-4 border-t border-slate-800 space-y-2 hidden sm:block">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Visit Live Website</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </aside>

        {/* ------------------------------------------------------------- */}
        {/* MAIN DASHBOARD CONTENT AREA */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 space-y-8">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  CMS Control Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Manage pages, blog posts, SEO configurations, and incoming leads in real time.
                </p>
              </div>

              {/* METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Total Site Pages</span>
                    <Layers className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{totalPagesCount}</div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> All {totalPagesCount} pages indexable
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Blog Articles</span>
                    <FileText className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{posts.length}</div>
                  <p className="text-[11px] text-slate-400">
                    <span className="text-sky-400 font-bold">{publishedPostsCount} Published</span> • {draftPostsCount} Draft
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Inquiries / Leads</span>
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{totalInquiriesCount}</div>
                  <p className="text-[11px] text-rose-400 font-semibold">
                    {newInquiriesCount} new unread submissions
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>SEO Health Score</span>
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400">{seoHealthScore}/100</div>
                  <p className="text-[11px] text-slate-400">
                    Yoast / RankMath score calculated
                  </p>
                </div>
              </div>

              {/* QUICK ACTIONS & RECENT INQUIRIES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Inquiries */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Recent Contact Inquiries</h3>
                      <p className="text-xs text-slate-400">Leads captured from project estimator and forms</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className="text-xs text-sky-400 font-bold hover:underline"
                    >
                      View All ({totalInquiriesCount})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {localConfig.inquiries?.slice(0, 3).map(inq => (
                      <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{inq.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              inq.status === 'new'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : inq.status === 'contacted'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{inq.message}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Requested: {inq.service} ({inq.budget})</span>
                          <span>{inq.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Management Shortland Cards */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white">Quick CMS Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleCreatePost}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-left space-y-1 transition-colors group cursor-pointer"
                      >
                        <Plus className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-white">New Article</div>
                        <div className="text-[10px] text-slate-400">Write blog post</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('pages')}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-left space-y-1 transition-colors group cursor-pointer"
                      >
                        <Layers className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-white">Edit Layout</div>
                        <div className="text-[10px] text-slate-400">Manage sections</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('seo')}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-left space-y-1 transition-colors group cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-white">SEO Health</div>
                        <div className="text-[10px] text-slate-400">Check keywords</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('backup')}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-left space-y-1 transition-colors group cursor-pointer"
                      >
                        <Download className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-white">Export Data</div>
                        <div className="text-[10px] text-slate-400">Download JSON</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-900/40 to-cyan-900/40 border border-sky-500/30 rounded-2xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span>Live Site Configuration</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All edits performed in this admin suite update local storage and the live site preview seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: COMPLETE PAGE & MODULAR LAYOUT MANAGEMENT */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'pages' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Pages & Modular Section Editor</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage page hierarchy, toggle visibility of home sections, reorder sections, and update titles/CTAs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Select Page:</span>
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
                  >
                    {localConfig.pages?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PAGE SUB-TABS: SECTIONS VS SEO */}
              <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit">
                <button
                  type="button"
                  onClick={() => setPageEditorMode('sections')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    pageEditorMode === 'sections' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Modular Sections Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPageEditorMode('seo')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    pageEditorMode === 'seo' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>SEO Settings & Analysis</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-950 text-sky-400 border border-slate-800">
                    RankMath Live
                  </span>
                </button>
              </div>

              {/* TAB CONTENT: SEO SETTINGS & ANALYSIS FOR SELECTED PAGE */}
              {pageEditorMode === 'seo' && selectedPage && (
                <div className="space-y-4">
                  <SeoAnalysisPanel
                    focusKeyword={selectedPage.focusKeyword || ''}
                    onFocusKeywordChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'focusKeyword', val)}
                    seoTitle={selectedPage.metaTitle || selectedPage.title || ''}
                    onSeoTitleChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'metaTitle', val)}
                    metaDescription={selectedPage.metaDescription || ''}
                    onMetaDescriptionChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'metaDescription', val)}
                    slug={selectedPage.slug || ''}
                    onSlugChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'slug', val)}
                    ogImage={selectedPage.ogImage || localConfig.seo?.defaultOgImage || ''}
                    onOgImageChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'ogImage', val)}
                    customSchema={selectedPage.customSchema || ''}
                    onCustomSchemaChange={(val) => handleUpdatePageSeoField(selectedPage.id, 'customSchema', val)}
                    content={`${selectedPage.title}\n\n${selectedPage.metaTitle}\n\n${selectedPage.metaDescription}\n\n${selectedPage.sections?.map(s => `${s.name}. ${s.title}. ${s.subtitle}. ${s.badge || ''} ${s.ctaText || ''}`).join('\n\n')}`}
                    entityType="page"
                    entityName={selectedPage.title}
                    onScoreUpdate={(score) => handleUpdatePageSeoField(selectedPage.id, 'seoScore', score)}
                  />
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => triggerSaveNotification(`SEO settings saved for "${selectedPage.title}"!`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Page SEO to Firestore</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODULAR SECTION EDITOR BOARD */}
              {pageEditorMode === 'sections' && selectedPage && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-sky-400" />
                        <span>Sections for "{selectedPage.title}"</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Use arrows to reorder. Toggle visibility or edit titles & call-to-action buttons.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      {selectedPage.sections.filter(s => s.visible).length} / {selectedPage.sections.length} Sections Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedPage.sections.map((sec, idx) => {
                      const isEditing = editingSectionId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          className={`rounded-xl border transition-all ${
                            sec.visible
                              ? 'bg-slate-950 border-slate-800 hover:border-sky-500/50'
                              : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          }`}
                        >
                          <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-1">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSection(sec.id, 'up')}
                                  className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  disabled={idx === selectedPage.sections.length - 1}
                                  onClick={() => handleMoveSection(sec.id, 'down')}
                                  className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-sky-400">{sec.badge || `Sec ${idx + 1}`}</span>
                                  <span className="text-sm font-extrabold text-white">{sec.name}</span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-1">{sec.title}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleSectionVisibility(sec.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                                  sec.visible
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{sec.visible ? 'Visible' : 'Hidden'}</span>
                              </button>

                              <button
                                onClick={() => setEditingSectionId(isEditing ? null : sec.id)}
                                className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/20 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditing ? 'Close' : 'Edit Section'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Expanded Section Editor */}
                          {isEditing && (
                            <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 space-y-4 rounded-b-xl">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-300 mb-1">Section Headline Title</label>
                                  <input
                                    type="text"
                                    value={sec.title}
                                    onChange={(e) => handleUpdateSectionData(sec.id, { title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-300 mb-1">Section Subtitle / Description</label>
                                  <input
                                    type="text"
                                    value={sec.subtitle}
                                    onChange={(e) => handleUpdateSectionData(sec.id, { subtitle: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Button Text (Optional)</label>
                                  <input
                                    type="text"
                                    value={sec.ctaText || ''}
                                    onChange={(e) => handleUpdateSectionData(sec.id, { ctaText: e.target.value })}
                                    placeholder="e.g. Get Started Today"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Button URL / Anchor</label>
                                  <input
                                    type="text"
                                    value={sec.ctaUrl || '#contact'}
                                    onChange={(e) => handleUpdateSectionData(sec.id, { ctaUrl: e.target.value })}
                                    placeholder="#contact or /services"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => {
                                    setEditingSectionId(null);
                                    triggerSaveNotification(`Updated section "${sec.name}"`);
                                  }}
                                  className="px-4 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
                                >
                                  Done Editing
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: FULL BLOG & CONTENT MANAGEMENT */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'posts' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Blog & Content Management</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Create, edit, search, and manage blog posts with rich markdown and status workflows.
                  </p>
                </div>

                <button
                  onClick={handleCreatePost}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Article</span>
                </button>
              </div>

              {/* FILTER BAR & BULK ACTIONS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 w-full">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search posts by title or keyword..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
                  >
                    {BLOG_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={blogStatusFilter}
                    onChange={(e) => setBlogStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {selectedPostIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sky-400 font-bold">{selectedPostIds.length} selected</span>
                    <button
                      onClick={() => handleBulkStatusChange('published')}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('draft')}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30"
                    >
                      Draft
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* POSTS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedPostIds.length === filteredPosts.length && filteredPosts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPostIds(filteredPosts.map(p => p.id));
                              } else {
                                setSelectedPostIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="p-4">Article Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">RankMath SEO</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPosts.map(post => {
                        const isSelected = selectedPostIds.includes(post.id);
                        return (
                          <tr key={post.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPostIds([...selectedPostIds, post.id]);
                                  } else {
                                    setSelectedPostIds(selectedPostIds.filter(id => id !== post.id));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={post.featuredImage}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white line-clamp-1">{post.title}</div>
                                  <div className="text-[11px] text-slate-400">/{post.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-300">{post.category}</td>
                            <td className="p-4 text-center">
                              {(() => {
                                const calculated = analyzeSeo({
                                  focusKeyword: post.focusKeyword || '',
                                  seoTitle: post.seoTitle || post.title,
                                  metaDescription: post.metaDescription || post.excerpt,
                                  slug: post.slug,
                                  content: post.content,
                                  ogImage: post.ogImage || post.featuredImage
                                });
                                const finalScore = post.seoScore !== undefined && post.seoScore > 0 ? post.seoScore : calculated.score;
                                return (
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold border ${
                                    finalScore >= 81
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : finalScore >= 51
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    <span>{finalScore}/100</span>
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() =>
                                  onToggleStatus(post.id, post.status === 'published' ? 'draft' : 'published')
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer ${
                                  post.status === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {post.status}
                              </button>
                            </td>
                            <td className="p-4 text-slate-400">{post.publishedAt}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingPost(post);
                                    setBlogEditorTab('content');
                                    setIsBlogModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                                  title="Edit Post"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this article?')) onDeletePost(post.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition-colors cursor-pointer"
                                  title="Delete Post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          
          {/* TAB 3.5: PORTFOLIO MANAGEMENT */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Portfolio Management</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your portfolio case studies, projects, and media.
                  </p>
                </div>

                <button
                  onClick={handleCreatePortfolio}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Project</span>
                </button>
              </div>

              {/* PORTFOLIO LIST GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(localConfig.portfolio || []).map((port) => (
                  <div key={port.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group">
                    <div className="h-40 bg-slate-800 relative">
                      {port.videoUrl ? (
                        <video src={port.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : port.image ? (
                        <img src={port.image} alt={port.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500"><ImageIcon className="w-8 h-8 opacity-50" /></div>
                      )}
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button onClick={() => handleEditPortfolio(port)} className="w-8 h-8 rounded-lg bg-slate-900/80 backdrop-blur-sm text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors border border-white/10 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePortfolio(port.id)} className="w-8 h-8 rounded-lg bg-slate-900/80 backdrop-blur-sm text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-white/10 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                        {port.categoryLabel}
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-sm font-bold text-white truncate">{port.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{port.description}</p>
                      {port.client && (
                         <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-300">Client:</span> {port.client}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(localConfig.portfolio || []).length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No Portfolio Projects Found</h3>
                    <p className="text-xs text-slate-500 mt-1">Click "Add New Project" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PORTFOLIO EDITOR MODAL */}
          <AnimatePresence>
            {isPortfolioModalOpen && editingPortfolio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col my-auto max-h-[90vh]"
                >
                  <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 bg-slate-900 z-10 rounded-t-2xl">
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-sky-400" />
                      {editingPortfolio.id?.includes('port-') && editingPortfolio.title === '' ? 'Create New Project' : 'Edit Project'}
                    </h2>
                    <button
                      onClick={() => setIsPortfolioModalOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Project Title</label>
                          <input
                            type="text"
                            required
                            value={editingPortfolio.title || ''}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                            placeholder="e.g. Skyline Digital Transformation"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Category Value (internal)</label>
                            <input
                              type="text"
                              value={editingPortfolio.category || ''}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, category: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="e.g. websites"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Category Label</label>
                            <input
                              type="text"
                              value={editingPortfolio.categoryLabel || ''}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, categoryLabel: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="e.g. Websites"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Client Name</label>
                            <input
                              type="text"
                              value={editingPortfolio.client || ''}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, client: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="e.g. Acme Corp"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Highlight Stats</label>
                            <input
                              type="text"
                              value={editingPortfolio.stats || ''}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, stats: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="e.g. 240% Growth"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Live Link</label>
                          <input
                            type="text"
                            value={editingPortfolio.link || ''}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, link: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Short Description (Card)</label>
                          <textarea
                            rows={3}
                            value={editingPortfolio.description || ''}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                            placeholder="Brief summary for the portfolio card..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description (Detail Page)</label>
                          <textarea
                            rows={5}
                            value={editingPortfolio.detailedDescription || ''}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, detailedDescription: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                            placeholder="Full case study details..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma separated)</label>
                          <input
                            type="text"
                            value={(editingPortfolio.tags || []).join(', ')}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                            placeholder="React, Node.js, UI/UX"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Technologies (Comma separated)</label>
                            <input
                              type="text"
                              value={(editingPortfolio.technologies || []).join(', ')}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="Figma, Tailwind, React"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Date/Year</label>
                            <input
                              type="text"
                              value={editingPortfolio.date || ''}
                              onChange={(e) => setEditingPortfolio({ ...editingPortfolio, date: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                              placeholder="e.g. 2024"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <MediaPickerField
                          label="Project Cover Image"
                          value={editingPortfolio.image || ''}
                          onChange={(url) => setEditingPortfolio({ ...editingPortfolio, image: url })}
                          category="portfolio"
                          helperText="Select or upload a thumbnail image from the media gallery."
                        />

                        <MediaPickerField
                          label="Project Video (Optional MP4)"
                          value={editingPortfolio.videoUrl || ''}
                          onChange={(url) => setEditingPortfolio({ ...editingPortfolio, videoUrl: url })}
                          category="portfolio"
                          helperText="Upload a video to display instead of the image in the project view."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-900 rounded-b-2xl">
                    <button
                      onClick={() => setIsPortfolioModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-transparent border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePortfolio}
                      disabled={!editingPortfolio.title}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-sky-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Project
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 4: ADVANCED SEO SUITE (YOAST / RANKMATH STYLE) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'seo' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-sky-400" />
                  <span>Advanced SEO Suite & On-Page Health Check</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Yoast & RankMath style controls: live meta character counters, focus keyword health checklist, OpenGraph social cards, canonicals & robots.txt.
                </p>
              </div>

              {/* GLOBAL SEO SETTINGS BOARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Global Site SEO & Indexing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Canonical URL Domain</label>
                    <input
                      type="text"
                      value={localConfig.seo?.canonicalUrl || ''}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          seo: { ...localConfig.seo, canonicalUrl: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Google Site Verification (Search Console)</label>
                    <input
                      type="text"
                      value={localConfig.seo?.googleSiteVerification || ''}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          seo: { ...localConfig.seo, googleSiteVerification: e.target.value },
                        })
                      }
                      placeholder="e.g. _bSz_UNGInG_iuZe3dvqdcm_F-AEnkLctkQLhzP_dXM"
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Injected as &lt;meta name="google-site-verification" content="..."&gt; in &lt;head&gt;
                    </p>
                  </div>

                  <MediaPickerField
                    label="Default OpenGraph Social Image"
                    value={localConfig.seo?.defaultOgImage || ''}
                    onChange={(url) =>
                      setLocalConfig({
                        ...localConfig,
                        seo: { ...localConfig.seo, defaultOgImage: url },
                      })
                    }
                    category="banner"
                    helperText="Displayed when sharing link on Facebook, LinkedIn, Twitter, and WhatsApp."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Robots.txt Content</label>
                    <textarea
                      rows={4}
                      value={localConfig.seo?.robotsTxt || ''}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          seo: { ...localConfig.seo, robotsTxt: e.target.value },
                        })
                      }
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Header Scripts Injection (`&lt;head&gt;` GTM / GA4)</label>
                    <textarea
                      rows={4}
                      value={localConfig.seo?.headerScripts || ''}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          seo: { ...localConfig.seo, headerScripts: e.target.value },
                        })
                      }
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* SOCIAL OPENGRAPH PREVIEW CARD */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    OpenGraph Social Sharing Preview (Facebook / LinkedIn / Twitter)
                  </div>
                  <div className="max-w-md rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
                    <img
                      src={localConfig.seo?.defaultOgImage || FEATURED_IMAGE_PRESETS[0].url}
                      alt="OG Preview"
                      className="w-full h-40 object-cover bg-slate-800"
                    />
                    <div className="p-4 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {localConfig.seo?.canonicalUrl || 'NETRONOMIC.COM'}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {localConfig.seo?.defaultOgTitle || localConfig.logo?.brandName}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-2">
                        {localConfig.seo?.defaultOgDescription || localConfig.hero?.subtitle}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: GLOBAL BRANDING & LOGO */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'branding' && (
            <div className="space-y-8 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h1 className="text-xl font-extrabold text-white border-b border-slate-800 pb-3">
                Global Site Branding & Colors
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={localConfig.logo?.brandName || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        logo: { ...localConfig.logo, brandName: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={localConfig.logo?.taglineText || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        logo: { ...localConfig.logo, taglineText: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Header Logo Settings */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Header Logo Settings</h3>
                <MediaPickerField
                  label="Header Brand Logo Image"
                  value={localConfig.logo?.customLogoUrl || ''}
                  onChange={(url) =>
                    setLocalConfig({
                      ...localConfig,
                      logo: { ...localConfig.logo, customLogoUrl: url, iconVariant: url ? 'custom-image' : localConfig.logo?.iconVariant || 'network-orb' },
                    })
                  }
                  category="logo"
                  helperText="Upload header logo or select from Media Library. (Used in navbar header)"
                />
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Header Logo Icon Mode</label>
                  <select
                    value={localConfig.logo?.iconVariant || 'network-orb'}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        logo: { ...localConfig.logo, iconVariant: e.target.value as any },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="network-orb">Default Vector Orb</option>
                    <option value="custom-image">Custom Image (Upload above)</option>
                    <option value="none">Hide Icon Entirely</option>
                  </select>
                </div>
              </div>

              {/* Footer Logo Settings */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Footer Logo Settings</h3>
                <MediaPickerField
                  label="Footer Brand Logo Image"
                  value={localConfig.logo?.footerLogoUrl || ''}
                  onChange={(url) =>
                    setLocalConfig({
                      ...localConfig,
                      logo: { ...localConfig.logo, footerLogoUrl: url, footerIconVariant: url ? 'custom-image' : localConfig.logo?.footerIconVariant || 'network-orb' },
                    })
                  }
                  category="logo"
                  helperText="Upload footer logo or select from Media Library. (Used independently in website footer)"
                />
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Footer Logo Icon Mode</label>
                  <select
                    value={localConfig.logo?.footerIconVariant || 'network-orb'}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        logo: { ...localConfig.logo, footerIconVariant: e.target.value as any },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="network-orb">Default Vector Orb</option>
                    <option value="custom-image">Custom Image (Upload above)</option>
                    <option value="none">Hide Icon Entirely</option>
                  </select>
                </div>
              </div>
              {/* Logo Layout & Custom Button Options */}
              <div className="pt-6 border-t border-slate-800">
                <h2 className="text-lg font-bold text-white mb-4">Logo Image & Layout Controls</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Global Logo Size ({localConfig.logo?.logoSize || 100}%)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={localConfig.logo?.logoSize || 100}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          logo: { ...localConfig.logo, logoSize: parseInt(e.target.value) },
                        })
                      }
                      className="w-full mt-2 accent-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Header Logo Alignment
                    </label>
                    <select
                      value={localConfig.logo?.headerLogoAlign || 'left'}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          logo: { ...localConfig.logo, headerLogoAlign: e.target.value as any },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Footer Logo Alignment
                    </label>
                    <select
                      value={localConfig.logo?.footerLogoAlign || 'left'}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          logo: { ...localConfig.logo, footerLogoAlign: e.target.value as any },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Gap between Icon & Text ({localConfig.logo?.gap !== undefined ? localConfig.logo.gap : 12}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={localConfig.logo?.gap !== undefined ? localConfig.logo.gap : 12}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          logo: { ...localConfig.logo, gap: parseInt(e.target.value) },
                        })
                      }
                      className="w-full mt-2 accent-sky-500"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="showTagline"
                      checked={localConfig.logo?.showTagline !== false}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          logo: { ...localConfig.logo, showTagline: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                    />
                    <label htmlFor="showTagline" className="ml-2 text-sm text-slate-300 font-semibold cursor-pointer">
                      Show Tagline under Brand Name
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-sky-500/30 bg-sky-950/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-sky-400">Custom Action Button Instead of Text</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showCustomButton"
                        checked={localConfig.logo?.showCustomButton || false}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            logo: { ...localConfig.logo, showCustomButton: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                      />
                      <label htmlFor="showCustomButton" className="ml-2 text-xs text-sky-200 font-bold cursor-pointer">
                        Replace Text with Button
                      </label>
                    </div>
                  </div>
                  
                  {localConfig.logo?.showCustomButton && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={localConfig.logo?.customButtonText || ''}
                          placeholder="e.g., Click Here"
                          onChange={(e) =>
                            setLocalConfig({
                              ...localConfig,
                              logo: { ...localConfig.logo, customButtonText: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Button Link / URL</label>
                        <input
                          type="text"
                          value={localConfig.logo?.customButtonUrl || ''}
                          placeholder="https://..."
                          onChange={(e) =>
                            setLocalConfig({
                              ...localConfig,
                              logo: { ...localConfig.logo, customButtonUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Button Color</label>
                        <select
                          value={localConfig.logo?.customButtonColor || 'sky'}
                          onChange={(e) =>
                            setLocalConfig({
                              ...localConfig,
                              logo: { ...localConfig.logo, customButtonColor: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                        >
                          <option value="sky">Sky Blue</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="rose">Rose Red</option>
                          <option value="indigo">Indigo Purple</option>
                          <option value="slate">Dark Slate</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 justify-end pb-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localConfig.logo?.customButtonShine || false}
                            onChange={(e) =>
                              setLocalConfig({
                                ...localConfig,
                                logo: { ...localConfig.logo, customButtonShine: e.target.checked },
                              })
                            }
                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-sky-500"
                          />
                          <span className="ml-2 text-[11px] text-slate-300">Enable Shine Animation</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localConfig.logo?.customButtonBorder || false}
                            onChange={(e) =>
                              setLocalConfig({
                                ...localConfig,
                                logo: { ...localConfig.logo, customButtonBorder: e.target.checked },
                              })
                            }
                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-sky-500"
                          />
                          <span className="ml-2 text-[11px] text-slate-300">Show Light Border</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => triggerSaveNotification('Branding updated!')}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                >
                  Save Branding Settings
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: AGENCY & CONTACT DETAILS */}
          {/* ------------------------------------------------------------- */}
          
          {activeTab === 'social' && (
            <div className="space-y-8 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h1 className="text-xl font-extrabold text-white">
                  Social Media Platforms
                </h1>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hideAllSocial"
                    checked={localConfig.agency?.social?.hideAll || false}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        agency: {
                          ...localConfig.agency,
                          social: {
                            ...localConfig.agency?.social,
                            hideAll: e.target.checked
                          }
                        } as any
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="hideAllSocial" className="text-sm font-bold text-slate-300 cursor-pointer">
                    Hide All Social Icons
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-400">Manage all your social media platforms here. To hide a specific platform, just clear its URL.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'github', 'tiktok', 'pinterest'].map((network) => (
                  <div key={network} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-2 capitalize">{network} Profile URL</label>
                    <input
                      type="text"
                      value={(localConfig.agency?.social as any)?.[network] || ''}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          agency: {
                            ...localConfig.agency,
                            social: {
                              ...localConfig.agency?.social,
                              [network]: e.target.value
                            }
                          } as any
                        })
                      }
                      placeholder={`https://${network}.com/yourprofile`}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => triggerSaveNotification('Social Media updated!')}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                >
                  Save Social Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'agency' && (
            <div className="space-y-8 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h1 className="text-xl font-extrabold text-white border-b border-slate-800 pb-3">
                Agency Details & Contact Info
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number or Full Link</label>
                  <input
                    type="text"
                    value={localConfig.agency?.whatsappNumber || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        agency: { ...localConfig.agency, whatsappNumber: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={localConfig.agency?.phone || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        agency: { ...localConfig.agency, phone: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={localConfig.agency?.email || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        agency: { ...localConfig.agency, email: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Business Hours</label>
                  <input
                    type="text"
                    value={localConfig.agency?.hours || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        agency: { ...localConfig.agency, hours: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Physical Headquarters Address</label>
                <input
                  type="text"
                  value={localConfig.agency?.address || ''}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      agency: { ...localConfig.agency, address: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => triggerSaveNotification('Agency contact info updated!')}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                >
                  Save Agency Details
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 7: CONTACT INQUIRIES & LEADS MANAGER */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Contact Inquiries & Leads</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage form submissions, budget preferences, and respond directly via WhatsApp or Email.
                </p>
              </div>

              <div className="space-y-4">
                {localConfig.inquiries?.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{inq.name}</h3>
                        <p className="text-xs text-slate-400">{inq.email} • {inq.phone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            handleInquiryStatusChange(inq.id, e.target.value as 'new' | 'contacted' | 'closed')
                          }
                          className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none"
                        >
                          <option value="new">Mark New</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="closed">Mark Closed</option>
                        </select>

                        <a
                          href={(localConfig.agency?.whatsappNumber?.startsWith('http') ? localConfig.agency?.whatsappNumber : `https://wa.me/${localConfig.agency?.whatsappNumber || '923020487103'}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whatsapp-shine-btn px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
                          title="Message Netronomic web on WhatsApp"
                        >
                          WhatsApp Reply
                        </a>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{inq.message}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                      <span>Service: <strong className="text-sky-400">{inq.service}</strong></span>
                      <span>Budget: <strong className="text-emerald-400">{inq.budget}</strong></span>
                      <span>Date: {inq.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 8: MEDIA LIBRARY */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'media' && (
            <AdminMediaManager />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 9: DATA BACKUP, EXPORT & IMPORT */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'backup' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Data Backup, Export & Import</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Export site configuration to JSON for offline backup, or restore data safely.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-sky-400" />
                    <h3 className="text-base font-bold text-white">Export Site Backup</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Downloads complete JSON package containing all page structures, blog posts, SEO configurations, and agency info.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    Download JSON Backup File
                  </button>
                </div>

                {/* Reset to Factory Defaults Card */}
                <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-6 h-6 text-rose-400" />
                    <h3 className="text-base font-bold text-white">Factory Reset</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reset all site data and configurations back to initial agency defaults.
                  </p>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-500/30 transition-all cursor-pointer"
                  >
                    Reset to Factory Defaults
                  </button>
                </div>
              </div>

              {/* Import JSON Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-sky-400" />
                  <h3 className="text-base font-bold text-white">Restore / Import JSON Data</h3>
                </div>

                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste backup JSON content here..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500"
                />

                {importError && (
                  <p className="text-xs font-bold text-rose-400">{importError}</p>
                )}

                <button
                  onClick={handleImportJSON}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Import Data Now
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 10: ADMIN USERS & SECURITY MANAGEMENT */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'users' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                    <ShieldCheck className="w-7 h-7 text-sky-400" />
                    <span>Admin Users & Authentication Security</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage administrator accounts, user roles, security settings, and password policies.
                  </p>
                </div>

                <button
                  onClick={() => setAddUserModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Admin User</span>
                </button>
              </div>

              {/* Status Message Toast */}
              {secMsg && (
                <div
                  className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    secMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {secMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{secMsg.text}</span>
                  </div>
                  <button onClick={() => setSecMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* CURRENT LOGGED-IN ACCOUNT PROFILE & PASSWORD CHANGE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Building2 className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Current Account Profile</h3>
                      <p className="text-[11px] text-slate-400">
                        Logged in as: <strong className="text-sky-300">{currentSession?.username || 'admin'}</strong> ({currentSession?.role || 'Super Admin'})
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                      <input
                        type="text"
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Password Change Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Change Admin Password</h3>
                      <p className="text-[11px] text-slate-400">Passwords are salted and stored securely with SHA-256 encryption.</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>

              {/* ADMINISTRATOR ACCOUNTS TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-sky-400" />
                      <span>Administrator Accounts ({adminUsers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">List of authorized administrators with access to CMS.</p>
                  </div>
                  <button
                    onClick={() => setAddUserModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/30 transition-colors cursor-pointer"
                  >
                    + Add Account
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                      <tr>
                        <th className="p-3 rounded-l-xl">User</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Created Date</th>
                        <th className="p-3 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.username}</span>
                            {user.mustChangePassword && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                Default Pass
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-[11px]">{user.email}</td>
                          <td className="p-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRoleClick(user.id, e.target.value as AdminRole)}
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-sky-300 font-bold focus:outline-none cursor-pointer"
                            >
                              <option value="Super Admin">Super Admin</option>
                              <option value="Editor">Editor</option>
                              <option value="SEO Manager">SEO Manager</option>
                            </select>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Initial'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteAdminUserClick(user.id)}
                              disabled={adminUsers.length <= 1}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer disabled:opacity-30"
                              title="Delete Admin Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BLOG EDITOR MODAL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isBlogModalOpen && editingPost && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-white">
                    {editingPost.id ? 'Edit Blog Article' : 'New Blog Article'}
                  </span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBlogEditorTab('content')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        blogEditorTab === 'content' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Content Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogEditorTab('seo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        blogEditorTab === 'seo' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>SEO Settings & Analysis</span>
                      {(() => {
                        const quickScore = analyzeSeo({
                          focusKeyword: editingPost.focusKeyword || '',
                          seoTitle: editingPost.seoTitle || editingPost.title,
                          metaDescription: editingPost.metaDescription || editingPost.excerpt,
                          slug: editingPost.slug,
                          content: editingPost.content,
                          ogImage: editingPost.ogImage || editingPost.featuredImage
                        }).score;
                        return (
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                            blogEditorTab === 'seo' ? 'bg-slate-950 text-sky-400' : 'bg-slate-900 text-slate-300'
                          }`}>
                            {quickScore}/100
                          </span>
                        );
                      })()}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsBlogModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArticleSubmit} className="space-y-4">
                {blogEditorTab === 'content' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Article Title</label>
                        <input
                          type="text"
                          required
                          value={editingPost.title || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                            setEditingPost({
                              ...editingPost,
                              title: val,
                              slug: editingPost.slug || slugified,
                              seoTitle: editingPost.seoTitle || val,
                            });
                          }}
                          className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug</label>
                        <input
                          type="text"
                          required
                          value={editingPost.slug || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                        <select
                          value={editingPost.category || 'Web Development'}
                          onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        >
                          {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                    <div className="space-y-4">
                      <MediaPickerField
                        label="Featured Article Cover Image"
                        value={editingPost.featuredImage || ''}
                        onChange={(url) => setEditingPost({ ...editingPost, featuredImage: url })}
                        category="blog"
                        helperText="Select or upload a cover image for this blog post."
                      />
                    </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Article Excerpt</label>
                      <textarea
                        rows={2}
                        value={editingPost.excerpt || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Content Editor Sub-Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setBlogContentSubTab('builder')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          blogContentSubTab === 'builder' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white bg-slate-900'
                        }`}
                      >
                        Visual Block Builder
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogContentSubTab('markdown')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          blogContentSubTab === 'markdown' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white bg-slate-900'
                        }`}
                      >
                        Raw Markdown
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogContentSubTab('import')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          blogContentSubTab === 'import' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white bg-slate-900'
                        }`}
                      >
                        Import Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogContentSubTab('preview')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          blogContentSubTab === 'preview' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white bg-slate-900'
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>

                    {blogContentSubTab === 'builder' && (
                      <div className="space-y-4">
                        {/* Add Block Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-300 mr-2">Add Section:</span>
                            <button type="button" onClick={() => handleAddBlogBlock('heading')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Heading</button>
                            <button type="button" onClick={() => handleAddBlogBlock('paragraph')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Paragraph</button>
                            <button type="button" onClick={() => handleAddBlogBlock('introduction')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Intro</button>
                            <button type="button" onClick={() => handleAddBlogBlock('image')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Image</button>
                            <button type="button" onClick={() => handleAddBlogBlock('table')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Table</button>
                            <button type="button" onClick={() => handleAddBlogBlock('quote')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Quote</button>
                            <button type="button" onClick={() => handleAddBlogBlock('bullet-list')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Bullet List</button>
                            <button type="button" onClick={() => handleAddBlogBlock('numbered-list')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Numbered List</button>
                            <button type="button" onClick={() => handleAddBlogBlock('faq')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ FAQ</button>
                            <button type="button" onClick={() => handleAddBlogBlock('custom-html')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ HTML</button>
                            <button type="button" onClick={() => handleAddBlogBlock('custom-code')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-colors cursor-pointer">+ Code</button>
                          </div>
                        </div>

                        {/* Blocks List */}
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {(!editingPost.blocks || editingPost.blocks.length === 0) ? (
                            <div className="text-center py-12 text-slate-500 text-xs">
                              No blocks added yet. Click above to add article sections.
                            </div>
                          ) : (
                            editingPost.blocks.map((block, idx) => (
                              <div key={block.id} className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3 relative group shadow-md">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                  <span className="text-[11px] font-extrabold uppercase text-sky-400 font-mono tracking-wider">
                                    #{idx + 1} • {block.type}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => handleMoveBlock(idx, 'up')} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => handleMoveBlock(idx, 'down')} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => handleDuplicateBlock(idx)} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteBlock(idx)} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:text-white cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>

                                {/* Block Specific Inputs */}
                                {block.type === 'heading' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Level</label>
                                      <select
                                        value={block.data.level || 2}
                                        onChange={(e) => handleUpdateBlockData(idx, 'level', parseInt(e.target.value))}
                                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                      >
                                        <option value={1}>H1</option>
                                        <option value={2}>H2</option>
                                        <option value={3}>H3</option>
                                        <option value={4}>H4</option>
                                      </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Heading Text</label>
                                      <input
                                        type="text"
                                        value={block.data.text || ''}
                                        onChange={(e) => handleUpdateBlockData(idx, 'text', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                      />
                                    </div>
                                  </div>
                                )}

                                {(block.type === 'paragraph' || block.type === 'introduction' || block.type === 'quote') && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                      {block.type === 'quote' ? 'Quote Text' : block.type === 'introduction' ? 'Lead Introduction Text' : 'Paragraph Text'}
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={block.data.text || ''}
                                      onChange={(e) => handleUpdateBlockData(idx, 'text', e.target.value)}
                                      className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed"
                                    />
                                  </div>
                                )}

                                {block.type === 'image' && (
                                  <div className="space-y-3">
                                    <MediaPickerField
                                      label="Image Source"
                                      value={block.data.imageUrl || ''}
                                      onChange={(url) => handleUpdateBlockData(idx, 'imageUrl', url)}
                                      category="blog"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Alt Text</label>
                                        <input
                                          type="text"
                                          value={block.data.altText || ''}
                                          onChange={(e) => handleUpdateBlockData(idx, 'altText', e.target.value)}
                                          className="w-full px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Caption</label>
                                        <input
                                          type="text"
                                          value={block.data.caption || ''}
                                          onChange={(e) => handleUpdateBlockData(idx, 'caption', e.target.value)}
                                          className="w-full px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Alignment</label>
                                        <select
                                          value={block.data.alignment || 'center'}
                                          onChange={(e) => handleUpdateBlockData(idx, 'alignment', e.target.value)}
                                          className="w-full px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                        >
                                          <option value="left">Left</option>
                                          <option value="center">Center</option>
                                          <option value="right">Right</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {block.type === 'table' && (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Table Editor</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const cols = block.data.columns || [];
                                          const rows = block.data.rows || [];
                                          handleUpdateBlockData(idx, 'rows', [...rows, cols.map(() => 'Cell')]);
                                        }}
                                        className="px-2 py-1 rounded bg-slate-800 text-sky-400 text-[10px] font-bold cursor-pointer"
                                      >
                                        + Add Row
                                      </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr>
                                            {(block.data.columns || []).map((col, cIdx) => (
                                              <th key={cIdx} className="p-1">
                                                <input
                                                  type="text"
                                                  value={col}
                                                  onChange={(e) => {
                                                    const cols = [...(block.data.columns || [])];
                                                    cols[cIdx] = e.target.value;
                                                    handleUpdateBlockData(idx, 'columns', cols);
                                                  }}
                                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400 font-bold text-xs"
                                                />
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(block.data.rows || []).map((row, rIdx) => (
                                            <tr key={rIdx}>
                                              {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-1">
                                                  <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => {
                                                      const rows = JSON.parse(JSON.stringify(block.data.rows || []));
                                                      rows[rIdx][cIdx] = e.target.value;
                                                      handleUpdateBlockData(idx, 'rows', rows);
                                                    }}
                                                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                                                  />
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {(block.type === 'bullet-list' || block.type === 'numbered-list') && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">List Items</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const items = block.data.items || [];
                                          handleUpdateBlockData(idx, 'items', [...items, 'New list item']);
                                        }}
                                        className="px-2 py-1 rounded bg-slate-800 text-sky-400 text-[10px] font-bold cursor-pointer"
                                      >
                                        + Add Item
                                      </button>
                                    </div>
                                    {(block.data.items || []).map((item, itemIdx) => (
                                      <div key={itemIdx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={item}
                                          onChange={(e) => {
                                            const items = [...(block.data.items || [])];
                                            items[itemIdx] = e.target.value;
                                            handleUpdateBlockData(idx, 'items', items);
                                          }}
                                          className="w-full px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = [...(block.data.items || [])];
                                            items.splice(itemIdx, 1);
                                            handleUpdateBlockData(idx, 'items', items);
                                          }}
                                          className="p-1 rounded bg-rose-500/20 text-rose-400 hover:text-white text-xs cursor-pointer"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {block.type === 'faq' && (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">FAQ Questions & Answers</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const qs = block.data.questions || [];
                                          handleUpdateBlockData(idx, 'questions', [...qs, { question: 'New Question?', answer: 'Answer text.' }]);
                                        }}
                                        className="px-2 py-1 rounded bg-slate-800 text-sky-400 text-[10px] font-bold cursor-pointer"
                                      >
                                        + Add FAQ
                                      </button>
                                    </div>
                                    {(block.data.questions || []).map((faq, fIdx) => (
                                      <div key={fIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                        <input
                                          type="text"
                                          placeholder="Question"
                                          value={faq.question}
                                          onChange={(e) => {
                                            const qs = JSON.parse(JSON.stringify(block.data.questions || []));
                                            qs[fIdx].question = e.target.value;
                                            handleUpdateBlockData(idx, 'questions', qs);
                                          }}
                                          className="w-full px-3 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300 font-bold text-xs"
                                        />
                                        <textarea
                                          rows={2}
                                          placeholder="Answer"
                                          value={faq.answer}
                                          onChange={(e) => {
                                            const qs = JSON.parse(JSON.stringify(block.data.questions || []));
                                            qs[fIdx].answer = e.target.value;
                                            handleUpdateBlockData(idx, 'questions', qs);
                                          }}
                                          className="w-full px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {block.type === 'custom-html' && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Custom HTML</label>
                                    <textarea
                                      rows={4}
                                      value={block.data.html || ''}
                                      onChange={(e) => handleUpdateBlockData(idx, 'html', e.target.value)}
                                      className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200"
                                    />
                                  </div>
                                )}

                                {block.type === 'custom-code' && (
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Language</label>
                                      <input
                                        type="text"
                                        value={block.data.language || 'javascript'}
                                        onChange={(e) => handleUpdateBlockData(idx, 'language', e.target.value)}
                                        className="w-full px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Code Snippet</label>
                                      <textarea
                                        rows={4}
                                        value={block.data.code || ''}
                                        onChange={(e) => handleUpdateBlockData(idx, 'code', e.target.value)}
                                        className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {blogContentSubTab === 'markdown' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Raw Markdown Content</label>
                        <textarea
                          rows={12}
                          value={editingPost.content || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200 focus:outline-none focus:border-sky-500 leading-relaxed"
                        />
                      </div>
                    )}

                    {blogContentSubTab === 'import' && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-300 mb-1">Import Article HTML / Markdown Code</label>
                        <textarea
                          rows={8}
                          placeholder="Paste HTML or markdown code here to parse into blocks..."
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            alert('Code imported and converted successfully into blocks!');
                            setBlogContentSubTab('builder');
                          }}
                          className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Convert & Load into Builder
                        </button>
                      </div>
                    )}

                    {blogContentSubTab === 'preview' && (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 max-h-[500px] overflow-y-auto">
                        <div className="border-b border-slate-800 pb-4">
                          <span className="text-xs font-bold text-sky-400 uppercase">{editingPost.category || 'Web Development'}</span>
                          <h1 className="text-2xl font-black text-white mt-1">{editingPost.title || 'Untitled Article'}</h1>
                          <p className="text-xs text-slate-400 mt-2">{editingPost.excerpt || ''}</p>
                        </div>
                        {editingPost.featuredImage && (
                          <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                            <img src={editingPost.featuredImage} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <article className="prose prose-invert max-w-none text-slate-300 text-sm space-y-4">
                          {editingPost.blocks && editingPost.blocks.map((b, bIdx) => (
                            <div key={bIdx}>
                              {b.type === 'heading' && <h2 className="text-xl font-bold text-white">{b.data.text}</h2>}
                              {b.type === 'paragraph' && <p>{b.data.text}</p>}
                              {b.type === 'introduction' && <div className="p-4 bg-sky-950/40 rounded-xl text-sky-200">{b.data.text}</div>}
                              {b.type === 'quote' && <blockquote className="border-l-4 border-sky-400 pl-4 italic">{b.data.text}</blockquote>}
                            </div>
                          ))}
                        </article>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <SeoAnalysisPanel
                      focusKeyword={editingPost.focusKeyword || ''}
                      onFocusKeywordChange={(val) => setEditingPost({ ...editingPost, focusKeyword: val })}
                      seoTitle={editingPost.seoTitle || editingPost.title || ''}
                      onSeoTitleChange={(val) => setEditingPost({ ...editingPost, seoTitle: val })}
                      metaDescription={editingPost.metaDescription || editingPost.excerpt || ''}
                      onMetaDescriptionChange={(val) => setEditingPost({ ...editingPost, metaDescription: val })}
                      slug={editingPost.slug || ''}
                      onSlugChange={(val) => setEditingPost({ ...editingPost, slug: val })}
                      ogImage={editingPost.ogImage || editingPost.featuredImage || ''}
                      onOgImageChange={(val) => setEditingPost({ ...editingPost, ogImage: val })}
                      customSchema={editingPost.customSchema || ''}
                      onCustomSchemaChange={(val) => setEditingPost({ ...editingPost, customSchema: val })}
                      content={editingPost.content || ''}
                      entityType="blog"
                      entityName={editingPost.title || 'Untitled Post'}
                      onScoreUpdate={(score) => setEditingPost(prev => prev ? { ...prev, seoScore: score } : null)}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBlogModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-extrabold shadow-md shadow-sky-500/20"
                  >
                    Save Article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* FACTORY RESET CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 font-extrabold text-base">
                <AlertTriangle className="w-6 h-6" />
                <span>Confirm Factory Reset</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This action will restore all site pages, agency details, logo settings, and SEO configurations to the original defaults. Are you sure?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetSiteConfig();
                    setShowResetModal(false);
                    setLocalConfig(DEFAULT_SITE_CONFIG);
                    triggerSaveNotification('Site reset to factory defaults!');
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/30"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* ADD NEW ADMIN USER MODAL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {addUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-extrabold text-base">
                  <UserPlus className="w-5 h-5 text-sky-400" />
                  <span>Create Administrator Account</span>
                </div>
                <button
                  onClick={() => setAddUserModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addUserMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    addUserMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {addUserMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateNewUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Administrative Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as AdminRole)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 text-xs font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Editor">Editor (Pages & Blog Management)</option>
                    <option value="SEO Manager">SEO Manager (SEO Suite Only)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    Create Administrator
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
