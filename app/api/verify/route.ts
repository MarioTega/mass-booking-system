// app/api/verify/route.ts
import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';

// TODO: replace with your real pricing logic. Amount is in NAIRA here.
// This must be computed on the server, never taken from the request body.
function getPriceFor(intention: string, dates: string[]): number {
  const pricePerMass = 100; // placeholder
  return pricePerMass * dates.length;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, booking, intention, firstName, lastName } = body;
    const phoneNo = typeof body.phoneNo === 'string' ? body.phoneNo.trim() : body.phoneNo;

    if (!reference || !phoneNo || !Array.isArray(booking) || booking.length === 0) {
      return NextResponse.json(
        { status: 'failure', message: 'Invalid request' },
        { status: 400 }
      );
    }

    // 1. Verify the transaction with Paystack (secret key, server side only)
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        cache: 'no-store',
      }
    );
    const finalData = await paystackResponse.json();
    console.log('Paystack verify:', paystackResponse.status, JSON.stringify(finalData));

    if (!finalData.status || finalData.data?.status !== 'success') {
      return NextResponse.json(
        { status: 'failure', message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // 2. Check the amount actually paid (Paystack returns kobo)
    const expectedKobo = getPriceFor(intention, booking) * 100;
    if (finalData.data.amount !== expectedKobo || finalData.data.currency !== 'NGN') {
      console.error('Amount mismatch: paid', finalData.data.amount, 'expected', expectedKobo);
      return NextResponse.json(
        { status: 'failure', message: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    // 3 + 4. In ONE statement: create the parishioner if they're new (or reuse
    // the existing one), then insert a booking row for every date.
    // Replaying the same reference is safe and creates no duplicates.
    //
    // Needs (run once):
    //   CREATE UNIQUE INDEX IF NOT EXISTS parishioners_phone_idx ON parishioners (phone_no);
    //   ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference text;
    //   CREATE UNIQUE INDEX IF NOT EXISTS bookings_ref_date_idx
    //     ON bookings (payment_reference, booking_date);
    //
    // Adjust first_name / last_name to your real column names. If booking_date
    // is a timestamp column rather than DATE, change ::date[].
    await query(
      `WITH p AS (
         INSERT INTO parishioners (first_name, last_name, phone_no)
         VALUES ($1, $2, $3)
         ON CONFLICT (phone_no) DO UPDATE SET phone_no = EXCLUDED.phone_no
         RETURNING id
       )
       INSERT INTO bookings (parishioner_id, intention, booking_date, payment_reference)
       SELECT p.id, $4::text, d, $5::text
       FROM p, unnest($6::date[]) AS d
       ON CONFLICT (payment_reference, booking_date) DO NOTHING`,
      [
        firstName ?? null,
        lastName ?? null,
        phoneNo,
        intention || 'Mass Intention',
        reference,
        booking,
      ]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Mass successfully booked',
    });
  } catch (error: any) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}