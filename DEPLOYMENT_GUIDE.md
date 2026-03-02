# Safari Blogs - Render Deployment Guide

## Prerequisites
1. GitHub account
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (for production database)

---

## Part 1: Setup MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/userManagement`)
5. Replace `<password>` with your actual password
6. Save this connection string for later

---

## Part 2: Push Code to GitHub

### Backend Repository
```bash
cd christo_Nodejs
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin <your-backend-repo-url>
git push -u origin main
```

### Frontend Repository
```bash
cd christo_Reactjs
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin <your-frontend-repo-url>
git push -u origin main
```

---

## Part 3: Deploy Backend on Render

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (christo_Nodejs)
   - Configure:
     - **Name:** safari-blogs-backend
     - **Environment:** Node
     - **Region:** Choose closest to you
     - **Branch:** main
     - **Root Directory:** (leave empty or set to `christo_Nodejs` if using monorepo)
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   PORT = 10000
   MONGODB_URI = <your-mongodb-atlas-connection-string>
   JWT_SECRET = <generate-a-random-secret-key>
   NODE_ENV = production
   BASE_URL = https://safari-blogs-backend.onrender.com
   ```

4. **Create Service**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your backend URL (e.g., `https://safari-blogs-backend.onrender.com`)

---

## Part 4: Deploy Frontend on Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository (christo_Reactjs)
   - Configure:
     - **Name:** safari-blogs-frontend
     - **Branch:** main
     - **Root Directory:** (leave empty or set to `christo_Reactjs` if using monorepo)
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`

2. **Add Environment Variables**
   ```
   VITE_API_URL = https://safari-blogs-backend.onrender.com/api
   NODE_ENV = production
   ```

3. **Create Static Site**
   - Click "Create Static Site"
   - Wait 5-10 minutes for deployment
   - Your frontend will be live at `https://safari-blogs-frontend.onrender.com`

---

## Part 5: Update Frontend API Calls

In your React app, create a config file to use the environment variable:

**Create: `christo_Reactjs/src/config.js`**
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3009/api';
```

Then update all API calls to use this:
```javascript
import { API_URL } from './config';

// Example:
axios.get(`${API_URL}/users`)
```

---

## Part 6: Update CORS in Backend

Make sure your backend allows requests from your frontend domain:

**In `christo_Nodejs/app.js`:**
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://safari-blogs-frontend.onrender.com'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

---

## Important Notes

### Free Tier Limitations
- Backend spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- 750 hours/month free

### Troubleshooting
1. **Check Logs:** Render Dashboard → Your Service → Logs
2. **Database Connection:** Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Render)
3. **Environment Variables:** Double-check all variables are set correctly
4. **Build Errors:** Check Node version compatibility

### Monitoring
- Backend health: `https://safari-blogs-backend.onrender.com/`
- Should return: "Safari Blogs Backend is running 🚀"

---

## Alternative: Deploy as Monorepo (Optional)

If you want to deploy both from a single repository:

1. Push entire `Safari-Blogs` folder to GitHub
2. When creating services on Render:
   - Backend: Set Root Directory to `christo_Nodejs`
   - Frontend: Set Root Directory to `christo_Reactjs`

---

## Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] MongoDB Atlas connection is working
- [ ] Frontend loads without errors
- [ ] API calls from frontend to backend work
- [ ] File uploads work (test image upload)
- [ ] Authentication/JWT works
- [ ] All routes are accessible

---

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test API endpoints with Postman
4. Check MongoDB Atlas network access

Good luck with your deployment! 🚀
