import React from 'react';

const MenuIcon = ({ icon, label, color, onClick }) => (
  <div className="flex flex-col items-center cursor-pointer group" onClick={onClick}>
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
  </div>
);

export default MenuIcon;