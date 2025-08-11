#!/usr/bin/env node

/**
 * Project validation script for BorderlessBits.com
 * Validates project structure, configuration, and readiness for deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = process.cwd();

/**
 * Log utility with colors
 */
function log(message, level = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m', // Reset
  };

  const color = colors[level] || colors.info;
  const prefix =
    level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';

  console.log(`${color}${prefix} ${message}${colors.reset}`);
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

/**
 * Read file content safely
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(PROJECT_ROOT, filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Parse JSON file safely
 */
function readJsonFile(filePath) {
  try {
    const content = readFile(filePath);
    return content ? JSON.parse(content) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate project structure
 */
function validateProjectStructure() {
  log('Validating project structure...');

  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.js',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/types/index.ts',
    'src/lib/validation.ts',
    'src/lib/emailjs.ts',
    'src/components/forms/ContactForm.tsx',
    '.github/workflows/deploy.yml',
  ];

  const requiredDirectories = [
    'src',
    'src/app',
    'src/components',
    'src/lib',
    'content',
    'content/blog',
    'content/case-studies',
    'public',
    'scripts',
  ];

  let structureValid = true;

  // Check files
  requiredFiles.forEach(file => {
    if (fileExists(file)) {
      log(`✓ Found: ${file}`, 'success');
    } else {
      log(`✗ Missing: ${file}`, 'error');
      structureValid = false;
    }
  });

  // Check directories
  requiredDirectories.forEach(dir => {
    if (fs.existsSync(path.join(PROJECT_ROOT, dir))) {
      log(`✓ Directory: ${dir}`, 'success');
    } else {
      log(`✗ Missing directory: ${dir}`, 'error');
      structureValid = false;
    }
  });

  return structureValid;
}

/**
 * Validate package.json configuration
 */
function validatePackageJson() {
  log('Validating package.json...');

  const packageJson = readJsonFile('package.json');
  if (!packageJson) {
    log('✗ package.json not found or invalid', 'error');
    return false;
  }

  let isValid = true;

  // Check required scripts
  const requiredScripts = ['dev', 'build', 'start', 'lint', 'type-check', 'test'];

  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log(`✓ Script: ${script}`, 'success');
    } else {
      log(`✗ Missing script: ${script}`, 'error');
      isValid = false;
    }
  });

  // Check required dependencies
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@emailjs/browser',
    'gray-matter',
    'remark',
    'isomorphic-dompurify',
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`✓ Dependency: ${dep}`, 'success');
    } else {
      log(`✗ Missing dependency: ${dep}`, 'error');
      isValid = false;
    }
  });

  // Check Node.js version requirement
  if (packageJson.engines && packageJson.engines.node) {
    log(`✓ Node.js version requirement: ${packageJson.engines.node}`, 'success');
  } else {
    log('⚠ Node.js version not specified', 'warn');
  }

  return isValid;
}

/**
 * Validate TypeScript configuration
 */
function validateTypeScript() {
  log('Validating TypeScript configuration...');

  const tsConfig = readJsonFile('tsconfig.json');
  if (!tsConfig) {
    log('✗ tsconfig.json not found or invalid', 'error');
    return false;
  }

  let isValid = true;

  // Check strict mode
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict) {
    log('✓ Strict mode enabled', 'success');
  } else {
    log('⚠ Strict mode not enabled', 'warn');
  }

  // Check path mapping
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
    log('✓ Path mapping configured', 'success');
  } else {
    log('⚠ Path mapping not configured', 'warn');
  }

  return isValid;
}

/**
 * Validate Next.js configuration
 */
function validateNextConfig() {
  log('Validating Next.js configuration...');

  const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.js');
  if (!fs.existsSync(nextConfigPath)) {
    log('✗ next.config.js not found', 'error');
    return false;
  }

  const nextConfig = readFile('next.config.js');

  // Check for static export
  if (nextConfig.includes("output: 'export'")) {
    log('✓ Static export configured', 'success');
  } else {
    log('✗ Static export not configured', 'error');
    return false;
  }

  // Check for security headers
  if (nextConfig.includes('headers()')) {
    log('✓ Security headers configured', 'success');
  } else {
    log('⚠ Security headers not found', 'warn');
  }

  return true;
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  log('Validating environment configuration...');

  let isValid = true;

  // Check for environment example file
  if (fileExists('.env.local.example')) {
    log('✓ Environment example file exists', 'success');
  } else {
    log('⚠ .env.local.example not found', 'warn');
  }

  // Check for production environment file
  if (fileExists('.env.production')) {
    log('✓ Production environment file exists', 'success');
  } else {
    log('⚠ .env.production not found', 'warn');
  }

  // Warn about local environment file
  if (fileExists('.env.local')) {
    log('✓ Local environment file exists', 'success');
  } else {
    log('⚠ .env.local not found - copy from .env.local.example', 'warn');
  }

  return isValid;
}

/**
 * Validate GitHub Actions workflow
 */
function validateGitHubActions() {
  log('Validating GitHub Actions workflow...');

  const workflowPath = '.github/workflows/deploy.yml';
  const workflow = readFile(workflowPath);

  if (!workflow) {
    log('✗ GitHub Actions workflow not found', 'error');
    return false;
  }

  let isValid = true;

  // Check for required jobs
  const requiredJobs = ['quality-check', 'build-and-test', 'deploy-production'];
  requiredJobs.forEach(job => {
    if (workflow.includes(`${job}:`)) {
      log(`✓ Job configured: ${job}`, 'success');
    } else {
      log(`✗ Missing job: ${job}`, 'error');
      isValid = false;
    }
  });

  // Check for Node.js version
  if (workflow.includes('NODE_VERSION: 18')) {
    log('✓ Node.js version configured', 'success');
  } else {
    log('⚠ Node.js version not found or incorrect', 'warn');
  }

  return isValid;
}

/**
 * Validate content structure
 */
function validateContent() {
  log('Validating content structure...');

  const contentDirs = ['content/blog', 'content/case-studies', 'content/pages'];
  let isValid = true;

  contentDirs.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      if (mdFiles.length > 0) {
        log(`✓ Content found in ${dir}: ${mdFiles.length} files`, 'success');
      } else {
        log(`⚠ No content files in ${dir}`, 'warn');
      }
    } else {
      log(`✗ Content directory missing: ${dir}`, 'error');
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Validate build readiness
 */
function validateBuildReadiness() {
  log('Validating build readiness...');

  // Check if node_modules exists
  if (fs.existsSync(path.join(PROJECT_ROOT, 'node_modules'))) {
    log('✓ Dependencies installed', 'success');
  } else {
    log('✗ Dependencies not installed - run "npm install"', 'error');
    return false;
  }

  // Check for common build files
  const buildFiles = ['.next', 'out'];
  buildFiles.forEach(file => {
    if (fs.existsSync(path.join(PROJECT_ROOT, file))) {
      log(`⚠ Build artifact exists: ${file} - consider running "npm run clean"`, 'warn');
    }
  });

  return true;
}

/**
 * Run comprehensive validation
 */
function runValidation() {
  log('🔍 Starting BorderlessBits.com project validation...\n');

  const validations = [
    { name: 'Project Structure', fn: validateProjectStructure },
    { name: 'Package.json', fn: validatePackageJson },
    { name: 'TypeScript Config', fn: validateTypeScript },
    { name: 'Next.js Config', fn: validateNextConfig },
    { name: 'Environment Config', fn: validateEnvironment },
    { name: 'GitHub Actions', fn: validateGitHubActions },
    { name: 'Content Structure', fn: validateContent },
    { name: 'Build Readiness', fn: validateBuildReadiness },
  ];

  let allValid = true;
  const results = [];

  validations.forEach(({ name, fn }) => {
    log(`\n📋 Validating ${name}...`);
    const isValid = fn();
    results.push({ name, valid: isValid });
    if (!isValid) allValid = false;
  });

  // Summary
  log('\n' + '='.repeat(60));
  log('📊 VALIDATION SUMMARY');
  log('='.repeat(60));

  results.forEach(({ name, valid }) => {
    const status = valid ? '✅ PASS' : '❌ FAIL';
    log(`${status} ${name}`);
  });

  log('='.repeat(60));

  if (allValid) {
    log('🎉 All validations passed! Project is ready for deployment.', 'success');
    log('\nNext steps:');
    log('1. Configure environment variables for production');
    log('2. Set up GitHub repository secrets');
    log('3. Push to main branch to trigger deployment');
    log('4. Configure custom domain and DNS');
    process.exit(0);
  } else {
    log('⚠️ Some validations failed. Please fix the issues above.', 'error');
    log('\nFor help with setup:');
    log('- Review the README.md file');
    log('- Check docs/DEPLOYMENT.md for deployment guide');
    log('- Contact richard@borderlessbits.com for support');
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  try {
    runValidation();
  } catch (error) {
    log(`Validation failed with error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateProjectStructure,
  validatePackageJson,
  validateTypeScript,
  validateNextConfig,
  validateEnvironment,
  validateGitHubActions,
  validateContent,
  validateBuildReadiness,
  runValidation,
};
