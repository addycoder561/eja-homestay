# Pull Request Documentation

## Overview

This document outlines the structure, features, and implementation details of the EJA Homestay platform for pull request reviews and onboarding.

## Project Summary

**EJA Homestay** is a comprehensive travel and experience booking platform built with modern web technologies. The platform enables users to discover, book, and manage homestays, experiences, and retreats with AI-powered recommendations and seamless payment processing.

## Technology Stack

### Frontend
- **Next.js 15.4.1** (App Router)
- **React 19.0.0**
- **TypeScript 5.5.4**
- **Tailwind CSS 3.4.13**

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Next.js API Routes**
- **Razorpay** (Payments)
- **Google Gemini API** (AI)

## Key Features Implemented

### 1. Authentication System
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Profile management (guest/host roles)
- ✅ Password reset flow
- ✅ Session management

**Files:**
- `src/contexts/AuthContext.tsx`
- `src/app/auth/signin/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/lib/supabase.ts`

### 2. Booking System
- ✅ Multi-step booking wizard
- ✅ Date selection with availability
- ✅ Room-based inventory management
- ✅ Guest count selection
- ✅ Payment integration
- ✅ Booking confirmation

**Files:**
- `src/components/BookingWizard.tsx`
- `src/components/BookingForm.tsx`
- `src/app/api/bookings/route.ts`
- `src/lib/booking-api.ts`

### 3. Property Management
- ✅ Property listing pages
- ✅ Property detail pages
- ✅ Room configuration
- ✅ Availability tracking
- ✅ Search and filtering

**Files:**
- `src/app/property/[id]/page.tsx`
- `src/app/search/page.tsx`
- `src/app/api/properties/[id]/rooms/route.ts`
- `src/lib/database.ts` (property functions)

### 4. AI Chat Assistant
- ✅ Gemini AI integration
- ✅ Mood detection
- ✅ Personalized recommendations
- ✅ Conversation history
- ✅ Inline and floating UI

**Files:**
- `src/components/AIChatAssistant.tsx`
- `src/app/api/ai-chat/route.ts`
- `src/lib/gemini-client.ts`
- `src/lib/mood-detector.ts`

### 5. Experience & Retreat System
- ✅ Experience listing
- ✅ Retreat listing
- ✅ Category-based browsing
- ✅ Mood-based filtering
- ✅ Experience detail pages

**Files:**
- `src/app/experiences/page.tsx`
- `src/app/retreats/[id]/page.tsx`
- `src/components/ExperienceModal.tsx`
- `src/components/RetreatModal.tsx`

### 6. Payment Integration
- ✅ Razorpay order creation
- ✅ Payment processing
- ✅ Payment confirmation
- ✅ Transaction tracking

**Files:**
- `src/app/api/payments/order/route.ts`
- `src/components/PaymentSummary.tsx`
- `RAZORPAY_SETUP.md`

### 7. Social Features
- ✅ Dares system
- ✅ Engagement tracking (likes, shares, follows)
- ✅ Stories viewer
- ✅ Card collaborations

**Files:**
- `src/app/api/dares/route.ts`
- `src/app/api/dares/engagements/route.ts`
- `src/components/StoriesViewer.tsx`

## Database Schema

### Core Tables
1. **profiles** - User profiles and authentication
2. **properties** - Property listings with host info
3. **rooms** - Room configurations per property
4. **room_inventory** - Date-based availability
5. **bookings** - Booking records
6. **experiences** - Experience listings
7. **retreats** - Retreat listings
8. **micro_experiences** - Retreat experience types
9. **dares** - Social challenge features
10. **Engagement tables** - Likes, shares, follows

### Database Views
- `properties_with_host`
- `experiences_with_host`
- `bookings_with_property`
- Additional optimized views

**Schema Files:**
- `supabase/01_schema_structure.sql`
- `supabase/02_create_views.sql`
- `supabase/03_misc_view.sql`

## Architecture Decisions

### 1. App Router (Next.js 15)
- **Decision**: Use Next.js App Router instead of Pages Router
- **Rationale**: Modern routing, better performance, server components support
- **Impact**: All routes in `src/app/` directory

### 2. TypeScript Throughout
- **Decision**: Full TypeScript implementation
- **Rationale**: Type safety, better IDE support, fewer runtime errors
- **Impact**: All `.ts` and `.tsx` files with strict typing

### 3. Supabase for Backend
- **Decision**: Use Supabase for database and auth
- **Rationale**: Rapid development, built-in auth, real-time capabilities
- **Impact**: Database functions in `src/lib/database.ts`, auth in `AuthContext`

### 4. Component Organization
- **Decision**: Feature-based component organization
- **Rationale**: Better maintainability, clear separation of concerns
- **Impact**: Components in `src/components/`, grouped by feature

### 5. API Routes Structure
- **Decision**: RESTful API routes in `src/app/api/`
- **Rationale**: Next.js built-in API routes, serverless functions
- **Impact**: API endpoints in `src/app/api/` directory

## Code Quality & Standards

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` → `src/*`)
- Type checking in build process

### Code Style
- ESLint configured with Next.js rules
- Consistent naming conventions
- Component-based architecture

### Error Handling
- Try-catch blocks in async functions
- Error boundaries for React components
- User-friendly error messages

### Performance Optimizations
- Image optimization with Next.js Image
- Code splitting with lazy loading
- Bundle optimization in webpack config
- Service worker for PWA support

## Security Implementation

### Authentication Security
- Supabase Auth with secure sessions
- Row Level Security (RLS) policies
- Password reset with secure tokens

### API Security
- Server-side validation
- Environment variable protection
- Security headers in `next.config.ts`

### Data Security
- RLS policies on all tables
- Input sanitization
- SQL injection prevention (parameterized queries)

## Testing Strategy

### Manual Testing Areas
- Authentication flows
- Booking process
- Payment processing
- AI chat functionality
- Search and filtering
- Mobile responsiveness

### Testing Checklist
- [ ] User registration and login
- [ ] Property search and filtering
- [ ] Complete booking flow
- [ ] Payment processing
- [ ] AI chat responses
- [ ] Mobile UI/UX
- [ ] Form validations
- [ ] Error handling

## Deployment Configuration

### Vercel Configuration
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `.next`
- **Environment Variables**: Configured in Vercel dashboard
- **Function Timeout**: 30 seconds (configured in `vercel.json`)

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_GEMINI_API_KEY
NEXT_PUBLIC_GEMINI_MODEL
```

## Known Issues & Limitations

### Current Limitations
1. **Image Upload**: Currently using external URLs (Unsplash)
2. **Real-time Updates**: Limited real-time features
3. **Email Notifications**: Basic email functionality
4. **Analytics**: Basic analytics implementation

### Future Enhancements
- [ ] Image upload functionality
- [ ] Enhanced real-time features
- [ ] Email notification system
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced search filters

## Dependencies

### Production Dependencies
```json
{
  "@headlessui/react": "^2.2.9",
  "@heroicons/react": "^2.1.5",
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.49.0",
  "next": "^15.4.1",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-hot-toast": "^2.4.1",
  "tailwindcss": "^3.4.13"
}
```

### Key Dependencies
- **Next.js**: Framework and routing
- **Supabase**: Database and authentication
- **Tailwind CSS**: Styling
- **React Hot Toast**: Notifications
- **Date-fns**: Date utilities

## File Structure Highlights

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and API clients
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `supabase/` - Database schema SQL files

### Important Files
- `next.config.ts` - Next.js configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `package.json` - Dependencies and scripts

## Review Checklist

### Code Review
- [ ] TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Components are reusable
- [ ] API routes have proper validation
- [ ] Database queries are optimized
- [ ] Security best practices followed

### Functionality Review
- [ ] Features work as expected
- [ ] Edge cases are handled
- [ ] User experience is smooth
- [ ] Mobile responsiveness verified
- [ ] Performance is acceptable

### Documentation Review
- [ ] Code comments are clear
- [ ] README is updated
- [ ] API documentation is complete
- [ ] Environment variables are documented

## Setup Instructions for Reviewers

### Prerequisites
- Node.js >= 18.18.0
- npm or yarn
- Supabase account (for testing)
- Razorpay test account (for payment testing)

### Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Create `.env.local` with required variables
4. Set up Supabase database (run SQL scripts)
5. Run development server: `npm run dev`
6. Test key features

### Testing Accounts
- Test user credentials (if applicable)
- Test payment methods
- Admin access (if applicable)

## Performance Metrics

### Current Performance
- **Lighthouse Score**: [To be measured]
- **First Contentful Paint**: [To be measured]
- **Time to Interactive**: [To be measured]
- **Bundle Size**: [To be measured]

### Optimization Opportunities
- Further code splitting
- Image optimization improvements
- Caching strategies
- Database query optimization

## Security Considerations

### Security Measures
- ✅ Environment variables for sensitive data
- ✅ Row Level Security (RLS) policies
- ✅ Input validation on API routes
- ✅ Security headers configured
- ✅ HTTPS enforcement

### Security Review Items
- [ ] No hardcoded secrets
- [ ] API routes are protected
- [ ] User inputs are validated
- [ ] SQL injection prevention
- [ ] XSS protection

## Migration Notes

### Database Migrations
- Run `supabase/01_schema_structure.sql` first
- Then `supabase/02_create_views.sql`
- Finally `supabase/03_misc_view.sql`

### Data Migration
- Existing data structure (if applicable)
- Migration scripts needed
- Data validation required

## Rollback Plan

### Rollback Steps
1. Revert to previous deployment
2. Restore database backup (if needed)
3. Verify environment variables
4. Test critical functionality

## Contact & Support

### For Questions
- Technical questions: [Contact Info]
- Business logic questions: [Contact Info]
- Deployment questions: [Contact Info]

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Razorpay Documentation**: https://razorpay.com/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

---

**Review Status**: Ready for Review
**Target Branch**: `main`
**Priority**: High

