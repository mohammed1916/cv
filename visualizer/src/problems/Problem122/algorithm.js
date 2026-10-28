export const STOCK_CODE = [
  "def maxProfit(prices):",
  "    profit = 0",
  "    for i in range(1, len(prices)):",
  "        if prices[i] > prices[i-1]:",
  "            profit += prices[i] - prices[i-1]",
  "    return profit",
];

export function parsePricesInput(input) {
  if (input === null || input === undefined) {
    throw new Error("Input is required");
  }

  let parsed = input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (err) {
        throw new Error(`Invalid JSON array format: ${err.message}`, {
          cause: err,
        });
      }
    } else {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        const items = trimmed.split(",").map((s) => s.trim());
        parsed = items.map((item) => {
          const num = Number(item);
          if (item === "" || isNaN(num)) {
            throw new Error(`Invalid price value: "${item}"`);
          }
          return num;
        });
      }
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Prices input must be an array of integers");
  }

  if (parsed.length > 100) {
    throw new Error("Prices array exceeds maximum supported length (100)");
  }

  for (let i = 0; i < parsed.length; i++) {
    const price = parsed[i];
    if (
      typeof price !== "number" ||
      !Number.isInteger(price) ||
      !Number.isFinite(price)
    ) {
      throw new Error(
        `Invalid price at index ${i}: "${price}". All prices must be integers.`,
      );
    }
    if (price < 0) {
      throw new Error(
        `Invalid price at index ${i}: ${price}. Prices cannot be negative.`,
      );
    }
  }

  return parsed;
}

export function buildStock2Story(input) {
  const prices = parsePricesInput(input);
  const n = prices.length;
  const frames = [];

  if (n === 0) {
    frames.push({
      activeLine: 6,
      phase: "done",
      currentDay: null,
      prevDay: null,
      currentPrice: null,
      prevPrice: null,
      diff: null,
      isUpward: false,
      profit: 0,
      transactions: [],
      message: "Empty price list: total profit is 0.",
      explanation:
        "No trading days are available. With zero prices, no transactions can be executed.",
    });

    return {
      prices: [],
      totalProfit: 0,
      transactions: [],
      frames,
    };
  }

  let profit = 0;
  const transactions = [];

  // Frame 1: Init profit = 0
  frames.push({
    activeLine: 2,
    phase: "init",
    currentDay: null,
    prevDay: null,
    currentPrice: null,
    prevPrice: null,
    diff: null,
    isUpward: false,
    profit: 0,
    transactions: [],
    message: "Initialize profit = 0.",
    explanation:
      "Start with an initial profit of 0. We iterate through adjacent days (i = 1 to len(prices) - 1) and capture every positive price increase.",
  });

  if (n === 1) {
    frames.push({
      activeLine: 6,
      phase: "done",
      currentDay: 0,
      prevDay: null,
      currentPrice: prices[0],
      prevPrice: null,
      diff: null,
      isUpward: false,
      profit: 0,
      transactions: [],
      message: `Only 1 day available ($${prices[0]}): cannot sell on a future day. Total profit is 0.`,
      explanation:
        "At least two trading days are needed to buy and sell for a profit. Returning profit = 0.",
    });

    return {
      prices: [...prices],
      totalProfit: 0,
      transactions: [],
      frames,
    };
  }

  for (let i = 1; i < n; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];
    const diff = currentPrice - prevPrice;
    const isUpward = diff > 0;

    // Line 4: comparison frame
    frames.push({
      activeLine: 4,
      phase: "compare",
      currentDay: i,
      prevDay: i - 1,
      currentPrice,
      prevPrice,
      diff,
      isUpward,
      profit,
      transactions: [...transactions],
      message: isUpward
        ? `Day ${i} ($${currentPrice}) > Day ${i - 1} ($${prevPrice}): +$${diff} price increase.`
        : `Day ${i} ($${currentPrice}) <= Day ${i - 1} ($${prevPrice}): ${diff === 0 ? "no price change" : `-$${Math.abs(diff)} price drop`}. No profit.`,
      explanation: isUpward
        ? `Comparing day ${i} (price $${currentPrice}) with day ${i - 1} (price $${prevPrice}). The stock price rose by $${diff}. Condition prices[${i}] > prices[${i - 1}] is TRUE.`
        : `Comparing day ${i} (price $${currentPrice}) with day ${i - 1} (price $${prevPrice}). The price did not increase (change: ${diff >= 0 ? `+$${diff}` : `-$${Math.abs(diff)}`}). Condition prices[${i}] > prices[${i - 1}] is FALSE; skip buying here.`,
    });

    if (isUpward) {
      profit += diff;
      const tx = { buyDay: i - 1, sellDay: i, profit: diff };
      transactions.push(tx);

      // Line 5: capture profit frame
      frames.push({
        activeLine: 5,
        phase: "update",
        currentDay: i,
        prevDay: i - 1,
        currentPrice,
        prevPrice,
        diff,
        isUpward: true,
        profit,
        transactions: [...transactions],
        message: `Capture profit: +$${diff}. Total accumulated profit = $${profit}.`,
        explanation: `Buy on day ${i - 1} at $${prevPrice} and sell on day ${i} at $${currentPrice}. We bank $${diff} profit, bringing total profit to $${profit}.`,
      });
    }
  }

  // Line 6: done frame
  frames.push({
    activeLine: 6,
    phase: "done",
    currentDay: null,
    prevDay: null,
    currentPrice: null,
    prevPrice: null,
    diff: null,
    isUpward: false,
    profit,
    transactions: [...transactions],
    message: `Finished! Maximum total profit is $${profit} across ${transactions.length} transaction(s).`,
    explanation: `Greedy choice is globally optimal: every multi-day upward run (p[b] - p[a]) is mathematically identical to the sum of consecutive daily gains. Final max profit: $${profit}.`,
  });

  return {
    prices: [...prices],
    totalProfit: profit,
    transactions: [...transactions],
    frames,
  };
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_PRICES = 60
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"prices": [7,1,5,3,6,4]}.') }
  if (!data || typeof data !== 'object' || !Array.isArray(data.prices)) throw new Error('Input must be an object with a "prices" array.')
  if (data.prices.length < 1 || data.prices.length > MAX_PRICES) throw new Error(`Use between 1 and ${MAX_PRICES} prices for this trace.`)
  for (const p of data.prices) if (!Number.isInteger(p) || p < 0 || p > 10000) throw new Error('Prices must be integers from 0 to 10000.')
  return { prices: data.prices }
}

export function buildTrace(input) {
  const prices = input.prices
  let total = 0
  const frames = [{ activeLine: L('total = 0'), phase: 'init', day: 0, total, message: 'No profit yet. Every upward move between neighbouring days can be captured.' }]
  for (let day = 1; day < prices.length; day++) {
    const rise = prices[day] - prices[day - 1]
    frames.push({ activeLine: L('if price today is above'), phase: 'check', day, total, message: `Day ${day}: ${prices[day - 1]} to ${prices[day]} is a change of ${rise}.` })
    if (rise > 0) total += rise
    frames.push({ activeLine: rise > 0 ? L('total = total +') : L('total = total +'), phase: rise > 0 ? 'gain' : 'skip', day, total, message: rise > 0 ? `Capture the rise of ${rise}; total is now ${total}.` : 'No rise, so no trade is made on this step.' })
  }
  frames.push({ activeLine: L('return total'), phase: 'done', day: prices.length - 1, total, message: `Maximum profit with unlimited transactions is ${total}.` })
  return { input, result: total, frames }
}

export const code = [
  { line: 1, text: 'maximum profit with unlimited transactions' },
  { line: 2, text: 'total = 0' },
  { line: 3, text: 'for each day from the second onward' },
  { line: 4, text: 'if price today is above price yesterday' },
  { line: 5, text: 'total = total + (today minus yesterday)' },
  { line: 6, text: 'return total' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit(prices):
    total = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            total = total + (prices[i] - prices[i - 1])
    return total
`
