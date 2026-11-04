// Teaching rule: a session is a zombie when it is still open
// and its last activity is at least `idle` minutes before the reference time.
export const meta = {
  number: '3673', title: 'Find Zombie Sessions', slug: 'find-zombie-sessions', difficulty: 'Medium',
  tags: ['Database'], accent: '#0f766e',
  description: 'Teaching rule: an open session whose last activity is at least the idle threshold old is a zombie; list their ids in order.',
}
