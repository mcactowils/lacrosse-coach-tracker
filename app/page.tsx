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
          <p className="text-xl text-gray-600 mb-8">
            Track player performance with our 3-number impact system
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/teams">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Create Your First Team
              </Button>
            </Link>
            <Link href="/tracker">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Tracking
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-orange-600">🏆 Team Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create and manage your teams and seasons to get started
              </p>
              <Link href="/teams" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Manage Teams →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-600">📱 Live Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real-time game tracking with tap counters for Ground Balls, Screens, and Effort Plays
              </p>
              <Link href="/tracker" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Start Tracking →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-green-600">📊 Team Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive analytics, team performance trends, and player leaderboards
              </p>
              <Link href="/dashboard" className="block mt-4">
                <Button variant="outline" className="w-full">
                  View Dashboard →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-purple-600">👥 Player Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Individual player profiles with detailed statistics and progress tracking
              </p>
              <Link href="/players" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Manage Players →
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  GB
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ground Balls</h3>
                <p className="text-sm text-gray-600">
                  Gaining possession of loose balls during live play
                </p>
                <p className="text-xs text-blue-600 mt-1">Target: 3-5 per game</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  SC
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Screens</h3>
                <p className="text-sm text-gray-600">
                  Setting body position to create space for teammates
                </p>
                <p className="text-xs text-green-600 mt-1">Target: 4-6 per game</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  EP
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Effort Plays</h3>
                <p className="text-sm text-gray-600">
                  High-energy actions that help the team succeed
                </p>
                <p className="text-xs text-purple-600 mt-1">Target: 3+ per game</p>
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
          <div className="flex flex-wrap justify-center gap-4">
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