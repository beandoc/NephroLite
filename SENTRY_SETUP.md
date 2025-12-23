# Sentry Configuration

## Getting Your Sentry DSN

1. Go to [sentry.io](https://sentry.io)
2. Create a free account
3. Create a new project (select "Next.js")
4. Copy your DSN from the project settings

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
```

## For Vercel Deployment

Add to Vercel environment variables:

```bash
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
```

## Test Sentry (Optional)

Add a test button to your app:

```typescript
<button onClick={() => {
  throw new Error('Sentry test error!');
}}>
  Test Sentry
</button>
```

Click the button and check your Sentry dashboard - you should see the error!

## What's Configured

✅ Client-side error tracking  
✅ Server-side error tracking  
✅ Edge runtime error tracking  
✅ Performance monitoring (10% sample rate)  
✅ Session replay on errors  
✅ Automatic error capture in error handler  

## Next Steps

1. Get your Sentry DSN
2. Add to `.env.local`
3. Restart dev server
4. Errors will now be tracked in Sentry dashboard!
