# Delchris - Professional Ecommerce Platform

A fully-featured, industry-standard ecommerce platform built with **Next.js 16**, **Django**, and **Supabase**, designed for premium fashion and lifestyle products with West African market focus.

## 🎯 Project Overview

Delchris is a complete ecommerce solution featuring:

- **Professional UI/UX**: Modern, luxury-focused design using shadcn/ui components
- **Robust Authentication**: Email/password and OAuth (Google, Apple) via Supabase Auth
- **Product Management**: Complete catalog with categories, variants, search, and filtering
- **Shopping Experience**: Full-featured cart with coupons, wishlists, and secure checkout
- **Multiple Payment Methods**: Paystack integration + Mobile Money (MTN MoMo, Telecel, AirtelTigo) + Bank Transfer
- **Order Management**: Real-time tracking, notifications, and customer dashboard
- **Admin Dashboard**: Complete business analytics, product management, and order handling
- **Reviews & Ratings**: Customer reviews with photo uploads and verified badges
- **Marketing Features**: Discount codes, flash sales, referral system, email campaigns

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **UI Components**: shadcn/ui (150+ pre-built components)
- **Styling**: Tailwind CSS v4 with custom theme
- **State Management**: Zustand for cart and auth
- **Data Fetching**: SWR + Axios for API calls
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner for toast messages
- **Icons**: Lucide React

### Backend
- **Framework**: Django REST Framework
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT tokens
- **Async Tasks**: Celery for emails, notifications
- **Caching**: Redis for performance optimization
- **Payment**: Paystack API integration

### Database (Supabase/PostgreSQL)
- Complete schema with 15+ tables
- Row-Level Security (RLS) for data privacy
- Optimized indexes for performance
- Foreign key relationships and constraints

## 📁 Project Structure

```
delchris/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── callback/
│   ├── products/                # Product pages
│   │   ├── page.tsx             # Product listing with filters
│   │   └── [slug]/              # Product detail page
│   ├── cart/                    # Shopping cart
│   ├── checkout/                # Multi-step checkout
│   ├── orders/                  # Order management
│   ├── account/                 # User account pages
│   │   ├── profile/
│   │   ├── addresses/
│   │   ├── orders/
│   │   └── wishlist/
│   ├── admin/                   # Admin dashboard
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── analytics/
│   └── globals.css              # Global styles + design tokens
│
├── components/
│   ├── layout/                  # Header, Footer, Navigation
│   ├── home/                    # Homepage sections
│   │   ├── hero-section.tsx
│   │   ├── categories-section.tsx
│   │   ├── featured-products.tsx
│   │   └── testimonial-section.tsx
│   ├── ui/                      # shadcn/ui components
│   └── ...
│
├── lib/
│   ├── supabase/               # Supabase client setup
│   ├── api/                    # API client configuration
│   ├── store/                  # Zustand stores
│   │   ├── auth.ts
│   │   └── cart.ts
│   └── types/                  # TypeScript interfaces
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts
│   └── use-mobile.tsx
│
├── public/                      # Static assets
├── supabase/
│   ├── schema.sql              # Complete database schema
│   └── migrations/
│
├── backend/                     # Django backend (setup guide)
│   ├── django_project/
│   ├── apps/
│   │   ├── users/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── reviews/
│   └── requirements.txt
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── .env.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL (via Supabase)
- Vercel account (deployment)

### Frontend Setup

1. **Clone and install dependencies**:
```bash
git clone <repo>
cd delchris
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
# Fill in your Supabase keys and API URLs
```

3. **Run the development server**:
```bash
pnpm dev
# Open http://localhost:3000
```

4. **Set up Supabase**:
   - Create a new Supabase project
   - Run the schema migration:
   ```sql
   -- Copy contents of supabase/schema.sql into Supabase SQL editor
   ```

### Backend Setup (Django)

1. **Create Python virtual environment**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure settings**:
```bash
cp .env.example .env
# Fill in Supabase credentials and Paystack keys
```

4. **Run migrations and start server**:
```bash
python manage.py migrate
python manage.py runserver
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep Charcoal (#1a1a1a) - Buttons, headers
- **Background**: Elegant Cream (#f9f7f4) - Main background
- **Accent**: Warm Gold (#d4af37) - Highlights, CTAs
- **Card**: Pure White (#ffffff) - Content containers

### Typography
- **Sans Serif**: Geist (headings and body)
- **Max 2 fonts**: No more than 2 font families per design
- **Line Height**: 1.4-1.6 for readability

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, destructive)
- **Forms**: Full validation with Zod, custom error states
- **Navigation**: Responsive header with mobile menu
- **Cards**: Consistent styling with hover effects
- **Modals**: Toast notifications via Sonner

## 📱 Key Features Implemented

### Phase 1: Foundation ✅
- [x] Next.js 16 setup with TypeScript
- [x] Supabase integration and database schema
- [x] Design system (colors, typography, components)
- [x] Header and Footer components
- [x] Responsive layout

### Phase 2: Authentication ✅
- [x] Supabase Auth setup
- [x] Login/Register pages
- [x] OAuth integration setup
- [x] User profile management
- [x] Protected routes middleware

### Phase 3: Product Catalog ✅
- [x] Product listing page with filters
- [x] Advanced search functionality
- [x] Category browsing
- [x] Product detail pages
- [x] Wishlist feature
- [x] View modes (grid/list)

### Phase 4: Shopping & Checkout ✅
- [x] Shopping cart with Zustand
- [x] Coupon/discount system
- [x] Multi-step checkout flow
- [x] Address management
- [x] Shipping method selection
- [x] Order summary

### Phase 5: Payment Integration 🔄
- [ ] Paystack payment gateway
- [ ] Mobile Money (MTN MoMo, Telecel, AirtelTigo)
- [ ] Bank transfer option
- [ ] Payment webhook handling
- [ ] Invoice generation

### Phase 6: Order Management 🔄
- [ ] Admin dashboard
- [ ] Order management interface
- [ ] Real-time order tracking
- [ ] Customer notifications (email/SMS/push)
- [ ] Refund management

### Phase 7: Reviews & Analytics 🔄
- [ ] Review submission and display
- [ ] Photo uploads in reviews
- [ ] Analytics dashboard
- [ ] Sales reports
- [ ] Customer behavior tracking

### Phase 8: Marketing & Optimization 🔄
- [ ] Flash sales management
- [ ] Referral system
- [ ] Email marketing integration
- [ ] SEO optimization
- [ ] Performance optimization

## 🔐 Security Features

✅ Implemented:
- **Authentication**: Secure JWT tokens via Supabase
- **Authorization**: Row-Level Security (RLS) policies
- **Input Validation**: Zod schema validation
- **API Security**: CORS headers, rate limiting ready
- **Password Security**: Bcrypt hashing (handled by Supabase)
- **HTTPS**: Enforced in production

🔄 To Implement:
- Payment security (PCI compliance)
- Rate limiting on API endpoints
- CSRF protection
- Input sanitization
- SQL injection prevention (using ORM)

## 📊 Database Schema

### Key Tables
1. **users_profiles** - Extended user information
2. **products** - Product catalog
3. **product_variants** - SKUs and variants
4. **categories** - Product categories
5. **carts** - Shopping carts
6. **orders** - Customer orders
7. **order_items** - Line items in orders
8. **payments** - Payment records
9. **reviews** - Product reviews
10. **wishlists** - Saved items
11. **coupons** - Discount codes
12. **analytics_events** - Event tracking
13. **notifications** - Email/SMS queue
14. **addresses** - Shipping/billing addresses
15. **refunds** - Refund requests

All tables include proper indexes, constraints, and RLS policies.

## 🌐 API Endpoints (Backend)

### Authentication
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/refresh-token/
```

### Products
```
GET    /api/products/                  # List with filters
POST   /api/products/                  # Create (admin)
GET    /api/products/[id]/
PUT    /api/products/[id]/             # Update (admin)
GET    /api/products/search/           # Search functionality
GET    /api/products/featured/
GET    /api/categories/
```

### Orders
```
POST   /api/orders/                    # Create order
GET    /api/orders/                    # List user orders
GET    /api/orders/[id]/
PUT    /api/orders/[id]/status/
```

### Payments
```
POST   /api/payments/initialize/
POST   /api/payments/verify/
GET    /api/payments/[id]/
POST   /api/refunds/
```

### Admin
```
GET    /api/admin/analytics/
GET    /api/admin/dashboard/
GET    /api/admin/orders/
GET    /api/admin/customers/
POST   /api/admin/products/
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Automatic deployment from Git
# Set environment variables in Vercel dashboard
pnpm run build
```

### Backend (Railway/Render)
```bash
# Docker containerization
# Set environment variables
# Connect to Supabase PostgreSQL
```

## 📦 Dependencies

### Frontend
```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "zustand": "^5.0.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "tailwindcss": "^4.0.0",
  "shadcn/ui": "latest"
}
```

### Backend
```
Django==5.0.0
djangorestframework==3.14.0
django-cors-headers==4.3.0
python-dotenv==1.0.0
psycopg2-binary==2.9.0
stripe==7.0.0
celery==5.3.0
redis==5.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- GitHub Issues: Project repository
- Email: support@delchris.com
- Documentation: Full docs at `/docs`

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video product reviews
- [ ] AR try-on features
- [ ] AI product recommendations
- [ ] Live chat support
- [ ] Multi-language support
- [ ] Custom loyalty program
- [ ] Subscription boxes

## ✨ Built With

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database & Auth
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Components
- [Django](https://www.djangoproject.com/) - Backend
- [Paystack](https://paystack.com/) - Payments

---

**Delchris** - Premium ecommerce for premium customers. 🎯
