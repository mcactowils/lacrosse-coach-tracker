'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lacrosse Coach Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track player performance with our 3-number impact system
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="text-center flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-green-600">🏆 Team Management</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-gray-600 flex-1">
                Complete team and player management with performance analytics, team setup, and detailed statistics in one place
              </p>
              <Link href="/management" className="block mt-6">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Team Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-blue-600">📱 Live Game Tracking</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-gray-600 flex-1">
                Real-time game tracking with tap counters for Ground Balls, Screens, and Effort Plays during live games
              </p>
              <Link href="/tracker" className="block mt-6">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Tracking
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Impact System Explanation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3-Number Impact System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ground Balls */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    GB
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Ground Balls</h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Definition</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    A ground ball is counted when the player successfully gains possession of a loose ball during live play.
                    This usually occurs after a shot, pass, check, or deflection.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Examples that count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Scooping up a loose ball on the field</li>
                    <li>• Winning a contested loose ball against an opponent</li>
                    <li>• Picking up a rebound after a shot hits the ground</li>
                    <li>• Recovering a dropped or checked ball</li>
                    <li>• Scooping a loose ball created by a teammate's check</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Does NOT count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Picking the ball up during a dead-ball restart</li>
                    <li>• Receiving a pass from a teammate</li>
                    <li>• Catching a rebound in the air before it touches the ground</li>
                    <li>• Picking up a ball that rolled out of bounds and is returned</li>
                  </ul>
                </div>

                <div className="bg-blue-100 p-3 rounded text-center">
                  <p className="text-sm font-medium text-blue-800">Target: 3-5 per game</p>
                  <p className="text-xs text-blue-700 mt-1">Ground balls win possessions, and possessions create scoring opportunities.</p>
                </div>
              </div>

              {/* Screens */}
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    SC
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Screens</h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Definition</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    A screen (or pick) occurs when a player sets their body position to block or delay a defender,
                    allowing a teammate to gain space. Screens can occur on-ball or off-ball.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Examples that count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• On-ball pick that frees a dodging teammate</li>
                    <li>• Off-ball screen that allows a teammate to cut to goal</li>
                    <li>• Crease screen that frees a shooter</li>
                    <li>• Screen that forces a defender to change direction or switch</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Does NOT count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Running near a defender without setting position</li>
                    <li>• Attempting a screen that the teammate does not use</li>
                    <li>• Moving while screening (illegal moving pick)</li>
                    <li>• Accidental contact without intentional screen positioning</li>
                  </ul>
                </div>

                <div className="bg-green-100 p-3 rounded">
                  <p className="text-sm font-medium text-green-800 text-center">Target: 4-6 per game</p>
                  <p className="text-xs text-green-700 mt-1 text-center font-medium">Coaching reminder: Set → Hold → Slip</p>
                  <p className="text-xs text-green-700 mt-1">After setting the screen, the player should roll or slip to open space.</p>
                </div>
              </div>

              {/* Effort Plays */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                    EP
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Effort Plays</h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Definition</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    An effort play is a high-energy action that helps the team but may not appear in traditional statistics.
                    These plays demonstrate hustle, awareness, and team play.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Examples that count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Backing up a teammate's shot</li>
                    <li>• Riding hard and disrupting a defensive clear</li>
                    <li>• Smart off-ball cut that creates space for a teammate</li>
                    <li>• Helping a teammate get open</li>
                    <li>• Hustling back on defense after a turnover</li>
                    <li>• Communicating a screen or defensive assignment</li>
                    <li>• Slipping to space after setting a screen</li>
                    <li>• Recovering a loose ball that prevents an opponent's fast break</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Does NOT count</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Standing in position without active involvement</li>
                    <li>• Routine jogging without influencing the play</li>
                    <li>• Passive participation in the offense or defense</li>
                  </ul>
                </div>

                <div className="bg-purple-100 p-3 rounded text-center">
                  <p className="text-sm font-medium text-purple-800">Target: 3+ per game</p>
                  <p className="text-xs text-purple-700 mt-1">These actions often change momentum and help the team succeed even when the player does not have the ball.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Impact Score = GB + SC + EP</strong>
              </p>
              <div className="flex justify-center space-x-6 mt-2 text-xs">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">10+: Excellent</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">7-9: Strong</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">5-6: Solid</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">&lt;5: Developing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ready to get started?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/tracker">
              <Button variant="outline">Live Game Tracker</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Team Dashboard</Button>
            </Link>
            <Link href="/players">
              <Button variant="outline">Player Management</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}