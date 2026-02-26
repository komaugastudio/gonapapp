import React from 'react';
import { Bike } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export default function SplashScreen() {
  const { t } = useTranslation();
  
  return (
    <div className="flex-1 bg-green-600 flex flex-col items-center justify-center absolute inset-0 z-[100] text-white animate-out fade-out duration-500 delay-1500 fill-mode-forwards">
      <div className="bg-white p-4 rounded-full mb-4 shadow-lg animate-bounce">
        <Bike className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight">GoNab</h1>
      <p className="font-medium mt-2 opacity-80">{t('app_desc')}</p>
    </div>
  );
}