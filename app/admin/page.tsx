import {DateFilterForm} from '@/components/DateFilterForm';
import { query } from '@/app/lib/db';


async function getParishionersByDate(isoDateString: string) {
  const categories = [
    'Mass Intention',
    'Thanksgiving',
    'Child Presentation',
    'Baptism',
    'Requiem Mass',
    'Wedding Mass'
  ];

  const data: Record<string, any[]> = {};

  for (const cat of categories) {
    const res = await query(
      `SELECT b.*, p.first_name, p.last_name, p.phone_no, p.origin 
       FROM bookings b
       INNER JOIN parishioners p ON b.parishioner_id = p.id
       WHERE b.booking_date = $1 AND b.intention = $2`,
      [isoDateString, cat]
    );

    const key = cat.replace(/\s+/g, '');
    data[key] = res.rows;
  }

  return data;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  
  const resolvedParams = await searchParams;
  const rawDate = resolvedParams.date || new Date().toISOString().split('T')[0];
  const qdate = new Date(rawDate).toISOString();

 
  const categorizedBookings = await getParishionersByDate(qdate);

  return (
    <div className="space-y-6">
  
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Daily Bookings Overview</h2>
          <p className="text-sm text-gray-500">Showing schedules for: {new Date(rawDate).toDateString()}</p>
        </div>
        <DateFilterForm currentDate={rawDate} />
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(categorizedBookings).map(([categoryName, listings]) => (
          <div key={categoryName} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold tracking-wide">
                {categoryName.replace(/([A-Z])/g, ' \$1').trim()}
              </h3>
              <span className="bg-gray-700 text-xs px-2.5 py-1 rounded-full font-bold">
                {listings.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {listings.length === 0 ? (
                <p className="p-4 text-sm text-gray-400 italic text-center">No bookings registered for this slot.</p>
              ) : (
                listings.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>{item.first_name} {item.last_name}</span>
                      <span className="text-gray-500 text-xs font-normal">{item.phone_no}</span>
                    </div>
                    {item.origin && <p className="text-xs text-gray-500"><strong className="text-gray-600">Origin:</strong> {item.origin}</p>}
                    {item.intention_info && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">"{item.intention_info}"</p>}
                    
                  
                    {item.partner_first_name && (
                      <div className="text-xs bg-blue-50/50 p-2 rounded border border-blue-100 text-blue-900 grid grid-cols-2 gap-1">
                        <div><strong className="text-blue-900">Partner:</strong> {item.partner_first_name} {item.partner_last_name}</div>
                        {item.partner_origin && <div><strong className="text-blue-900">Partner Origin:</strong> {item.partner_origin}</div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


