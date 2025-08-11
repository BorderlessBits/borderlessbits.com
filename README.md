# BorderlessBits.com

Professional cloud architecture and healthcare software consulting website with enterprise-grade CI/CD pipeline.

[![CI/CD Pipeline](https://github.com/username/borderlessbits.com/workflows/CI/badge.svg)](https://github.com/username/borderlessbits.com/actions)
[![Security Scan](https://github.com/username/borderlessbits.com/workflows/Security%20Scanning/badge.svg)](https://github.com/username/borderlessbits.com/actions)
[![Lighthouse Performance](https://img.shields.io/badge/lighthouse-100%25-brightgreen.svg)](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fborderlessbits.com)
[![Uptime](https://img.shields.io/uptimerobot/status/m793494864-bb123456789abcdef0)](https://stats.uptimerobot.com/123456)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git
- Docker (optional)

### Local Development
```bash
# Clone repository
git clone https://github.com/username/borderlessbits.com.git
cd borderlessbits.com

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Docker Development
```bash
# Start with Docker Compose
docker-compose up

# Production preview
docker-compose --profile production up
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Forms**: EmailJS, Netlify Forms
- **Analytics**: Google Analytics 4
- **Hosting**: GitHub Pages (primary), Netlify (backup)
- **CDN**: Cloudflare, GitHub Pages CDN

### Zero-Cost Hosting Strategy
- **GitHub Pages**: 100GB bandwidth/month (free)
- **Netlify**: 100GB bandwidth/month (free) 
- **GitHub Actions**: 2000 minutes/month (free)
- **Analytics**: Google Analytics (free)
- **Monitoring**: Uptime Robot (50 monitors free)
- **Forms**: EmailJS (200 emails/month free)

## 📋 Features

### 🎯 Core Features
- ✅ **Static Site Generation**: Optimized performance with Next.js
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Contact Forms**: EmailJS integration with spam protection
- ✅ **SEO Optimization**: Meta tags, sitemap, structured data
- ✅ **Performance**: Lighthouse score >90 across all metrics
- ✅ **Accessibility**: WCAG 2.1 AA compliance

### 🔒 Security Features
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options
- ✅ **Input Sanitization**: DOMPurify for form inputs
- ✅ **Rate Limiting**: Form submission protection
- ✅ **SSL/TLS**: Automatic HTTPS with modern ciphers
- ✅ **Dependency Scanning**: Automated vulnerability detection
- ✅ **Secret Management**: Encrypted environment variables

### 🚀 CI/CD Pipeline
- ✅ **Quality Gates**: ESLint, TypeScript, Prettier, Tests
- ✅ **Security Scanning**: CodeQL, Trivy, TruffleHog, GitLeaks
- ✅ **Multi-Environment**: Production, staging, preview deployments  
- ✅ **Automated Rollback**: Health check failures trigger rollback
- ✅ **Performance Monitoring**: Lighthouse CI integration
- ✅ **Visual Regression**: Playwright screenshot testing

## 🚦 Development Workflow

### Branch Strategy
```
main           ← Production deployments (https://borderlessbits.com)
develop        ← Staging deployments (https://staging.borderlessbits.com)  
feature/*      ← Preview deployments (https://preview-pr-{number}.netlify.app)
hotfix/*       ← Emergency production fixes
```

### Available Scripts

**Development**:
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run preview      # Preview production build locally
```

**Quality & Testing**:
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript validation
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run test         # Run Jest tests
npm run test:coverage # Test coverage report
npm run validate-build # Full validation pipeline
```

**Performance & Analysis**:
```bash
npm run analyze      # Bundle analysis
npm run lighthouse   # Lighthouse audit
npm run lighthouse:ci # Lighthouse CI validation
```

**Deployment**:
```bash
./scripts/deploy.sh              # Deploy to production
./scripts/deploy.sh -e staging   # Deploy to staging  
./scripts/deploy.sh -d           # Dry run deployment
./scripts/rollback.sh            # Emergency rollback
./scripts/rollback.sh -l         # List available backups
```

## 📁 Project Structure

```
├── .github/
│   ├── workflows/           # GitHub Actions CI/CD
│   │   ├── ci.yml          # Continuous Integration
│   │   ├── deploy-production.yml
│   │   ├── deploy-staging.yml
│   │   ├── preview-deploy.yml
│   │   ├── security-scan.yml
│   │   └── monitoring.yml
│   └── ISSUE_TEMPLATE/     # Issue templates
├── docs/                   # Documentation
│   ├── CI-CD-PIPELINE.md
│   ├── DEPLOYMENT-GUIDE.md
│   ├── SECURITY.md
│   └── ARCHITECTURE.md
├── scripts/                # Deployment scripts
│   ├── deploy.sh          # Main deployment script
│   ├── rollback.sh        # Rollback script
│   ├── setup-secrets.sh   # GitHub secrets setup
│   └── monitoring/
├── src/                   # Source code
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utilities and libraries
│   ├── styles/          # Global styles
│   └── types/           # TypeScript definitions
├── tests/               # Test files
│   ├── e2e/            # End-to-end tests (Playwright)
│   ├── performance/    # Performance tests
│   ├── visual/         # Visual regression tests
│   └── unit/           # Unit tests (Jest)
├── content/            # Markdown content
├── public/             # Static assets
├── docker/             # Docker configurations
├── next.config.js      # Next.js configuration
├── playwright.config.ts # E2E test configuration
├── lighthouserc.json   # Lighthouse CI configuration
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

**Required for Production**:
```env
NEXT_PUBLIC_SITE_URL=https://borderlessbits.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxx
```

**Required for Deployment**:
```env
NETLIFY_AUTH_TOKEN=nfp_xxxxxxxxxx
NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx
GITHUB_TOKEN=ghp_xxxxxxxxxx
```

See [.env.example](.env.example) for complete configuration options.

### GitHub Secrets Setup
```bash
# Interactive setup
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/repository

# List current secrets  
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/repository -l
```

Required GitHub Secrets:
- `GA_MEASUREMENT_ID` - Google Analytics tracking ID
- `EMAILJS_SERVICE_ID` - EmailJS service configuration
- `EMAILJS_TEMPLATE_ID` - Email template ID
- `EMAILJS_PUBLIC_KEY` - EmailJS public key
- `NETLIFY_AUTH_TOKEN` - Netlify deployment token
- `NETLIFY_SITE_ID` - Production site ID
- `NETLIFY_STAGING_SITE_ID` - Staging site ID
- `NETLIFY_PREVIEW_SITE_ID` - Preview deployments site ID

## 🚀 Deployment

### Automatic Deployment
- **Production**: Push to `main` branch
- **Staging**: Push to `develop` branch  
- **Preview**: Create pull request

### Manual Deployment
```bash
# Deploy to all targets
./scripts/deploy.sh

# Deploy to specific environment
./scripts/deploy.sh -e staging -t netlify

# Force deployment (skip validations)
./scripts/deploy.sh -f

# Dry run (preview changes)
./scripts/deploy.sh -d
```

### Rollback Procedures
```bash
# Emergency rollback
./scripts/rollback.sh -y

# List available backups
./scripts/rollback.sh -l

# Rollback to specific version
./scripts/rollback.sh -b backup-20231201-143022
```

## 📊 Monitoring

### Health Monitoring
- **Uptime**: 24/7 monitoring with 5-minute intervals
- **Performance**: Lighthouse CI on every deployment
- **Security**: Daily vulnerability scans
- **SSL**: Certificate expiration monitoring

### Performance Budgets
- **Performance Score**: >80 (Lighthouse)
- **Accessibility Score**: >95 (Lighthouse)  
- **Bundle Size**: <2MB total JavaScript
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

### Monitoring Endpoints
- Production: https://borderlessbits.com
- Staging: https://staging.borderlessbits.com
- Backup: https://backup.borderlessbits.com

## 🔒 Security

### Security Features
- **Content Security Policy**: XSS protection
- **Security Headers**: HSTS, X-Frame-Options, X-XSS-Protection
- **Input Sanitization**: DOMPurify for user inputs
- **Rate Limiting**: Form submission protection
- **Dependency Scanning**: Automated vulnerability detection
- **Secret Management**: GitHub secrets encryption

### Security Scanning
- **Daily Scans**: Dependency vulnerabilities, code analysis
- **Deployment Gates**: Security validation before production
- **Container Scanning**: Docker image vulnerability assessment
- **Secret Detection**: Credential scanning in code and history

### Incident Response
- **Detection**: Automated monitoring and alerting
- **Response Time**: <4 hours for critical issues
- **Escalation**: Automated notifications for security incidents
- **Recovery**: Automated rollback for security breaches

## 🧪 Testing

### Test Types
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright across Chrome, Firefox, Safari
- **Performance Tests**: Lighthouse CI validation
- **Visual Regression**: Screenshot comparison testing
- **Security Tests**: OWASP ZAP baseline scans

### Test Commands
```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests  
npm run test:performance  # Performance tests
npm run test:visual       # Visual regression tests
npm run test:security     # Security tests
```

### Test Coverage
- **Target Coverage**: >80% for unit tests
- **E2E Coverage**: Critical user journeys
- **Performance Coverage**: All major pages
- **Visual Coverage**: Key UI components

## 📚 Documentation

- **[CI/CD Pipeline](docs/CI-CD-PIPELINE.md)**: Comprehensive pipeline documentation
- **[Deployment Guide](docs/DEPLOYMENT-GUIDE.md)**: Step-by-step deployment instructions
- **[Security Documentation](docs/SECURITY.md)**: Security architecture and procedures
- **[Architecture Overview](docs/ARCHITECTURE.md)**: System design and technical decisions

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow coding standards and add tests
4. **Run Quality Checks**: `npm run validate-build`
5. **Commit Changes**: `git commit -m 'Add amazing feature'`
6. **Push to Branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Include description and testing notes

### Code Quality Standards
- **ESLint**: No errors or warnings
- **TypeScript**: Strict type checking
- **Prettier**: Consistent formatting  
- **Tests**: Maintain >80% coverage
- **Performance**: Meet Lighthouse budgets
- **Security**: Pass all security scans

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation & Resources
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community questions and ideas
- **Wiki**: Additional documentation and guides

### Contact
- **Email**: richard@borderlessbits.com
- **Website**: https://borderlessbits.com
- **Response Time**: Within 24 hours for issues

### Emergency Support
- **Production Issues**: Critical deployment or security issues
- **Security Incidents**: Immediate response for security concerns
- **Emergency Contact**: Available for business-critical issues

---

## 🌟 Acknowledgments

- **Next.js Team**: Amazing React framework
- **Vercel**: Inspiration for deployment strategies  
- **Netlify**: Reliable backup hosting
- **GitHub**: Excellent CI/CD platform
- **Open Source Community**: Security tools and best practices

Built with ❤️ by [Richard Mosley](https://github.com/username) at BorderlessBits

---

## 📈 Status

- **Build Status**: [![CI](https://github.com/username/borderlessbits.com/workflows/CI/badge.svg)](https://github.com/username/borderlessbits.com/actions)
- **Security**: [![Security](https://github.com/username/borderlessbits.com/workflows/Security%20Scanning/badge.svg)](https://github.com/username/borderlessbits.com/actions)  
- **Uptime**: [![Uptime Robot status](https://img.shields.io/uptimerobot/status/m793494864-bb123456789abcdef0)](https://status.borderlessbits.com)
- **Performance**: [![Lighthouse](https://img.shields.io/badge/lighthouse-100%25-brightgreen.svg)](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fborderlessbits.com)