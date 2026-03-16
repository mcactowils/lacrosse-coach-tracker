'use client';

import { useState } from 'react';

interface GameFormProps {
  onGameAdded: () => void;
}

export default function GameForm({ onGameAdded }: GameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    game_date: new Date().toISOString().split('T')[0],
    opponent: '',
    ground_balls: '',
    screens: '',
    effort_plays: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ground_balls: parseInt(formData.ground_balls) || 0,
          screens: parseInt(formData.screens) || 0,
          effort_plays: parseInt(formData.effort_plays) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add game');
      }

      // Reset form
      setFormData({
        game_date: new Date().toISOString().split('T')[0],
        opponent: '',
        ground_balls: '',
        screens: '',
        effort_plays: '',
      });

      onGameAdded();
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Game</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="game_date" className="block text-sm font-medium text-gray-700 mb-1">
              Game Date
            </label>
            <input
              type="date"
              id="game_date"
              name="game_date"
              value={formData.game_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="opponent" className="block text-sm font-medium text-gray-700 mb-1">
              Opponent
            </label>
            <input
              type="text"
              id="opponent"
              name="opponent"
              value={formData.opponent}
              onChange={handleChange}
              required
              placeholder="Team name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="ground_balls" className="block text-sm font-medium text-gray-700 mb-1">
              Ground Balls
            </label>
            <input
              type="number"
              id="ground_balls"
              name="ground_balls"
              value={formData.ground_balls}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="screens" className="block text-sm font-medium text-gray-700 mb-1">
              Screens
            </label>
            <input
              type="number"
              id="screens"
              name="screens"
              value={formData.screens}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="effort_plays" className="block text-sm font-medium text-gray-700 mb-1">
              Effort Plays
            </label>
            <input
              type="number"
              id="effort_plays"
              name="effort_plays"
              value={formData.effort_plays}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding Game...' : 'Add Game'}
        </button>
      </form>
    </div>
  );
}