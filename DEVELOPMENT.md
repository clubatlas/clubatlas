# ClubAtlas Development Guide

## Project Structure

```
ClubAtlas/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router
│   │   ├── welcome/             # Welcome page
│   │   └── ...
│   └── lib/                      # Shared libraries
│       └── api/                  # API clients
│           ├── client.ts         # API client utility
│           └── index.ts
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration management
│   │   ├── api/                 # API endpoints
│   │   ├── models/              # Data models
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utility functions
│   ├── run.py                   # Run script
│   └── requirements.txt         # Python dependencies
└── public/                       # Static files
```

## Development Workflow

### 1. Developing New Features

#### Frontend
1. Create new pages/components under `src/app/`
2. Use API clients from `src/lib/api/`
3. Style with CSS Modules

#### Backend
1. Add new endpoints in `backend/app/api/`
2. Define data models in `backend/app/models/`
3. Implement business logic in `backend/app/services/`

### 2. API Communication

Example of calling backend API from frontend:

```typescript
import { apiClient, checkHealth } from '@/lib/api';

// GET request
const response = await apiClient.get('/health');

// POST request
const response = await apiClient.post('/api/clubs', {
  name: 'Example Club',
  description: '...'
});
```

### 3. Environment Variables

#### Frontend
- Use `.env.local` file
- `NEXT_PUBLIC_` prefix required (accessible from client)

#### Backend
- Use `backend/.env` file
- Auto-loaded with `python-dotenv`

## Testing

### Frontend Testing
```bash
npm run lint
```

### Backend Testing
```bash
cd backend
# pytest to be added in the future
```

## Build & Deployment

### Frontend Build
```bash
npm run build
npm start
```

### Backend Deployment
```bash
cd backend
# Configure for production environment, then:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Backend blocking frontend requests
- Check `ALLOWED_ORIGINS` in `backend/.env`
- Verify CORS configuration

### API connection failure
- Verify backend server is running
- Check `NEXT_PUBLIC_API_URL` environment variable
- Check browser console for errors

### Port conflicts
- Frontend: Modify `dev` script in `package.json`
- Backend: Change `PORT` in `backend/.env`
