# Deployment Guide

Comprehensive deployment guide for BorderlessBits.com with enterprise-grade CI/CD pipeline and zero-cost hosting strategy.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Git configured
- GitHub account with repository access
- Required third-party service accounts (see [Service Setup](#service-setup))

### Initial Setup
```bash
# Clone repository
git clone https://github.com/yourusername/borderlessbits.com.git
cd borderlessbits.com

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup GitHub secrets
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/borderlessbits.com

# Initial deployment test
npm run build
npm run preview
```

## Service Setup

### 1. Google Analytics 4

1. **Create GA4 Property**:
   - Visit [Google Analytics](https://analytics.google.com/)
   - Create new property for your domain
   - Copy Measurement ID (format: `G-XXXXXXXXXX`)

2. **Configure Privacy Settings**:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX', {
     anonymize_ip: true,
     allow_ad_personalization_signals: false,
     allow_google_signals: false
   });
   ```

3. **Add to GitHub Secrets**: `GA_MEASUREMENT_ID`

### 2. EmailJS Configuration

1. **Create EmailJS Account**:
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Connect email service (Gmail, Outlook, etc.)
   - Create email templates

2. **Email Templates**:

**Contact Form Template**:
```html
Subject: New Contact - {{project_type}}

From: {{from_name}} <{{from_email}}>
Company: {{company}}
Project: {{project_type}}
Timeline: {{project_timeline}}
Budget: {{budget_range}}

Message:
{{message}}

---
Submitted: {{submission_date}}
```

**Auto-Reply Template**:
```html
Subject: Thank you for contacting BorderlessBits

Hi {{to_name}},

Thank you for your interest in our {{project_type}} services. 
We'll respond within 24 hours.

Best regards,
Richard Mosley
BorderlessBits
```

3. **Add to GitHub Secrets**:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`

### 3. Netlify Deployment

1. **Create Netlify Account**: [netlify.com](https://netlify.com)

2. **Create Sites**:
   - **Production**: `borderlessbits-prod`
   - **Staging**: `borderlessbits-staging` 
   - **Preview**: `borderlessbits-preview`

3. **Configure Build Settings**:
   ```yaml
   Build command: npm run build
   Publish directory: out
   Environment variables:
     NODE_VERSION: 18
     NEXT_PUBLIC_SITE_URL: https://borderlessbits.com
   ```

4. **Domain Configuration**:
   - Production: `borderlessbits.com`
   - Staging: `staging.borderlessbits.com`
   - Backup: `backup.borderlessbits.com`

5. **Add to GitHub Secrets**:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`
   - `NETLIFY_STAGING_SITE_ID`
   - `NETLIFY_PREVIEW_SITE_ID`

### 4. GitHub Pages Setup

1. **Repository Settings**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - Custom domain: `borderlessbits.com`
   - Enforce HTTPS: ✅

2. **DNS Configuration**:
   ```dns
   # A Records (GitHub Pages IPs)
   A    borderlessbits.com    185.199.108.153
   A    borderlessbits.com    185.199.109.153
   A    borderlessbits.com    185.199.110.153
   A    borderlessbits.com    185.199.111.153

   # CNAME for www
   CNAME www.borderlessbits.com borderlessbits.com
   ```

3. **SSL Certificate**: Automatically provisioned by GitHub

### 5. Uptime Monitoring

1. **Uptime Robot Setup**:
   ```bash
   # Automated setup
   ./scripts/monitoring/uptime-robot-setup.sh -k $UPTIME_ROBOT_API_KEY
   ```

2. **Manual Setup**:
   - Create account at [Uptime Robot](https://uptimerobot.com/)
   - Add monitors for critical endpoints
   - Configure alert contacts

3. **Monitoring Targets**:
   - `https://borderlessbits.com` (5-min intervals)
   - `https://borderlessbits.com/contact` (5-min intervals)
   - `https://staging.borderlessbits.com` (15-min intervals)
   - `https://backup.borderlessbits.com` (15-min intervals)

## Deployment Environments

### Production Environment

**Domain**: https://borderlessbits.com
**Hosting**: GitHub Pages (primary), Netlify (backup)
**Branch**: `main`
**Deployment**: Automatic on push to main

**Configuration**:
```yaml
NODE_ENV: production
NEXT_PUBLIC_SITE_URL: https://borderlessbits.com
NEXT_PUBLIC_GA_MEASUREMENT_ID: G-XXXXXXXXXX
```

**Features**:
- Custom domain with SSL
- CDN optimization
- Form processing with EmailJS
- Performance monitoring
- SEO optimization
- Security headers

### Staging Environment

**Domain**: https://staging.borderlessbits.com
**Hosting**: Netlify
**Branch**: `develop`
**Deployment**: Automatic on push to develop

**Configuration**:
```yaml
NODE_ENV: development
NEXT_PUBLIC_SITE_URL: https://staging.borderlessbits.com
NEXT_PUBLIC_GA_MEASUREMENT_ID: G-STAGING-ID
```

**Features**:
- Production-like testing
- Auto-promotion to production
- Separate analytics tracking
- Form testing environment

### Preview Environment

**Domain**: https://preview-pr-{number}.netlify.app
**Hosting**: Netlify
**Branch**: Any feature branch in PR
**Deployment**: Automatic on PR creation/update

**Features**:
- Per-PR preview deployments
- Lighthouse performance audits
- Visual regression testing
- Automatic cleanup on PR closure

## Deployment Commands

### Manual Deployment Script

**Script**: `scripts/deploy.sh`

```bash
# Deploy to production (all targets)
./scripts/deploy.sh

# Deploy to staging
./scripts/deploy.sh -e staging

# Deploy to specific target
./scripts/deploy.sh -t netlify

# Dry run (preview changes)
./scripts/deploy.sh -d

# Force deployment (skip validations)
./scripts/deploy.sh -f

# Skip tests
./scripts/deploy.sh -s
```

### GitHub Actions Deployment

**Production Deployment**:
```bash
# Automatic trigger
git push origin main

# Manual trigger
gh workflow run deploy-production.yml
```

**Staging Deployment**:
```bash
# Automatic trigger
git push origin develop

# Auto-promote to production
git commit -m "Update feature [auto-promote]"
git push origin develop
```

**Preview Deployment**:
```bash
# Automatic on PR creation
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

### Local Development

```bash
# Development server
npm run dev

# Production build locally
npm run build
npm run preview

# Docker development
docker-compose up

# Docker production preview
docker-compose --profile production up
```

## Rollback Procedures

### Automatic Rollback

**Triggers**:
- Post-deployment health checks fail
- Performance thresholds breached  
- Critical security vulnerabilities detected

**Process**:
1. Failure detection
2. Previous deployment identification
3. Artifact restoration
4. Re-deployment
5. Validation
6. Notification

### Manual Rollback

**Script**: `scripts/rollback.sh`

```bash
# Rollback to latest backup
./scripts/rollback.sh

# List available backups
./scripts/rollback.sh -l

# Rollback to specific backup
./scripts/rollback.sh -b backup-20231201-143022

# Emergency rollback (skip confirmations)
./scripts/rollback.sh -y

# Rollback specific target
./scripts/rollback.sh -t netlify
```

**Backup Management**:
- Automatic backups before each deployment
- 30-day retention policy
- Versioned artifacts with metadata
- Quick restoration capabilities

## Security Configuration

### Secrets Management

**Setup Script**: `scripts/setup-secrets.sh`

```bash
# Interactive setup
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/repo

# List existing secrets
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/repo -l

# Batch setup (CI mode)
export GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
export EMAILJS_SERVICE_ID="service_xxxxx"
# ... other environment variables
./scripts/setup-secrets.sh -t $GITHUB_TOKEN -r username/repo
```

**Required Secrets**:
| Secret | Purpose | Example |
|--------|---------|---------|
| `GA_MEASUREMENT_ID` | Google Analytics tracking | `G-XXXXXXXXXX` |
| `EMAILJS_SERVICE_ID` | Email service configuration | `service_xxxxxxx` |
| `EMAILJS_TEMPLATE_ID` | Email template ID | `template_xxxxxxx` |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key | `xxxxxxxxxx` |
| `NETLIFY_AUTH_TOKEN` | Netlify deployment | `nfp_xxxxxxxxxx` |
| `NETLIFY_SITE_ID` | Production site ID | `xxxxxxxx-xxxx-xxxx` |

### Security Scanning

**Automated Scans**:
- Daily security audits (2 AM UTC)
- Dependency vulnerability scanning
- Container security scanning
- Code security analysis (CodeQL)
- Infrastructure configuration scanning

**Manual Security Checks**:
```bash
# Run security audit
npm audit --audit-level moderate

# Container security scan
docker build -t borderlessbits:security .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image borderlessbits:security

# Security headers validation
curl -I https://borderlessbits.com | grep -E "(X-Frame-Options|X-XSS-Protection|Content-Security-Policy)"
```

## Performance Optimization

### Build Optimization

```bash
# Bundle analysis
npm run analyze

# Performance audit
npm run lighthouse

# Test different device profiles
npm run lighthouse:mobile
npm run lighthouse:desktop
```

### Performance Budgets

**Thresholds**:
- **Bundle Size**: <2MB total JavaScript
- **Performance Score**: >80 (Lighthouse)
- **Accessibility Score**: >95 (Lighthouse)
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

### Optimization Strategies

**Images**:
- WebP/AVIF format conversion
- Responsive image sizing
- Lazy loading for below-fold content
- Alt text for accessibility

**JavaScript**:
- Code splitting by route
- Tree shaking for unused code
- Dynamic imports for heavy components
- Bundle size monitoring

**CSS**:
- Critical CSS inlining
- Unused CSS removal
- CSS minification and compression
- Modern CSS features with fallbacks

## Monitoring & Alerting

### Health Monitoring

**Automated Checks**:
- HTTP status monitoring (every 5 minutes)
- Response time measurement
- SSL certificate expiration (30-day warning)
- DNS resolution validation
- Performance regression detection

**Monitoring Endpoints**:
```bash
# Production health check
curl -f https://borderlessbits.com/

# Contact form availability
curl -f https://borderlessbits.com/contact

# Staging environment
curl -f https://staging.borderlessbits.com/

# Backup site
curl -f https://backup.borderlessbits.com/
```

### Performance Monitoring

**Core Web Vitals Tracking**:
```javascript
// Real User Monitoring
import { getCLS, getFID, getFCP, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);  
getFCP(console.log);
getLCP(console.log);
```

**Lighthouse CI Integration**:
```bash
# Continuous performance monitoring
lhci autorun --config=lighthouserc.json

# Performance budgets enforcement
npm run lighthouse:ci
```

### Alert Configuration

**Alert Levels**:
- 🟢 **Healthy**: All systems operational
- 🟡 **Warning**: Non-critical issues detected
- 🔴 **Critical**: Service unavailable or compromised

**Notification Channels**:
- GitHub Actions workflow status
- Email alerts (configurable)
- Slack/Discord webhooks (configurable)
- PagerDuty integration (enterprise)

## Troubleshooting

### Common Deployment Issues

**Build Failures**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Validate environment variables
npm run validate
```

**Deployment Failures**:
```bash
# Check GitHub Actions logs
gh run list --workflow=deploy-production.yml

# Verify secrets configuration
gh secret list

# Test local build
npm run build
ls -la out/  # Verify output directory

# Check third-party services
curl -f https://api.netlify.com/api/v1/sites \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN"
```

**Performance Issues**:
```bash
# Analyze bundle sizes
npm run analyze

# Run Lighthouse audit
npm run lighthouse

# Check image optimization
npm run optimize-images

# Validate Core Web Vitals
npm run test:performance
```

**Form Issues**:
```bash
# Test EmailJS configuration
curl -X POST https://api.emailjs.com/api/v1.0/email/send \
  -H "Content-Type: application/json" \
  -d '{"service_id":"YOUR_SERVICE_ID","template_id":"YOUR_TEMPLATE_ID","user_id":"YOUR_PUBLIC_KEY"}'

# Check Netlify forms (if using)
curl -X POST https://your-site.netlify.app/ \
  -F "form-name=contact" \
  -F "name=Test" \
  -F "email=test@example.com"
```

### Emergency Procedures

**Critical Production Issue**:
1. **Immediate Response**:
   ```bash
   # Execute emergency rollback
   ./scripts/rollback.sh -y -e production
   ```

2. **Investigation**:
   - Check GitHub Actions logs
   - Review monitoring alerts
   - Analyze error reports
   - Check third-party service status

3. **Recovery**:
   - Identify root cause
   - Prepare hotfix branch
   - Test fix in staging
   - Deploy with validation

4. **Post-Incident**:
   - Document incident details
   - Review response time
   - Update procedures
   - Implement preventive measures

**Security Incident**:
1. **Immediate Actions**:
   ```bash
   # Rotate all secrets
   ./scripts/setup-secrets.sh --rotate-all
   
   # Review access logs
   gh api repos/:owner/:repo/actions/runs \
     --jq '.workflow_runs[] | select(.created_at > "2023-12-01")'
   ```

2. **Assessment**:
   - Audit exposed secrets
   - Check for unauthorized access
   - Review code changes
   - Validate current deployment

3. **Remediation**:
   - Patch vulnerabilities
   - Update security policies
   - Strengthen access controls
   - Enhanced monitoring

## Scaling Considerations

### Traffic Growth Triggers

**100GB/month Bandwidth Exceeded**:
- **GitHub Pages**: Migrate to Netlify Pro ($19/month)
- **Alternative**: Vercel Pro ($20/month)
- **Enterprise**: Custom CDN solution

**Form Submissions >100/month**:
- **Netlify Pro**: $19/month for enhanced forms
- **Alternative**: Formspree Pro ($10/month)
- **Custom**: Serverless form handler (~$5/month)

**Build Minutes >2000/month**:
- **GitHub Actions**: Optimize pipeline efficiency
- **Alternative**: Self-hosted runners
- **Enterprise**: GitHub Enterprise ($21/user/month)

### Enterprise Migration Path

**Stage 1**: Enhanced Features ($20-40/month)
- Netlify Pro: Advanced form processing
- Vercel Pro: Enhanced deployment features
- Uptime Robot Pro: Extended monitoring

**Stage 2**: Custom Infrastructure ($100-500/month)
- AWS/Azure cloud hosting
- Custom CI/CD pipelines
- Advanced monitoring solutions
- Compliance and security features

**Stage 3**: Enterprise Solutions ($500+/month)
- Dedicated infrastructure
- SLA guarantees
- 24/7 support
- Advanced security features

---

## Support

**Documentation**: [GitHub Repository](https://github.com/username/borderlessbits.com)
**Issues**: Create GitHub issue with detailed description
**Email**: richard@borderlessbits.com
**Response Time**: Within 24 hours for deployment issues

**Emergency Support**: Available for critical production issues affecting business operations