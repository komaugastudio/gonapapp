import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in">
      <div className="bg-gray-800 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
        <CheckCircle className="w-5 h-5 text-green-400" />
        {message}
      </div>
    </div>
  );
}