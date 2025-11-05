# EJA Homestay - Travel & Experience Booking Platform

A modern, full-stack homestay and experience booking platform built with Next.js, TypeScript, and Supabase. Features AI-powered travel recommendations, integrated payment processing, and social engagement features.

## 🚀 Project Overview

EJA Homestay is a comprehensive booking platform that connects travelers with unique homestays, local experiences, and retreats. The platform includes:

- **Property Bookings** - Homestays, cottages, boutique properties with room-based inventory
- **Experiences** - Hyper-local experiences, online activities, and immersive retreats
- **AI-Powered Recommendations** - Gemini AI integration for personalized travel suggestions
- **Payment Integration** - Razorpay payment gateway for seamless transactions
- **Social Features** - Dares, engagements, stories, and collaborative experiences

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.1** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.5.4** - Type safety
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **Heroicons & Headless UI** - UI components

### Backend
- **Supabase** - PostgreSQL database + Authentication
- **Next.js API Routes** - Serverless API endpoints
- **Razorpay** - Payment processing
- **Google Gemini API** - AI chat assistant

### Key Libraries
- `@supabase/supabase-js` & `@supabase/ssr` - Database & auth
- `react-hot-toast` - Toast notifications
- `date-fns` & `react-day-picker` - Date handling
- `jspdf` & `file-saver` - PDF generation
- `clsx` - Conditional class names

## 📁 Project Structure

```
eja-homestay/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── ai-chat/       # AI chat endpoint
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── payments/      # Payment processing
│   │   │   ├── properties/    # Property endpoints
│   │   │   ├── dares/         # Social features
│   │   │   └── user/          # User management
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/        # Sign in page
│   │   │   ├── signup/        # Sign up page
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── property/          # Property pages
│   │   │   └── [id]/          # Property detail page
│   │   ├── experiences/       # Experience pages
│   │   ├── retreats/          # Retreat pages
│   │   ├── discover/          # Discovery/search
│   │   ├── search/            # Search page
│   │   ├── guest/             # Guest dashboard
│   │   ├── admin/             # Admin dashboard
│   │   └── [various pages]    # Other pages
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── Navigation.tsx     # Main navigation
│   │   ├── Footer.tsx          # Footer component
│   │   ├── BookingWizard.tsx   # Multi-step booking
│   │   ├── AIChatAssistant.tsx # AI chat interface
│   │   ├── PropertyCard.tsx     # Property cards
│   │   └── [other components]
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/                 # Custom React hooks
│   │   ├── useBookingPersistence.ts
│   │   └── useOptimizedData.ts
│   └── lib/                   # Utilities & API clients
│       ├── database.ts        # Database functions
│       ├── types.ts           # TypeScript types
│       ├── supabase.ts        # Supabase client
│       ├── supabase-server.ts # Server-side Supabase
│       ├── gemini-client.ts   # AI chat client
│       ├── gemini-config.ts   # AI configuration
│       ├── mood-detector.ts   # Mood detection
│       ├── booking-api.ts     # Booking API
│       └── [other utilities]
├── supabase/                  # Database schema
│   ├── 01_schema_structure.sql
│   ├── 02_create_views.sql
│   ├── 03_misc_view.sql
│   └── README_DATABASE_SCRIPTS.md
├── public/                    # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── [images & icons]
├── next.config.ts            # Next.js configuration
├── tailwind.config.cjs       # Tailwind CSS config
├── tsconfig.json             # TypeScript config
├── vercel.json               # Vercel deployment
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🗄️ Database Schema (Supabase)

### Core Tables

1. **profiles** - User profiles (guests/hosts)
   - Authentication, profile data, roles
   - Host-specific fields (bio, USPs, etc.)

2. **properties** - Property listings
   - Property details, location, pricing
   - Room configurations, amenities, images
   - Host information (denormalized)

3. **rooms** - Room configurations per property
   - Room types, pricing, inventory
   - Extra guest pricing, amenities

4. **room_inventory** - Availability tracking
   - Date-based availability per room
   - Real-time inventory management

5. **bookings** - Booking records
   - Guest, property, dates, pricing
   - Status tracking (pending, confirmed, cancelled, completed)

6. **experiences** - Experience listings
   - Hyper-local, online, retreat experiences
   - Host information, pricing, categories

7. **retreats** - Retreat listings
   - Multi-day retreat experiences
   - Host information, pricing, dates

8. **micro_experiences** - Retreat experiences
   - Experience types within retreats
   - Budget tiers (tight budget, family comfort, premium)

9. **dares** - Social challenge features
   - User challenges and completions

10. **Engagement tables** - Likes, shares, follows, collaborations

### Database Views

- `properties_with_host` - Properties with host information
- `experiences_with_host` - Experiences with host information
- `bookings_with_property` - Bookings with property details
- Additional optimized views for performance

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-pro

# Optional: Custom Keys
CUSTOM_KEY=your_custom_key
```

### Environment Setup Guides

- **Razorpay Setup**: See `RAZORPAY_SETUP.md` for detailed payment gateway configuration
- **Supabase Setup**: See `supabase/README_DATABASE_SCRIPTS.md` for database schema setup

## 📦 Installation

### Prerequisites

- Node.js >= 18.18.0
- npm or yarn
- Supabase account
- Razorpay account (for payments)
- Google Gemini API key (for AI features)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eja-homestay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up Supabase database**
   - Create a Supabase project
   - Run the SQL scripts in `supabase/` in order:
     - `01_schema_structure.sql`
     - `02_create_views.sql`
     - `03_misc_view.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:3000`

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:vercel # Build for Vercel (no lint)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Development Workflow

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Make changes**
   - Edit files in `src/`
   - Changes hot-reload automatically

3. **Test changes**
   - Check browser console for errors
   - Test API routes via `/api/*` endpoints

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## 🎨 Key Features

### 1. Authentication System
- Email/password authentication
- Google OAuth integration
- Profile management (guest/host roles)
- Password reset flow
- Session management with Supabase

### 2. Booking System
- **Multi-step Booking Wizard**
  - Date selection
  - Guest count selection
  - Room selection (if applicable)
  - Special requests
  - Payment processing
- **Room-based Inventory**
  - Real-time availability tracking
  - Multiple room types per property
  - Dynamic pricing
- **Booking Management**
  - Guest dashboard
  - Host dashboard
  - Booking status tracking
  - Cancellation handling

### 3. AI Chat Assistant
- **Gemini AI Integration**
  - Personalized travel recommendations
  - Mood detection from user messages
  - Conversation history
  - Context-aware responses
- **Features**
  - Inline chat interface
  - Floating chat button
  - AI-powered suggestions
  - Experience/retreat recommendations

### 4. Search & Discovery
- **Property Search**
  - Location-based search
  - Date availability filtering
  - Guest count filtering
  - Price range filtering
  - Property type filtering (Boutique, Cottage, Homely, Off-Beat)
  - Amenity filtering
  - Preference filtering (Families only, Females only, Pet-Friendly, Pure-Veg)
- **Experience Discovery**
  - Category-based browsing
  - Mood-based filtering
  - Location-based filtering
  - Price-based filtering

### 5. Social Features
- **Dares** - Social challenges
- **Engagements** - Likes, shares, follows
- **Stories** - User-generated content
- **Card Collaborations** - Collaborative experiences
- **Follow System** - User following

### 6. Payment Integration
- **Razorpay Integration**
  - Order creation
  - Payment processing
  - Payment confirmation
  - Refund handling
- **Payment Flow**
  - Secure payment gateway
  - Multiple payment methods
  - Transaction tracking

## 🏗️ Architecture

### Frontend Architecture

- **App Router** - Next.js 15 App Router for routing
- **Server Components** - Default server components for performance
- **Client Components** - Interactive components with `'use client'`
- **API Routes** - Serverless functions for backend logic
- **Context Providers** - React Context for global state (Auth)
- **Custom Hooks** - Reusable logic hooks

### Backend Architecture

- **Supabase** - Database and authentication backend
- **API Routes** - Next.js API routes for server logic
- **Row Level Security** - Supabase RLS for data security
- **Database Functions** - Reusable database query functions

### State Management

- **React Context** - Global auth state
- **Local State** - Component-level state with hooks
- **Server State** - Supabase real-time subscriptions
- **URL State** - Search filters in URL parameters

## 🔒 Security

### Security Features

- **Authentication** - Supabase Auth with secure sessions
- **Row Level Security** - Database-level access control
- **API Security** - Server-side validation
- **Environment Variables** - Secure credential management
- **Security Headers** - Configured in `next.config.ts`:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection
  - Strict-Transport-Security
  - Referrer-Policy
  - Permissions-Policy

### Best Practices

- Never expose API keys in client code
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production

## 📊 Performance Optimizations

### Implemented Optimizations

1. **Image Optimization**
   - Next.js Image component
   - WebP/AVIF formats
   - Responsive images
   - Lazy loading

2. **Code Splitting**
   - Lazy loading for heavy components
   - Dynamic imports for modals
   - Route-based code splitting

3. **Bundle Optimization**
   - Webpack bundle splitting
   - Vendor chunk separation
   - Tree shaking
   - Module concatenation

4. **Caching**
   - Image caching with TTL
   - API response caching
   - Static asset caching

5. **Performance Monitoring**
   - PerformanceMonitor component
   - Real-time performance tracking

## 🚢 Deployment

### Vercel Deployment

The project is configured for Vercel deployment:

1. **Connect Repository**
   - Import repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Use production keys for all services

3. **Build Settings**
   - Build Command: `npm run build:vercel`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Push to main branch triggers deployment
   - Preview deployments for PRs

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Razorpay keys configured (production)
- [ ] Gemini API key configured
- [ ] Build passes without errors
- [ ] Security headers verified
- [ ] SSL certificate active
- [ ] Domain configured (if applicable)

## 📝 API Documentation

### API Routes

#### `/api/ai-chat` - AI Chat Assistant
- **Method**: POST
- **Body**: `{ message: string, conversationHistory: Array }`
- **Response**: AI response with suggestions

#### `/api/bookings` - Booking Management
- **Method**: GET, POST
- **GET**: Fetch user bookings
- **POST**: Create new booking

#### `/api/payments/order` - Payment Processing
- **Method**: POST
- **Body**: Booking details
- **Response**: Razorpay order details

#### `/api/properties/[id]/rooms` - Property Rooms
- **Method**: GET
- **Params**: Property ID
- **Response**: Available rooms for property

#### `/api/user/profile` - User Profile
- **Method**: GET, PUT
- **GET**: Fetch user profile
- **PUT**: Update user profile

## 🧪 Testing

### Manual Testing Checklist

- [ ] Authentication flow (sign in, sign up, password reset)
- [ ] Property search and filtering
- [ ] Booking flow (complete booking wizard)
- [ ] Payment processing
- [ ] AI chat assistant
- [ ] Experience browsing
- [ ] Mobile responsiveness
- [ ] Form validations

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint for code quality
   - Write descriptive commit messages

2. **Component Structure**
   - Use TypeScript for all components
   - Separate concerns (UI, logic, data)
   - Create reusable components

3. **Database Changes**
   - Update schema in `supabase/` folder
   - Create migration scripts
   - Update TypeScript types

4. **API Changes**
   - Document API endpoints
   - Add error handling
   - Validate inputs

## 📚 Documentation

- **Database Setup**: `supabase/README_DATABASE_SCRIPTS.md`
- **Razorpay Setup**: `RAZORPAY_SETUP.md`
- **Component Documentation**: Inline comments in components
- **API Documentation**: Inline comments in API routes

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run lint`
   - Verify environment variables
   - Clear `.next` folder and rebuild

2. **Database Connection**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Verify database schema

3. **Payment Issues**
   - Verify Razorpay keys
   - Check network requests
   - Verify order creation

4. **AI Chat Not Working**
   - Verify Gemini API key
   - Check API rate limits
   - Verify network connectivity

## 📄 License

[Add your license information here]

## 👥 Team

[Add team information here]

## 🔗 Links

- **Production**: [Production URL]
- **Staging**: [Staging URL]
- **Documentation**: [Documentation URL]
- **Supabase Dashboard**: [Supabase URL]
- **Razorpay Dashboard**: [Razorpay Dashboard URL]

## 📞 Support

For support and questions:
- **Email**: [Support Email]
- **Issues**: [GitHub Issues URL]
- **Documentation**: [Documentation URL]

---

**Built with ❤️ by the EJA Team**

