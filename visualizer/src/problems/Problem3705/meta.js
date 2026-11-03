export const meta = {
  number: '3705', title: 'Find Golden Hour Customers', slug: 'find-golden-hour-customers', difficulty: 'Medium',
  tags: ['Database', 'Aggregation', 'SQL'], accent: '#ca8a04',
  // Teaching rule (not verified against the official statement): a golden-hour order is one placed at hour 18 up to but not including 20,
  // and a customer qualifies with at least 3 such orders.
  description: 'Teaching rule: filter orders placed from 18:00 up to 20:00, count them per customer, and keep customers with at least 3.',
}
