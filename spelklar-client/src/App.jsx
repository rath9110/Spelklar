import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnterCode from './pages/EnterCode';
import MatchScreen from './pages/MatchScreen';
import PostMatch from './pages/PostMatch';
import SupporterFeed from './pages/SupporterFeed';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnterCode />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/match/:id" element={<MatchScreen />} />
        <Route path="/match/:id/end" element={<PostMatch />} />
        <Route path="/live/:id" element={<SupporterFeed />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
