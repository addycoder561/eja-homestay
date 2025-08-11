# EJA Homestay - Modern Travel Platform

A modern, responsive travel platform built with Next.js 15, TypeScript, and Supabase. Discover amazing properties, book experiences, and plan your next adventure with confidence.

## ✨ Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Property Search**: Advanced search with filters and location autocomplete
- **Booking System**: Complete booking workflow with payment integration
- **User Authentication**: Secure authentication with Supabase Auth
- **Wishlist**: Save and manage favorite properties
- **Experiences & Retreats**: Book local experiences and wellness retreats
- **Host Dashboard**: Property management for hosts
- **Real-time Updates**: Live ratings and availability updates
- **Mobile Optimized**: Perfect experience on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Custom animations
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Icons**: Heroicons
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eja-homestay.git
   cd eja-homestay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run migrations**
   ```bash
   npx supabase db push
   ```

3. **Set up Row Level Security (RLS)**
   The migrations include RLS policies for secure data access.

## 🚀 Deployment to Vercel

### Automatic Deployment (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure Environment Variables**
   In your Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Deploy**
   Vercel will automatically deploy on every push to main branch.

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |

### Vercel Configuration

The project includes a `vercel.json` file with optimized settings for:
- Performance optimization
- Security headers
- API route configuration
- Image optimization

## 📱 Features Overview

### For Travelers
- **Search Properties**: Advanced search with filters
- **Book Accommodations**: Seamless booking process
- **Save Favorites**: Wishlist functionality
- **Book Experiences**: Local activities and tours
- **Join Retreats**: Wellness and adventure retreats
- **User Dashboard**: Manage bookings and profile

### For Hosts
- **Property Management**: Add and manage properties
- **Booking Management**: Handle guest bookings
- **Analytics**: View property performance
- **Host Dashboard**: Comprehensive management tools

## 🎨 Design System

The project uses a comprehensive design system with:
- **Color Palette**: Blue and indigo primary colors
- **Typography**: Inter font family
- **Components**: Reusable UI components
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach

## 🔒 Security

- **Authentication**: Supabase Auth with email/password
- **Row Level Security**: Database-level security policies
- **CORS Protection**: Configured for API routes
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Form validation and sanitization

## 📊 Performance

- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Automatic code splitting
- **Bundle Optimization**: Optimized webpack configuration
- **Caching**: Strategic caching strategies
- **CDN**: Vercel's global CDN

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## 📈 Monitoring

The application includes:
- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: Core Web Vitals tracking
- **Analytics**: Ready for Google Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ejahomestay.com or create an issue in this repository.

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Following the repository
- Checking the releases page
- Reading the changelog

---

**Built with ❤️ by the EJA Homestay team**
