# 🚀 AI Video Summarizer - Deployment Guide

## 📋 **Prerequisites**
- GitHub account
- OpenAI API key
- Gemini API key (optional, for fallback)
- Video files for testing

## 🎯 **Option 1: Deploy to Render (Recommended)**

### **Step 1: Prepare Your Repository**
1. Push your code to GitHub
2. Ensure all files are committed

### **Step 2: Deploy on Render**
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-video-summarizer`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### **Step 3: Set Environment Variables**
In Render dashboard, add these environment variables:
```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_actual_openai_key
GEMINI_API_KEY=your_actual_gemini_key
TRANSCRIPTION_SERVICE=custom
SUMMARIZATION_SERVICE=openai
TRANSLATION_SERVICE=custom
ENABLE_FALLBACK_SERVICES=true
```

### **Step 4: Deploy**
Click "Create Web Service" and wait for deployment.

---

## 🚂 **Option 2: Deploy to Railway**

### **Step 1: Setup Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### **Step 2: Configure**
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### **Step 3: Set Environment Variables**
Same as Render above.

---

## 🎪 **Option 3: Deploy to Heroku**

### **Step 1: Install Heroku CLI**
```bash
npm install -g heroku
```

### **Step 2: Login & Create App**
```bash
heroku login
heroku create your-app-name
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

## 🔧 **Post-Deployment Setup**

### **1. Test Your App**
- Visit your deployed URL
- Test video upload and processing
- Verify PDF export functionality

### **2. Monitor Logs**
- Check for any errors
- Monitor API usage
- Verify environment variables

### **3. Set Up Custom Domain (Optional)**
- Configure DNS settings
- Set up SSL certificate

---

## ⚠️ **Important Notes**

### **File Storage**
- Render/Railway/Heroku have ephemeral file systems
- Uploaded videos will be temporary
- Consider using cloud storage (AWS S3, Cloudinary) for production

### **API Limits**
- Monitor OpenAI API usage
- Set up billing alerts
- Consider rate limiting

### **Performance**
- Free tiers have limitations
- Consider upgrading for production use
- Monitor response times

---

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required vars are set
3. **Port Issues**: Use `process.env.PORT` in production
4. **File Upload Errors**: Check file size limits

### **Debug Commands**
```bash
# Check logs
heroku logs --tail  # Heroku
# Render/Railway: Use dashboard logs

# Check environment
heroku config  # Heroku
# Render/Railway: Use dashboard
```

---

## 🌟 **Success!**

Your AI Video Summarizer is now deployed and accessible worldwide! 

**Next Steps:**
- Share your app URL
- Monitor usage and performance
- Consider adding analytics
- Set up monitoring and alerts

---

## 📞 **Need Help?**

- Check the logs in your deployment platform
- Verify environment variables
- Test locally first
- Check API key validity
