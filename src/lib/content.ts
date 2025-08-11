import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import type { Post, CaseStudy, PostMetadata } from '@/types';

// Content directories
const CONTENT_DIR = path.join(process.cwd(), 'content');
const POSTS_DIR = path.join(CONTENT_DIR, 'blog');
const CASE_STUDIES_DIR = path.join(CONTENT_DIR, 'case-studies');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');

// Markdown processor configuration
const processor = remark()
  .use(remarkGfm) // GitHub Flavored Markdown
  .use(remarkHtml, { sanitize: false }); // Allow HTML for rich content

/**
 * Ensures content directories exist
 */
function ensureContentDirectories(): void {
  const directories = [CONTENT_DIR, POSTS_DIR, CASE_STUDIES_DIR, PAGES_DIR];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created content directory: ${dir}`);
    }
  });
}

/**
 * Get all markdown files from a directory
 */
function getMarkdownFiles(directory: string): string[] {
  try {
    if (!fs.existsSync(directory)) {
      return [];
    }
    
    return fs.readdirSync(directory)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

/**
 * Calculate reading time for content
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Process markdown content
 */
async function processMarkdown(content: string): Promise<string> {
  const result = await processor.process(content);
  return result.toString();
}

/**
 * Parse frontmatter and content from markdown file
 */
async function parseMarkdownFile(filePath: string): Promise<{
  metadata: PostMetadata;
  content: string;
  slug: string;
} | null> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Generate slug from filename
    const slug = path.basename(filePath, path.extname(filePath));
    
    // Process markdown to HTML
    const processedContent = await processMarkdown(content);
    
    // Validate required metadata
    if (!data.title || !data.date) {
      console.warn(`Missing required metadata in ${filePath}`);
      return null;
    }
    
    const metadata: PostMetadata = {
      title: data.title,
      description: data.description || '',
      date: data.date,
      author: data.author || 'Richard Mosley',
      tags: Array.isArray(data.tags) ? data.tags : [],
      featured: data.featured || false,
      seo: {
        meta_title: data.seo?.meta_title || data.title,
        meta_description: data.seo?.meta_description || data.description,
        canonical_url: data.seo?.canonical_url,
      },
    };
    
    return {
      metadata,
      content: processedContent,
      slug,
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all blog posts
 */
export async function getAllPosts(): Promise<Post[]> {
  ensureContentDirectories();
  
  const files = getMarkdownFiles(POSTS_DIR);
  const posts: Post[] = [];
  
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const parsed = await parseMarkdownFile(filePath);
    
    if (parsed) {
      const post: Post = {
        ...parsed.metadata,
        slug: parsed.slug,
        content: parsed.content,
        readingTime: calculateReadingTime(parsed.content),
      };
      
      posts.push(post);
    }
  }
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a specific blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const parsed = await parseMarkdownFile(filePath);
  
  if (!parsed) {
    return null;
  }
  
  return {
    ...parsed.metadata,
    slug: parsed.slug,
    content: parsed.content,
    readingTime: calculateReadingTime(parsed.content),
  };
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(limit: number = 3): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.featured).slice(0, limit);
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.tags.some(postTag => 
      postTag.toLowerCase() === tag.toLowerCase()
    )
  );
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

/**
 * Get all case studies
 */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  ensureContentDirectories();
  
  const files = getMarkdownFiles(CASE_STUDIES_DIR);
  const caseStudies: CaseStudy[] = [];
  
  for (const file of files) {
    const filePath = path.join(CASE_STUDIES_DIR, file);
    const parsed = await parseMarkdownFile(filePath);
    
    if (parsed) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      const caseStudy: CaseStudy = {
        ...parsed.metadata,
        slug: parsed.slug,
        content: parsed.content,
        client: data.client || '',
        industry: data.industry || '',
        challenge: data.challenge || '',
        solution: data.solution || '',
        results: Array.isArray(data.results) ? data.results : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        timeline: data.timeline || '',
      };
      
      caseStudies.push(caseStudy);
    }
  }
  
  // Sort case studies by date (newest first)
  return caseStudies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a specific case study by slug
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const filePath = path.join(CASE_STUDIES_DIR, `${slug}.md`);
  
  if (!fs.existsExists(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  const parsed = await parseMarkdownFile(filePath);
  
  if (!parsed) {
    return null;
  }
  
  return {
    ...parsed.metadata,
    slug: parsed.slug,
    content: parsed.content,
    client: data.client || '',
    industry: data.industry || '',
    challenge: data.challenge || '',
    solution: data.solution || '',
    results: Array.isArray(data.results) ? data.results : [],
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    timeline: data.timeline || '',
  };
}

/**
 * Get featured case studies
 */
export async function getFeaturedCaseStudies(limit: number = 3): Promise<CaseStudy[]> {
  const allCaseStudies = await getAllCaseStudies();
  return allCaseStudies.filter(caseStudy => caseStudy.featured).slice(0, limit);
}

/**
 * Get page content by slug
 */
export async function getPageBySlug(slug: string): Promise<{
  metadata: PostMetadata;
  content: string;
} | null> {
  const filePath = path.join(PAGES_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const parsed = await parseMarkdownFile(filePath);
  
  if (!parsed) {
    return null;
  }
  
  return {
    metadata: parsed.metadata,
    content: parsed.content,
  };
}

/**
 * Search content across posts and case studies
 */
export async function searchContent(
  query: string,
  includeContent: boolean = true
): Promise<{
  posts: Post[];
  caseStudies: CaseStudy[];
}> {
  const [allPosts, allCaseStudies] = await Promise.all([
    getAllPosts(),
    getAllCaseStudies(),
  ]);
  
  const normalizedQuery = query.toLowerCase();
  
  const matchesQuery = (item: Post | CaseStudy): boolean => {
    const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = item.description.toLowerCase().includes(normalizedQuery);
    const tagMatch = item.tags.some(tag => 
      tag.toLowerCase().includes(normalizedQuery)
    );
    
    if (!includeContent) {
      return titleMatch || descriptionMatch || tagMatch;
    }
    
    const contentMatch = item.content.toLowerCase().includes(normalizedQuery);
    return titleMatch || descriptionMatch || tagMatch || contentMatch;
  };
  
  return {
    posts: allPosts.filter(matchesQuery),
    caseStudies: allCaseStudies.filter(matchesQuery),
  };
}

/**
 * Generate RSS feed data
 */
export async function generateRSSData(): Promise<{
  posts: Post[];
  lastModified: string;
}> {
  const posts = await getAllPosts();
  const lastModified = posts.length > 0 
    ? new Date(posts[0].date).toISOString()
    : new Date().toISOString();
  
  return {
    posts: posts.slice(0, 20), // Latest 20 posts
    lastModified,
  };
}

/**
 * Generate sitemap data
 */
export async function generateSitemapData(): Promise<{
  posts: string[];
  caseStudies: string[];
  lastModified: string;
}> {
  const [posts, caseStudies] = await Promise.all([
    getAllPosts(),
    getAllCaseStudies(),
  ]);
  
  const lastModified = new Date().toISOString();
  
  return {
    posts: posts.map(post => post.slug),
    caseStudies: caseStudies.map(cs => cs.slug),
    lastModified,
  };
}

/**
 * Create sample content for development
 */
export async function createSampleContent(): Promise<void> {
  ensureContentDirectories();
  
  // Sample blog post
  const samplePost = `---
title: "Getting Started with Cloud Architecture"
description: "A comprehensive guide to modern cloud architecture principles and best practices."
date: "2024-01-15"
author: "Richard Mosley"
tags: ["cloud-architecture", "aws", "azure", "best-practices"]
featured: true
seo:
  meta_title: "Cloud Architecture Guide - BorderlessBits"
  meta_description: "Learn cloud architecture fundamentals and best practices from expert consultant Richard Mosley."
---

# Getting Started with Cloud Architecture

Cloud architecture forms the backbone of modern digital transformation. In this guide, we'll explore the fundamental principles and best practices that every organization should consider when designing their cloud infrastructure.

## Key Principles

### 1. Scalability by Design
Your cloud architecture should be designed to scale both horizontally and vertically based on demand.

### 2. Security First
Implement security measures at every layer, from network to application level.

### 3. Cost Optimization
Design for cost efficiency while maintaining performance and reliability.

## Best Practices

- Use managed services where possible
- Implement proper monitoring and alerting
- Design for failure and recovery
- Automate everything you can

## Conclusion

Cloud architecture is a journey, not a destination. Start with solid principles and iterate based on your specific needs and constraints.
`;

  // Sample case study
  const sampleCaseStudy = `---
title: "Healthcare Platform Modernization"
description: "Complete modernization of legacy healthcare platform achieving 99.9% uptime and HIPAA compliance."
date: "2024-01-10"
author: "Richard Mosley"
tags: ["healthcare", "modernization", "hipaa", "compliance"]
featured: true
client: "Regional Healthcare Network"
industry: "Healthcare"
challenge: "Legacy system with poor performance and compliance gaps"
solution: "Cloud-native architecture with microservices"
timeline: "6 months"
technologies: ["AWS", "Docker", "Kubernetes", "Node.js", "PostgreSQL"]
results:
  - metric: "Uptime Improvement"
    value: "99.9%"
  - metric: "Performance Gain"
    value: "300%"
  - metric: "Cost Reduction"
    value: "40%"
seo:
  meta_title: "Healthcare Platform Case Study - BorderlessBits"
  meta_description: "Learn how we modernized a healthcare platform achieving 99.9% uptime and HIPAA compliance."
---

# Healthcare Platform Modernization Case Study

Our client, a regional healthcare network, was struggling with a legacy system that couldn't meet modern performance and compliance requirements.

## The Challenge

The existing platform had several critical issues:
- Frequent downtime affecting patient care
- HIPAA compliance gaps
- Poor scalability during peak usage
- High maintenance costs

## Our Solution

We designed and implemented a cloud-native architecture featuring:
- Microservices architecture for better scalability
- Automated compliance monitoring
- Real-time backup and disaster recovery
- Performance optimization at all levels

## Results

The modernized platform delivered exceptional results:
- 99.9% uptime achievement
- 300% performance improvement
- 40% cost reduction
- Full HIPAA compliance

## Technologies Used

- **Cloud Platform**: AWS
- **Containerization**: Docker & Kubernetes
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with read replicas
- **Monitoring**: CloudWatch and custom dashboards

This project demonstrates our expertise in healthcare technology modernization and regulatory compliance.
`;

  // Write sample files
  const postPath = path.join(POSTS_DIR, 'getting-started-with-cloud-architecture.md');
  const caseStudyPath = path.join(CASE_STUDIES_DIR, 'healthcare-platform-modernization.md');
  
  if (!fs.existsSync(postPath)) {
    fs.writeFileSync(postPath, samplePost);
    console.log('Created sample blog post');
  }
  
  if (!fs.existsSync(caseStudyPath)) {
    fs.writeFileSync(caseStudyPath, sampleCaseStudy);
    console.log('Created sample case study');
  }
}

// Helper function to fix typo in getCaseStudyBySlug
function existsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}