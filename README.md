This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Features Setup

### Database Configuration (Supabase)

The app fetches location data from Supabase and includes an AI chat assistant. To enable these features:

1. Create a `.env` file in the root directory
2. Add your Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
   ```
3. The app will work without Supabase for testing, but data fetching requires proper configuration

### AI Chat Assistant (OpenRouter)

The app includes an AI chat assistant that can answer questions about Hong Kong locations using your Supabase data. To enable this feature:

1. Add your OpenRouter API key to the `.env` file:
   ```
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
2. Get your API key from [OpenRouter.ai](https://openrouter.ai/)
3. The AI uses the Sonoma Sky Alpha model and has access to your location database

### Camera Permissions

The app will request camera access when you click "Enable Camera". If permission is denied:
- Check your browser's camera permissions in the address bar
- Ensure no other applications are using the camera
- Try refreshing the page and allowing permissions again

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
