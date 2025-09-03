# 🚀 Complete Hostinger Deployment Guide for riviso.com

## 📋 **Prerequisites Checklist**

Before starting, ensure you have:
- [ ] Hostinger hosting account
- [ ] Domain `riviso.com` registered and pointed to Hostinger
- [ ] Access to Hostinger control panel
- [ ] Basic understanding of file uploads

## 🎯 **Step-by-Step Deployment Process**

### **Step 1: Prepare Your Local Environment**

1. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **This will create a `deployment` folder with all necessary files**

### **Step 2: Hostinger Server Setup**

#### **2.1 Access Hostinger Control Panel**
1. Log into your Hostinger account
2. Go to "Hosting" → Select your domain
3. Access "File Manager" or use FTP

#### **2.2 Create Database**
1. Go to "Databases" → "MySQL Databases"
2. Create new database: `riviso_prod`
3. Create database user with full privileges
4. **Note down these credentials:**
   - Database name: `riviso_prod`
   - Username: `your_username`
   - Password: `your_password`
   - Host: `localhost` (usually)

#### **2.3 Upload Files**
1. Navigate to `public_html` folder
2. Upload the entire `deployment` folder contents
3. Extract if compressed

### **Step 3: Configuration**

#### **3.1 Update Environment Variables**
1. Rename `production-config.env` to `.env`
2. Edit the file with your database credentials:

```env
# Update these with your Hostinger database details
DB_HOST=localhost
DB_NAME=riviso_prod
DB_USER=your_actual_username
DB_PASSWORD=your_actual_password

# Update domain settings
NEXT_PUBLIC_API_URL=https://riviso.com/api
NEXT_PUBLIC_APP_URL=https://riviso.com
ALLOWED_HOSTS=riviso.com,www.riviso.com
```

#### **3.2 Set File Permissions**
```bash
# Set proper permissions (if you have SSH access)
chmod 755 public_html/
chmod 644 public_html/.env
chmod 755 public_html/backend/
chmod 755 public_html/frontend/
```

### **Step 4: Backend Setup**

#### **4.1 Install Python Dependencies**
If Hostinger supports Python (check with support):

```bash
cd public_html/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### **4.2 Run Database Migrations**
```bash
alembic upgrade head
```

#### **4.3 Start Backend Server**
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### **Step 5: Frontend Setup**

#### **5.1 Install Node.js Dependencies**
If Hostinger supports Node.js:

```bash
cd public_html/frontend
npm install
npm run build
npm start
```

#### **5.2 Alternative: Static Export**
If Node.js isn't available, use static export:

```bash
cd apps/web
npm run build
npm run export
# Upload the 'out' folder contents to public_html
```

### **Step 6: Domain Configuration**

#### **6.1 DNS Settings**
1. In your domain registrar (where you bought riviso.com):
   - Set A record: `riviso.com` → Hostinger IP
   - Set CNAME: `www.riviso.com` → `riviso.com`

#### **6.2 SSL Certificate**
1. In Hostinger control panel:
   - Go to "SSL" section
   - Enable "Let's Encrypt" (free SSL)
   - Force HTTPS redirect

### **Step 7: Testing**

#### **7.1 Basic Tests**
1. Visit `https://riviso.com`
2. Check if the homepage loads
3. Try creating an audit
4. Verify all features work

#### **7.2 Performance Tests**
1. Test page load speed
2. Check mobile responsiveness
3. Verify SEO audit functionality

## 🔧 **Alternative Deployment Options**

### **Option A: Vercel (Recommended for Frontend)**
1. Connect your GitHub repo to Vercel
2. Deploy frontend to Vercel (free)
3. Use Hostinger only for backend

### **Option B: Netlify (Alternative)**
1. Deploy frontend to Netlify
2. Use Hostinger for backend API

### **Option C: Full Hostinger**
1. Use Hostinger for both frontend and backend
2. May require higher hosting plan for Node.js support

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: Database Connection Failed**
- Check database credentials in `.env`
- Verify database exists in Hostinger
- Ensure user has proper permissions

### **Issue 2: Frontend Not Loading**
- Check if files are in `public_html`
- Verify `index.html` exists
- Check file permissions

### **Issue 3: API Not Working**
- Verify backend is running on port 8000
- Check CORS settings
- Ensure API URL is correct in frontend

### **Issue 4: SSL Certificate Issues**
- Wait 24-48 hours for SSL to propagate
- Clear browser cache
- Check DNS propagation

## 📞 **Getting Help**

### **Hostinger Support**
- Live chat in control panel
- Email support
- Knowledge base

### **Technical Issues**
- Check error logs in `/var/log/`
- Use browser developer tools
- Test API endpoints directly

## 🎉 **Going Live Checklist**

- [ ] Domain points to Hostinger
- [ ] SSL certificate active
- [ ] Database configured and working
- [ ] Backend API responding
- [ ] Frontend loading correctly
- [ ] SEO audit functionality working
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## 💰 **Cost Breakdown**

- **Domain**: $10-15/year (riviso.com)
- **Hostinger Hosting**: $2-5/month (shared hosting)
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$35-75/year

## 🚀 **Post-Launch Optimization**

1. **Performance**
   - Enable caching
   - Optimize images
   - Use CDN if needed

2. **SEO**
   - Submit sitemap to Google
   - Set up Google Analytics
   - Monitor Core Web Vitals

3. **Security**
   - Regular backups
   - Security updates
   - Monitor for vulnerabilities

4. **Monitoring**
   - Uptime monitoring
   - Error tracking
   - Performance monitoring

---

**🎯 Your riviso.com will be live and ready to audit websites!**
