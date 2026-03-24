import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import './TeamsPage.css';

export default function TeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [followedTeams, setFollowedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
    fetchFollowedTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Fetch clubs first, then get all teams
      const clubs = await api.getClubs();
      let allTeams = [];

      for (const club of clubs) {
        const clubTeams = await api.getTeams(club.id);
        allTeams = [...allTeams, ...clubTeams];
      }

      setTeams(allTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedTeams = async () => {
    try {
      const followed = await api.getMyFollows();
      setFollowedTeams(followed.map(f => f.teamId));
    } catch (err) {
      console.error('Error fetching followed teams:', err);
    }
  };

  const handleFollow = async (teamId) => {
    try {
      await api.followTeam(teamId);
      setFollowedTeams([...followedTeams, teamId]);
    } catch (err) {
      console.error('Error following team:', err);
    }
  };

  const handleUnfollow = async (teamId) => {
    try {
      await api.unfollowTeam(teamId);
      setFollowedTeams(followedTeams.filter(id => id !== teamId));
    } catch (err) {
      console.error('Error unfollowing team:', err);
    }
  };

  if (loading) {
    return (
      <div className="teams-page">
        <div className="loading">Loading teams...</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1>Teams</h1>
      </div>

      <div className="teams-list">
        {teams.map((team) => {
          const isFollowed = followedTeams.includes(team.id);
          return (
            <div key={team.id} className="team-card">
              <div className="team-info">
                <h3>{team.name}</h3>
                <p className="follower-count">{team._count?.followers || 0} followers</p>
              </div>
              <button
                className={`follow-button ${isFollowed ? 'following' : ''}`}
                onClick={() => isFollowed ? handleUnfollow(team.id) : handleFollow(team.id)}
              >
                {isFollowed ? '✓ Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
