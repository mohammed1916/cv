export const STOCK_CODE = [
  "def maxProfit(prices):",
  "    minPrice = float('inf')",
  "    maxProfit = 0",
  "    for price in prices:",
  "        if price < minPrice:",
  "            minPrice = price",
  "        elif price - minPrice > maxProfit:",
  "            maxProfit = price - minPrice",
  "    return maxProfit",
];

export function parsePricesInput(input) {
  if (input == null) {
    throw new Error("Input cannot be empty");
  }

  let raw;
  if (Array.isArray(input)) {
    raw = input;
  } else if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        throw new Error("Invalid JSON format for stock prices");
      }
    } else if (
      trimmed.startsWith("[") ||
      trimmed.endsWith("]") ||
      trimmed.startsWith("{") ||
      trimmed.endsWith("}")
    ) {
      throw new Error("Invalid JSON format for stock prices");
    } else {
      const parts = trimmed.split(",");
      raw = parts.map((part) => {
        const item = part.trim();
        if (item === "") {
          throw new Error("Empty price value in comma-separated input");
        }
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid price number: "${item}"`);
        }
        return num;
      });
    }
  } else {
    throw new Error("Prices must be an array or comma-separated string");
  }

  if (!Array.isArray(raw)) {
    throw new Error("Prices must be an array");
  }

  if (raw.length === 0) {
    throw new Error("Prices array must contain at least 1 price");
  }

  if (raw.length > 100) {
    throw new Error("Prices array exceeds limit (max 100 prices)");
  }

  const prices = raw.map((val, idx) => {
    if (typeof val !== "number" || !Number.isInteger(val)) {
      throw new Error(
        `Price at index ${idx} must be an integer, got ${JSON.stringify(val)}`,
      );
    }
    if (val < 0) {
      throw new Error(`Price at index ${idx} cannot be negative (${val})`);
    }
    if (val > 1000000) {
      throw new Error(
        `Price at index ${idx} exceeds maximum limit of 1,000,000 (${val})`,
      );
    }
    return val;
  });

  return prices;
}

export function buildStock1Story(input) {
  const prices = Object.freeze(parsePricesInput(input));
  const frames = [];

  let minPrice = Infinity;
  let minDay = -1;
  let maxProfit = 0;
  let bestBuyDay = -1;
  let bestSellDay = -1;

  // Frame 1: Line 2 - minPrice = float('inf')
  frames.push(
    Object.freeze({
      activeLine: 2,
      phase: "init",
      i: -1,
      currentPrice: null,
      minPrice: Infinity,
      minDay: -1,
      maxProfit: 0,
      bestBuyDay: -1,
      bestSellDay: -1,
      prospectiveProfit: null,
      message: "Initialize minPrice = ∞.",
      explanation:
        "Start minPrice at infinity so the first price visited will automatically become the initial candidate buy price.",
    }),
  );

  // Frame 2: Line 3 - maxProfit = 0
  frames.push(
    Object.freeze({
      activeLine: 3,
      phase: "init",
      i: -1,
      currentPrice: null,
      minPrice: Infinity,
      minDay: -1,
      maxProfit: 0,
      bestBuyDay: -1,
      bestSellDay: -1,
      prospectiveProfit: null,
      message: "Initialize maxProfit = 0.",
      explanation:
        "Initialize maxProfit to 0. If no profitable trade is found, we make zero transactions.",
    }),
  );

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];

    // Frame: Line 4 - for price in prices:
    frames.push(
      Object.freeze({
        activeLine: 4,
        phase: "scan",
        i,
        currentPrice: price,
        minPrice,
        minDay,
        maxProfit,
        bestBuyDay,
        bestSellDay,
        prospectiveProfit: null,
        message: `Day ${i}: Inspect price = ${price}.`,
        explanation: `Checking price on day ${i} (${price}) to see if it gives a lower buy price or a higher profit.`,
      }),
    );

    // Frame: Line 5 - if price < minPrice:
    const isLower = price < minPrice;
    frames.push(
      Object.freeze({
        activeLine: 5,
        phase: "compare",
        i,
        currentPrice: price,
        minPrice,
        minDay,
        maxProfit,
        bestBuyDay,
        bestSellDay,
        prospectiveProfit: null,
        message: isLower
          ? `Check if price (${price}) < minPrice (${minPrice === Infinity ? "∞" : minPrice}): True.`
          : `Check if price (${price}) < minPrice (${minPrice}): False.`,
        explanation: isLower
          ? `Found a new lowest price (${price}) on day ${i}. This is our best buy candidate so far.`
          : `Price (${price}) is not lower than current minPrice (${minPrice}). Next, evaluate selling on day ${i}.`,
      }),
    );

    if (isLower) {
      minPrice = price;
      minDay = i;

      // Frame: Line 6 - minPrice = price
      frames.push(
        Object.freeze({
          activeLine: 6,
          phase: "update",
          i,
          currentPrice: price,
          minPrice,
          minDay,
          maxProfit,
          bestBuyDay,
          bestSellDay,
          prospectiveProfit: null,
          message: `Update minPrice = ${price} at day ${i}.`,
          explanation: `New buying baseline set to ${price} on day ${i}. Subsequent selling opportunities will measure profit from here.`,
        }),
      );
    } else {
      const prospectiveProfit = price - minPrice;
      const isNewMax = prospectiveProfit > maxProfit;

      // Frame: Line 7 - elif price - minPrice > maxProfit:
      frames.push(
        Object.freeze({
          activeLine: 7,
          phase: "compare",
          i,
          currentPrice: price,
          minPrice,
          minDay,
          maxProfit,
          bestBuyDay,
          bestSellDay,
          prospectiveProfit,
          message: isNewMax
            ? `Check if profit (${price} − ${minPrice} = ${prospectiveProfit}) > maxProfit (${maxProfit}): True.`
            : `Check if profit (${price} − ${minPrice} = ${prospectiveProfit}) > maxProfit (${maxProfit}): False.`,
          explanation: isNewMax
            ? `Buying on day ${minDay} (${minPrice}) and selling on day ${i} (${price}) produces profit of ${prospectiveProfit}, beating ${maxProfit}!`
            : `Selling on day ${i} gives profit of ${prospectiveProfit}, which does not exceed current best profit of ${maxProfit}.`,
        }),
      );

      if (isNewMax) {
        maxProfit = prospectiveProfit;
        bestBuyDay = minDay;
        bestSellDay = i;

        // Frame: Line 8 - maxProfit = price - minPrice
        frames.push(
          Object.freeze({
            activeLine: 8,
            phase: "update",
            i,
            currentPrice: price,
            minPrice,
            minDay,
            maxProfit,
            bestBuyDay,
            bestSellDay,
            prospectiveProfit,
            message: `Update maxProfit = ${maxProfit} (Buy Day ${minDay} @ ${minPrice}, Sell Day ${i} @ ${price}).`,
            explanation: `Recorded new best trade: buy on day ${minDay} for ${minPrice} and sell on day ${i} for ${price}, earning ${maxProfit}.`,
          }),
        );
      }
    }
  }

  // Frame: Line 9 - return maxProfit
  frames.push(
    Object.freeze({
      activeLine: 9,
      phase: "done",
      i: -1,
      currentPrice: null,
      minPrice,
      minDay,
      maxProfit,
      bestBuyDay,
      bestSellDay,
      prospectiveProfit: null,
      message:
        maxProfit > 0
          ? `Complete! Max profit is ${maxProfit} (buy on day ${bestBuyDay} @ ${prices[bestBuyDay]}, sell on day ${bestSellDay} @ ${prices[bestSellDay]}).`
          : "Complete! Max profit is 0 (no profitable transaction possible).",
      explanation:
        maxProfit > 0
          ? `The single most profitable trade achieves a profit of ${maxProfit} by buying on day ${bestBuyDay} at ${prices[bestBuyDay]} and selling on day ${bestSellDay} at ${prices[bestSellDay]}.`
          : "Prices decrease or stay constant over time, so making 0 transactions is optimal.",
    }),
  );

  return {
    prices,
    minPrice,
    maxProfit,
    bestBuyDay,
    bestSellDay,
    frames,
  };
}
