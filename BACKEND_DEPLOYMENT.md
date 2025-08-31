# 🚀 Backend Deployment Guide - AI Video Summarizer

## 🔧 **Why You Need to Deploy Backend**

Your frontend is working on Firebase, but uploads fail because:
- ❌ **Backend is local** (only accessible from your computer)
- ✅ **Frontend is on Firebase** (accessible worldwide)
- 🔗 **No connection** between them

## 🎯 **Deploy Backend to Render (Recommended)**

### **Step 1: Prepare Your Repository**
1. **Push your code to GitHub** (if not already done)
2. **Ensure backend folder is included**

### **Step 2: Deploy on Render**
1. **Go to**: [render.com](https://render.com)
2. **Sign up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure**:
   - **Name**: `ai-video-summarizer-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### **Step 3: Set Environment Variables**
In Render dashboard, add these:
```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
TRANSCRIPTION_SERVICE=custom
SUMMARIZATION_SERVICE=openai
TRANSLATION_SERVICE=custom
ENABLE_FALLBACK_SERVICES=true
```

### **Step 4: Deploy**
Click "Create Web Service" and wait 2-3 minutes.

---

## 🔗 **Update Frontend to Use Deployed Backend**

After backend deployment, update your frontend to use the new backend URL:

### **Step 1: Get Your Backend URL**
Your backend will be available at: `https://your-backend-name.onrender.com`

### **Step 2: Update Frontend API Calls**
In `frontend/js/app.js`, update the API base URL:

```javascript
// Change from localhost to your deployed backend URL
const API_BASE_URL = 'https://your-backend-name.onrender.com';
```

### **Step 3: Redeploy Frontend**
```bash
firebase deploy
```

---

## 🚂 **Alternative: Deploy to Railway**

### **Step 1: Setup Railway**
1. **Go to**: [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **Click "New Project" → "Deploy from GitHub repo"**

### **Step 2: Configure**
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### **Step 3: Set Environment Variables**
Same as Render above.

---

## 🎪 **Alternative: Deploy to Heroku**

### **Step 1: Install Heroku CLI**
```bash
npm install -g heroku
```

### **Step 2: Login & Create App**
```bash
heroku login
heroku create your-backend-app-name
```

### **Step 3: Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GEMINI_API_KEY=your_key
```

### **Step 4: Deploy**
```bash
git push heroku main
```

---

## ✅ **After Backend Deployment**

### **Test Your Complete App:**
1. **Frontend**: https://ai-video-summarizer-6fffc.web.app
2. **Backend**: Your deployed backend URL
3. **Test upload**: Upload a video and process it
4. **Verify all features**: Transcription, summarization, translation, PDF export

### **Your App Architecture:**
```
Frontend (Firebase) ←→ Backend (Render/Railway/Heroku)
```

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required vars are set
3. **CORS Issues**: Backend should allow requests from Firebase domain
4. **File Upload Errors**: Check file size limits

### **Debug Commands:**
```bash
# Check backend logs
# Render/Railway: Use dashboard logs
# Heroku: heroku logs --tail
```

---

## 🌟 **Success!**

Once backend is deployed and frontend is updated:
- ✅ **Complete full-stack app**
- ✅ **Video uploads working**
- ✅ **AI processing functional**
- ✅ **PDF export working**
- ✅ **Authentication secure**

Your AI Video Summarizer will be fully operational! 🎉
