'use client';
import { useRouter } from 'next/navigation';

export const DateFilterForm = ({ currentDate }: { currentDate: string }) => {
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;

    router.push(`/admin?date=${selectedDate}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-date" className="text-sm font-medium text-gray-600">Change Date:</label>
      <input 
        id="filter-date"
        type="date" 
        value={currentDate} 
        onChange={handleDateChange}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      />
    </div>
  );
}
