# Delchris Ecommerce Platform - Deployment Guide

## Production-Ready Implementation

This guide walks you through deploying the Delchris ecommerce platform to production.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Configuration](#database-configuration)
3. [Payment Integration](#payment-integration)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Performance Optimization](#performance-optimization)
6. [Security Checklist](#security-checklist)

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Email Configuration (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Database Configuration

### 1. Create Supabase Project

- Go to [supabase.com](https://supabase.com)
- Create a new project
- Copy your project URL and keys

### 2. Run Database Schema

Connect to your Supabase project and run the SQL schema:

```bash
# Copy the contents of supabase/schema.sql
# Paste into the SQL Editor in Supabase Dashboard
```

### 3. Enable Row Level Security (RLS)

For production security, enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Create Storage Buckets

In Supabase Dashboard:

- Create bucket: `product-images` (public)
- Create bucket: `user-uploads` (private)

---

## Payment Integration

### Paystack Setup

1. Create account at [paystack.com](https://paystack.com)
2. Get API keys from Dashboard
3. Set up webhook URL: `https://your-domain.com/api/payments/webhook`

### Mobile Money Configuration

Configure mobile money providers in your Paystack dashboard:
- MTN MoMo
- Telecel Cash
- AirtelTigo Money

### Test Transactions

Use these test credentials:

**Test Card:**
- Number: 4111 1111 1111 1111
- Expiry: 01/25
- CVV: 123

**Test Mobile Money:**
- Use any 10-digit phone number

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Complete Delchris ecommerce implementation"
git push origin main
```

### 2. Connect to Vercel

- Go to [vercel.com](https://vercel.com)
- Create new project from GitHub
- Select the repository
- Configure environment variables

### 3. Set Environment Variables in Vercel

Dashboard → Project Settings → Environment Variables

Add all variables from your `.env.local` file.

### 4. Deploy

- Vercel will automatically build and deploy
- Preview URL: `https://your-project.vercel.app`
- Production URL: Connect your custom domain

---

## Performance Optimization

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/products/jacket.jpg"
  alt="Premium Leather Jacket"
  width={500}
  height={500}
  quality={85}
  priority={false}
/>
```

### Caching Strategy

```tsx
// Configure revalidation in page.tsx
export const revalidate = 3600 // Revalidate every hour

// For dynamic data
export const dynamic = 'force-dynamic'
```

### Bundle Analysis

```bash
pnpm add -D @next/bundle-analyzer

# In next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})
```

### Performance Monitoring

Monitor with:
- Google Lighthouse
- Vercel Analytics
- Web Vitals

---

## Security Checklist

### Frontend Security

- ✓ Input validation with Zod
- ✓ XSS protection via React escaping
- ✓ CSRF tokens on forms
- ✓ Secure password requirements

### Backend Security

- ✓ Rate limiting on API routes
- ✓ SQL injection prevention (parameterized queries)
- ✓ Authentication verification on protected routes
- ✓ Payment verification with Paystack

### Data Protection

- ✓ Encrypt sensitive data
- ✓ HTTPS enforcement
- ✓ Secure password hashing (bcrypt)
- ✓ Secure session management

### Third-Party Security

- ✓ Validate Paystack webhooks
- ✓ Use HTTPS for all API calls
- ✓ Keep dependencies updated
- ✓ Use security headers

### Security Headers

Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' js.paystack.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ]
}
```

---

## Production Monitoring

### Error Tracking

Integrate with Sentry:

```bash
pnpm add @sentry/nextjs
```

### Logging

```tsx
console.log('[Delchris]', 'Event:', data)
// Use structured logging in production
```

### Analytics

- Set up Google Analytics
- Monitor Paystack payment conversions
- Track user journey

---

## Maintenance & Updates

### Regular Updates

```bash
# Update dependencies
pnpm update

# Check for security vulnerabilities
pnpm audit

# Run tests
pnpm test
```

### Database Backups

- Enable automatic backups in Supabase
- Test restore procedures monthly
- Keep backup history for 30 days

### Monitoring

- Set up uptime monitoring
- Monitor database performance
- Track payment success rates
- Monitor customer support tickets

---

## Scaling Considerations

### When Traffic Increases

1. **Database**: Upgrade Supabase plan
2. **Images**: Use CDN (Vercel Edge, Cloudflare)
3. **Caching**: Implement Redis for sessions
4. **Database**: Add read replicas
5. **Frontend**: Enable ISR (Incremental Static Regeneration)

### Load Testing

```bash
# Use tools like:
# - Apache JMeter
# - LoadRunner
# - k6
# - Artillery
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Paystack Docs**: https://paystack.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Quick Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
pnpm install
pnpm run build
```

### Database Connection Issues

- Verify Supabase URL and keys
- Check firewall/IP whitelist
- Test connection with: `supabase-js`

### Payment Processing Fails

- Verify Paystack keys are correct
- Check webhook configuration
- Test with Paystack test credentials

### Performance Issues

- Run Lighthouse audit
- Check database query performance
- Optimize images
- Implement caching

---

## Final Checklist

- ✓ Environment variables configured
- ✓ Database schema deployed
- ✓ Supabase RLS policies enabled
- ✓ Paystack integration tested
- ✓ Email notifications working
- ✓ Admin dashboard accessible
- ✓ SSL certificate configured
- ✓ Backups enabled
- ✓ Monitoring set up
- ✓ Security headers configured
- ✓ Performance optimized
- ✓ Documentation updated

Congratulations! Your Delchris ecommerce platform is production-ready.
