# Olive Frontend - React

React frontend for the Olive application built with Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

The API URL is configured in `src/App.jsx`:
```javascript
const API_URL = 'http://localhost:8000'
```

Change this to your backend URL in production.

## Features

- Fetches and displays items from FastAPI backend
- Modern UI with gradient styling
- Responsive grid layout
- Error handling and loading states
