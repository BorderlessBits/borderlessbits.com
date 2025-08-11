#!/usr/bin/env node

/**
 * Development server with enhanced features for BorderlessBits.com
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  contentDir: path.join(process.cwd(), 'content'),
  envFile: path.join(process.cwd(), '.env.local'),
  nodeEnv: 'development',
};

/**
 * Log utility with colors for better visibility
 */
function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',      // Cyan
    success: '\x1b[32m',   // Green
    warn: '\x1b[33m',      // Yellow
    error: '\x1b[31m',     // Red
    reset: '\x1b[0m'       // Reset
  };
  
  const color = colors[level] || colors.info;
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  
  console.log(`${color}${prefix} [${timestamp}] ${message}${colors.reset}`);
}

/**
 * Check if .env.local exists and create from example if not
 */
function checkEnvironmentFile() {
  const envExample = path.join(process.cwd(), '.env.local.example');
  
  if (!fs.existsSync(CONFIG.envFile) && fs.existsSync(envExample)) {
    log('Creating .env.local from example file...');
    fs.copyFileSync(envExample, CONFIG.envFile);
    log('Created .env.local - please update with your actual values', 'warn');
  } else if (!fs.existsSync(CONFIG.envFile)) {
    log('.env.local file not found. Creating minimal file...', 'warn');
    const minimalEnv = `# BorderlessBits.com Environment Variables
NEXT_PUBLIC_SITE_URL=http://localhost:${CONFIG.port}
NODE_ENV=development
DEBUG=true
`;
    fs.writeFileSync(CONFIG.envFile, minimalEnv);
    log('Created minimal .env.local file', 'success');
  }
}

/**
 * Ensure content directories exist with sample content
 */
function setupContentDirectories() {
  const directories = [
    path.join(CONFIG.contentDir, 'blog'),
    path.join(CONFIG.contentDir, 'case-studies'),
    path.join(CONFIG.contentDir, 'pages'),
  ];
  
  let contentCreated = false;
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created content directory: ${path.relative(process.cwd(), dir)}`);
      contentCreated = true;
    }
  });
  
  // Create sample content if directories were just created
  if (contentCreated) {
    createSampleContent();
  }
}

/**
 * Create sample content for development
 */
function createSampleContent() {
  log('Creating sample content for development...');
  
  const samplePost = `---
title: "Getting Started with Development"
description: "A guide to setting up the BorderlessBits.com development environment."
date: "${new Date().toISOString().split('T')[0]}"
author: "Richard Mosley"
tags: ["development", "setup", "guide"]
featured: true
seo:
  meta_title: "Development Setup Guide - BorderlessBits"
  meta_description: "Learn how to set up the BorderlessBits.com development environment."
---

# Development Setup Guide

Welcome to the BorderlessBits.com development environment!

## Quick Start

1. Install dependencies: \`npm install\`
2. Copy environment file: \`cp .env.local.example .env.local\`
3. Start development server: \`npm run dev\`

## Features

- Hot reloading for rapid development
- TypeScript support with strict type checking
- Tailwind CSS for styling
- Form processing with validation
- Content management with Markdown

## Next Steps

- Update your environment variables in \`.env.local\`
- Customize the content in the \`content/\` directory
- Test the contact form functionality
- Review the deployment configuration

Happy coding! 🚀
`;

  const sampleCaseStudy = `---
title: "Sample Project Implementation"
description: "A demonstration case study showing the project structure and capabilities."
date: "${new Date().toISOString().split('T')[0]}"
author: "Richard Mosley"
tags: ["sample", "demonstration", "architecture"]
featured: true
client: "Sample Client"
industry: "Technology"
challenge: "Modernize legacy systems and improve performance"
solution: "Cloud-native architecture with modern development practices"
timeline: "3 months"
technologies: ["Next.js", "TypeScript", "Tailwind CSS", "EmailJS", "GitHub Actions"]
results:
  - metric: "Performance Improvement"
    value: "300%"
  - metric: "Development Speed"
    value: "5x faster"
  - metric: "Cost Reduction"
    value: "Zero hosting costs"
seo:
  meta_title: "Sample Project Case Study - BorderlessBits"
  meta_description: "Demonstration of modern web development practices and zero-cost hosting architecture."
---

# Sample Project Implementation

This case study demonstrates the modern development practices and architecture used in the BorderlessBits.com website.

## The Challenge

Create a professional consulting website that:
- Achieves zero ongoing hosting costs
- Maintains enterprise-grade performance
- Provides excellent user experience
- Includes robust form processing
- Supports content management

## Our Solution

We implemented a modern, static-first architecture:

### Architecture Decisions
- **Next.js 14** with static site generation
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for maintainable, responsive design
- **Dual form processing** with Netlify Forms and EmailJS fallback
- **GitHub Actions** for automated CI/CD

### Key Features
- Zero-cost hosting with GitHub Pages
- Comprehensive form validation and spam protection
- Performance monitoring and optimization
- SEO optimization with structured data
- Accessibility compliance (WCAG 2.1 AA)

## Results

The implementation achieved exceptional results:
- **Zero hosting costs** while maintaining professional quality
- **Sub-3-second load times** on 3G connections
- **100% uptime** with automatic deployments
- **Enterprise-grade security** with comprehensive validation

## Technologies Used

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with custom design system
- **Forms**: Dual processing (Netlify Forms + EmailJS)
- **Deployment**: GitHub Actions + GitHub Pages
- **Analytics**: Google Analytics 4 with privacy controls
- **Content**: Markdown with gray-matter frontmatter

This project demonstrates how modern web technologies can deliver enterprise-quality results at zero operational cost.
`;

  const blogPath = path.join(CONFIG.contentDir, 'blog', 'getting-started-with-development.md');
  const caseStudyPath = path.join(CONFIG.contentDir, 'case-studies', 'sample-project-implementation.md');
  
  if (!fs.existsSync(blogPath)) {
    fs.writeFileSync(blogPath, samplePost);
    log('Created sample blog post');
  }
  
  if (!fs.existsSync(caseStudyPath)) {
    fs.writeFileSync(caseStudyPath, sampleCaseStudy);
    log('Created sample case study');
  }
}

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('Node modules not found. Please run "npm install" first.', 'error');
    process.exit(1);
  }
  
  // Check if package.json has been modified more recently than node_modules
  if (fs.existsSync(packageJsonPath)) {
    const packageStats = fs.statSync(packageJsonPath);
    const nodeModulesStats = fs.statSync(nodeModulesPath);
    
    if (packageStats.mtime > nodeModulesStats.mtime) {
      log('package.json has been modified. Consider running "npm install" to update dependencies.', 'warn');
    }
  }
}

/**
 * Start the Next.js development server
 */
function startDevServer() {
  log(`Starting development server on port ${CONFIG.port}...`);
  
  const nextProcess = spawn('npx', ['next', 'dev', '-p', CONFIG.port], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: CONFIG.nodeEnv,
      PORT: CONFIG.port,
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Shutting down development server...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Shutting down development server...');
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  nextProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Development server exited with code ${code}`, 'error');
      process.exit(code);
    }
  });
  
  nextProcess.on('error', (error) => {
    log(`Failed to start development server: ${error.message}`, 'error');
    process.exit(1);
  });
}

/**
 * Display helpful information
 */
function displayStartupInfo() {
  log('BorderlessBits.com Development Server', 'success');
  log(`Local URL: http://localhost:${CONFIG.port}`);
  log(`Environment: ${CONFIG.nodeEnv}`);
  
  // Show available scripts
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (packageJson.scripts) {
      log('\nAvailable commands:');
      Object.entries(packageJson.scripts).forEach(([script, command]) => {
        if (script.startsWith('dev') || script.startsWith('build') || script.startsWith('test')) {
          log(`  npm run ${script}`);
        }
      });
    }
  } catch (error) {
    // Ignore if package.json can't be read
  }
  
  log('\nPress Ctrl+C to stop the server\n');
}

/**
 * Main function
 */
function main() {
  try {
    log('Initializing BorderlessBits.com development environment...');
    
    checkDependencies();
    checkEnvironmentFile();
    setupContentDirectories();
    
    displayStartupInfo();
    startDevServer();
    
  } catch (error) {
    log(`Failed to start development server: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  CONFIG,
  log
};