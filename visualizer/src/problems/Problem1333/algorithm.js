const PYTHON_LINES = [
  "def filterRestaurants(restaurants, veganFriendly, maxPrice, maxDistance):",
  "    kept = []",
  "    for restaurant in restaurants:",
  "        id_, rating, vegan, price, distance = restaurant",
  "        if veganFriendly == 1 and vegan != 1:",
  "            continue",
  "        if price > maxPrice or distance > maxDistance:",
  "            continue",
  "        kept.append((rating, id_))",
  "    kept.sort(reverse=True)",
  "    return [id_ for rating, id_ in kept]",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "kept = empty list" },
  { line: 2, text: "for each restaurant [id, rating, vegan, price, distance]:" },
  { line: 3, text: "if veganFriendly is 1 and vegan is 0: skip it" },
  { line: 4, text: "if price > maxPrice or distance > maxDistance: skip it" },
  { line: 5, text: "add (rating, id) to kept" },
  { line: 6, text: "sort kept by rating descending, then id descending" },
  { line: 7, text: "return the ids in kept order" },
];

export const pythonLineMap = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9, 6: 10, 7: 11 };

export const examples = [
  { label: "Vegan only", input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":1,"maxPrice":50,"maxDistance":10}' },
  { label: "Any", input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":50,"maxDistance":10}' },
  { label: "Tight limits", input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":30,"maxDistance":3}' },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"restaurants":[[1,4,1,40,10]],"veganFriendly":1,"maxPrice":50,"maxDistance":10}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { restaurants, veganFriendly, maxPrice, maxDistance } = data;
  if (!Array.isArray(restaurants) || restaurants.length < 1) throw new Error("restaurants must be a non-empty array");
  if (restaurants.length > 50) throw new Error(`restaurants has ${restaurants.length} rows; the visualization caps it at 50`);
  restaurants.forEach((r, i) => {
    if (!Array.isArray(r) || r.length !== 5 || !r.every(Number.isInteger)) throw new Error(`restaurants[${i}] must be [id, rating, veganFriendly, price, distance] of integers`);
    if (r[2] !== 0 && r[2] !== 1) throw new Error(`restaurants[${i}] vegan flag must be 0 or 1`);
  });
  if (veganFriendly !== 0 && veganFriendly !== 1) throw new Error("veganFriendly must be 0 or 1");
  if (!Number.isInteger(maxPrice) || !Number.isInteger(maxDistance)) throw new Error("maxPrice and maxDistance must be integers");
  return { restaurants: restaurants.map(r => [...r]), veganFriendly, maxPrice, maxDistance };
}

export function buildTrace(input) {
  const { restaurants, veganFriendly, maxPrice, maxDistance } = input;
  const frames = [];
  const kept = [];
  const statuses = [];
  frames.push({ phase: "filter", activeLine: 1, message: "Start with no kept restaurants.", i: -1, statuses: [], kept: [], order: [] });
  restaurants.forEach(([id, rating, vegan, price, distance], i) => {
    frames.push({ phase: "filter", activeLine: 2, message: `Check restaurant ${id}.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] });
    if (veganFriendly === 1 && vegan !== 1) {
      statuses.push("vegan");
      frames.push({ phase: "filter", activeLine: 3, message: `Restaurant ${id} is not vegan-friendly; skip.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] });
    } else if (price > maxPrice || distance > maxDistance) {
      statuses.push("limits");
      frames.push({ phase: "filter", activeLine: 4, message: `Restaurant ${id} is over the price or distance limit; skip.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] });
    } else {
      statuses.push("kept");
      kept.push({ id, rating });
      frames.push({ phase: "filter", activeLine: 5, message: `Keep restaurant ${id} with rating ${rating}.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] });
    }
  });
  const sorted = [...kept].sort((a, b) => (b.rating - a.rating) || (b.id - a.id));
  frames.push({ phase: "sort", activeLine: 6, message: "Sort by rating descending, then id descending.", i: -1, statuses: [...statuses], kept: kept.map(k => k.id), order: sorted.map(k => k.id) });
  const result = sorted.map(k => k.id);
  frames.push({ phase: "done", activeLine: 7, message: `Return ${JSON.stringify(result)}.`, i: -1, statuses: [...statuses], kept: kept.map(k => k.id), order: result });
  return { input, result, frames };
}
