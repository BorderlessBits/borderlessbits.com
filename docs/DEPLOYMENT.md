# Deployment Guide

This guide covers deploying BorderlessBits.com using the zero-cost architecture
design.

## 🎯 Deployment Overview

The website uses a comprehensive zero-cost deployment strategy:

- **Primary Hosting**: GitHub Pages (100GB/month bandwidth)
- **Backup Hosting**: Netlify (100GB/month bandwidth)
- **Form Processing**: Netlify Forms (100 submissions/month) + EmailJS fallback
  (200 emails/month)
- **Analytics**: Google Analytics 4 (free tier)
- **Monitoring**: Uptime Robot (50 monitors free)

## 🚀 GitHub Pages Deployment (Primary)

### Prerequisites

1. GitHub repository with code
2. Custom domain configured (optional)
3. Environment secrets configured

### Step 1: Repository Setup

1. Create a new GitHub repository named `borderlessbits.com`
2. Push your code to the repository:
   ```bash
   git remote add origin https://github.com/yourusername/borderlessbits.com.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure GitHub Secrets

Navigate to repository **Settings → Secrets and variables → Actions** and add:

| Secret Name             | Description                    | Example            |
| ----------------------- | ------------------------------ | ------------------ |
| `GA_MEASUREMENT_ID`     | Google Analytics 4 ID          | `G-XXXXXXXXXX`     |
| `EMAILJS_SERVICE_ID`    | EmailJS service identifier     | `service_xxxxxxx`  |
| `EMAILJS_TEMPLATE_ID`   | EmailJS template ID            | `template_xxxxxxx` |
| `EMAILJS_PUBLIC_KEY`    | EmailJS public key             | `xxxxxxxxxx`       |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI token (optional) | `xxxxxxxxxx`       |

### Step 3: Enable GitHub Pages

1. Go to repository **Settings → Pages**
2. Set **Source** to "GitHub Actions"
3. The workflow will automatically deploy on push to `main`

### Step 4: Custom Domain Setup (Optional)

1. In **Settings → Pages**, add your custom domain: `borderlessbits.com`
2. Wait for DNS verification
3. Enable "Enforce HTTPS"

### Step 5: DNS Configuration

Configure your domain's DNS records:

```
# A Records (GitHub Pages IPs)
A    borderlessbits.com    185.199.108.153
A    borderlessbits.com    185.199.109.153
A    borderlessbits.com    185.199.110.153
A    borderlessbits.com    185.199.111.153

# CNAME for www subdomain
CNAME www.borderlessbits.com borderlessbits.com

# Optional: Cloudflare for enhanced performance
# Use Cloudflare nameservers and configure through Cloudflare dashboard
```

## 🔄 Netlify Deployment (Backup)

### Setup as Backup Host

1. Sign up for [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   ```yaml
   Build command: npm run build
   Publish directory: out
   Environment variables:
     NODE_VERSION: 18
     NEXT_PUBLIC_SITE_URL: https://borderlessbits.netlify.app
   ```

### Netlify Forms Configuration

Add the following to your contact page HTML:

```html
<form
  name="contact"
  method="POST"
  data-netlify="true"
  data-netlify-recaptcha="true"
>
  <input type="hidden" name="form-name" value="contact" />
  <!-- Your form fields -->
  <div data-netlify-recaptcha="true"></div>
</form>
```

### Domain Configuration

1. In Netlify dashboard, go to **Domain management**
2. Add custom domain as backup: `backup.borderlessbits.com`
3. Configure DNS for failover scenarios

## 📧 EmailJS Setup

### Account Configuration

1. Sign up for [EmailJS](https://www.emailjs.com/)
2. Create a new email service (Gmail, Outlook, etc.)
3. Create email templates for:
   - Contact form notifications
   - Auto-reply confirmations

### Template Configuration

**Contact Template** (for notifications):

```
Subject: New Contact Form Submission - {{project_type}}

From: {{from_name}} <{{from_email}}>
Company: {{company}}
Project Type: {{project_type}}
Timeline: {{project_timeline}}
Budget: {{budget_range}}
Referral Source: {{referral_source}}

Message:
{{message}}

---
Submitted: {{submission_date}}
```

**Auto-Reply Template** (for confirmations):

```
Subject: Thank you for contacting BorderlessBits

Hi {{to_name}},

Thank you for your interest in our {{project_type}} services. We've received your message and will respond within 24 hours.

Project Details:
- Type: {{project_type}}
- Timeline: {{project_timeline}}

Best regards,
Richard Mosley
BorderlessBits
richard@borderlessbits.com
```

## 📊 Google Analytics Setup

### GA4 Configuration

1. Create a [Google Analytics 4](https://analytics.google.com/) property
2. Get your measurement ID (format: `G-XXXXXXXXXX`)
3. Configure privacy settings:
   ```javascript
   gtag('config', 'GA_MEASUREMENT_ID', {
     anonymize_ip: true,
     allow_ad_personalization_signals: false,
     allow_google_signals: false,
   });
   ```

### Enhanced Ecommerce Setup

Track lead values for ROI analysis:

```javascript
gtag('event', 'purchase', {
  transaction_id: 'lead_' + Date.now(),
  value: 25000, // Estimated contract value
  currency: 'USD',
  items: [
    {
      item_id: 'consultation_lead',
      item_name: 'Consultation Lead',
      category: 'leads',
      quantity: 1,
      price: 25000,
    },
  ],
});
```

## 🔍 Monitoring Setup

### Uptime Robot Configuration

1. Sign up for [Uptime Robot](https://uptimerobot.com/)
2. Create monitors for:
   - Main site: `https://borderlessbits.com`
   - Contact page: `https://borderlessbits.com/contact`
   - Backup site: `https://backup.borderlessbits.com`

### Google Search Console

1. Add property in [Search Console](https://search.google.com/search-console)
2. Verify ownership using HTML meta tag
3. Submit sitemap: `https://borderlessbits.com/sitemap.xml`

## ⚡ Performance Optimization

### Lighthouse CI Setup

1. Install Lighthouse CI: `npm install -g @lhci/cli`
2. Configure `.lighthouserc.json` (already included)
3. Optional: Connect to GitHub app for PR comments

### Core Web Vitals Monitoring

Monitor performance metrics automatically:

- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

## 🔐 Security Configuration

### Security Headers

Configured automatically via `next.config.js`:

```javascript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com",
  },
];
```

### Form Security

- Input sanitization with DOMPurify
- Honeypot spam detection
- Rate limiting (5 submissions per IP per hour)
- reCAPTCHA integration (optional)

## 🎯 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Content added to `content/` directories
- [ ] Form processing tested locally
- [ ] Performance audit passed (Lighthouse > 90)
- [ ] Security headers verified
- [ ] SEO meta tags configured

### GitHub Setup

- [ ] Repository created and code pushed
- [ ] GitHub Actions secrets configured
- [ ] GitHub Pages enabled with custom domain
- [ ] DNS records configured and verified
- [ ] SSL certificate active

### Third-Party Services

- [ ] Google Analytics property created and configured
- [ ] EmailJS service and templates configured
- [ ] Netlify backup deployment configured
- [ ] Uptime Robot monitors configured
- [ ] Google Search Console property added

### Post-Deployment

- [ ] Site accessibility verified
- [ ] Contact form functionality tested
- [ ] Performance metrics within targets
- [ ] SEO sitemap submitted
- [ ] Monitoring alerts configured
- [ ] Backup deployment tested

## 🚨 Troubleshooting

### Common Issues

**Build Fails**

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**Form Not Submitting**

```bash
# Check EmailJS configuration
console.log('EmailJS Config:', {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
});
```

**Site Not Loading**

1. Check GitHub Pages status
2. Verify DNS configuration
3. Check SSL certificate status
4. Review deployment logs

**Performance Issues**

```bash
# Run performance audit
npm run lighthouse

# Analyze bundle size
npm run analyze
```

## 🔄 Continuous Deployment

The GitHub Actions workflow automatically:

1. **Quality Gates**: ESLint, TypeScript, tests
2. **Security Audit**: npm audit, dependency scanning
3. **Build Process**: Next.js static export with optimizations
4. **Performance Testing**: Lighthouse CI validation
5. **Deployment**: GitHub Pages with custom domain
6. **Verification**: Site availability and SEO checks
7. **Monitoring**: Performance metric collection

### Deployment Triggers

- **Push to main**: Full deployment pipeline
- **Pull requests**: Build and test only
- **Schedule**: Weekly security scans and cleanup

## 📈 Scaling Considerations

### Traffic Growth Triggers

**100GB/month exceeded (GitHub Pages)**

- **Solution**: Migrate to Netlify (100GB free) or Vercel
- **Cost**: $0 (still within free tiers)

**100 form submissions/month exceeded**

- **Solution**: Upgrade to Netlify Pro ($19/month) or Formspree Pro ($10/month)
- **Alternative**: Custom serverless solution (~$5/month)

**Performance degradation**

- **Solution**: Cloudflare Pro ($20/month) for advanced CDN
- **Alternative**: AWS CloudFront with Lambda@Edge

### Enterprise Migration Path

When ready for enterprise features:

1. **Vercel Pro** ($20/month): Advanced deployment features
2. **Netlify Pro** ($19/month): Enhanced form processing and analytics
3. **Custom AWS/Azure**: Full control and compliance features

---

For deployment support, contact richard@borderlessbits.com with response within
24 hours.
