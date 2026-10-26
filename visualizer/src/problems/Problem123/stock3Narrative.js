function fmt(val) {
  if (val === -Infinity || !Number.isFinite(val)) return "-∞";
  return String(val);
}

export const stock3Narrative = {
  goal: "Find the maximum profit achievable by completing at most two non-overlapping buy-and-sell transactions.",
  chapters: [
    "Initialize balances",
    "Track 1st transaction",
    "Reinvest into 2nd transaction",
    "Final maximum profit",
  ],
  ready: {
    why: "Four state variables (b1, s1, b2, s2) allow tracking the optimal net cash after 1st buy, 1st sell, 2nd buy, and 2nd sell in a single O(n) pass.",
    achieved: "States not initialized yet.",
    next: "Initialize buy states to -∞ and sell profits to 0.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Set initial net cash: buying positions start at -∞ (no purchases), and sell profits start at 0 (no trades).",
      achieved: "b1 = -∞, s1 = 0, b2 = -∞, s2 = 0.",
      next: "Iterate through daily stock prices in chronological order.",
    },
    iterate: ({ step }) => ({
      chapter: 0,
      why: "Visit each trading day to evaluate buy and sell opportunities across both transactions.",
      achieved: `Day ${step.dayIndex}: Today's stock price is $${step.currentPrice}. Current states: b1=${fmt(step.b1)}, s1=${step.s1}, b2=${fmt(step.b2)}, s2=${step.s2}.`,
      next: "Update 1st buy balance (b1) against today’s price.",
    }),
    buy1: ({ step }) => ({
      chapter: 1,
      why: "b1 = max(b1, -price): find the lowest purchase price for transaction 1 (highest remaining cash).",
      achieved: `b1 = max(${fmt(step.prevStates?.b1)}, -${step.currentPrice}) = ${fmt(step.b1)}.${step.updated ? " Lower buy price found!" : " Kept earlier buy."}`,
      next: "Evaluate selling today for transaction 1 (s1).",
    }),
    sell1: ({ step }) => ({
      chapter: 1,
      why: "s1 = max(s1, b1 + price): find the maximum profit after completing transaction 1.",
      achieved: `s1 = max(${step.prevStates?.s1}, ${fmt(step.b1)} + ${step.currentPrice}) = ${step.s1}.${step.updated ? " Improved 1st transaction profit!" : " Kept earlier 1st sell profit."}`,
      next: "Evaluate reinvesting transaction 1 profit into a 2nd buy (b2).",
    }),
    buy2: ({ step }) => ({
      chapter: 2,
      why: "b2 = max(b2, s1 - price): maximize net cash after buying a 2nd stock using profit from transaction 1.",
      achieved: `b2 = max(${fmt(step.prevStates?.b2)}, ${step.s1} - ${step.currentPrice}) = ${fmt(step.b2)}.${step.updated ? " Improved 2nd buy entry point!" : " Kept previous 2nd buy."}`,
      next: "Evaluate completing transaction 2 today (s2).",
    }),
    sell2: ({ step }) => ({
      chapter: 2,
      why: "s2 = max(s2, b2 + price): find the maximum total profit after completing at most 2 transactions.",
      achieved: `s2 = max(${step.prevStates?.s2}, ${fmt(step.b2)} + ${step.currentPrice}) = ${step.s2}.${step.updated ? " New peak profit for at most 2 trades!" : " Kept previous 2nd sell profit."}`,
      next: "Move to the next trading day or finish scan.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All prices examined; s2 holds the global optimum for at most 2 transactions.",
      achieved: `Maximum achievable profit across at most 2 transactions is $${step.s2}.`,
      next: "Try another price pattern to compare 1-trade vs 2-trade gains.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Initialize b1 and b2 to -infinity (no initial stocks bought).",
      achieved: "b1 = b2 = -∞.",
      next: "Initialize s1 and s2 to 0.",
    },
    4: ({ step }) => ({
      chapter: 0,
      why: "Iterate through each price p in prices.",
      achieved: `Visiting day ${step.dayIndex} with price $${step.currentPrice}.`,
      next: "Evaluate b1.",
    }),
    5: ({ step }) => ({
      chapter: 1,
      why: "Update 1st buy net cash: b1 = max(b1, -p).",
      achieved: `b1 = ${fmt(step.b1)}.`,
      next: "Update s1.",
    }),
    6: ({ step }) => ({
      chapter: 1,
      why: "Update 1st sell profit: s1 = max(s1, b1 + p).",
      achieved: `s1 = ${step.s1}.`,
      next: "Update b2.",
    }),
    7: ({ step }) => ({
      chapter: 2,
      why: "Update 2nd buy net balance: b2 = max(b2, s1 - p).",
      achieved: `b2 = ${fmt(step.b2)}.`,
      next: "Update s2.",
    }),
    8: ({ step }) => ({
      chapter: 2,
      why: "Update 2nd sell total profit: s2 = max(s2, b2 + p).",
      achieved: `s2 = ${step.s2}.`,
      next: "Continue loop with next price.",
    }),
    9: ({ step }) => ({
      chapter: 3,
      why: "Return final value of s2.",
      achieved: `Final profit s2 = ${step.s2}.`,
      next: "Completed.",
    }),
  },
};
