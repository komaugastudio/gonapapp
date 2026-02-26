import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const syncUserProfile = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  
  // Mengambil data dari provider Google (biasanya index 0 atau 1)
  const profileData = {
    uid: user.uid,
    displayName: user.displayName || "User Baru",
    email: user.email,
    photoURL: user.photoURL || null,
    isAnonymous: false, // Sekarang sudah permanen
    updatedAt: serverTimestamp(),
  };

  try {
    // merge: true agar data lama (jika ada) tidak terhapus total
    await setDoc(userRef, profileData, { merge: true });
    console.log("Profil Firestore berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal sinkronisasi profil:", error);
  }
};