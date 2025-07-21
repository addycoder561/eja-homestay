# EJA Homestay - Online Travel Agency Platform

A full-featured online travel agency platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. This MVP provides a complete booking system for vacation rentals and accommodations.

## 🚀 Features

### For Travelers
- **Property Search & Discovery**: Browse properties with advanced filtering
- **Property Details**: View detailed information, amenities, and reviews
- **Booking System**: Reserve properties with date selection and guest count
- **User Authentication**: Secure sign-up and sign-in functionality
- **Booking Management**: View and manage your reservations
- **Reviews & Ratings**: Leave reviews for properties you've stayed at

### For Hosts
- **Property Management**: Add, edit, and manage your properties
- **Booking Management**: View and manage incoming bookings
- **Host Dashboard**: Overview of your hosting business

### Technical Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Database**: Powered by Supabase with PostgreSQL
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Beautiful, accessible interface with Tailwind CSS
- **Authentication**: Secure user authentication with Supabase Auth
- **Image Management**: Property image galleries
- **Search & Filtering**: Advanced search with multiple filters

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Custom component library
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd eja-homestay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Install Supabase CLI (optional but recommended):
```bash
npm install -g supabase
```

2. Run the database migrations:
```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
```

3. Seed the database with sample data:
```bash
# If using Supabase CLI
supabase db reset

# Or manually run the SQL in supabase/seed.sql
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
eja-homestay/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/              # Authentication pages
│   │   ├── property/          # Property detail pages
│   │   ├── search/            # Search page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── Navigation.tsx    # Navigation component
│   │   ├── Footer.tsx        # Footer component
│   │   └── ...               # Other components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   └── lib/                  # Utility functions
│       ├── database.ts       # Database operations
│       ├── supabase.ts       # Supabase client
│       └── types.ts          # TypeScript types
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── seed.sql             # Sample data
│   └── config.toml          # Supabase config
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profiles and authentication data
- **properties**: Property listings with details and images
- **bookings**: Reservation records
- **reviews**: User reviews and ratings

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration

The project includes a complete Supabase setup with:
- Row Level Security (RLS) policies
- Automatic profile creation on signup
- Database triggers for timestamps
- Sample data for testing

## 🎨 Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.js`
- Customize component styles in individual component files

### Components
- All UI components are in `src/components/ui/`
- Customize the design system by modifying these base components

### Database
- Add new tables in `supabase/migrations/`
- Update types in `src/lib/types.ts`
- Modify database operations in `src/lib/database.ts`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 Features in Detail

### Authentication
- Email/password authentication
- Automatic profile creation
- Protected routes
- Session management

### Property Management
- CRUD operations for properties
- Image upload and management
- Amenity management
- Availability tracking

### Booking System
- Date range selection
- Guest count validation
- Price calculation
- Availability checking
- Booking status management

### Search & Filtering
- Location-based search
- Date filtering
- Price range filtering
- Property type filtering
- Amenity filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Payment integration (Stripe)
- [ ] Real-time messaging between hosts and guests
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced search with maps
- [ ] Social login (Google, Facebook)
- [ ] Email notifications
- [ ] Calendar integration

---

Built with ❤️ using Next.js and Supabase
