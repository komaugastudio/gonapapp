import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Ticket, CreditCard, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath === '/ride' || currentPath === '/food') return null;

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center pt-3 pb-5 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40">
      <Link to="/" className={`flex flex-col items-center space-y-1 ${currentPath === '/' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home size={24} className={currentPath === '/' ? 'fill-current' : ''} />
        <span className="text-[10px] font-semibold">Beranda</span>
      </Link>
      <Link to="/promo" className={`flex flex-col items-center space-y-1 ${currentPath === '/promo' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <Ticket size={24} />
        <span className="text-[10px] font-semibold">Promo</span>
      </Link>
      <Link to="/wallet" className={`flex flex-col items-center space-y-1 ${currentPath === '/wallet' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <CreditCard size={24} className={currentPath === '/wallet' ? 'fill-current' : ''} />
        <span className="text-[10px] font-semibold">GonabPay</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center space-y-1 ${currentPath === '/profile' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <User size={24} className={currentPath === '/profile' ? 'fill-current' : ''} />
        <span className="text-[10px] font-semibold">Profil</span>
      </Link>
    </div>
  );
};

export default BottomNav;
