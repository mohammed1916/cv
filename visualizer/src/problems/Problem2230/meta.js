// Teaching rule (the official rule is not verified in the local draft): a user is eligible when,
// inside the requested [start, end] interval, they have at least minCount purchases and a total of at least minTotal.
export const meta = {
  number: '2230', title: 'The Users That Are Eligible for Discount', slug: 'the-users-that-are-eligible-for-discount', difficulty: 'Medium',
  tags: ['Database'], accent: '#0f766e',
  description: 'Keep only purchases inside the interval, total each user, and list users who meet both the count and the total thresholds.',
}
