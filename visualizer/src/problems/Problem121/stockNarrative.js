export const stockNarrative = {
  edgeCases: [
    'One day cannot complete a buy followed by a later sale.',
    'Flat or decreasing prices return zero; trading is optional.',
    'The cheapest price must precede the sale; the global minimum and maximum alone do not determine the answer.',
  ],
  goal: 'Find the largest profit from buying once and selling on a later day, or choose no trade for a profit of zero.',
  chapters: ['Keep the cheapest buy', 'Evaluate a sale', 'Keep the best profit'],
  ready: {
    why: 'For each selling day, only the cheapest earlier buy can give its best profit. Remembering that price avoids checking every pair of days.',
    achieved: 'No days have been scanned yet.',
    next: 'Start with no buy candidate and a best profit of zero.',
  },
  phases: {
    init: {
      chapter: 0,
      why: 'Infinity lets the first price become the buy candidate. Zero keeps the option of making no trade when every sale would lose money.',
      achieved: 'The scan is being initialized; no trading opportunity has been evaluated yet.',
      next: 'Visit the first day and establish a buy candidate.',
    },
    scan: ({ step }) => ({
      chapter: 0,
      why: 'Process days in order so every recorded sale uses an earlier buy.',
      achieved: `The best profit recorded before day ${step.i} is ${step.maxProfit}. Today’s price is ${step.currentPrice}.`,
      next: 'Decide whether today offers a cheaper buy or a possible sale.',
    }),
    done: ({ step }) => ({
      chapter: 2,
      why: 'Every day has been considered as a buy candidate or selling opportunity. No unexamined day can improve the recorded answer.',
      achieved: step.maxProfit > 0
        ? `Maximum profit: ${step.maxProfit}, buying on day ${step.bestBuyDay} and selling on day ${step.bestSellDay} (days start at 0).`
        : 'No profitable trade exists; choosing no trade returns zero.',
      next: 'Try another price sequence or step backward to inspect the winning decision.',
    }),
  },
  lines: {
    5: ({ step }) => ({
      chapter: 0,
      why: 'A cheaper buy improves every future selling opportunity, so we only need to keep the cheapest candidate.',
      achieved: step.minDay < 0 ? 'No buy candidate has been stored yet.' : `The stored buy candidate is ${step.minPrice} on day ${step.minDay}.`,
      next: step.currentPrice < step.minPrice ? 'Replace the buy candidate with today’s lower price.' : 'Evaluate selling today against the earlier buy candidate.',
    }),
    6: ({ step }) => ({
      chapter: 0,
      why: 'Keep this lower price as the baseline for future sales; previously recorded profits remain valid.',
      achieved: `The cheapest price through day ${step.i} is now ${step.minPrice}. Best recorded profit remains ${step.maxProfit}.`,
      next: 'Move to the next day and look for a sale or an even cheaper buy.',
    }),
    7: ({ step }) => ({
      chapter: 1,
      why: 'Selling today after the cheapest earlier buy gives the best possible trade ending today.',
      achieved: `Today’s candidate profit is ${step.prospectiveProfit}; the best recorded profit is still ${step.maxProfit}.`,
      next: step.prospectiveProfit > step.maxProfit ? 'Record this better trade.' : 'Keep the existing best trade and continue scanning.',
    }),
    8: ({ step }) => ({
      chapter: 2,
      why: 'Keep the best trade across all selling days evaluated so far.',
      achieved: `Best profit is now ${step.maxProfit}: buy on day ${step.bestBuyDay}, sell on day ${step.bestSellDay}.`,
      next: 'Continue scanning; future days may improve the answer.',
    }),
  },
};
