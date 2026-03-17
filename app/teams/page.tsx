'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Team } from '@/lib/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    season: ''
  });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showRoster, setShowRoster] = useState<number | null>(null);
  const [rosterData, setRosterData] = useState<any[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTeam.name.trim() || !newTeam.season.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeam.name.trim(),
          season: newTeam.season.trim()
        })
      });

      if (response.ok) {
        const createdTeam = await response.json();
        setTeams([createdTeam, ...teams]);
        setNewTeam({ name: '', season: '' });
        setShowCreateForm(false);
        alert('Team created successfully!');
      } else {
        const error = await response.json();
        alert(`Error creating team: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewRoster = async (teamId: number) => {
    try {
      const response = await fetch(`/api/players?teamId=${teamId}&active=true`);
      if (response.ok) {
        const players = await response.json();
        setRosterData(players);
        setShowRoster(teamId);
      }
    } catch (error) {
      console.error('Error fetching roster:', error);
      alert('Error loading roster. Please try again.');
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      season: team.season
    });
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTeam) return;

    if (!newTeam.name.trim() || !newTeam.season.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeam.name.trim(),
          season: newTeam.season.trim()
        })
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(teams.map(t => t.id === editingTeam.id ? updatedTeam : t));
        setNewTeam({ name: '', season: '' });
        setEditingTeam(null);
        alert('Team updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating team: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Error updating team. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage your lacrosse teams and seasons</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Add New Team'}
          </Button>
        </div>

        {/* Create/Edit Team Form */}
        {(showCreateForm || editingTeam) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Team Name *</label>
                    <Input
                      placeholder="e.g., Eagles, Lions, Warriors"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Season *</label>
                    <Input
                      placeholder="e.g., 2024 Spring, 2024 Fall"
                      value={newTeam.season}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, season: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={creating}>
                    {creating ? (editingTeam ? 'Updating...' : 'Creating...') : (editingTeam ? 'Update Team' : 'Create Team')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTeam(null);
                      setNewTeam({ name: '', season: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Teams List */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first team to start tracking lacrosse performance
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {team.season}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {team.id}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Created:</span> {formatDate(team.created_at)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewRoster(team.id)}
                      >
                        View Roster
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {teams.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Total teams: {teams.length}
          </div>
        )}

        {/* Roster Modal */}
        {showRoster && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Team Roster - {teams.find(t => t.id === showRoster)?.name}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoster(null)}
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {rosterData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No players in this team yet.</p>
                    <p className="text-sm mt-2">Add players from the Players page.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rosterData.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {player.first_name} {player.last_name}
                          </p>
                          {player.jersey_number && (
                            <Badge variant="outline" className="mt-1">
                              #{player.jersey_number}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {player.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}