
import { query } from '@/app/lib/db';
import { NextResponse,NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const qdate = new Date(date).toISOString();

    const fetchIntentions = async (intentionType: string) => {
      const res = await query(
        `SELECT b.*, p.first_name, p.last_name, p.phone_no, p.origin 
         FROM bookings b
         INNER JOIN parishioners p ON b.parishioner_id = p.id
         WHERE b.booking_date = $1 AND b.intention = $2`,
        [qdate, intentionType]
      );
      return res.rows;
    };

    return NextResponse.json({
      MassIntention: await fetchIntentions('Mass Intention'),
      Thanksgiving: await fetchIntentions('Thanksgiving'),
      ChildPresentation: await fetchIntentions('Child Presentation'),
      Baptism: await fetchIntentions('Baptism'),
      RequiemMass: await fetchIntentions('Requiem Mass'),
      WeddingMass: await fetchIntentions('Wedding Mass')
    });
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
