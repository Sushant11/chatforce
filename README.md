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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

ChatforceAI — Build Complete
The full application scaffolded and building successfully. Here's what exists:

Routes
Route	Description
/	Landing page (Hero, Features, HowItWorks, Pricing, Testimonials, CTA)
/login · /signup	OAuth auth pages (GitHub + Google)
/dashboard	Dashboard with chatbot grid + stats
/chatbots	All chatbots list
/chatbots/new	Create chatbot form
/chatbots/[id]	Builder (Documents, Customize, Deploy tabs + live chat preview)
/account · /account/billing	Account & billing/subscription pages
API Routes
Route	Description
/api/chatbots	CRUD for chatbots
/api/chatbots/[id]/chat	RAG pipeline → Claude
/api/chatbots/[id]/api-key	Generate API keys
/api/documents/upload	PDF/text upload + chunking + embeddings
/api/documents/[id]	Delete document
/api/stripe/checkout · /webhook · /portal	Full Stripe integration
/api/v1/chat	Public API (API key auth)
Next Steps Before Launch
Fill in .env.local — add real Supabase, Anthropic, Stripe, OAuth keys
Run supabase/schema.sql in your Supabase SQL editor
Create Supabase Storage bucket named documents
Create Stripe products for Starter ($29/mo) and Pro ($99/mo), add price IDs to .env.local
Replace mock generateEmbedding() in lib/claude.ts with a real embedding API (OpenAI text-embedding-3-small or Voyage AI)
Run npm run dev to start developing
