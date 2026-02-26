import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// Konfigurasi Firebase terpusat untuk lingkungan ini
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Memastikan appId aman dari nilai kosong/undefined
const appId = (typeof __app_id !== 'undefined' && __app_id) ? __app_id : 'default-app-id';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    let isMounted = true;

    const initAuthAndListen = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      }

      // HANYA pasang listener setelah proses login di atas selesai 100%
      // Ini mencegah race condition di mana UID token belum tervalidasi sepenuhnya
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          if (!currentUser) {
            setUserData(null);
            setLoading(false);
          }
        }
      });
    };

    initAuthAndListen();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    // Mengambil dokumen tunggal (doc) alih-alih koleksi untuk mencegah error 'list permission'
    const profileDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    
    const unsubscribe = onSnapshot(
      profileDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData({
            ...user,
            ...snapshot.data()
          });
        } else {
          setUserData(user);
        }
        setLoading(false);
      },
      (error) => {
        // Fallback anggun: jika Firestore menolak akses (karena aturan keamanan), 
        // kita tetap gunakan data dasar dari Firebase Auth agar UI tidak rusak.
        console.warn("Akses Firestore dibatasi, menggunakan data Auth lokal.");
        setUserData(user);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Biasanya di sini Anda arahkan user ke halaman login:
      // window.location.href = '/login';
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center p-6 text-gray-500">
        Anda belum login. Silakan login terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Bagian Header / Cover */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      {/* Bagian Foto Profil */}
      <div className="relative flex justify-center mt-[-48px]">
        {userData.photoURL ? (
          <img
            src={userData.photoURL}
            alt="Foto Profil"
            className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover bg-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
            {userData.isAnonymous ? "?" : (userData.displayName?.charAt(0) || "U")}
          </div>
        )}
      </div>

      {/* Info User */}
      <div className="text-center px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {userData.displayName || "Pengguna Tamu"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {userData.email || "Tidak ada email tertaut"}
        </p>

        {/* Badge Status Akun */}
        <div className="mt-4 flex justify-center">
          {userData.isAnonymous ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Akun Sementara (Anonim)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Akun Permanen Terverifikasi
            </span>
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="px-6 pb-6 pt-2">
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>User ID:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate w-32 text-right">
              {userData.uid}
            </span>
          </div>

          {/* Jika masih anonim, kita bisa meletakkan komponen UpgradeAccount di halaman ini juga */}
          {userData.isAnonymous && (
            <p className="text-xs text-center text-gray-500 mb-2">
              Hubungkan akun untuk mengamankan data Anda.
            </p>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm border border-red-200"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;