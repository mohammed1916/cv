export const STOCK_CODE = [
  "def maxProfit(prices):",
  "    b1 = b2 = -inf",
  "    s1 = s2 = 0",
  "    for p in prices:",
  "        b1 = max(b1, -p)",
  "        s1 = max(s1, b1 + p)",
  "        b2 = max(b2, s1 - p)",
  "        s2 = max(s2, b2 + p)",
  "    return s2",
];

function fmt(val) {
  if (val === -Infinity || !Number.isFinite(val)) return "-∞";
  return String(val);
}

export function parsePricesInput(input) {
  if (input === null || input === undefined) {
    throw new Error("Input must be provided");
  }

  let parsed;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }

    if (trimmed.startsWith("{")) {
      throw new Error("Prices must be an array of numbers");
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      if (trimmed.startsWith("[")) {
        throw new Error("Invalid JSON format for prices");
      }
      try {
        parsed = JSON.parse(`[${trimmed}]`);
      } catch {
        throw new Error("Invalid format for prices: must be a list of numbers");
      }
    }
  } else {
    parsed = input;
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Prices must be an array of numbers");
  }

  if (parsed.length > 50) {
    throw new Error("Prices array exceeds limit (max 50 elements)");
  }

  for (let i = 0; i < parsed.length; i++) {
    const val = parsed[i];
    if (typeof val !== "number" || !Number.isInteger(val) || Number.isNaN(val)) {
      throw new Error(`Invalid integer at index ${i}: ${val}`);
    }
    if (val < 0) {
      throw new Error(`Price at index ${i} cannot be negative (${val})`);
    }
    if (val > 1000000) {
      throw new Error(`Price at index ${i} out of reasonable range`);
    }
  }

  return parsed;
}

export function buildStock3Story(input) {
  const prices = parsePricesInput(input);
  const n = prices.length;

  if (n === 0) {
    return {
      prices: [],
      maxProfit: 0,
      frames: [
        {
          activeLine: 2,
          phase: "init",
          dayIndex: -1,
          currentPrice: null,
          b1: -Infinity,
          s1: 0,
          b2: -Infinity,
          s2: 0,
          prevStates: { b1: -Infinity, s1: 0, b2: -Infinity, s2: 0 },
          activeVar: null,
          updated: false,
          comparison: null,
          history: [],
          message: "Empty prices list: initialize b1 = b2 = -∞, s1 = s2 = 0.",
          explanation:
            "No price history provided. b1 and b2 represent Buy 1 and Buy 2 net cash (starting at -∞ before any purchase), while s1 and s2 represent Sell 1 and Sell 2 net profit (starting at 0).",
        },
        {
          activeLine: 9,
          phase: "done",
          dayIndex: -1,
          currentPrice: null,
          b1: -Infinity,
          s1: 0,
          b2: -Infinity,
          s2: 0,
          prevStates: { b1: -Infinity, s1: 0, b2: -Infinity, s2: 0 },
          activeVar: null,
          updated: false,
          comparison: null,
          history: [],
          message: "Done! With no trading days, maximum profit is 0.",
          explanation:
            "With an empty prices array, no transactions can be executed. Return s2 = 0.",
        },
      ],
    };
  }

  let b1 = -Infinity;
  let s1 = 0;
  let b2 = -Infinity;
  let s2 = 0;

  const history = [];
  const frames = [];

  // Frame 1: Init variables (lines 2-3)
  frames.push({
    activeLine: 2,
    phase: "init",
    dayIndex: -1,
    currentPrice: null,
    b1,
    s1,
    b2,
    s2,
    prevStates: { b1, s1, b2, s2 },
    activeVar: null,
    updated: false,
    comparison: null,
    history: [],
    message: "Initialize states: b1 = b2 = -∞, s1 = s2 = 0.",
    explanation:
      "We track 4 states in a single pass: b1 (Buy 1 net cash), s1 (Sell 1 net cash), b2 (Buy 2 net cash), and s2 (Sell 2 final profit). Initial buy balances start at -∞ (no purchases yet) and sells start at 0 (0 initial profit).",
  });

  // Iteration through prices
  for (let i = 0; i < n; i++) {
    const p = prices[i];

    // Day arrival (line 4: for p in prices)
    frames.push({
      activeLine: 4,
      phase: "iterate",
      dayIndex: i,
      currentPrice: p,
      b1,
      s1,
      b2,
      s2,
      prevStates: { b1, s1, b2, s2 },
      activeVar: null,
      updated: false,
      comparison: null,
      history: [...history],
      message: `Day ${i}: Current stock price is $${p}.`,
      explanation: `Day ${i} at price $${p}. We evaluate updating our 4 states sequentially: Buy 1, Sell 1, Buy 2, and Sell 2.`,
    });

    // 1. b1 = max(b1, -p)
    const prevB1 = b1;
    const candB1 = -p;
    const newB1 = Math.max(prevB1, candB1);
    const updatedB1 = newB1 !== prevB1;
    b1 = newB1;

    frames.push({
      activeLine: 5,
      phase: "buy1",
      dayIndex: i,
      currentPrice: p,
      b1,
      s1,
      b2,
      s2,
      prevStates: { b1: prevB1, s1, b2, s2 },
      activeVar: "b1",
      updated: updatedB1,
      comparison: {
        target: "b1",
        label: "Buy 1 net cash",
        formula: `max(b1, -p) = max(${fmt(prevB1)}, -${p})`,
        prevVal: prevB1,
        candVal: candB1,
        resultVal: b1,
        updated: updatedB1,
      },
      history: [...history],
      message: `Day ${i} (b1): max(${fmt(prevB1)}, -${p}) = ${fmt(b1)}.${updatedB1 ? ` Buy 1 updated to buying at $${p}.` : " Kept previous 1st buy."}`,
      explanation: `Buy 1 net cash (b1): Represents maximum remaining cash after buying the 1st stock. Buying today costs $${p} (net cash -${p}). ${
        updatedB1
          ? `Since -${p} > ${fmt(prevB1)}, buying today at $${p} minimizes buying cost (highest net cash: ${fmt(b1)}).`
          : `Previous 1st buy position (${fmt(prevB1)}) is as good or better than buying today at $${p} (-${p}). Keep previous b1.`
      }`,
    });

    // 2. s1 = max(s1, b1 + p)
    const prevS1 = s1;
    const candS1 = b1 + p;
    const newS1 = Math.max(prevS1, candS1);
    const updatedS1 = newS1 !== prevS1;
    s1 = newS1;

    frames.push({
      activeLine: 6,
      phase: "sell1",
      dayIndex: i,
      currentPrice: p,
      b1,
      s1,
      b2,
      s2,
      prevStates: { b1, s1: prevS1, b2, s2 },
      activeVar: "s1",
      updated: updatedS1,
      comparison: {
        target: "s1",
        label: "Sell 1 net cash",
        formula: `max(s1, b1 + p) = max(${prevS1}, ${fmt(b1)} + ${p})`,
        prevVal: prevS1,
        candVal: candS1,
        resultVal: s1,
        updated: updatedS1,
      },
      history: [...history],
      message: `Day ${i} (s1): max(${prevS1}, ${fmt(b1)} + ${p}) = ${s1}.${updatedS1 ? ` Sell 1 profit raised to $${s1}.` : " Kept previous 1st sell profit."}`,
      explanation: `Sell 1 net cash (s1): Represents maximum profit after completing the 1st transaction. Selling today at $${p} paired with optimal 1st buy (${fmt(b1)}) yields profit of ${fmt(b1)} + ${p} = ${candS1}. ${
        updatedS1
          ? `Selling today yields higher profit of $${s1} than earlier sell opportunities ($${prevS1}). Update s1.`
          : `Previous 1st sell profit ($${prevS1}) is as good or better than selling today ($${candS1}). Keep previous s1.`
      }`,
    });

    // 3. b2 = max(b2, s1 - p)
    const prevB2 = b2;
    const candB2 = s1 - p;
    const newB2 = Math.max(prevB2, candB2);
    const updatedB2 = newB2 !== prevB2;
    b2 = newB2;

    frames.push({
      activeLine: 7,
      phase: "buy2",
      dayIndex: i,
      currentPrice: p,
      b1,
      s1,
      b2,
      s2,
      prevStates: { b1, s1, b2: prevB2, s2 },
      activeVar: "b2",
      updated: updatedB2,
      comparison: {
        target: "b2",
        label: "Buy 2 net cash",
        formula: `max(b2, s1 - p) = max(${fmt(prevB2)}, ${s1} - ${p})`,
        prevVal: prevB2,
        candVal: candB2,
        resultVal: b2,
        updated: updatedB2,
      },
      history: [...history],
      message: `Day ${i} (b2): max(${fmt(prevB2)}, ${s1} - ${p}) = ${fmt(b2)}.${updatedB2 ? ` Buy 2 updated: reinvesting profit at $${p}.` : " Kept previous 2nd buy balance."}`,
      explanation: `Buy 2 net cash (b2): Represents maximum net cash after buying a 2nd stock, reinvesting profits from transaction 1 ($${s1}). Buying today leaves $${s1} - $${p} = ${candB2}. ${
        updatedB2
          ? `Reinvesting today yields higher net balance ($${b2}) than previous 2nd buy balance ($${fmt(prevB2)}). Update b2.`
          : `Previous 2nd buy balance ($${fmt(prevB2)}) is as good or better than buying today ($${candB2}). Keep previous b2.`
      }`,
    });

    // 4. s2 = max(s2, b2 + p)
    const prevS2 = s2;
    const candS2 = b2 + p;
    const newS2 = Math.max(prevS2, candS2);
    const updatedS2 = newS2 !== prevS2;
    s2 = newS2;

    // Record completed day into history
    history.push({
      day: i,
      price: p,
      b1,
      s1,
      b2,
      s2,
    });

    frames.push({
      activeLine: 8,
      phase: "sell2",
      dayIndex: i,
      currentPrice: p,
      b1,
      s1,
      b2,
      s2,
      prevStates: { b1, s1, b2, s2: prevS2 },
      activeVar: "s2",
      updated: updatedS2,
      comparison: {
        target: "s2",
        label: "Sell 2 final profit",
        formula: `max(s2, b2 + p) = max(${prevS2}, ${fmt(b2)} + ${p})`,
        prevVal: prevS2,
        candVal: candS2,
        resultVal: s2,
        updated: updatedS2,
      },
      history: [...history],
      message: `Day ${i} (s2): max(${prevS2}, ${fmt(b2)} + ${p}) = ${s2}.${updatedS2 ? ` New 2-transaction profit peak: $${s2}!` : " Kept previous 2-transaction profit."}`,
      explanation: `Sell 2 final profit (s2): Represents maximum overall profit after completing at most 2 transactions. Selling our 2nd stock today yields b2 + ${p} = ${fmt(b2)} + ${p} = ${candS2}. ${
        updatedS2
          ? `Selling today increases total profit to $${s2}! Update s2.`
          : `Previous 2-transaction profit ($${prevS2}) is as good or better than selling today ($${candS2}). Keep previous s2.`
      }`,
    });
  }

  // Done frame (line 9: return s2)
  frames.push({
    activeLine: 9,
    phase: "done",
    dayIndex: n - 1,
    currentPrice: null,
    b1,
    s1,
    b2,
    s2,
    prevStates: { b1, s1, b2, s2 },
    activeVar: null,
    updated: false,
    comparison: null,
    history: [...history],
    message: `Done! Maximum profit after at most 2 transactions is s2 = ${s2}.`,
    explanation: `All ${n} days evaluated. The final value s2 = ${s2} is the maximum achievable profit using at most two buy-and-sell cycles without overlapping.`,
  });

  return {
    prices,
    maxProfit: s2,
    frames,
  };
}
