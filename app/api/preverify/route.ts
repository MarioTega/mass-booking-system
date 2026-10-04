
import { query } from '@/app/lib/db';
import { NextResponse,NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, intention, phoneNo, booking } = body;

    // 1. Properly format the incoming array of date strings into a clean PostgreSQL array string
    // e.g., ["2026-10-04"] becomes '{"2026-10-04T12:00:00.000Z"}'
    const formattedDates = booking.map((d: string) => new Date(d).toISOString());
    const postgresArray = `{${formattedDates.map((dateStr: string) => `"\${dateStr}"`).join(',')}}`;

    // 2. Loop through each date in the input to check structural parameters
    for (const dateStr of booking) {
      const targetDate = new Date(dateStr).toISOString();

      // Check if this exact booking already exists by checking both tables via a JOIN
      const duplicateCheck = await query(
        `SELECT b.id FROM bookings b
         JOIN parishioners p ON b.parishioner_id = p.id
         WHERE p.first_name = $1 AND p.last_name = $2 AND p.phone_no = $3 
         AND b.intention = $4 AND b.booking_date = $5`,
        [firstName, lastName, phoneNo, intention, targetDate]
      );

      if (duplicateCheck.rows.length > 0) {
        return NextResponse.json({ status: 'failure', message: 'Booking already exists' });
      }
    }

    // 3. Check general structural caps (Wedding / Requiem limit slots for the day) using the array string
    if (intention === 'Wedding Mass' || intention === 'Requiem Mass') {
      const dayCheck = await query(
        `SELECT id FROM bookings 
         WHERE booking_date = ANY($1::timestamp[]) AND (intention = 'Wedding Mass' OR intention = 'Requiem Mass')`,
        [formattedDates] // We pass the array directly to pg which handles it natively via ANY
      );

      if (dayCheck.rows.length > 0) {
        return NextResponse.json({ status: 'failure', message: 'The Day is fully booked' });
      }
    }

    return NextResponse.json({ status: 'success', message: 'Proceed to Pay' });
  } catch (error:any) {
    // This logs the exact runtime error message to your terminal console so you can see it
    console.error("Error in preverify route:", error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
