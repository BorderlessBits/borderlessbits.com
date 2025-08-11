# Security Policy for BorderlessBits.com

## Public Repository Security Guidelines

This is a **PUBLIC repository** for a business website. Follow these security practices:

### ✅ What CAN be public:
- Website source code (Next.js, TypeScript, React)
- Styling and design system (Tailwind CSS)
- Public content (services, about, blog posts)
- CI/CD workflows (GitHub Actions)
- Documentation and README files
- Package dependencies (package.json)
- Build configurations

### ❌ What must NEVER be committed:
- API keys or secrets
- Email service credentials  
- Analytics private keys
- Client data or private case studies
- Database credentials
- SSL certificates or private keys
- Personal contact information beyond business email
- Any `.env` files with real values

### 🔒 Security Measures in Place:

1. **Secrets Management**
   - All sensitive values stored in GitHub Secrets
   - Environment variables for local development
   - `.env.example` contains only placeholder values

2. **API Security**
   - EmailJS uses domain-restricted public keys
   - Google Analytics uses domain-locked measurement IDs
   - Contact forms have rate limiting and validation

3. **Dependency Security**
   - Dependabot enabled for vulnerability alerts
   - Regular security audits via `npm audit`
   - Automated security scanning in CI/CD

4. **Content Security**
   - Input sanitization on all forms
   - Content Security Policy headers
   - XSS protection enabled

### 🚨 If You Find a Security Issue:

**Do NOT:**
- Post sensitive information in issues
- Commit fixes that expose the vulnerability

**Do:**
- Email privately to richard@borderlessbits.com
- Use GitHub's private security advisory feature
- Allow time for fixes before public disclosure

### 📝 Pre-Commit Checklist:

Before every commit, verify:
- [ ] No API keys in code
- [ ] No real email addresses (except business email)
- [ ] No client-specific data
- [ ] No `.env` files being committed
- [ ] No sensitive debugging information

### 🔍 Regular Security Reviews:

Monthly:
- Review GitHub security alerts
- Update dependencies
- Check for exposed secrets

Quarterly:
- Full security audit
- Penetration testing
- Update security policies

---

*Last Updated: December 2024*
*Security Contact: richard@borderlessbits.com*