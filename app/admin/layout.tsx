import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import {LogoutButton} from '@/components/LogoutButton';

const TOKEN_KEY = new TextEncoder().encode(process.env.TOKEN_KEY);

export default async function AdminLayout({ children }:any) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
console.log('AdminLayout token:', token);
  if (!token) {
    redirect('/login'); 
  }

  try {
   
    await jwtVerify(token, TOKEN_KEY);
  } catch (err) {
    redirect('/login');
  }

  return (
    <div className="admin-wrapper min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">St. Ferdinand Admin Panel</h1>
        <LogoutButton />
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}


