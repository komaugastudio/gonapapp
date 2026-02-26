import React from 'react';
import { ChevronLeft, Phone, Mail, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Bantuan & Dukungan</h2>
      </div>
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-3">
          <Phone size={20} className="text-green-600" />
          <span className="text-gray-800">+62 812-3456-7890</span>
        </div>
        <div className="flex items-center space-x-3">
          <Mail size={20} className="text-green-600" />
          <span className="text-gray-800">support@gonab-app.com</span>
        </div>
        <div className="flex items-center space-x-3">
          <HelpCircle size={20} className="text-green-600" />
          <span className="text-gray-800">FAQ & Panduan Penggunaan</span>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
