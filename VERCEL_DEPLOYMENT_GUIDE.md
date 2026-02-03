# Vercel Deployment Guide for Todo Web App Frontend

This guide explains how to deploy the frontend of your Todo Web App to Vercel.

## Prerequisites

- A GitHub/GitLab/Bitbucket account with your project repository
- A Vercel account ([sign up here](https://vercel.com/signup))
- Your frontend code pushed to a remote repository

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your frontend code is in the `frontend` directory of your repository and that you have the following files:

- `package.json` with proper Next.js configuration
- `next.config.js` or `next.config.ts`
- `public` directory with static assets
- `src` or `app` directory with your Next.js pages/components

### 2. Import Your Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository containing the Todo Web App
5. Click "Import"

### 3. Configure Your Project

In the project configuration page:

- **Framework Preset**: Select "Next.js" (Vercel will auto-detect this)
- **Root Directory**: If your Next.js app is in a subdirectory (like `frontend`), specify it here
- **Build Command**: Usually auto-detected, but should be `npm run build` or `yarn build`
- **Output Directory**: Usually `out` for Next.js apps (auto-detected)
- **Development Command**: Leave blank for production builds

### 4. Set Environment Variables

Click on "Environment Variables" and add:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-backend-domain.com
NODE_ENV=production
```

Replace `https://your-backend-domain.com` with your actual backend API URL.

### 5. Add Build & Development Settings

In "Build & Development Settings":

- **Framework**: Next.js
- **Server Side Rendering (SSR)**: Enabled (default)
- **Build Command**: `cd frontend && npm run build` (if in subdirectory)
- **Dev Command**: `cd frontend && npm run dev`
- **Output Directory**: `frontend/out` (if in subdirectory)

### 6. Deploy

Click "Deploy" to start the deployment process.

## Advanced Configuration

### Custom Domain

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment-Specific Variables

You can set different environment variables for different deployment environments (Production, Preview, Development):

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Select the environment scope for each variable

### Git Integration

Configure automatic deployments:

- **Production Branch**: Usually `main` or `master`
- **Preview Deployments**: For all branches/PRs (recommended)
- **Ignored Build Step**: If needed, add conditions to skip builds

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `package.json` and that your Next.js app builds locally with `npm run build`

2. **API calls failing**: Verify that `NEXT_PUBLIC_API_BASE_URL` points to your deployed backend

3. **Static assets not loading**: Make sure your asset paths are correct relative to your deployment URL

4. **Environment variables not working**: Ensure they start with `NEXT_PUBLIC_` to be accessible in client-side code

### Build Logs

Check the build logs in the Vercel dashboard for detailed error messages. Look for:
- Missing dependencies
- Build-time errors
- Environment variable issues

## Performance Optimization

### Image Optimization

Vercel automatically optimizes images served through Next.js Image component. Make sure to use:

```jsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={300}
  height={200}
  priority={false}
/>
```

### Caching Headers

Add caching headers in your `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};
```

## Monitoring and Analytics

### Logs

Monitor your deployment logs in real-time through the Vercel dashboard.

### Analytics

Consider adding Vercel Analytics to monitor your app's performance:

1. Enable Analytics in your project settings
2. Use the Vercel Analytics component in your Next.js app

## Rollbacks

If you need to rollback to a previous version:

1. Go to the "Deployments" tab in your project
2. Find the deployment you want to rollback to
3. Click "Promote" to make it the production version

## Best Practices

- Use semantic versioning for your deployments
- Test your app locally before pushing to production
- Monitor your app's performance metrics
- Set up alerts for deployment failures
- Keep your dependencies updated

## Support

For further assistance:

- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Community Forum: [https://vercel.community](https://vercel.community)

Your frontend should now be successfully deployed to Vercel and accessible via the provided URL or your custom domain!