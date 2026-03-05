import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, AlertCircle, History, ChevronRight, Tag, CreditCard, Settings, HelpCircle, LogOut, Mail, CheckCircle, Loader } from 'lucide-react';
import { signOut, sendEmailVerification, reload } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';
import { auth, db, appId } from '../firebase';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    setVerificationMessage('');
    try {
      if (!user) {
        setVerificationMessage(t('userNotFound'));
        return;
      }
      
      if (!user.email) {
        setVerificationMessage(t('emailNotFound'));
        return;
      }
      
      console.log('📧 Sending verification email to:', user.email);
      await sendEmailVerification(user);
      setVerificationSent(true);
      setVerificationMessage(`✉️ ${t('emailSentMsg')}\n${user.email}\n\n${t('checkSpam')}`);
      
      // Check status setiap 3 detik
      const checkInterval = setInterval(async () => {
        try {
          await reload(user);
          if (user.emailVerified) {
            setEmailVerified(true);
            setVerificationMessage(t('verificationConfirmed'));
            clearInterval(checkInterval);
            setTimeout(() => setShowVerificationModal(false), 2000);
          }
        } catch (err) {
          console.error('Error checking verification:', err);
        }
      }, 3000);
      
      // Stop checking setelah 5 menit
      setTimeout(() => clearInterval(checkInterval), 300000);
    } catch (err) {
      console.error('Error sending verification:', err);
      let errorMsg = t('failedToSendEmail');
      
      if (err.code === 'auth/too-many-requests') {
        errorMsg = t('tooManyRequests');
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = t('userNotFound');
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setVerificationMessage(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationClick = () => {
    setShowVerificationModal(true);
    setVerificationSent(false);
    setVerificationMessage('');
  };

  const navigate = useNavigate();
  const handleLogout = () => signOut(auth);

  const menuItems = [
    { icon: History, label: t('orderHistory'), action: () => navigate('/history') },
    { icon: CreditCard, label: t('paymentMethod'), action: () => navigate('/wallet') },
    { icon: Tag, label: t('vouchersPromo'), action: () => navigate('/vouchers') },
    { icon: Settings, label: t('accountSettings'), action: () => navigate('/settings') },
    { icon: HelpCircle, label: t('helpSupport'), action: () => navigate('/help') },
    { icon: Mail, label: t('contactUs'), action: () => window.location.href = 'mailto:support@gonab-app.com' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pt-2">{t('myProfile')}</h2>
        <div className="flex items-center space-x-4">
          {user?.photoURL ? <img src={user.photoURL} alt={t('profile')} className="w-16 h-16 rounded-full border border-gray-200 shadow-sm" /> : <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={32} /></div>}
          <div>
            <h3 className="font-bold text-lg text-gray-800">{user?.displayName || t('defaultUser')}</h3>
            <p className="text-sm text-gray-500 font-medium">{user?.phoneNumber || user?.email}</p>
            {user?.emailVerified ? <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md"><Shield size={12} /><span>{t('verified')}</span></div> : <button onClick={handleVerificationClick} className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer"><AlertCircle size={12} /><span>{t('notVerified')}</span></button>}
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4 pb-24">
        {/* menu utama */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className="text-gray-600" />
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          ))}
        </div>

        {/* tombol logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={handleLogout} className="p-4 flex items-center justify-center cursor-pointer text-red-600">
            <span className="font-bold flex items-center space-x-2"><LogOut size={20}/> <span>{t('logout')}</span></span>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setShowVerificationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1">
              ✕
            </button>
            
            {verificationSent ? (
              <div className="text-center py-6">
                {user?.emailVerified ? (
                  <>
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('verificationSuccess')}</h3>
                    <p className="text-gray-600">{t('emailVerified')}</p>
                  </>
                ) : (
                  <>
                    <Loader size={64} className="text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('verificationSent')}</h3>
                    <p className="text-gray-600 mb-4">{t('verificationSentTo')}</p>
                    <p className="font-bold text-gray-800 mb-6 bg-blue-50 p-3 rounded-lg text-sm">{user?.email}</p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
                      <p className="font-bold mb-2">📌 {t('instructions')}</p>
                      <ul className="space-y-1 ml-4 text-xs">
                        <li>• {t('checkInbox')}</li>
                        <li>• {t('waitEmail')}</li>
                        <li>• {t('clickLink')}</li>
                        <li>• {t('dontCloseApp')}</li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">{t('autoUpdate')}</p>
                    <button 
                      onClick={handleSendVerification}
                      disabled={isLoading}
                      className="w-full py-2 text-sm text-blue-600 font-bold hover:text-blue-700 disabled:opacity-50"
                    >
                      {t('resendEmail')}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('emailVerification')}</h3>
                <p className="text-gray-600 mb-6">{t('needVerification')}</p>
                
                {verificationMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                    verificationMessage.includes('✓') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {verificationMessage}
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
                  <p className="font-bold mb-2">📧 {t('verificationSteps')}</p>
                  <ol className="space-y-1 ml-4 text-xs">
                    <li>{t('clickButton')}</li>
                    <li>{t('waitTime')}</li>
                    <li>{t('checkEmail')} <strong>{user?.email}</strong></li>
                    <li>{t('clickVerifyLink')}</li>
                    <li>{t('appDetects')}</li>
                    <li>{t('accountVerified')}</li>
                  </ol>
                </div>
                
                <button
                  onClick={handleSendVerification}
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      {t('sendingEmail')}
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      {t('sendEmailVerification')}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;