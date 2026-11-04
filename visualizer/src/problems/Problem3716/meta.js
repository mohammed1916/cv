export const meta = {
  number: '3716', title: 'Find Churn Risk Customers', slug: 'find-churn-risk-customers', difficulty: 'Medium',
  tags: ['Database', 'Aggregation', 'Date'], accent: '#9333ea',
  description: 'From a table of subscription events, list users whose last event is not a cancellation, who have downgraded at least once, whose current monthly amount is under half their historical peak, and who have been subscribed for at least 60 days. Sort by days subscribed descending, then user id ascending.',
}
