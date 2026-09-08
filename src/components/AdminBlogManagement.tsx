import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  Globe,
  Sparkles,
  Save,
  X,
  Code2,
  HelpCircle,
  Calendar,
  User,
  LayoutGrid
} from 'lucide-react';
import { BlogPost, PostStatus } from '../types';
import { BLOG_CATEGORIES } from '../data/blogData';
import { MediaPickerField } from './MediaPickerField';

interface AdminBlogManagementProps {
  posts: BlogPost[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  onToggleStatus: (postId: string, status: PostStatus) => void;
  onExitAdmin: () => void;
  onOpenSitemap: () => void;
}

const FEATURED_IMAGE_PRESETS = [
  { label: 'Web Design', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'SEO Analytics', url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Video Production', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Brand Identity', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mobile Engineering', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80' }
];

export const AdminBlogManagement: React.FC<AdminBlogManagementProps> = ({
  posts,
  onSavePost,
  onDeletePost,
  onToggleStatus,
  onExitAdmin,
  onOpenSitemap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPublished = posts.filter(p => p.status === 'published').length;
  const totalDrafts = posts.filter(p => p.status === 'draft').length;
  const totalScheduled = posts.filter(p => p.status === 'scheduled').length;

  const handleCreateNew = () => {
    setEditingPost({
      id: `post-${Date.now()}`,
      title: '',
      slug: '',
      excerpt: '',
      content: `# New Article Title\n\nWrite your introduction here...\n\n## Key Section\n\n- Add bullet points\n- Highlight key metrics`,
      featuredImage: FEATURED_IMAGE_PRESETS[0].url,
      author: {
        name: 'Netronomic Editorial Team',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Content Strategist'
      },
      category: 'Web Development',
      tags: ['Growth', 'Technology'],
      publishedAt: new Date().toISOString().split('T')[0],
      readingTime: '5 min read',
      status: 'published',
      isFeatured: false,
      seoTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      comments: []
    });
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editingPost) return;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setEditingPost(prev => ({
      ...prev,
      title: val,
      slug: prev?.slug ? prev.slug : generatedSlug,
      seoTitle: prev?.seoTitle ? prev.seoTitle : `${val} | Skyline Agency`
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title || !editingPost.slug) return;

    const fullPost: BlogPost = {
      id: editingPost.id || `post-${Date.now()}`,
      title: editingPost.title || 'Untitled Post',
      slug: editingPost.slug || 'untitled-post',
      excerpt: editingPost.excerpt || '',
      content: editingPost.content || '',
      featuredImage: editingPost.featuredImage || FEATURED_IMAGE_PRESETS[0].url,
      author: editingPost.author || {
        name: 'Skyline Team',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Editor'
      },
      category: editingPost.category || 'Web Development',
      tags: editingPost.tags || [],
      publishedAt: editingPost.publishedAt || new Date().toISOString().split('T')[0],
      readingTime: editingPost.readingTime || '5 min read',
      status: editingPost.status || 'published',
      scheduledDate: editingPost.scheduledDate,
      isFeatured: editingPost.isFeatured || false,
      seoTitle: editingPost.seoTitle || `${editingPost.title} | Skyline Agency`,
      metaDescription: editingPost.metaDescription || editingPost.excerpt,
      canonicalUrl: editingPost.canonicalUrl || `https://skyline.agency/blog/${editingPost.slug}`,
      comments: editingPost.comments || []
    };

    onSavePost(fullPost);
    setIsModalOpen(false);
    setEditingPost(null);
  };

  return (
    <div className="pt-24 pb-20 bg-[#050816] text-white min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Portal Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>Blog Admin Portal</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-400/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  CMS v2.4
                </span>
              </h1>
              <p className="text-xs text-slate-400">Manage blog articles, SEO metadata, drafts, and XML sitemaps.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSitemap}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Sitemap.xml</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:scale-105 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Article</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Posts</p>
              <p className="text-2xl font-black text-white mt-1">{posts.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Published</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{totalPublished}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Drafts</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{totalDrafts}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Scheduled</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">{totalScheduled}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts by title or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-[#0B1120] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-4 px-6">Article Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white max-w-xs">
                      <div className="flex items-center gap-3">
                        <img src={p.featuredImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800" />
                        <div>
                          <p className="line-clamp-1">{p.title}</p>
                          <p className="text-[10px] text-sky-400 font-mono mt-0.5">/blog/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={p.status}
                          onChange={(e) => onToggleStatus(p.id, e.target.value as PostStatus)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                            p.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : p.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {p.publishedAt}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeletePost(p.id)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-800 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Blog Modal */}
        <AnimatePresence>
          {isModalOpen && editingPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0B1120] border border-sky-500/30 rounded-3xl p-6 sm:p-8 max-w-4xl w-full text-white shadow-[0_0_50px_rgba(56,189,248,0.2)] my-8 max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-sky-400" />
                    <span>{editingPost.id ? 'Edit Article' : 'Create New Article'}</span>
                  </h3>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'content'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Article Content & Editor
                  </button>

                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'seo'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    2. SEO Meta & OpenGraph
                  </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto space-y-5 pr-2">
                  {activeTab === 'content' && (
                    <>
                      {/* Title & Slug */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Article Title *</label>
                          <input
                            type="text"
                            required
                            value={editingPost.title || ''}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="e.g. 10 Web Design Secrets for 2026"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug *</label>
                          <input
                            type="text"
                            required
                            value={editingPost.slug || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                            placeholder="10-web-design-secrets-2026"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Category & Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                          <select
                            value={editingPost.category || 'Web Development'}
                            onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                          >
                            {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                          <select
                            value={editingPost.status || 'published'}
                            onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as PostStatus })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Reading Time</label>
                          <input
                            type="text"
                            value={editingPost.readingTime || '5 min read'}
                            onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* WordPress Style Featured Image Media Picker */}
                      <MediaPickerField
                        label="Featured Article Cover Image"
                        value={editingPost.featuredImage || ''}
                        onChange={(url) => setEditingPost({ ...editingPost, featuredImage: url })}
                        category="blog"
                        helperText="Select or upload a high-resolution cover photo for your blog post."
                      />

                      {/* Author Avatar Picker */}
                      <MediaPickerField
                        label="Author Avatar Image"
                        value={editingPost.author?.avatar || ''}
                        onChange={(url) =>
                          setEditingPost({
                            ...editingPost,
                            author: {
                              name: editingPost.author?.name || 'Netronomic Team',
                              role: editingPost.author?.role || 'Editor',
                              avatar: url
                            }
                          })
                        }
                        category="avatar"
                        helperText="Upload or choose author profile headshot."
                      />

                      {/* Excerpt */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Short Excerpt / Summary</label>
                        <textarea
                          rows={2}
                          value={editingPost.excerpt || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                          placeholder="Brief 2-line summary for post cards..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      {/* Rich Editor / Content Body */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-300">Article Content (Markdown Formatted)</label>
                          <span className="text-[10px] text-sky-400">Supports # H1, ## H2, &gt; Quotes, ``` code blocks</span>
                        </div>
                        <textarea
                          rows={10}
                          required
                          value={editingPost.content || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-200 focus:outline-none focus:border-sky-500 leading-relaxed"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'seo' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">SEO Title Tag</label>
                        <input
                          type="text"
                          value={editingPost.seoTitle || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, seoTitle: e.target.value })}
                          placeholder="Article Title | Skyline Digital Agency"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Meta Description</label>
                        <textarea
                          rows={3}
                          value={editingPost.metaDescription || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, metaDescription: e.target.value })}
                          placeholder="Optimal 150-160 character description for Google Search Snippet..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Canonical URL</label>
                        <input
                          type="text"
                          value={editingPost.canonicalUrl || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, canonicalUrl: e.target.value })}
                          placeholder="https://skyline.agency/blog/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      {/* SERP Preview snippet */}
                      <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Google SERP Snippet Preview:</p>
                        <p className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-1">
                          {editingPost.seoTitle || 'Article Title Preview'}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-mono">
                          {editingPost.canonicalUrl || 'https://skyline.agency/blog/...'}
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {editingPost.metaDescription || editingPost.excerpt || 'Meta description preview...'}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Submit buttons */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-extrabold shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Post</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
