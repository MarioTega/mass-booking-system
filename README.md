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
# Parish Mass Booking

A web app that lets parishioners book Masses (e.g. Child Presentation intentions)
for chosen dates and pay online, with a separate admin area for the parish to
view bookings.

I built this for my home parish in Nigeria. The parish hasn't deployed it yet,
so payments run on **Paystack test mode** and no real money moves. It's a
fully working prototype you can try end to end.

**Live demo:** [link]

## Features
- Check availability for a date before paying
- Pay in naira through Paystack
- A parishioner record is created on their first successful booking,
  matched by phone number
- Password-protected admin area to view all bookings

## Tech stack
Next.js (App Router), Neon Postgres, Paystack, JWT cookie auth for the admin area

## Try it
**Making a booking**
1. Pick an intention and a date, then click Check Availability
2. Pay using Paystack's test card: [test card details from Paystack's docs]

**Admin area**
1. Click "Are you a Parish Admin?" at the bottom of the page
2. Password: `[demo-only password]`
3. You'll see the booking you just made

## What I'd do next
- Switch to live Paystack keys once a parish is ready to use it
- [e.g. email or SMS confirmations, rate limiting on the admin login]

## Running locally
[env variables needed, `npm install`, `npm run dev`]