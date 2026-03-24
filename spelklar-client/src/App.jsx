import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnterCode from './pages/EnterCode';
import MatchScreen from './pages/MatchScreen';
import PostMatch from './pages/PostMatch';
import SupporterFeed from './pages/SupporterFeed';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import MyFeed from './pages/MyFeed';
import TeamPage from './pages/TeamPage';
import MatchFeed from './pages/MatchFeed';
import PhotoModerationQueue from './pages/PhotoModerationQueue';
import TeamsPage from './pages/TeamsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnterCode />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<MyFeed />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/team/:id" element={<TeamPage />} />
        <Route path="/match/:id" element={<MatchScreen />} />
        <Route path="/match/:id/end" element={<PostMatch />} />
        <Route path="/live/:id" element={<SupporterFeed />} />
        <Route path="/feed/:id" element={<MatchFeed />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/photos" element={<PhotoModerationQueue />} />
      </Routes>
    </BrowserRouter>
  );
}
