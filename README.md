# EventFinder React App

A modern React.js frontend for the EventFinder application, migrated from vanilla JavaScript with enhanced user experience and Vercel deployment.

## Features

- **Modern React Architecture**: Built with TypeScript, hooks, and context API
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Search Functionality**: Advanced event search with filters
- **User Authentication**: JWT-based authentication with refresh tokens
- **Event Discovery**: Featured events and personalized recommendations
- **Real-time Updates**: Live search results and status updates
- **API Integration**: Seamless integration with AWS Lambda backend

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules with CSS Custom Properties
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Backend**: AWS Lambda Functions (existing)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventfinder-react
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your configuration:
```env
REACT_APP_API_URL=https://qk3jiyk1e8.execute-api.ap-south-1.amazonaws.com/prod
```

### Development

Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Building

Build for production:
```bash
npm run build
```

## Deployment to Vercel

### Quick Deploy

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Environment Variables

Set these environment variables in your Vercel dashboard:

- `REACT_APP_API_URL`: Your AWS API Gateway URL

### Custom Domain

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header/         # Navigation header
│   ├── Hero/           # Hero section
│   ├── SearchModal/    # Search form modal
│   └── EventCard/      # Event display card
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts          # API client and services
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
├── config/            # Configuration files
│   └── constants.ts   # App constants
├── styles/            # Global styles
│   └── globals.css    # Global CSS variables and base styles
└── App.tsx            # Main app component
```

## Migration Notes

This React app replaces the vanilla JavaScript frontend while maintaining:

- **Same API endpoints**: No backend changes required
- **Feature parity**: All original features preserved
- **Improved UX**: Enhanced user experience and performance
- **Modern architecture**: Scalable and maintainable codebase
