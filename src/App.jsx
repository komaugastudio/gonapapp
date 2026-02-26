import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Contexts
import { LanguageProvider } from './context/LanguageContext';
import { WalletProvider } from './context/WalletContext';

// Components
import SplashScreen from './components/ui/SplashScreen';
import BottomNav from './components/ui/BottomNav';
import LoginScreen from './components/auth/LoginScreen';

// Screens
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import ProfileScreen from './screens/ProfileScreen';
import GonabRideScreen from './screens/GonabRideScreen';
import GonabFoodScreen from './screens/GonabFoodScreen';
import HistoryScreen from './screens/HistoryScreen';
import VouchersScreen from './screens/VouchersScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import PromoScreen from './screens/PromoScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import LanguageScreen from './screens/LanguageScreen';
import NotificationScreen from './screens/NotificationScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import GomartScreen from './screens/GomartScreen';
import PulsaScreen from './screens/PulsaScreen';

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });

    const splashTimer = setTimeout(() => setIsSplashVisible(false), 2500);
    return () => { unsubscribe(); clearTimeout(splashTimer); };
  }, []);

  if (isSplashVisible || isAuthChecking) return <SplashScreen />;

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
                <Route path="/history" element={isAuthenticated ? <HistoryScreen /> : <Navigate to="/login" replace />} />
                <Route path="/vouchers" element={isAuthenticated ? <VouchersScreen /> : <Navigate to="/login" replace />} />
                <Route path="/settings" element={isAuthenticated ? <SettingsScreen /> : <Navigate to="/login" replace />} />
                <Route path="/help" element={isAuthenticated ? <HelpScreen /> : <Navigate to="/login" replace />} />
                <Route path="/promo" element={isAuthenticated ? <PromoScreen /> : <Navigate to="/login" replace />} />
                <Route path="/edit-profile" element={isAuthenticated ? <EditProfileScreen /> : <Navigate to="/login" replace />} />
                <Route path="/change-password" element={isAuthenticated ? <ChangePasswordScreen /> : <Navigate to="/login" replace />} />
                <Route path="/language" element={isAuthenticated ? <LanguageScreen /> : <Navigate to="/login" replace />} />
                <Route path="/notifications" element={isAuthenticated ? <NotificationScreen /> : <Navigate to="/login" replace />} />
                <Route path="/delete-account" element={isAuthenticated ? <DeleteAccountScreen /> : <Navigate to="/login" replace />} />
                <Route path="/gomart" element={isAuthenticated ? <GomartScreen /> : <Navigate to="/login" replace />} />
                <Route path="/pulsa" element={isAuthenticated ? <PulsaScreen /> : <Navigate to="/login" replace />} />
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