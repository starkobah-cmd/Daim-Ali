import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Image as ImageIcon, 
  Globe, Search, Code, BookOpen, Layers, Save, Send, ChevronDown, ChevronUp,
  Tag, FileText, ExternalLink, Smartphone, Monitor, Check
} from 'lucide-react';
import { BlogPost } from '../types';
import { analyzeSeo } from '../utils/seoAnalyzer';
import { MediaPickerField } from './MediaPickerField';

interface BlogEditorStudioProps {
  post: Partial<BlogPost>;
  onSave: (post: Partial<BlogPost>, shouldPublish?: boolean) => void;
  onClose: () => void;
  categories: string[];
}

export function BlogEditorStudio({ post, onSave, onClose, categories }: BlogEditorStudioProps, blogEditorTabProp?: string) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    category: 'Web Development',
    status: 'draft',
    content: '',
    excerpt: '',
    featuredImage: '',
    focusKeyword: '',
    secondaryKeywords: '',
    seoTitle: '',
    metaDescription: '',
    customSchema: '',
    ...post
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content');
  const [seoAccordionOpen, setSeoAccordionOpen] = useState({
    snippet: true,
    meta: true,
    checklist: true,
    schema: false
  });

  // Real-time SEO analysis
  const seo = useMemo(() => {
    return analyzeSeo({
      focusKeyword: formData.focusKeyword || '',
      seoTitle: formData.seoTitle || formData.title || '',
      metaDescription: formData.metaDescription || formData.excerpt || '',
      slug: formData.slug || '',
      content: formData.content || '',
      ogImage: formData.ogImage || formData.featuredImage || ''
    });
  }, [formData.focusKeyword, formData.seoTitle, formData.title, formData.metaDescription, formData.excerpt, formData.slug, formData.content, formData.ogImage, formData.featuredImage]);

  // Default Schema.org BlogPosting JSON-LD if empty
  const defaultSchema = useMemo(() => {
    if (formData.customSchema) return formData.customSchema;
    const title = formData.title || 'Blog Article';
    const desc = formData.excerpt || formData.metaDescription || '';
    const date = formData.date || new Date().toISOString().split('T')[0];
    const image = formData.featuredImage || 'https://netronomic.com/og-image.png';
    const slug = formData.slug || 'article-slug';
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": desc,
      "image": image,
      "datePublished": date,
      "author": {
        "@type": "Person",
        "name": "Daim Ali"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Netronomic",
        "logo": {
          "@type": "ImageObject",
          "url": "https://netronomic.com/og-image.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://netronomic.com/blog/${slug}`
      }
    }, null, 2);
  }, [formData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: prev.slug || slugified,
      seoTitle: prev.seoTitle || val
    }));
  };

  const handleSave = (status: 'draft' | 'published') => {
    onSave({
      ...formData,
      status,
      date: formData.date || new Date().toISOString().split('T')[0],
      customSchema: formData.customSchema || defaultSchema
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 overflow-hidden">
      {/* 1. TOP STICKY ACTION BAR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CMS</span>
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white">Netronomic Gutenberg Studio</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
              formData.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {formData.status || 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* SEO Score Pill */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-400 font-semibold">SEO Score:</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
              seo.score >= 81 ? 'bg-emerald-500/20 text-emerald-400' : seo.score >= 51 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {seo.score}/100
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave('published')}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Article</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2-COLUMN MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: 70% WIDTH - DEEP WRITING CANVAS */}
        <main className="flex-1 lg:w-[70%] overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-950 border-r border-slate-800/80">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Article Title..."
                value={formData.title || ''}
                onChange={handleTitleChange}
                className="w-full bg-transparent text-3xl sm:text-4xl lg:text-5xl font-black text-white placeholder-slate-600 focus:outline-none tracking-tight"
              />
            </div>

            {/* Meta Row: Slug, Category, Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category || 'Web Development'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-bold"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <MediaPickerField
                  label="Featured Cover Image"
                  value={formData.featuredImage || ''}
                  onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                  category="blog"
                  helperText="Choose or upload cover image for blog listing and OpenGraph sharing."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Article Excerpt / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary or hook for blog cards..."
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Unified Rich Writing Canvas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Deep Writing Canvas (Markdown & Rich Text)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{seo.wordCount} words</span>
                  <span>•</span>
                  <span>{Math.ceil(seo.wordCount / 200)} min read</span>
                </div>
              </div>

              <textarea
                rows={22}
                placeholder="Write your article content here in markdown (supports ## Headings, **bold**, lists, links, paragraphs)..."
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-sky-500 font-sans resize-y shadow-inner"
              />
              <p className="text-[11px] text-slate-500">
                Tip: Use <code className="text-sky-400">## Heading 2</code> or <code className="text-sky-400">### Heading 3</code> for subheadings. Include your focus keyword in subheadings and add a Table of Contents list for top SEO rankings.
              </p>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: 30% STICKY SIDEBAR (RANKMATH STYLE SUITE) */}
        <aside className="w-full lg:w-[30%] bg-slate-900 border-l border-slate-800 overflow-y-auto p-4 space-y-4 shrink-0">
          {/* ACCORDION #1: LIVE SEARCH SNIPPET PREVIEW */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSeoAccordionOpen(p => ({ ...p, snippet: !p.snippet }))}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Google SERP Preview</span>
              </div>
              {seoAccordionOpen.snippet ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {seoAccordionOpen.snippet && (
              <div className="p-4 pt-0 space-y-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Preview Mode</span>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewDevice === 'desktop' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewDevice === 'mobile' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-sans">
                  <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1">
                    <span>netronomic.com</span>
                    <span>›</span>
                    <span>blog</span>
                    <span>›</span>
                    <span className="text-slate-400">{formData.slug || 'article-slug'}</span>
                  </div>
                  <div className="text-sm font-bold text-sky-400 hover:underline cursor-pointer line-clamp-1">
                    {formData.seoTitle || formData.title || 'Enter your SEO Title...'}
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {formData.metaDescription || formData.excerpt || 'Enter meta description summary for search engine results page...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION #2: META PARAMETERS */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSeoAccordionOpen(p => ({ ...p, meta: !p.meta }))}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                <span>SEO Meta Parameters</span>
              </div>
              {seoAccordionOpen.meta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {seoAccordionOpen.meta && (
              <div className="p-4 pt-0 space-y-3 border-t border-slate-800/80 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. web development agency"
                    value={formData.focusKeyword || ''}
                    onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Secondary Keywords</label>
                  <input
                    type="text"
                    placeholder="comma separated keywords..."
                    value={formData.secondaryKeywords || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300">SEO Title</label>
                    <span className={`text-[10px] font-mono ${(formData.seoTitle || '').length >= 50 && (formData.seoTitle || '').length <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(formData.seoTitle || '').length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300">Meta Description</label>
                    <span className={`text-[10px] font-mono ${(formData.metaDescription || '').length >= 120 && (formData.metaDescription || '').length <= 160 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(formData.metaDescription || '').length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION #3: REAL-TIME ON-PAGE SEO CHECKLIST */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSeoAccordionOpen(p => ({ ...p, checklist: !p.checklist }))}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Netronomic SEO Audit ({seo.passedCount}/{seo.totalCount})</span>
              </div>
              {seoAccordionOpen.checklist ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {seoAccordionOpen.checklist && (
              <div className="p-4 pt-0 space-y-2 border-t border-slate-800/80 max-h-96 overflow-y-auto">
                {seo.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      chk.passed 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 font-bold">
                      <div className="flex items-center gap-1.5">
                        {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span>{chk.label}</span>
                      </div>
                      <span className="font-mono text-[10px] shrink-0 opacity-80">+{chk.earned}/{chk.points}pt</span>
                    </div>
                    <p className="text-[11px] opacity-90 pl-5">{chk.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACCORDION #4: SCHEMA.ORG JSON-LD EDITOR */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSeoAccordionOpen(p => ({ ...p, schema: !p.schema }))}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-white hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                <span>Schema.org JSON-LD</span>
              </div>
              {seoAccordionOpen.schema ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {seoAccordionOpen.schema && (
              <div className="p-4 pt-0 space-y-2 border-t border-slate-800/80 text-xs">
                <p className="text-[11px] text-slate-400">
                  Valid JSON-LD schema injected into page head for Rich Snippets.
                </p>
                <textarea
                  rows={8}
                  value={formData.customSchema || defaultSchema}
                  onChange={(e) => setFormData({ ...formData, customSchema: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
