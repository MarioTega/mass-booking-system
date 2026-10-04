'use client';
export const LogoutButton = () => {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded text-sm transition"
    >
      Log Out
    </button>
  );
}
