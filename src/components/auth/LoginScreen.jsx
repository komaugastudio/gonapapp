import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible', 'callback': () => {} });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber || phoneNumber.length < 9) return setError('Masukkan nomor HP yang valid.');
    
    setIsLoading(true);
    try {
      setupRecaptcha();
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = '+62' + formattedPhone.substring(1);
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+' + formattedPhone; 

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2); 
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim OTP. Pastikan paket Firebase mendukung SMS.');
      if (window.recaptchaVerifier) window.recaptchaVerifier.render().then(id => window.grecaptcha.reset(id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return setError('Masukkan 6 digit kode OTP.');
    setIsLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
    } catch {
      setError('Kode OTP salah atau telah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') setError('Proses masuk dibatalkan.');
      else setError('Gagal masuk: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 relative">
      <div className="flex-grow flex flex-col justify-center">
        <div className="text-4xl font-extrabold text-green-600 tracking-tighter mb-2">gonab</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat datang kembali!</h2>
        <p className="text-gray-500 mb-8">Masuk untuk menikmati layanan Gonab di Nabire, Papua Tengah.</p>
        
        <div id="recaptcha-container"></div>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

        {step === 1 && (
          <>
            <form onSubmit={handleSendOtp} className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nomor HP</label>
              <div className="flex shadow-sm rounded-xl overflow-hidden mb-4 border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                <span className="flex items-center justify-center px-4 bg-gray-50 text-gray-500 border-r border-gray-300 font-semibold">+62</span>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="812 3456 7890" className="flex-1 px-4 py-3 outline-none text-gray-800 text-lg w-full" disabled={isLoading} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-70 flex items-center justify-center space-x-2">
                {isLoading ? <span>Memproses...</span> : <span>Lanjut</span>}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 px-4 text-gray-400 text-sm">atau masuk dengan</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-full font-bold shadow-sm hover:bg-gray-50 flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="mb-6 animate-in slide-in-from-right">
            <p className="text-gray-600 mb-6 text-sm">Kami telah mengirimkan 6 digit kode OTP via SMS ke nomor <span className="font-bold text-gray-800">{phoneNumber}</span></p>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kode OTP</label>
            <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="0 0 0 0 0 0" className="w-full px-4 py-3 mb-6 outline-none text-gray-800 text-2xl tracking-[0.5em] text-center shadow-sm rounded-xl border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500" disabled={isLoading} />
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-70 mb-4">{isLoading ? <span>Memverifikasi...</span> : <span>Masuk</span>}</button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }} disabled={isLoading} className="w-full py-3 bg-white text-green-600 border border-green-600 rounded-full font-bold hover:bg-green-50">Ganti Nomor</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;

