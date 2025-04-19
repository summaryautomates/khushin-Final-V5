# KHUSH.IN Deployment Guide

Your app is showing a blank screen in production because it's trying to load source files that don't exist in the built version. This guide will help you fix it.

## Quick Fix Steps

1. **Set Required Environment Variables**

   You need to set these environment variables in Replit deployment settings:

   ```
   NODE_ENV=production
   PORT=8080
   SESSION_SECRET=a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289
   ```

   To do this:
   - Go to the Replit deployment page
   - Find "Environment Variables" section
   - Add each variable with its value

2. **Rebuild the Application**

   In your Replit shell, run these commands:

   ```bash
   # Set environment variables in the current shell
   export NODE_ENV=production
   export PORT=8080

   # Clear any previous builds
   rm -rf dist

   # Run the build with production settings
   npm run build
   ```

3. **Deploy the Application**

   After the build completes successfully:
   - Click the "Deploy" button in Replit
   - Make sure to deploy with the environment variables set

## Verification

After deploying, you can check if the following files are correctly built:
- dist/index.js (server-side code)
- dist/public/index.html (client HTML)
- dist/public/assets/ (bundled JavaScript)

The most important part is that index.html should NOT contain `src="/src/main.tsx"`. Instead, it should point to a file in the assets directory like `src="/assets/index-[hash].js"`.

## Troubleshooting

If you still encounter issues:

1. **Check the Server Logs**
   - Look for any errors in the server logs when deployed
   - Confirm that the server reports `NODE_ENV=production` at startup

2. **Verify Static File Serving**
   - The server should be properly serving static files from `dist/public`
   - Check that all asset paths in the HTML are being found

3. **Try Multiple Browsers**
   - Sometimes caching issues can cause problems
   - Test in an incognito/private browsing window

4. **Restart and Rebuild**
   - If issues persist, try a complete restart and rebuild
   - Delete the dist directory and rebuild with the environment variables set

## Important Notes

- Production mode is essential for proper bundling and serving of files
- The build process may take a few minutes to complete
- Always test in an environment similar to production before deploying