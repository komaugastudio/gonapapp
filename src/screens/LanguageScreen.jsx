import React, { useState } from 'react';
import { ChevronLeft, Check, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const LanguageScreen = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('id');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectLanguage = (code) => {
    setSelected(code);
    // Implementasi perubahan bahasa
    localStorage.setItem('appLanguage', code);
    setShowSuccess(true);
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Pilih Bahasa</h2>
      </div>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5" />
            Bahasa berhasil diubah!
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 transition-all ${
              selected === lang.code ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{lang.flag}</span>
              <div>
                <p className="font-bold text-gray-800">{lang.name}</p>
                <p className="text-xs text-gray-500">{lang.code.toUpperCase()}</p>
              </div>
            </div>
            {selected === lang.code && <Check size={24} className="text-green-600" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageScreen;
