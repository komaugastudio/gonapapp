import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
        const unsubSnap = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setBalance(snap.data().balance);
          } else {
            setDoc(docRef, { balance: 150000 }, { merge: true });
            setBalance(150000);
          }
        }, (error) => console.error("Firestore error:", error));
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
    setBalance(newBalance); 
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
    await setDoc(docRef, { balance: newBalance }, { merge: true }); 
  };

  const pay = async (amount) => {
    const currentUser = auth.currentUser;
    if (!currentUser || balance < amount) return false;
    const newBalance = balance - amount;
    setBalance(newBalance); 
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'wallet', 'data');
    await setDoc(docRef, { balance: newBalance }, { merge: true }); 
    return true;
  };

  return (
    <WalletContext.Provider value={{ balance, topUp, pay }}>
      {children}
    </WalletContext.Provider>
  );
};