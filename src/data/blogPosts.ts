import { Buffer } from 'buffer';
import matter from 'gray-matter';

// Make Buffer available globally for gray-matter
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  slug: string;
}

// Import all markdown files from content/blog
const modules = import.meta.glob('/content/blog/*.md', { 
  eager: true, 
  query: '?raw',
  import: 'default'
});

// Parse markdown files and create blog posts
export const blogPosts: BlogPost[] = Object.entries(modules).map(([filepath, content]) => {
  const filename = filepath.split('/').pop() || '';
  const slug = filename.replace('.md', '');
  
  // Parse frontmatter and content
  const { data, content: markdownContent } = matter(content as string);
  
  // Format date
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    id: slug,
    slug,
    title: data.title || 'Untitled',
    date: formattedDate,
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    content: markdownContent
  };
}).sort((a, b) => {
  // Sort by date, newest first
  return new Date(b.date).getTime() - new Date(a.date).getTime();
});

export const getTags = (): string[] => {
  const tagSet = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

export const getPostsByTag = (tag: string): BlogPost[] => {
  return blogPosts.filter(post => post.tags.includes(tag));
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};
