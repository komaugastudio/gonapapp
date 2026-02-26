import React, { useState } from "react";
import { auth } from "../firebase"; // gunakan modul firebase utama
import { GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import { syncUserProfile } from "../services/authService";

const UpgradeAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const user = auth.currentUser;

  // Fungsi utama untuk upgrade akun
  const handleUpgradeWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      // 1. Link akun anonim dengan Google
      const result = await linkWithPopup(user, provider);
      
      // 2. Sinkronisasi data profil ke Firestore
      await syncUserProfile(result.user);

      setSuccess(true);
      
      // Berikan jeda sebentar sebelum reload agar user bisa baca pesan sukses
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Upgrade Error:", err);
      
      // Menangani error spesifik jika email sudah terpakai
      if (err.code === "auth/credential-already-in-use") {
        setError("Email Google ini sudah terdaftar di akun lain.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // JANGAN TAMPILKAN jika user tidak login atau sudah bukan anonim lagi
  if (!user || !user.isAnonymous) return null;

  return (
    <div className="max-w-md mx-auto my-6 p-6 bg-white border border-yellow-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Simpan Akun Anda</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Saat ini Anda masuk sebagai <strong>Tamu</strong>. Hubungkan dengan Google agar data <strong>gonab-app</strong> Anda tidak hilang saat ganti perangkat.
      </p>

      {error && (
        <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-3 text-center bg-green-50 text-green-700 border border-green-200 rounded font-medium">
          ✅ Berhasil! Mengalihkan...
        </div>
      ) : (
        <button
          onClick={handleUpgradeWithGoogle}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
            loading 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Lanjutkan dengan Google
            </>
          )}
        </button>
      )}

      <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest">
        Data Anda akan aman tersinkronisasi
      </p>
    </div>
  );
};

export default UpgradeAccount;