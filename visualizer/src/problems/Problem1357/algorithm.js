const PYTHON_LINES = [
  "class Cashier:",
  "    def __init__(self, n, discount, products, prices):",
  "        self.n = n",
  "        self.discount = discount",
  "        self.count = 0",
  "        self.price = {p: c for p, c in zip(products, prices)}",
  "    def getBill(self, product, amount):",
  "        self.count += 1",
  "        total = sum(self.price[p] * a for p, a in zip(product, amount))",
  "        if self.count % self.n == 0:",
  "            total = total * (100 - self.discount) / 100",
  "        return total",
  "",
  "def cashierBills(n, discount, products, prices, orders):",
  "    cashier = Cashier(n, discount, products, prices)",
  "    return [cashier.getBill(o[\"product\"], o[\"amount\"]) for o in orders]",
];

export const python = PYTHON_LINES.join("\n");

const CODE_LINES = [
  "const price = new Map(products.map((p, i) => [p, prices[i]]))",
  "let count = 0",
  "for (const { product, amount } of orders) {",
  "  count += 1",
  "  let subtotal = product.reduce((sum, p, j) => sum + price.get(p) * amount[j], 0)",
  "  if (count % n === 0) subtotal = subtotal * (100 - discount) / 100",
  "  bills.push(subtotal)",
  "}",
  "return bills",
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

export const pythonLineMap = { 1: 6, 2: 5, 3: 16, 4: 8, 5: 9, 6: 10, 7: 12, 8: 16, 9: 16 };

export const examples = [
  {
    label: "Every 3rd",
    input: '{"n":3,"discount":50,"products":[1,2,3,4,5,6,7],"prices":[100,200,300,400,300,200,100],"orders":[{"product":[1,2],"amount":[1,1]},{"product":[3],"amount":[2]},{"product":[1,7],"amount":[3,2]},{"product":[4],"amount":[1]},{"product":[2,5],"amount":[2,1]},{"product":[6],"amount":[3]}]}',
  },
  {
    label: "Every 2nd, 20 off",
    input: '{"n":2,"discount":20,"products":[1,2],"prices":[500,250],"orders":[{"product":[1],"amount":[1]},{"product":[2],"amount":[4]},{"product":[1,2],"amount":[2,2]}]}',
  },
    { label: "Every order discounted", input: "{\"n\":1,\"discount\":10,\"products\":[1],\"prices\":[100],\"orders\":[{\"product\":[1],\"amount\":[1]}]}" },
    { label: "Equal prices", input: "{\"n\":2,\"discount\":50,\"products\":[1,2],\"prices\":[200,200],\"orders\":[{\"product\":[1,2],\"amount\":[1,1]},{\"product\":[2],\"amount\":[1]}]}" },
    { label: "Discount never reached", input: "{\"n\":10000,\"discount\":100,\"products\":[1],\"prices\":[1000],\"orders\":[{\"product\":[1],\"amount\":[3]}]}" },
    { label: "Long run: fifty orders", input: "{\"n\":7,\"discount\":25,\"products\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],\"prices\":[353,755,231,901,11,22,139,45,112,860,304,601,709,996,613,784,715,826,367,630],\"orders\":[{\"product\":[5,14],\"amount\":[5,3]},{\"product\":[20,15,11],\"amount\":[3,5,4]},{\"product\":[15,18],\"amount\":[2,2]},{\"product\":[19],\"amount\":[1]},{\"product\":[20],\"amount\":[1]},{\"product\":[20,18],\"amount\":[3,4]},{\"product\":[1],\"amount\":[3]},{\"product\":[12,9,2],\"amount\":[5,3,3]},{\"product\":[11,17],\"amount\":[5,1]},{\"product\":[3,7],\"amount\":[1,3]},{\"product\":[3],\"amount\":[5]},{\"product\":[5,10,15],\"amount\":[4,3,2]},{\"product\":[16,12],\"amount\":[5,1]},{\"product\":[11,9,7],\"amount\":[3,3,1]},{\"product\":[6,13],\"amount\":[1,1]},{\"product\":[14,2,11],\"amount\":[2,2,4]},{\"product\":[12,11,8],\"amount\":[2,5,4]},{\"product\":[7,12,10],\"amount\":[3,2,4]},{\"product\":[18],\"amount\":[3]},{\"product\":[4],\"amount\":[4]},{\"product\":[9,16],\"amount\":[2,5]},{\"product\":[6],\"amount\":[4]},{\"product\":[12,16],\"amount\":[3,5]},{\"product\":[12],\"amount\":[3]},{\"product\":[1],\"amount\":[4]},{\"product\":[7],\"amount\":[4]},{\"product\":[12],\"amount\":[3]},{\"product\":[16,19,15],\"amount\":[3,3,1]},{\"product\":[18,14],\"amount\":[2,4]},{\"product\":[17],\"amount\":[5]},{\"product\":[5,7,10],\"amount\":[5,2,2]},{\"product\":[6,12,14],\"amount\":[4,3,3]},{\"product\":[7],\"amount\":[2]},{\"product\":[7,8],\"amount\":[4,5]},{\"product\":[12,6],\"amount\":[3,1]},{\"product\":[17,4],\"amount\":[2,1]},{\"product\":[18],\"amount\":[5]},{\"product\":[1,2],\"amount\":[2,3]},{\"product\":[5],\"amount\":[1]},{\"product\":[19,4,3],\"amount\":[2,3,4]},{\"product\":[13],\"amount\":[1]},{\"product\":[10],\"amount\":[5]},{\"product\":[12,17,8],\"amount\":[2,2,4]},{\"product\":[16,8],\"amount\":[4,3]},{\"product\":[20],\"amount\":[5]},{\"product\":[5,17,14],\"amount\":[4,3,5]},{\"product\":[6,20],\"amount\":[2,3]},{\"product\":[7,3],\"amount\":[1,5]},{\"product\":[3,1,4],\"amount\":[2,3,4]},{\"product\":[15,11,1],\"amount\":[2,4,4]}]}" },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"n":3,"discount":50,"products":[1],"prices":[100],"orders":[{"product":[1],"amount":[2]}]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { n, discount, products, prices, orders } = data;
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error("n must be an integer from 1 to 10000");
  if (!Number.isInteger(discount) || discount < 0 || discount > 100) throw new Error("discount must be an integer from 0 to 100");
  if (!Array.isArray(products) || !Array.isArray(prices) || products.length !== prices.length) throw new Error("products and prices must be arrays of equal length");
  if (products.length < 1 || products.length > 200) throw new Error("products must have 1 to 200 entries");
  if (new Set(products).size !== products.length || !products.every(p => Number.isInteger(p) && p >= 1 && p <= 200)) throw new Error("products must be unique ids from 1 to 200");
  if (!prices.every(p => Number.isInteger(p) && p >= 1 && p <= 1000)) throw new Error("prices must be integers from 1 to 1000");
  if (!Array.isArray(orders) || orders.length < 1) throw new Error("orders must be a non-empty array");
  if (orders.length > 50) throw new Error(`orders has ${orders.length} entries; the visualization caps it at 50`);
  const known = new Set(products);
  orders.forEach((o, k) => {
    if (!o || !Array.isArray(o.product) || !Array.isArray(o.amount) || o.product.length !== o.amount.length || o.product.length < 1) {
      throw new Error(`orders[${k}] needs product and amount arrays of equal length`);
    }
    if (new Set(o.product).size !== o.product.length) throw new Error(`orders[${k}] repeats a product id`);
    o.product.forEach((p, j) => {
      if (!known.has(p)) throw new Error(`orders[${k}] uses product ${p}, which is not in products`);
      if (!Number.isInteger(o.amount[j]) || o.amount[j] < 1 || o.amount[j] > 1000) throw new Error(`orders[${k}] amounts must be integers from 1 to 1000`);
    });
  });
  return { n, discount, products: [...products], prices: [...prices], orders: orders.map(o => ({ product: [...o.product], amount: [...o.amount] })) };
}

export function buildTrace(input) {
  const { n, discount, products, prices, orders } = input;
  const price = new Map(products.map((p, i) => [p, prices[i]]));
  const frames = [];
  const bills = [];
  let count = 0;
  frames.push({ phase: "setup", activeLine: 1, message: "Store the price of every product.", k: -1, count, subtotal: null, bills: [] });
  frames.push({ phase: "setup", activeLine: 2, message: "Start the customer counter at 0.", k: -1, count, subtotal: null, bills: [] });
  orders.forEach((order, k) => {
    frames.push({ phase: "bill", activeLine: 3, message: `Customer ${k + 1} checks out.`, k, count, subtotal: null, bills: [...bills] });
    count += 1;
    frames.push({ phase: "bill", activeLine: 4, message: `Customer count is now ${count}.`, k, count, subtotal: null, bills: [...bills] });
    let subtotal = 0;
    order.product.forEach((p, j) => { subtotal += price.get(p) * order.amount[j]; });
    frames.push({ phase: "bill", activeLine: 5, message: `Subtotal before discount is ${subtotal}.`, k, count, subtotal, bills: [...bills] });
    if (count % n === 0) {
      subtotal = subtotal * (100 - discount) / 100;
      frames.push({ phase: "bill", activeLine: 6, message: `Customer ${count} is every ${n}th; ${discount}% off gives ${subtotal}.`, k, count, subtotal, bills: [...bills] });
    } else {
      frames.push({ phase: "bill", activeLine: 6, message: `No discount for customer ${count}.`, k, count, subtotal, bills: [...bills] });
    }
    bills.push(subtotal);
    frames.push({ phase: "bill", activeLine: 7, message: `Bill for customer ${k + 1} is ${subtotal}.`, k, count, subtotal, bills: [...bills] });
  });
  frames.push({ phase: "done", activeLine: 9, message: "All bills are computed.", k: -1, count, subtotal: null, bills: [...bills] });
  return { input, result: bills, frames };
}
