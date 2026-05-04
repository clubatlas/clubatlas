# ClubAtlas Testing Guide

## Quick Start Testing

### 1. Backend Server Test

```bash
cd backend
python run.py
```

**Verify**:
- Server is running at `http://localhost:8000`
- Access `http://localhost:8000/docs` in browser to view API docs
- Access `http://localhost:8000/health` and verify `{"status": "healthy", "service": "ClubAtlas API"}` response

### 2. Frontend Server Test

```bash
npm run dev
```

**Verify**:
- Server is running at `http://localhost:3000`
- Access `http://localhost:3000` in browser to view Welcome page
- Verify page matches Figma design

### 3. API Connection Test

**Method 1: Browser Console**
1. Open developer tools with F12 on frontend page
2. Run in Console tab:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

**Method 2: ApiTest Component (dev mode)**
- Add ApiTest component to Welcome page for testing

**Method 3: curl**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/
```

## Checklist

### Backend
- [ ] FastAPI server starts successfully
- [ ] `/health` endpoint returns `{"status": "healthy"}`
- [ ] Swagger UI displays correctly at `/docs`
- [ ] CORS settings work correctly (frontend can call API)

### Frontend
- [ ] Next.js server starts successfully
- [ ] Welcome page renders correctly
- [ ] All components display correctly (logo, cards, features section)
- [ ] Responsive design works on mobile/tablet
- [ ] Images load correctly

### Integration
- [ ] Frontend can call backend API
- [ ] No CORS errors
- [ ] Both servers can run simultaneously

## Troubleshooting

### Backend won't start
1. Check Python version: `python --version` (3.9+ required)
2. Verify virtual environment is activated
3. Verify dependencies are installed: `pip list`
4. Check if port 8000 is in use

### Frontend won't start
1. Check Node.js version: `node --version` (18+ required)
2. Verify dependencies are installed: `npm list`
3. Check if port 3000 is in use

### CORS errors
1. Check `ALLOWED_ORIGINS` in `backend/.env`
2. Verify frontend URL is in allowed list
3. Restart backend server

### API connection failure
1. Verify backend server is running
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Check requests in browser Network tab
