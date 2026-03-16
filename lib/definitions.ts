// Central definitions and canonical descriptions for lacrosse statistics

export interface StatDefinition {
  name: string;
  shortCode: string;
  definition: string;
  examples: string[];
  doesNotCount: string[];
  target: string;
  whyItMatters: string;
  coachingReminder?: string;
}

export const STAT_DEFINITIONS: Record<string, StatDefinition> = {
  groundBalls: {
    name: 'Ground Balls',
    shortCode: 'GB',
    definition: 'A ground ball is counted when the player successfully gains possession of a loose ball during live play.',
    examples: [
      'Scooping up a loose ball on the field',
      'Winning a contested loose ball',
      'Picking up a rebound after a shot hits the ground',
      'Recovering a dropped or checked ball'
    ],
    doesNotCount: [
      'Picking the ball up during a dead ball restart',
      'Receiving a pass',
      'Catching a rebound in the air before it hits the ground'
    ],
    target: '3–5 ground balls per game',
    whyItMatters: 'Ground balls win possessions and possessions create scoring opportunities.'
  },

  screens: {
    name: 'Screens',
    shortCode: 'SC',
    definition: 'A screen (or pick) occurs when a player sets their body position to block or delay a defender, allowing a teammate to gain space.',
    examples: [
      'On-ball pick for a dodging teammate',
      'Off-ball screen for a cutter',
      'Crease screen to free a shooter'
    ],
    doesNotCount: [
      'Running near a defender without setting position',
      'Attempting a screen that the teammate never uses',
      'Moving while screening'
    ],
    target: '4–6 quality screens per game',
    whyItMatters: 'Screens create scoring opportunities and open space for teammates.',
    coachingReminder: 'Set → Hold → Slip to open space'
  },

  effortPlays: {
    name: 'Effort Plays',
    shortCode: 'EP',
    definition: 'An effort play is a high-energy action that helps the team but may not appear on the scoreboard.',
    examples: [
      'Backing up a teammate\'s shot',
      'Hard ride that disrupts a clear',
      'Smart off-ball cut that creates space',
      'Helping a teammate get open',
      'Hustling back on defense',
      'Communicating a screen or defensive assignment',
      'Slipping after setting a screen'
    ],
    doesNotCount: [
      'Standing in position without active involvement',
      'Routine jogging',
      'Passive play'
    ],
    target: '3 effort plays per game',
    whyItMatters: 'These plays contribute to team success even when the player does not have the ball.'
  }
};

export interface ScoreLabel {
  label: string;
  range: string;
  color: string;
  bgColor: string;
}

export const SCORE_THRESHOLDS: Record<string, ScoreLabel> = {
  excellent: {
    label: 'Excellent',
    range: '10+',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  strong: {
    label: 'Strong',
    range: '7–9',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  solid: {
    label: 'Solid',
    range: '5–6',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  developing: {
    label: 'Developing',
    range: '<5',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  }
};

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 10) return SCORE_THRESHOLDS.excellent;
  if (score >= 7) return SCORE_THRESHOLDS.strong;
  if (score >= 5) return SCORE_THRESHOLDS.solid;
  return SCORE_THRESHOLDS.developing;
}

export function getStatDefinition(statType: 'groundBalls' | 'screens' | 'effortPlays'): StatDefinition {
  return STAT_DEFINITIONS[statType];
}