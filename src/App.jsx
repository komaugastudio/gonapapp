import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Wallet, ArrowUpCircle, PlusCircle, MoreHorizontal, 
  Bike, Car, Utensils, Box, ShoppingBag, Smartphone, Ticket, Shield, 
  Home, User, CreditCard, ChevronRight, LogOut,
  History, Tag, Settings, HelpCircle, AlertCircle, X, Mail,
  ScanLine, QrCode, CheckCircle, Bot, Sparkles, Send, 
  ChevronLeft, Navigation, Clock, Star, Map as MapIcon
} from 'lucide-react';

// --- Import Firebase ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification 
} from 'firebase/auth';
// Tambahan Import Firestore
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

// --- Firebase Init ---
const firebaseConfig = {
  apiKey: "AIzaSyADeE78Dv1AMNsDXuvEkj0oU-Fh2M0Jsa4",
  authDomain: "gonab-app.firebaseapp.com",
  projectId: "gonab-app",
  storageBucket: "gonab-app.firebasestorage.app",
  messagingSenderId: "260585496864",
  appId: "1:260585496864:web:3dc151ae2c2a95379bb745",
  measurementId: "G-S34JW64LYN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Variabel Global ID Aplikasi untuk standarisasi path Firestore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'gonab-app';

// --- Context & Formatters ---
const LanguageContext = createContext();
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('id');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Wallet Context dengan Integrasi Firestore
const WalletContext = createContext();
const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Path dokumen Firestore: artifacts/gonab-app/users/{user.uid}/wallet/data
        const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
        
        // Memantau perubahan saldo secara real-time dari database
        const unsubSnap = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setBalance(snap.data().balance);
          } else {
            // Jika user baru, inisialisasi saldo awal (misal: Rp 150.000)
            setDoc(docRef, { balance: 150000 }, { merge: true });
            setBalance(150000);
          }
        }, (error) => {
          console.error("Firestore error:", error);
        });

        return () => unsubSnap();
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const topUp = async (amount) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const newBalance = balance + amount;
    setBalance(newBalance); // Optimistic update (Ubah tampilan langsung)
    
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
    await setDoc(docRef, { balance: newBalance }, { merge: true }); // Simpan ke Cloud
  };

  const pay = async (amount) => {
    const currentUser = auth.currentUser;
    if (!currentUser || balance < amount) return false;
    
    const newBalance = balance - amount;
    setBalance(newBalance); // Optimistic update
    
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
    await setDoc(docRef, { balance: newBalance }, { merge: true }); // Simpan ke Cloud
    return true;
  };

  return (
    <WalletContext.Provider value={{ balance, topUp, pay }}>
      {children}
    </WalletContext.Provider>
  );
};

// Fungsi Format Rupiah
const formatRp = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- Komponen Layar (Screens) ---
const SplashScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 text-white">
    <div className="text-6xl font-extrabold tracking-tighter mb-2">gonab</div>
    <p className="text-green-100 font-medium">Pasti ada jalan di Nabire.</p>
  </div>
);

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Masukkan nomor HP yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = '+62' + formattedPhone.substring(1);
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+' + formattedPhone; 

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2); 
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError('Gagal mengirim OTP. Pastikan paket Firebase mendukung SMS.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => window.grecaptcha.reset(widgetId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      console.error("Error verifying OTP:", err);
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
      console.error("Error login:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses masuk dibatalkan oleh pengguna.');
      } else {
        setError('Gagal masuk: ' + err.message);
      }
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
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="812 3456 7890"
                  className="flex-1 px-4 py-3 outline-none text-gray-800 text-lg w-full"
                  disabled={isLoading}
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                {isLoading ? <span>Memproses...</span> : <span>Lanjut</span>}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 px-4 text-gray-400 text-sm">atau masuk dengan</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-colors mb-4 flex items-center justify-center space-x-3">
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
            <p className="text-gray-600 mb-6 text-sm">
              Kami telah mengirimkan 6 digit kode OTP via SMS ke nomor <br/>
              <span className="font-bold text-gray-800">{phoneNumber.startsWith('0') ? '+62' + phoneNumber.substring(1) : phoneNumber}</span>
            </p>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kode OTP</label>
            <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="0 0 0 0 0 0" className="w-full px-4 py-3 mb-6 outline-none text-gray-800 text-2xl tracking-[0.5em] text-center shadow-sm rounded-xl border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" disabled={isLoading} />
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-4">
              {isLoading ? <span>Memverifikasi...</span> : <span>Masuk</span>}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }} disabled={isLoading} className="w-full py-3 bg-white text-green-600 border border-green-600 rounded-full font-bold hover:bg-green-50 transition-colors">Ganti Nomor</button>
          </form>
        )}
        <p className="text-center text-xs text-gray-400 mt-auto pt-8">Dengan masuk, Anda menyetujui Syarat dan Ketentuan Gonab.</p>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const { balance } = useContext(WalletContext);
  const [modalType, setModalType] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchDatabase = [
    { id: 1, type: 'Layanan', name: 'GonabRide (Ojek Motor)', icon: <Bike size={16}/>, color: 'text-green-500 bg-green-100', link: '/ride' },
    { id: 2, type: 'Layanan', name: 'GonabCar (Taksi Online)', icon: <Car size={16}/>, color: 'text-green-500 bg-green-100', link: '/ride' },
    { id: 3, type: 'Layanan', name: 'GonabFood (Pesan Makanan)', icon: <Utensils size={16}/>, color: 'text-red-500 bg-red-100', link: '/food' },
    { id: 4, type: 'Makanan', name: 'Nasi Goreng Spesial Nabire', icon: <Utensils size={16}/>, color: 'text-orange-500 bg-orange-100', link: '/food' },
    { id: 5, type: 'Makanan', name: 'Ayam Bakar Madu', icon: <Utensils size={16}/>, color: 'text-orange-500 bg-orange-100', link: '/food' },
    { id: 6, type: 'Lokasi', name: 'Bandara Douw Aturure, Nabire', icon: <MapPin size={16}/>, color: 'text-blue-500 bg-blue-100', link: '/ride' },
    { id: 7, type: 'Lokasi', name: 'Pantai MAF Nabire', icon: <MapPin size={16}/>, color: 'text-blue-500 bg-blue-100', link: '/ride' },
    { id: 8, type: 'Promo', name: 'Diskon 50% Makan Siang', icon: <Ticket size={16}/>, color: 'text-yellow-600 bg-yellow-100', link: '/promo' },
  ];

  const filteredSearch = searchDatabase.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-6 relative">
      <div className="bg-white px-4 pt-6 pb-4 rounded-b-3xl shadow-sm relative z-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex-grow flex items-center bg-gray-100 rounded-full px-4 py-2 border transition-colors ${isSearching ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
            <Search size={20} className={isSearching ? 'text-green-600 mr-2' : 'text-gray-400 mr-2'} />
            <input 
              type="text" 
              placeholder="Cari layanan, makanan, & tujuan" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearching(true)}
              className="bg-transparent border-none focus:outline-none w-full text-sm" 
            />
            {isSearching && (
              <button onClick={() => {setIsSearching(false); setSearchQuery('');}} className="text-gray-400 ml-2 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => navigate('/profile')}>
            <User size={20} />
          </div>
        </div>

        {isSearching && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-2xl mt-1 py-2 px-4 border border-gray-100 max-h-80 overflow-y-auto z-50 animate-in fade-in duration-200">
            {searchQuery === '' ? (
              <div className="py-4 text-center text-gray-400 text-sm">
                Ketik sesuatu untuk mencari di Gonab...
              </div>
            ) : filteredSearch.length > 0 ? (
              filteredSearch.map(item => (
                <div key={item.id} onClick={() => navigate(item.link)} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border-b border-gray-50 last:border-0">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500 text-sm">
                Yaaah, hasil tidak ditemukan untuk "{searchQuery}".
              </div>
            )}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-700">
          <MapPin size={16} className="text-green-600 mr-1" />
          <span className="font-medium">Lokasi Anda:</span>
          <span className="ml-1 truncate font-bold">Kabupaten Nabire, Papua Tengah</span>
          <ChevronRight size={16} className="text-gray-400 ml-1" />
        </div>
      </div>

      {isSearching && <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setIsSearching(false)}></div>}

      <div className="px-4 mt-4 relative z-0">
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 translate-x-10 -translate-y-10"></div>
          <div className="flex justify-between items-center relative z-10">
            <div onClick={() => navigate('/wallet')} className="bg-white/20 p-2 rounded-xl cursor-pointer hover:bg-white/30 transition">
              <div className="flex items-center space-x-2 font-bold text-lg mb-1">
                <Wallet size={20} />
                <span>GonabPay</span>
              </div>
              <p className="text-sm text-blue-100">Klik & cek riwayat</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatRp(balance)}</p>
              <p onClick={() => setModalType('topup')} className="text-sm text-blue-100 hover:text-white hover:underline cursor-pointer">Top Up Saldo</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-5 relative z-10 bg-blue-700/50 rounded-xl p-2">
            <button onClick={() => setModalType('bayar')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <ScanLine size={24} className="mb-1" />
              <span className="text-xs font-medium">Bayar</span>
            </button>
            <button onClick={() => setModalType('topup')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <PlusCircle size={24} className="mb-1" />
              <span className="text-xs font-medium">Top Up</span>
            </button>
            <button onClick={() => setModalType('qr')} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <QrCode size={24} className="mb-1" />
              <span className="text-xs font-medium">Kode QR</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <MoreHorizontal size={24} className="mb-1" />
              <span className="text-xs font-medium">Lainnya</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-y-6 mt-8">
          <MenuIcon icon={<Bike size={28} className="text-white" />} label="GonabRide" color="bg-green-500" onClick={() => navigate('/ride')} />
          <MenuIcon icon={<Car size={28} className="text-white" />} label="GonabCar" color="bg-green-500" onClick={() => navigate('/ride')} />
          <MenuIcon icon={<Utensils size={28} className="text-white" />} label="GonabFood" color="bg-red-500" onClick={() => navigate('/food')} />
          <MenuIcon icon={<Box size={28} className="text-white" />} label="GonabSend" color="bg-green-500" />
          <MenuIcon icon={<ShoppingBag size={28} className="text-white" />} label="GonabMart" color="bg-red-500" />
          <MenuIcon icon={<Smartphone size={28} className="text-white" />} label="Pulsa" color="bg-blue-400" />
          <MenuIcon icon={<Ticket size={28} className="text-white" />} label="Voucher" color="bg-yellow-500" />
          <MenuIcon icon={<MoreHorizontal size={28} className="text-gray-600" />} label="Lainnya" color="bg-gray-200" />
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Promo Spesial di Nabire!</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white p-4">
              <div className="text-center">
                <h4 className="font-bold text-xl">Diskon Kuliner Nabire</h4>
                <p className="text-sm opacity-90">Potongan s.d 50% untuk pengguna baru</p>
              </div>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-800">Makan hemat akhir bulan</p>
              <p className="text-sm text-gray-500 mt-1">Berlaku di warung dan resto bertanda khusus di sekitar Anda.</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setModalType('ai')}
        className="fixed bottom-24 right-4 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-xl text-white flex items-center justify-center hover:scale-105 transition-transform z-30 animate-bounce"
      >
        <Sparkles size={24} className="absolute -top-1 -right-1 text-yellow-300 fill-current animate-pulse" />
        <Bot size={28} />
      </button>

      {/* Render Modals */}
      {modalType === 'topup' && <TopUpModal onClose={() => setModalType(null)} />}
      {modalType === 'bayar' && <PayScannerModal onClose={() => setModalType(null)} />}
      {modalType === 'qr' && <MyQrModal onClose={() => setModalType(null)} />}
      {modalType === 'ai' && <GonabAIModal onClose={() => setModalType(null)} />}

    </div>
  );
};

const MenuIcon = ({ icon, label, color, onClick }) => (
  <div className="flex flex-col items-center cursor-pointer group" onClick={onClick}>
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
  </div>
);

// --- HALAMAN BARU: GONAB RIDE DENGAN PETA GOOGLE MAPS ---
const GonabRideScreen = () => {
  const navigate = useNavigate();
  // Default pickup diset ke lokasi nyata agar peta menampilkannya
  const [pickup, setPickup] = useState('Oyehe, Nabire, Papua Tengah');
  const [dropoff, setDropoff] = useState('');
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    if (dropoff.length > 2) {
      const timer = setTimeout(() => setShowPrice(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPrice(false);
    }
  }, [dropoff]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      
      {/* --- Peta Interaktif (Google Maps Embed) --- */}
      {/* Peta ini akan otomatis bergeser jika state `pickup` diubah oleh pengguna */}
      <div className="absolute inset-0 z-0 bg-gray-200">
        <iframe
          title="Peta Lokasi"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(pickup || 'Nabire, Papua Tengah')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        
        {/* Overlay Gradient agar UI atas & bawah tetap terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="relative z-10 p-4">
        <button onClick={() => navigate(-1)} className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-50 transition">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="relative z-10 mt-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2 pb-6 px-4 animate-in slide-in-from-bottom-10 duration-300">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mau pergi ke mana?</h2>

        <div className="relative pl-8 mb-6">
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200 border-l-2 border-dotted border-gray-300"></div>
          <div className="relative mb-4">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-green-100"></div>
            <input 
              type="text" 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium transition-all"
              placeholder="Cari lokasi jemput..."
            />
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-red-100"></div>
            <input 
              type="text" 
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-1 focus:ring-red-500 text-sm font-medium transition-all"
              placeholder="Cari lokasi tujuan (Misal: Pantai MAF)"
            />
          </div>
        </div>

        {showPrice && (
          <div className="space-y-3 mb-6 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="font-bold text-gray-700 text-sm mb-2">Pilih Kendaraan</h3>
            
            <div className="flex items-center justify-between p-3 border border-green-500 bg-green-50 rounded-xl cursor-pointer">
              <div className="flex items-center space-x-4">
                <Bike size={32} className="text-green-600" />
                <div>
                  <h4 className="font-bold text-gray-800">GonabRide</h4>
                  <p className="text-xs text-gray-500 flex items-center"><User size={12} className="mr-1"/> 1 Orang • <Clock size={12} className="ml-2 mr-1"/> 3 mnt</p>
                </div>
              </div>
              <p className="font-bold text-lg text-gray-800">Rp 12.000</p>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl cursor-pointer transition-all">
              <div className="flex items-center space-x-4">
                <Car size={32} className="text-gray-600" />
                <div>
                  <h4 className="font-bold text-gray-800">GonabCar</h4>
                  <p className="text-xs text-gray-500 flex items-center"><User size={12} className="mr-1"/> 1-4 Orang • <Clock size={12} className="ml-2 mr-1"/> 5 mnt</p>
                </div>
              </div>
              <p className="font-bold text-lg text-gray-800">Rp 25.000</p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1 rounded text-white"><Wallet size={16} /></div>
                <span className="text-sm font-bold text-gray-800">GonabPay</span>
              </div>
              <span className="text-sm font-bold text-blue-600">Terhubung</span>
            </div>
          </div>
        )}

        <button 
          disabled={!showPrice}
          className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {showPrice ? "Pesan Sekarang" : "Pilih Tujuan Dulu"}
        </button>
      </div>
    </div>
  );
};

// --- HALAMAN BARU: GONAB FOOD (PESAN MAKANAN) ---
const GonabFoodScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Terdekat');

  const restaurants = [
    { id: 1, name: "Nasi Goreng Hebat Nabire", category: "Nasi Goreng, Aneka Nasi", rating: 4.8, distance: "1.2 km", time: "15 mnt", promo: "Diskon 20%" },
    { id: 2, name: "Seafood Oyehe Spesial", category: "Seafood, Ikan Bakar", rating: 4.9, distance: "2.5 km", time: "25 mnt", promo: "Gratis Ongkir" },
    { id: 3, name: "Kopi Hitam Pantai MAF", category: "Minuman, Kopi, Snack", rating: 4.6, distance: "3.0 km", time: "20 mnt", promo: null },
    { id: 4, name: "Ayam Geprek Papua", category: "Ayam, Makanan Pedas", rating: 4.7, distance: "1.5 km", time: "18 mnt", promo: "Diskon 10%" },
  ];

  return (
    <div className="min-h-screen bg-white pb-6">
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-700">
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
            <Search size={18} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Mau makan apa hari ini?" className="bg-transparent border-none outline-none w-full text-sm" />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-500 text-xs">Diantar ke</p>
            <p className="font-bold text-gray-800 flex items-center">
              Jl. Merdeka, Oyehe <ChevronRight size={14} className="ml-1 text-red-500" />
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 mb-6">
        <div className="w-full bg-red-500 rounded-2xl p-4 text-white flex justify-between items-center shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 rounded-full mix-blend-multiply opacity-50 translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <h3 className="font-extrabold text-xl mb-1">Makan Kenyang, Dompet Tenang!</h3>
            <p className="text-sm text-red-100">Diskon s.d 50% khusus area Nabire</p>
          </div>
          <Utensils size={48} className="text-red-300 relative z-10 opacity-50" />
        </div>
      </div>

      <div className="flex px-4 space-x-3 overflow-x-auto no-scrollbar mb-6">
        {['Terdekat', 'Terlaris', 'Promo', 'Seafood', 'Kopi'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <h2 className="font-bold text-lg text-gray-800">Rekomendasi di Nabire</h2>
        
        {restaurants.map(resto => (
          <div key={resto.id} className="flex space-x-4 bg-white border-b border-gray-100 pb-6 last:border-0 cursor-pointer group">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden group-hover:opacity-90 transition">
              <Utensils size={32} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 leading-tight mb-1">{resto.name}</h3>
              <p className="text-xs text-gray-500 mb-2 truncate">{resto.category}</p>
              
              <div className="flex items-center text-xs font-semibold text-gray-700 space-x-3 mb-2">
                <span className="flex items-center text-yellow-500"><Star size={14} className="fill-current mr-1" /> {resto.rating}</span>
                <span className="flex items-center"><MapPin size={14} className="mr-1 text-gray-400" /> {resto.distance}</span>
                <span className="flex items-center"><Clock size={14} className="mr-1 text-gray-400" /> {resto.time}</span>
              </div>

              {resto.promo && (
                <div className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center">
                  <Ticket size={10} className="mr-1" /> {resto.promo}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MODALS UNTUK FITUR DOMPET & AI ---
const GonabAIModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya Gonab AI, asisten pintar kamu. Ada yang bisa saya bantu hari ini di Nabire?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchGeminiResponse = async (userText, chatHistory) => {
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const formattedHistory = chatHistory
      .slice(1) 
      .map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    formattedHistory.push({ role: 'user', parts: [{ text: userText }] });

    const payload = {
      contents: formattedHistory,
      systemInstruction: {
        parts: [{ text: "Kamu adalah Gonab AI, asisten virtual yang ramah, cerdas, dan asyik untuk aplikasi Gonab (layanan ride-hailing dan pesan antar seperti Gojek) yang beroperasi khusus di Kabupaten Nabire, Papua Tengah. Gunakan bahasa Indonesia yang santai, gaul, namun tetap sopan (pakai sapaan 'kamu/aku'). Secara proaktif rekomendasikan layanan GonabRide (ojek), GonabCar (taksi), GonabFood (makanan), GonabSend (kurir), atau pembayaran GonabPay jika relevan dengan pertanyaan pengguna. Berikan jawaban yang singkat, jelas, dan memikat." }]
      }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i <= 5; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error("API Error");
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku bingung mau jawab apa.";
      } catch (error) {
        if (i === 5) return "Maaf ya, server Gonab AI lagi sibuk banget nih. Coba sapa aku lagi nanti!";
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const currentInput = inputText;
    const currentMessages = [...messages];

    setMessages([...currentMessages, { role: 'user', text: currentInput }]);
    setInputText('');
    setIsTyping(true);

    const aiReply = await fetchGeminiResponse(currentInput, currentMessages);

    setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl relative animate-in slide-in-from-bottom duration-300 flex flex-col h-[85vh]">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-3xl flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Gonab AI</h3>
              <p className="text-xs text-green-100 flex items-center">
                <span className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanya Gonab AI..." 
              className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const TopUpModal = ({ onClose }) => {
  const { topUp } = useContext(WalletContext);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    if (val > 0) {
      await topUp(val);
      setIsSuccess(true);
      setTimeout(onClose, 1500); 
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 min-h-[50vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800">Top Up Berhasil!</h3>
            <p className="text-gray-500 mt-2">Saldo GonabPay Anda telah bertambah.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Isi Saldo GonabPay</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[20000, 50000, 100000].map(val => (
                <button 
                  key={val} 
                  onClick={() => setAmount(val.toString())}
                  className="py-2 border border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
                >
                  {formatRp(val).replace(',00', '')}
                </button>
              ))}
            </div>
            <form onSubmit={handleTopUp}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Atau masukkan nominal</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-6 border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span className="px-4 text-gray-500 font-bold">Rp</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="flex-1 py-3 outline-none text-gray-800 text-xl font-bold"
                />
              </div>
              <button 
                type="submit" 
                disabled={!amount || parseInt(amount) <= 0}
                className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Top Up Sekarang
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const PayScannerModal = ({ onClose }) => {
  const { balance, pay } = useContext(WalletContext);
  const [step, setStep] = useState('input'); 
  const [amount, setAmount] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    if (val > 0) {
      const isSuccess = await pay(val);
      if (isSuccess) {
        setStep('success');
        setTimeout(onClose, 1500); 
      } else {
        setStep('fail');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 min-h-[50vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>

        {step === 'success' ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800">Pembayaran Berhasil!</h3>
            <p className="text-gray-500 mt-2">Pembayaran ke merchant telah selesai.</p>
            <p className="font-bold text-blue-600 text-xl mt-2">-{formatRp(amount)}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Bayar Pembelanjaan</h3>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Merchant Terdeteksi</p>
                <p className="font-bold text-lg">Waroeng Nabire Hebat</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Saldo Anda</p>
                <p className="font-bold text-blue-600">{formatRp(balance)}</p>
              </div>
            </div>
            
            {step === 'fail' && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Saldo Anda tidak mencukupi untuk pembayaran ini.</div>}

            <form onSubmit={handlePay}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Pembayaran</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-6 border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                <span className="px-4 text-gray-500 font-bold">Rp</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="flex-1 py-3 outline-none text-gray-800 text-2xl font-bold"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                disabled={!amount || parseInt(amount) <= 0}
                className="w-full py-4 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Konfirmasi & Bayar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const MyQrModal = ({ onClose }) => {
  const user = getAuth().currentUser;
  
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>
        
        <h3 className="text-lg font-bold text-gray-800 mb-1">Kode QR Saya</h3>
        <p className="text-sm text-gray-500 mb-6">Tunjukkan kode ini ke kasir untuk menerima dana atau membayar.</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] mb-6 border border-gray-100">
          <QrCode size={200} className="text-gray-800" strokeWidth={1} />
        </div>
        
        <div className="bg-blue-50 w-full p-3 rounded-xl border border-blue-100 flex items-center justify-center space-x-2">
          <User size={18} className="text-blue-600" />
          <span className="font-bold text-blue-800">{user?.displayName || "Pengguna Nabire"}</span>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Layar Lainnya (Wallet & Profile) ---
const WalletScreen = () => {
  const { balance } = useContext(WalletContext);
  const [modalType, setModalType] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 pt-4">Dompet</h2>
      <div className="bg-blue-600 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-1">Saldo GonabPay Anda</p>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold">{formatRp(balance)}</span>
          </div>
          <div className="mt-6 flex space-x-3">
            <button onClick={() => setModalType('topup')} className="flex-1 bg-white text-blue-600 py-3 rounded-full font-bold shadow-sm flex items-center justify-center space-x-2 hover:bg-blue-50 transition">
              <PlusCircle size={18} /> <span>Top Up</span>
            </button>
            <button onClick={() => setModalType('bayar')} className="flex-1 bg-blue-700 text-white py-3 rounded-full font-bold shadow-sm flex items-center justify-center space-x-2 hover:bg-blue-800 transition">
              <ScanLine size={18} /> <span>Bayar</span>
            </button>
          </div>
        </div>
      </div>
      
      <div 
        onClick={() => setModalType('qr')}
        className="mt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><QrCode size={24} /></div>
          <div>
            <p className="font-bold text-gray-800">Tampilkan Kode QR</p>
            <p className="text-xs text-gray-500">Untuk menerima saldo dari teman/kasir</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-800 mb-3">Riwayat Transaksi</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center text-gray-500 py-10">
          Belum ada transaksi bulan ini.
        </div>
      </div>

      {modalType === 'topup' && <TopUpModal onClose={() => setModalType(null)} />}
      {modalType === 'bayar' && <PayScannerModal onClose={() => setModalType(null)} />}
      {modalType === 'qr' && <MyQrModal onClose={() => setModalType(null)} />}
    </div>
  );
};

const ProfileScreen = () => {
  const user = auth.currentUser;
  
  // Sinkronisasi status Verifikasi dengan Firestore (menggantikan localStorage)
  const [isVerified, setIsVerified] = useState(false);
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    
    // Baca status dari Cloud
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setIsVerified(snap.data().isVerified || false);
      } else {
        const verified = !!user.phoneNumber;
        setDoc(docRef, { isVerified: verified }, { merge: true });
        setIsVerified(verified);
      }
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (showVerifyModal) {
      setVerifyStep(1);
      setError('');
    }
  }, [showVerifyModal]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  const handleSendEmailLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await sendEmailVerification(user);
      setVerifyStep(2); 
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/too-many-requests') {
        setError('Terlalu banyak permintaan. Tunggu beberapa saat lalu coba lagi.');
      } else {
        setError('Gagal mengirim tautan. Pastikan email Anda aktif.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    setIsLoading(true);
    try {
      await user.reload(); 
      // Update data di Firestore saat user berhasil memverifikasi diri
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      await setDoc(docRef, { isVerified: true }, { merge: true });
      
      setIsVerified(true);
      setShowVerifyModal(false);
    } catch (err) {
      setError('Gagal memeriksa status. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.displayName || "Pengguna Nabire";
  const displayPhoneOrEmail = user?.email || user?.phoneNumber || "Belum ada kontak terdaftar";

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pt-2">Profil Saya</h2>
        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profil" className="w-16 h-16 rounded-full border border-gray-200 shadow-sm" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <User size={32} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg text-gray-800">{displayName}</h3>
            <p className="text-sm text-gray-500 font-medium truncate w-48">{displayPhoneOrEmail}</p>
            
            {isVerified ? (
              <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                <Shield size={12} />
                <span>Terverifikasi</span>
              </div>
            ) : (
              <button 
                onClick={() => setShowVerifyModal(true)}
                className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer"
              >
                <AlertCircle size={12} />
                <span>Belum Verifikasi (Klik)</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 mt-6 space-y-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <History size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Pesanan & Riwayat</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Tag size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Promo & Diskon</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <CreditCard size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Metode Pembayaran</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Settings size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Pengaturan Akun</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <HelpCircle size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Pusat Bantuan</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={handleLogout} className="p-4 flex items-center justify-center cursor-pointer hover:bg-red-50 text-red-600 transition-colors">
            <span className="font-bold flex items-center space-x-2"><LogOut size={20}/> <span>Keluar dari Akun</span></span>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowVerifyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-2 text-gray-800 pt-2">Verifikasi Email</h3>
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

            {verifyStep === 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-6">
                  Untuk keamanan akun, kami akan mengirimkan tautan verifikasi ke email yang terhubung:
                  <span className="font-bold text-gray-800 mt-2 flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <Mail size={16} /> <span>{user?.email || "Email tidak ditemukan"}</span>
                  </span>
                </p>
                <button onClick={handleSendEmailLink} disabled={isLoading || !user?.email} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-70 transition-colors">
                  {isLoading ? 'Mengirim...' : 'Kirim Tautan Verifikasi'}
                </button>
              </div>
            )}

            {verifyStep === 2 && (
              <div className="animate-in slide-in-from-right text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2">Cek Kotak Masuk Anda</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Tautan telah dikirim! Silakan buka email Anda, klik tautan yang kami berikan, lalu kembali ke sini.
                </p>
                <button onClick={handleConfirmVerification} disabled={isLoading} className="w-full py-3 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-70 mb-3 transition-colors">
                  {isLoading ? 'Memeriksa...' : 'Saya Sudah Klik Tautannya'}
                </button>
                <button onClick={() => { setVerifyStep(1); setError(''); }} className="w-full py-3 bg-white text-gray-500 font-bold hover:text-gray-700">Kirim Ulang Email</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Komponen Navigasi Bawah ---
const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath === '/ride' || currentPath === '/food') {
    return null;
  }

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

// --- Aplikasi Utama ---
function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });

    const splashTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);

    return () => {
      unsubscribe();
      clearTimeout(splashTimer);
    };
  }, []);

  if (isSplashVisible || isAuthChecking) {
    return <SplashScreen />;
  }

  return (
    <LanguageProvider>
      <WalletProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-black font-sans">
            <main className="flex-grow max-w-md mx-auto w-full bg-white min-h-screen shadow-2xl relative overflow-x-hidden pb-20">
              <Routes>
                <Route path="/login" element={!isAuthenticated ? <LoginScreen /> : <Navigate to="/" replace />} />
                <Route path="/" element={isAuthenticated ? <HomeScreen /> : <Navigate to="/login" replace />} />
                <Route path="/wallet" element={isAuthenticated ? <WalletScreen /> : <Navigate to="/login" replace />} />
                <Route path="/profile" element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/login" replace />} />
                <Route path="/ride" element={isAuthenticated ? <GonabRideScreen /> : <Navigate to="/login" replace />} />
                <Route path="/food" element={isAuthenticated ? <GonabFoodScreen /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
              </Routes>
              
              {isAuthenticated && <BottomNav />}
            </main>
          </div>
        </Router>
      </WalletProvider>
    </LanguageProvider>
  );
}

export default App;