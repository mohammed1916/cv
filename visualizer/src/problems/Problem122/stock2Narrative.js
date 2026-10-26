export const stock2Narrative = {
  goal: "Find the maximum profit achievable from buying and selling stock as many times as desired by greedily capturing every positive daily price increase.",
  chapters: [
    "Compare adjacent days",
    "Capture price rise",
    "Total accumulated profit",
  ],
  ready: {
    why: "Because we can make unlimited transactions without cooldown or fee, any multi-day upward price run (prices[j] - prices[i]) equals the sum of its daily increases.",
    achieved: "No trading days scanned yet.",
    next: "Start with 0 total profit and compare day 1 with day 0.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Initialize cumulative profit accumulator to 0 before scanning price pairs.",
      achieved: "Total profit is initialized to 0.",
      next: "Begin scanning price changes from day 1 onward.",
    },
    compare: ({ step }) => ({
      chapter: 0,
      why: "Check whether stock price rose from yesterday (day i-1) to today (day i).",
      achieved: `Day ${step.currentDay} price ($${step.currentPrice}) vs day ${step.prevDay} price ($${step.prevPrice}): difference is ${step.diff >= 0 ? `+$${step.diff}` : `-$${Math.abs(step.diff)}`}.`,
      next: step.isUpward
        ? `Price rose: buy at $${step.prevPrice} and sell at $${step.currentPrice} to capture +$${step.diff}.`
        : "Price dropped or stayed equal: no profit opportunity on this day.",
    }),
    update: ({ step }) => ({
      chapter: 1,
      why: "Add the positive daily price difference to total profit.",
      achieved: `Captured +$${step.diff} profit. Cumulative total profit is now $${step.profit}.`,
      next: "Advance to the next day.",
    }),
    done: ({ step }) => ({
      chapter: 2,
      why: "All adjacent day transitions have been evaluated.",
      achieved:
        step.profit > 0
          ? `Maximum total profit across all transactions is $${step.profit}.`
          : "Stock price never increased; choosing no trades yields 0 profit.",
      next: "Try another price series to explore different market movements.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Initialize total profit accumulator to 0.",
      achieved: "profit = 0.",
      next: "Iterate over days i from 1 to len(prices) - 1.",
    },
    4: ({ step }) => ({
      chapter: 0,
      why: "Test if today’s price is higher than yesterday’s price: prices[i] > prices[i-1].",
      achieved: `Condition prices[${step.currentDay}] ($${step.currentPrice}) > prices[${step.prevDay}] ($${step.prevPrice}) is ${step.isUpward ? "True" : "False"}.`,
      next: step.isUpward
        ? "Add price difference to profit."
        : "Move to next day.",
    }),
    5: ({ step }) => ({
      chapter: 1,
      why: "Accumulate the daily gain into total profit.",
      achieved: `profit += ${step.currentPrice} - ${step.prevPrice} (${step.diff}) → total profit = $${step.profit}.`,
      next: "Continue scanning price changes.",
    }),
    6: ({ step }) => ({
      chapter: 2,
      why: "Return the final accumulated profit.",
      achieved: `Total maximum profit is $${step.profit}.`,
      next: "Try another price array.",
    }),
  },
};
