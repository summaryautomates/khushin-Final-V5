# KHUSHIN E-commerce Deployment Guide

This guide will help you deploy your KHUSHIN e-commerce platform on Replit.

## Prerequisites

Before deploying, make sure you have:
- Built your application with `npm run build`
- Set up the required environment variables

## Setting Up Environment Variables

Your application requires the following environment variables:

1. **NODE_ENV**: Set to `production` for deployment
2. **SESSION_SECRET**: Required for secure session management
3. **PORT**: Set to `8080` (Replit's default production port)
4. **DATABASE_URL**: Should already be set up for your PostgreSQL database

## Deployment Steps

### Option 1: Using the Deployment Helper Scripts

1. **Prepare for deployment**:
   ```bash
   node deploy.js
   ```
   This script will:
   - Build your application
   - Verify the build files
   - Set up necessary environment variables for the current session

2. **Click the "Deploy" button** in your Replit workspace.

3. **Configure environment variables** in the deployment settings:
   - NODE_ENV=production
   - SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289
   - PORT=8080

### Option 2: Manual Deployment

1. **Build your application**:
   ```bash
   npm run build
   ```

2. **Add environment variables**:
   - Go to the "Secrets" tab in your Replit workspace
   - Add the necessary environment variables (NODE_ENV, SESSION_SECRET, PORT)

3. **Configure deployment settings**:
   - Click on the three dots in the top right corner
   - Select "Deployment"
   - Click "Configure Deployment"
   - Make sure the run command is set to `NODE_ENV=production node dist/index.js`
   - Add the environment variables mentioned above

4. **Deploy**:
   - Click the "Deploy" button

## Troubleshooting

If you encounter issues with deployment:

1. **Check environment variables**:
   Use `node deployment-checker.js` to verify all required environment variables are set.

2. **Verify build files**:
   Ensure the build was successful by checking for the existence of the `dist` directory and its contents.

3. **Test the production build locally**:
   ```bash
   node production-start.js
   ```
   This will run your app in production mode with the necessary environment variables set.

4. **Review server logs**:
   After deployment, check the logs for any errors.

## Alternative Run Commands

If the default run command doesn't work, try one of these alternatives:

```
NODE_ENV=production node dist/index.js
```

or

```
node production-start.js
```

These should ensure your application starts correctly in production mode.

---

For additional assistance, contact the development team.