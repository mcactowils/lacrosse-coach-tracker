'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  category: 'ground_balls' | 'screens' | 'effort_plays';
  isOpen: boolean;
  onClose: () => void;
}

const categoryData = {
  ground_balls: {
    title: 'Ground Balls (GB)',
    definition: 'A ground ball is counted when the player successfully gains possession of a loose ball during live play. This usually occurs after a shot, pass, check, or deflection.',
    examples: [
      'Scooping up a loose ball on the field',
      'Winning a contested loose ball against an opponent',
      'Picking up a rebound after a shot hits the ground',
      'Recovering a dropped or checked ball',
      'Scooping a loose ball created by a teammate\'s check'
    ],
    doesNotCount: [
      'Picking the ball up during a dead-ball restart',
      'Receiving a pass from a teammate',
      'Catching a rebound in the air before it touches the ground',
      'Picking up a ball that rolled out of bounds and is returned'
    ],
    target: '3-5 ground balls per game',
    whyMatters: 'Ground balls win possessions, and possessions create scoring opportunities.',
    color: 'blue'
  },
  screens: {
    title: 'Screens (SC)',
    definition: 'A screen (or pick) occurs when a player sets their body position to block or delay a defender, allowing a teammate to gain space. Screens can occur on-ball or off-ball.',
    examples: [
      'On-ball pick that frees a dodging teammate',
      'Off-ball screen that allows a teammate to cut to goal',
      'Crease screen that frees a shooter',
      'Screen that forces a defender to change direction or switch'
    ],
    doesNotCount: [
      'Running near a defender without setting position',
      'Attempting a screen that the teammate does not use',
      'Moving while screening (illegal moving pick)',
      'Accidental contact without intentional screen positioning'
    ],
    target: '4-6 quality screens per game',
    whyMatters: 'After setting the screen, the player should roll or slip to open space.',
    coachingReminder: 'Set → Hold → Slip',
    color: 'green'
  },
  effort_plays: {
    title: 'Effort Plays (EP)',
    definition: 'An effort play is a high-energy action that helps the team but may not appear in traditional statistics. These plays demonstrate hustle, awareness, and team play.',
    examples: [
      'Backing up a teammate\'s shot',
      'Riding hard and disrupting a defensive clear',
      'Smart off-ball cut that creates space for a teammate',
      'Helping a teammate get open',
      'Hustling back on defense after a turnover',
      'Communicating a screen or defensive assignment',
      'Slipping to space after setting a screen',
      'Recovering a loose ball that prevents an opponent\'s fast break'
    ],
    doesNotCount: [
      'Standing in position without active involvement',
      'Routine jogging without influencing the play',
      'Passive participation in the offense or defense'
    ],
    target: '3+ effort plays per game',
    whyMatters: 'These actions often change momentum and help the team succeed even when the player does not have the ball.',
    color: 'purple'
  }
};

export function HelpModal({ category, isOpen, onClose }: HelpModalProps) {
  const data = categoryData[category];

  if (!isOpen) return null;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      header: 'bg-blue-100',
      text: 'text-blue-800',
      target: 'bg-blue-100 text-blue-800'
    },
    green: {
      bg: 'bg-green-50',
      header: 'bg-green-100',
      text: 'text-green-800',
      target: 'bg-green-100 text-green-800'
    },
    purple: {
      bg: 'bg-purple-50',
      header: 'bg-purple-100',
      text: 'text-purple-800',
      target: 'bg-purple-100 text-purple-800'
    }
  };

  const colors = colorClasses[data.color as keyof typeof colorClasses];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <Card className={colors.bg}>
          <CardHeader className={colors.header}>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-xl ${colors.text}`}>{data.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[70vh] space-y-6">
            {/* Definition */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Definition</h4>
              <p className="text-gray-700">{data.definition}</p>
            </div>

            {/* Examples that count */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Examples that count</h4>
              <ul className="text-gray-700 space-y-1">
                {data.examples.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 font-bold mr-2 mt-0.5">✓</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Does NOT count */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Does NOT count</h4>
              <ul className="text-gray-700 space-y-1">
                {data.doesNotCount.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-600 font-bold mr-2 mt-0.5">✗</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target and why it matters */}
            <div className={`${colors.target} p-4 rounded-lg text-center`}>
              <p className="font-semibold mb-2">Target: {data.target}</p>
              {data.coachingReminder && (
                <p className="font-medium mb-2">Coaching reminder: {data.coachingReminder}</p>
              )}
              <p className="text-sm">{data.whyMatters}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}