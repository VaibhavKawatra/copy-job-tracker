import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import your pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage'; // 1. Import the new page

// A simple wrapper component for page transition animations
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    // AnimatePresence is the key to enabling exit animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/register"
          element={<AnimatedPage><RegisterPage /></AnimatedPage>}
        />
        <Route
          path="/login"
          element={<AnimatedPage><LoginPage /></AnimatedPage>}
        />
        <Route
          path="/dashboard"
          element={<AnimatedPage><DashboardPage /></AnimatedPage>}
        />
        {/* 2. Add the new route for the profile page */}
        <Route
          path="/profile"
          element={<AnimatedPage><ProfilePage /></AnimatedPage>}
        />
        <Route
          path="/"
          element={<AnimatedPage><LoginPage /></AnimatedPage>}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
