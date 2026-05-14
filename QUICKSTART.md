# Delchris Quick Start Guide

Get Delchris running in 5 minutes!

## 🚀 Installation

### 1. Clone & Install
```bash
git clone <repository>
cd delchris
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Then fill in these required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Setup Supabase Database

**Option A: GUI (Recommended)**
1. Go to Supabase dashboard
2. Create new SQL editor query
3. Copy contents of `supabase/schema.sql`
4. Run the full schema

**Option B: CLI**
```bash
supabase db push
```

### 4. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` 🎉

---

## 📱 Test the App

### Homepage
- View featured products and categories
- Check responsive design on mobile

### Product Listing
- Go to `/products`
- Filter by category, price, rating
- Toggle between grid/list view
- Add items to wishlist

### Shopping Cart
- Go to `/cart`
- Add items via product pages (coming soon)
- Test coupon: `WELCOME10` (10% off)
- Proceed to checkout

### Checkout
- Fill shipping address
- Select shipping method
- Choose payment method
- Review order summary

### Authentication
- Sign up: `/auth/register`
- Sign in: `/auth/login`
- View profile: `/account/profile` (after login)

---

## 🎨 Customize Branding

### Colors
Edit `app/globals.css`:
```css
:root {
  --primary: oklch(...);      /* Main brand color */
  --accent: oklch(...);       /* Highlights */
  --background: oklch(...);   /* Page background */
}
```

### Fonts
Edit `app/layout.tsx`:
```tsx
import { YourFont } from 'next/font/google'
const font = YourFont({ subsets: ['latin'] })
```

### Company Name
Search & replace:
- "Delchris" → "YourBrand"
- Logo in `components/layout/header.tsx`

---

## 🗄️ Database

### View Schema
```sql
-- See all tables
SELECT * FROM information_schema.tables;

-- Check specific table
SELECT * FROM products LIMIT 5;
```

### Add Sample Data

```sql
-- Add category
INSERT INTO categories (name, slug, description)
VALUES ('Clothing', 'clothing', 'Fashion & apparel');

-- Add product
INSERT INTO products (name, slug, category_id, base_price, stock_quantity)
VALUES ('T-Shirt', 't-shirt', <category_id>, 50, 100);
```

---

## 🔌 API Integration

Once backend is ready, update `lib/api/client.ts`:

```typescript
// Current (mock/client-side)
const data = mockProducts

// Soon:
const { data } = await apiClient.get('/products/')
```

---

## 📦 Common Tasks

### Add a New Page
```bash
# Create in app/ directory
# Use Header and Footer components
# Add to navigation if needed
```

### Add a New Component
```bash
# Save in components/
# Export from components/index.ts
# Use shadcn/ui as base
```

### Style with Tailwind
```tsx
<div className="flex items-center justify-between bg-card p-4 rounded-lg">
  {/* Uses design tokens: primary, accent, background, etc. */}
</div>
```

### Add Form Validation
```tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1)
})

export function MyForm() {
  const { register, errors } = useForm()
  // Use register for inputs
}
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm build
```

### Supabase Connection Issues
```bash
# Check URL and keys in .env.local
# Verify Supabase project is active
# Test in Supabase dashboard
```

### Component Not Found
```bash
# Check import path
# Verify file exists in components/
# Check component exports
```

---

## 📚 File Locations

| Task | Location |
|------|----------|
| Add page | `app/*/page.tsx` |
| Add component | `components/` |
| Add style | `app/globals.css` |
| Add type | `lib/types/index.ts` |
| Add store | `lib/store/` |
| Add hook | `hooks/` |

---

## 🎯 Next: Connect Backend

When ready for Phase 5 (Payments):

1. **Setup Django** (see README)
2. **Update API URL**: 
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
3. **Implement Paystack**:
   ```bash
   pnpm add @paystack/inline-js
   ```
4. **Update payment handling** in checkout

---

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy 🎉

```bash
# Preview deployment
vercel

# Production
vercel --prod
```

---

## 📞 Getting Help

- **Docs**: See `README.md` and `IMPLEMENTATION_SUMMARY.md`
- **Issues**: Check component source code
- **TypeScript**: Hover over variables for types
- **Components**: Browse `components/` directory

---

## ✅ Checklist

Before going live:

- [ ] Update all placeholder content
- [ ] Configure Supabase database
- [ ] Setup environment variables
- [ ] Configure payment gateway (Phase 5)
- [ ] Setup email service
- [ ] Configure analytics
- [ ] Setup monitoring
- [ ] Test all user flows
- [ ] Mobile testing
- [ ] Security audit
- [ ] Performance testing

---

**Ready to build? Start with `pnpm dev` 🚀**
