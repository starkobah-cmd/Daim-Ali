import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  MessageSquare,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  List,
  Code2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BlogPost, BlogComment } from '../types';

interface SingleBlogProps {
  post: BlogPost;
  allPosts: BlogPost[];
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onAddComment: (postId: string, comment: BlogComment) => void;
}

export const SingleBlog: React.FC<SingleBlogProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
  onAddComment
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // Dynamic SEO meta updates in document head
  useEffect(() => {
    const originalTitle = document.title;
    document.title = post.seoTitle || `${post.title} | Netronomic Web`;

    // Inject Schema.org Article JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-article-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      image: [post.featuredImage],
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author.name
      },
      publisher: {
        '@type': 'Organization',
        name: 'Netronomic Web',
        logo: {
          '@type': 'ImageObject',
          url: 'https://netronomicweb.com/logo.png'
        }
      },
      description: post.metaDescription || post.excerpt
    });
    document.head.appendChild(script);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      const existingScript = document.getElementById('schema-article-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [post]);

  // Extract headings for Table of Contents
  const tableOfContents = useMemo(() => {
    const lines = post.content.split('\n');
    const headings: { id: string; text: string; level: number }[] = [];
    lines.forEach((line) => {
      if (line.startsWith('# ')) {
        const text = line.replace('# ', '').trim();
        headings.push({ id: text.toLowerCase().replace(/[^\w]+/g, '-'), text, level: 1 });
      } else if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        headings.push({ id: text.toLowerCase().replace(/[^\w]+/g, '-'), text, level: 2 });
      } else if (line.startsWith('### ')) {
        const text = line.replace('### ', '').trim();
        headings.push({ id: text.toLowerCase().replace(/[^\w]+/g, '-'), text, level: 3 });
      }
    });
    return headings;
  }, [post.content]);

  // Previous and Next Post navigation
  const publishedPosts = useMemo(() => allPosts.filter(p => p.status === 'published'), [allPosts]);
  const currentIndex = publishedPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;

  // Related posts by category
  const relatedPosts = useMemo(() => {
    return publishedPosts
      .filter(p => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [publishedPosts, post]);

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook' | 'copy') => {
    const url = window.location.href;
    const title = post.title;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentName.trim() && commentText.trim()) {
      const newComment: BlogComment = {
        id: `c-${Date.now()}`,
        author: commentName.trim(),
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
        date: new Date().toISOString().split('T')[0],
        content: commentText.trim()
      };
      onAddComment(post.id, newComment);
      setCommentName('');
      setCommentText('');
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 3000);
    }
  };

  // Helper to render markdown blocks cleanly
  const renderContentBlocks = (content: string) => {
    const blocks = content.split('\n\n');
    let codeBlockCount = 0;

    return blocks.map((block, i) => {
      const trimmed = block.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace('# ', '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return (
          <h1 key={i} id={id} className="text-3xl sm:text-4xl font-black text-white mt-8 mb-4 tracking-tight scroll-mt-28">
            {text}
          </h1>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return (
          <h2 key={i} id={id} className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight border-b border-slate-800 pb-2 scroll-mt-28">
            {text}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return (
          <h3 key={i} id={id} className="text-xl font-bold text-sky-300 mt-6 mb-3 scroll-mt-28">
            {text}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace('> ', '').replace(/"/g, '');
        return (
          <blockquote key={i} className="my-6 p-6 rounded-2xl bg-gradient-to-r from-sky-950/80 to-slate-900 border-l-4 border-sky-400 text-sky-100 italic font-medium shadow-md">
            "{quoteText}"
          </blockquote>
        );
      }

      // Code block ```
      if (trimmed.startsWith('```')) {
        const currentCodeIdx = codeBlockCount++;
        const lines = trimmed.split('\n');
        const lang = lines[0].replace('```', '') || 'code';
        const codeCode = lines.slice(1, lines.length - 1).join('\n');

        return (
          <div key={i} className="my-6 rounded-2xl bg-[#050816] border border-slate-800 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>{lang}</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeCode);
                  setCopiedCodeIdx(currentCodeIdx);
                  setTimeout(() => setCopiedCodeIdx(null), 2000);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedCodeIdx === currentCodeIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-sky-200/90 overflow-x-auto leading-relaxed">
              <code>{codeCode}</code>
            </pre>
          </div>
        );
      }

      // Horizontal rule ---
      if (trimmed === '---') {
        return <hr key={i} className="my-8 border-slate-800" />;
      }

      // Unordered list
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').map(item => item.replace(/^[*|-]\s+/, ''));
        return (
          <ul key={i} className="my-4 space-y-2 list-none">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm sm:text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Standard paragraph
      return (
        <p key={i} className="text-slate-300 text-base sm:text-lg leading-relaxed my-4 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="pt-24 pb-20 bg-[#050816] text-white min-h-screen relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-sky-600/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb Navigation & Back Button */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Back to All Articles</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span>Blog</span>
            <span>/</span>
            <span className="text-sky-400 font-semibold">{post.category}</span>
          </div>
        </div>

        {/* Post Category & Reading Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {post.readingTime}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              {post.publishedAt}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Card */}
          <div className="pt-4 flex items-center justify-between border-t border-b border-slate-800/80 py-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-400/40 shadow-md"
              />
              <div>
                <p className="text-sm font-bold text-white">{post.author.name}</p>
                <p className="text-xs text-sky-400 font-medium">{post.author.role}</p>
              </div>
            </div>

            {/* Social Share Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors cursor-pointer"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors cursor-pointer"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors cursor-pointer relative"
                title="Copy Article Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-10 rounded-3xl overflow-hidden border border-sky-500/20 shadow-2xl aspect-video w-full relative">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Table of Contents Box */}
        {tableOfContents.length > 0 && (
          <div className="mb-10 rounded-2xl bg-[#0B1120] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-3">
              <List className="w-4 h-4" />
              <span>Table of Contents</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {tableOfContents.map((head, idx) => (
                <li key={idx} style={{ paddingLeft: `${(head.level - 1) * 12}px` }}>
                  <a
                    href={`#${head.id}`}
                    className="text-slate-300 hover:text-sky-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-sky-500 font-mono text-[11px]">•</span>
                    <span>{head.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Content */}
        <article className="prose prose-invert max-w-none mb-16">
          {renderContentBlocks(post.content)}
        </article>

        {/* Article Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-12 pb-8 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Previous / Next Article Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {prevPost ? (
            <button
              onClick={() => onSelectPost(prevPost.slug)}
              className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 hover:border-sky-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <ChevronLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Previous Post</span>
              </div>
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                {prevPost.title}
              </p>
            </button>
          ) : <div />}

          {nextPost ? (
            <button
              onClick={() => onSelectPost(nextPost.slug)}
              className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 hover:border-sky-500/40 text-right transition-all group cursor-pointer ml-auto w-full"
            >
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Next Post</span>
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                {nextPost.title}
              </p>
            </button>
          ) : <div />}
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>Related Articles in {post.category}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectPost(rel.slug)}
                  className="bg-[#0B1120] border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 cursor-pointer group transition-all"
                >
                  <img
                    src={rel.featuredImage}
                    alt={rel.title}
                    className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-2">{rel.publishedAt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Comments Section */}
        <div className="rounded-3xl bg-[#0B1120] border border-slate-800/80 p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <span>Discussion ({post.comments?.length || 0})</span>
          </h3>

          {/* Comment List */}
          <div className="space-y-4 mb-8">
            {(!post.comments || post.comments.length === 0) ? (
              <p className="text-xs text-slate-400 italic">Be the first to share your thoughts on this article!</p>
            ) : (
              post.comments.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover border border-sky-400/30" />
                      <div>
                        <p className="text-xs font-bold text-white">{c.author}</p>
                        <p className="text-[10px] text-slate-400">{c.date}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Leave a comment form */}
          <form onSubmit={handlePostComment} className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white">Leave a Comment</h4>

            {commentSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                ✓ Your comment has been published!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your Name / Organization"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your perspective or ask a question..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Comment</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
