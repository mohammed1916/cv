// Teaching rule (the local draft gives no concrete criterion; this is an original rule for the visualizer):
// a seller qualifies when the orders they received cover at least two distinct item brands.
// Difficulty and tags are not verified against the official page.
export const meta = {
  number: '2922', title: 'Market Analysis III', slug: 'market-analysis-iii', difficulty: 'Hard',
  tags: ['Database', 'Join', 'Aggregation'], accent: '#0f766e',
  description: 'Teaching rule: join each order to its item brand, then keep the sellers whose orders span at least two brands.',
}
