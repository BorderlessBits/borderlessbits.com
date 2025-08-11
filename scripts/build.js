#!/usr/bin/env node

/**
 * Enhanced build script for BorderlessBits.com
 * Handles content generation, optimization, and deployment preparation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  contentDir: path.join(process.cwd(), 'content'),
  outputDir: path.join(process.cwd(), 'out'),
  publicDir: path.join(process.cwd(), 'public'),
  nodeEnv: process.env.NODE_ENV || 'development',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateSitemap: process.env.GENERATE_SITEMAP !== 'false',
};

/**
 * Log utility with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix =
    level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Execute shell command with error handling
 */
function exec(command, options = {}) {
  try {
    log(`Executing: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      ...options,
    });
    return result;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Ensure required directories exist
 */
function ensureDirectories() {
  log('Ensuring required directories exist...');

  const directories = [
    CONFIG.contentDir,
    path.join(CONFIG.contentDir, 'blog'),
    path.join(CONFIG.contentDir, 'case-studies'),
    path.join(CONFIG.contentDir, 'pages'),
    CONFIG.publicDir,
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });
}

/**
 * Create sample content files if none exist
 */
function createSampleContent() {
  log('Checking for content files...');

  const blogDir = path.join(CONFIG.contentDir, 'blog');
  const caseStudyDir = path.join(CONFIG.contentDir, 'case-studies');

  // Check if we need sample content
  const hasBlogPosts = fs.readdirSync(blogDir).some(file => file.endsWith('.md'));
  const hasCaseStudies = fs.readdirSync(caseStudyDir).some(file => file.endsWith('.md'));

  if (!hasBlogPosts) {
    log('Creating sample blog post...');
    const samplePost = `---
title: "Welcome to BorderlessBits"
description: "Introducing expert cloud architecture and healthcare software consulting services."
date: "${new Date().toISOString().split('T')[0]}"
author: "Richard Mosley"
tags: ["announcement", "cloud-architecture", "healthcare", "consulting"]
featured: true
seo:
  meta_title: "Welcome to BorderlessBits - Cloud Architecture Consulting"
  meta_description: "Expert cloud architecture and healthcare software consulting services for enterprise organizations."
---

# Welcome to BorderlessBits

We're excited to introduce BorderlessBits, your trusted partner for cloud architecture and healthcare software consulting.

## Our Expertise

- **Cloud Architecture**: Scalable, secure cloud infrastructures
- **Healthcare Software**: HIPAA-compliant applications and systems
- **Enterprise Consulting**: Strategic technology guidance

## Get Started

Ready to transform your technology infrastructure? [Contact us today](/contact/) to discuss your project requirements.
`;

    fs.writeFileSync(path.join(blogDir, 'welcome-to-borderlessbits.md'), samplePost);
  }

  if (!hasCaseStudies) {
    log('Creating sample case study...');
    const sampleCaseStudy = `---
title: "Enterprise Cloud Migration Success"
description: "Complete cloud migration for a Fortune 500 company, achieving 99.9% uptime and 40% cost reduction."
date: "${new Date().toISOString().split('T')[0]}"
author: "Richard Mosley"
tags: ["cloud-migration", "aws", "enterprise", "success-story"]
featured: true
client: "Fortune 500 Technology Company"
industry: "Technology"
challenge: "Legacy infrastructure limiting scalability and increasing costs"
solution: "Comprehensive cloud migration to AWS with microservices architecture"
timeline: "6 months"
technologies: ["AWS", "Docker", "Kubernetes", "Terraform", "PostgreSQL"]
results:
  - metric: "Uptime Improvement"
    value: "99.9%"
  - metric: "Cost Reduction" 
    value: "40%"
  - metric: "Deployment Speed"
    value: "10x faster"
seo:
  meta_title: "Enterprise Cloud Migration Case Study - BorderlessBits"
  meta_description: "Learn how we helped a Fortune 500 company achieve 99.9% uptime and 40% cost reduction through strategic cloud migration."
---

# Enterprise Cloud Migration Success Story

Our client, a Fortune 500 technology company, was struggling with legacy infrastructure that limited their ability to scale and innovate.

## The Challenge

- Aging on-premises infrastructure
- High maintenance costs
- Limited scalability during peak periods
- Deployment bottlenecks affecting time-to-market

## Our Solution

We designed and implemented a comprehensive cloud migration strategy:

1. **Infrastructure Assessment**: Comprehensive analysis of existing systems
2. **Migration Planning**: Phased approach to minimize business disruption
3. **Cloud Architecture**: Scalable, fault-tolerant AWS infrastructure
4. **Automation**: CI/CD pipelines and Infrastructure as Code

## Results Achieved

The migration delivered exceptional results:

- **99.9% uptime** with improved disaster recovery
- **40% cost reduction** through optimized resource allocation
- **10x faster deployments** with automated pipelines
- **Enhanced security** with cloud-native security controls

## Technologies Used

- **Cloud Platform**: Amazon Web Services (AWS)
- **Containerization**: Docker and Kubernetes
- **Infrastructure**: Terraform for Infrastructure as Code
- **Database**: Managed PostgreSQL with automated backups
- **Monitoring**: CloudWatch with custom dashboards

This project demonstrates our expertise in large-scale cloud migrations and our commitment to delivering measurable business value.
`;

    fs.writeFileSync(path.join(caseStudyDir, 'enterprise-cloud-migration.md'), sampleCaseStudy);
  }
}

/**
 * Generate robots.txt file
 */
function generateRobotsTxt() {
  log('Generating robots.txt...');

  const robotsTxt = `User-agent: *
${CONFIG.nodeEnv === 'production' ? 'Allow: /' : 'Disallow: /'}

Sitemap: ${CONFIG.siteUrl}/sitemap.xml
`;

  fs.writeFileSync(path.join(CONFIG.publicDir, 'robots.txt'), robotsTxt);
  log('Generated robots.txt');
}

/**
 * Generate sitemap.xml file
 */
function generateSitemap() {
  if (!CONFIG.generateSitemap) {
    log('Sitemap generation disabled, skipping...');
    return;
  }

  log('Generating sitemap.xml...');

  // Basic pages
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/contact/', priority: '0.9', changefreq: 'monthly' },
    { url: '/services/', priority: '0.8', changefreq: 'monthly' },
    { url: '/about/', priority: '0.7', changefreq: 'monthly' },
  ];

  // Add blog posts and case studies if they exist
  try {
    const blogDir = path.join(CONFIG.contentDir, 'blog');
    if (fs.existsSync(blogDir)) {
      const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
      blogFiles.forEach(file => {
        const slug = path.basename(file, '.md');
        pages.push({
          url: `/blog/${slug}/`,
          priority: '0.6',
          changefreq: 'monthly',
        });
      });
    }

    const caseStudyDir = path.join(CONFIG.contentDir, 'case-studies');
    if (fs.existsSync(caseStudyDir)) {
      const caseStudyFiles = fs.readdirSync(caseStudyDir).filter(file => file.endsWith('.md'));
      caseStudyFiles.forEach(file => {
        const slug = path.basename(file, '.md');
        pages.push({
          url: `/case-studies/${slug}/`,
          priority: '0.7',
          changefreq: 'monthly',
        });
      });
    }
  } catch (error) {
    log(`Error reading content directories: ${error.message}`, 'warn');
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    page => `  <url>
    <loc>${CONFIG.siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(CONFIG.publicDir, 'sitemap.xml'), sitemap);
  log(`Generated sitemap.xml with ${pages.length} pages`);
}

/**
 * Check for required environment variables
 */
function checkEnvironment() {
  log('Checking environment configuration...');

  const requiredVars = ['NEXT_PUBLIC_SITE_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    log(`Missing required environment variables: ${missingVars.join(', ')}`, 'warn');
    log('Using default values for missing variables', 'warn');
  }

  // Optional variables - log warnings if missing in production
  if (CONFIG.nodeEnv === 'production') {
    const optionalVars = [
      'NEXT_PUBLIC_GA_ID',
      'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
      'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
      'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
    ];

    const missingOptional = optionalVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
      log(`Missing optional environment variables: ${missingOptional.join(', ')}`, 'warn');
      log('Some features may not work correctly without these variables', 'warn');
    }
  }
}

/**
 * Run the build process
 */
function runBuild() {
  log('Running Next.js build...');

  // Run the Next.js build directly to avoid circular reference
  exec('npx next build');

  log('Build completed successfully!', 'success');
}

/**
 * Post-build optimization and validation
 */
function postBuildOptimization() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    log('Output directory not found, skipping post-build optimization', 'warn');
    return;
  }

  log('Running post-build optimization...');

  // Add .nojekyll for GitHub Pages
  fs.writeFileSync(path.join(CONFIG.outputDir, '.nojekyll'), '');
  log('Added .nojekyll file');

  // Add CNAME for custom domain (production only)
  if (CONFIG.nodeEnv === 'production' && CONFIG.siteUrl.includes('borderlessbits.com')) {
    fs.writeFileSync(path.join(CONFIG.outputDir, 'CNAME'), 'borderlessbits.com');
    log('Added CNAME file');
  }

  // Validate critical files exist
  const criticalFiles = ['index.html', '_next/static', 'contact/index.html'];

  const missingFiles = criticalFiles.filter(
    file => !fs.existsSync(path.join(CONFIG.outputDir, file))
  );

  if (missingFiles.length > 0) {
    log(`Missing critical files: ${missingFiles.join(', ')}`, 'error');
    process.exit(1);
  }

  // Log build statistics
  const outputStats = fs.statSync(CONFIG.outputDir);
  log(`Build output ready in: ${CONFIG.outputDir}`, 'success');

  // Count files in output
  try {
    exec(`find "${CONFIG.outputDir}" -type f | wc -l`, { stdio: 'pipe' });
  } catch (error) {
    // Fallback for systems without find command
    log('Build completed successfully', 'success');
  }
}

/**
 * Main build function
 */
function main() {
  log('Starting BorderlessBits.com build process...');

  try {
    checkEnvironment();
    ensureDirectories();
    createSampleContent();
    generateRobotsTxt();
    generateSitemap();
    runBuild();
    postBuildOptimization();

    log('Build process completed successfully! 🎉', 'success');
    log(`Output directory: ${CONFIG.outputDir}`, 'success');
    log(`Site URL: ${CONFIG.siteUrl}`, 'success');
  } catch (error) {
    log(`Build process failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  CONFIG,
  log,
  exec,
};
