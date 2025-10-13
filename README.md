# WhatsUP - Event Discovery Platform

A modern React-based event discovery application with real-time search, multi-language support, and user authentication.

**Original Figma Design**: https://www.figma.com/design/zOpq9s8sFFXS5wMOrvA0Z6/Whatsup-V0.9.1

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## ✨ Features

### Core Functionality
- **Real-Time Event Search**: AI-powered event discovery via Supabase Edge Functions
- **Interactive Map View**: View events on an interactive Leaflet map
- **Advanced Filtering**: Filter by location, radius, categories, price, time, and more
- **Event Cards**: Rich event display with images, dates, pricing, and ticket links

### User Features
- **Email OTP Authentication**: Passwordless login with 6-digit verification codes
- **User Profiles**: Collect and manage user information (name, phone, birthday, location)
- **Saved Events**: Bookmark favorite events for later viewing
- **Multi-Language Support**: Interface available in English, German, French, and Spanish

### Technical Features
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS)
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first UI with desktop optimization
- **Type Safety**: Full TypeScript implementation

## 🏗️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI Components**: Radix UI + shadcn/ui + Tailwind CSS
- **Maps**: Leaflet
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with Email OTP

## 📁 Project Structure

```
whatsUP/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── EventCard.tsx # Event display cards
│   │   ├── MapView.tsx   # Interactive map
│   │   ├── SettingsScreen.tsx # Settings & auth
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── LanguageContext.tsx # Multi-language support
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.tsx   # Authentication hook
│   ├── lib/              # Utilities
│   │   └── supabase.ts   # Supabase client
│   ├── pages/            # Page components
│   │   ├── UserProfile.tsx
│   │   ├── SavedEvents.tsx
│   │   └── LanguageSelection.tsx
│   └── types/            # TypeScript definitions
├── supabase/
│   ├── functions/        # Edge Functions
│   │   └── search-events/
│   └── migrations/       # Database migrations
│       ├── 001_initial_schema.sql
│       └── 002_add_user_profiles.sql
└── public/               # Static assets
```

## 🔧 Setup & Configuration

### 1. Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Run the migrations in order:
1. `001_initial_schema.sql` - Core tables (events, user_saved_events)
2. `002_add_user_profiles.sql` - User profiles table

See `SUPABASE_SETUP.md` for detailed instructions.

### 3. Authentication Setup

- Email OTP is configured by default in Supabase Auth
- No additional setup required for basic functionality
- See `EMAIL_OTP_SETUP.md` for customization options

## 🌍 Multi-Language Support

The app supports 4 languages:
- 🇬🇧 English
- 🇩🇪 German (Deutsch)
- 🇫🇷 French (Français)
- 🇪🇸 Spanish (Español)

Language preference is stored in localStorage and persists across sessions.

**Note**: Language switching is currently in development. Some components may still display in German.

## 📊 Database Schema

### Events Table
```sql
- id: UUID (primary key)
- title: TEXT
- description: TEXT
- date: TIMESTAMPTZ
- location: TEXT
- category: TEXT
- price: TEXT
- image_url: TEXT
- ticket_link: TEXT
```

### User Profiles Table
```sql
- user_id: UUID (foreign key to auth.users)
- full_name: TEXT
- phone_number: TEXT
- date_of_birth: DATE
- location: TEXT
- avatar_url: TEXT
```

### User Saved Events Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- event_id: UUID (foreign key)
- saved_at: TIMESTAMPTZ
- notes: TEXT
```

## 🔐 Authentication Flow

1. **Email Entry**: User enters email address
2. **OTP Verification**: 6-digit code sent via email
3. **Profile Creation**: New users complete profile (name, phone, birthday, location)
4. **Session Management**: JWT-based sessions with automatic refresh

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗺️ Features in Development

- [ ] Complete multi-language translation implementation
- [ ] Push notifications for saved events
- [ ] Advanced search filters (accessibility, age groups, features)
- [ ] Event recommendations based on user preferences
- [ ] Social sharing features
- [ ] Calendar integration

## 📚 Documentation

- `CLAUDE.md` - Project architecture and session history
- `SUPABASE_SETUP.md` - Database setup instructions
- `EMAIL_OTP_SETUP.md` - Authentication configuration
- `USER_PROFILE_SETUP.md` - User profile management
- `AUTHENTICATION_GUIDE.md` - Complete authentication guide

## 🤝 Contributing

This project is currently in active development. Please refer to the project roadmap in `CLAUDE.md` for planned features and improvements.

## 📄 License

[Your License Here]

## 🔗 Links

- Figma Design: https://www.figma.com/design/zOpq9s8sFFXS5wMOrvA0Z6/Whatsup-V0.9.1
- Supabase: https://supabase.com
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org