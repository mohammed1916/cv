export const CODE = [
  "FUNCTION countUnhappyFriends(n, preferences, pairs)",
  "    partner ← array of size n",
  "    FOR each pair [x, y]: partner[x] ← y and partner[y] ← x",
  "    rank[u][w] ← position of w in preferences[u], for every u",
  "    unhappy ← 0",
  "    FOR each friend x FROM 0 THROUGH n − 1",
  "        FOR each u in preferences[x] before partner[x]",
  "            IF u prefers x over partner[u]",
  "                unhappy ← unhappy + 1 and stop checking x",
  "    RETURN unhappy",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const python = `def unhappyFriends(n, preferences, pairs):
    partner = [0] * n
    for x, y in pairs:
        partner[x] = y
        partner[y] = x
    rank = [[0] * n for _ in range(n)]
    for u in range(n):
        for pos, w in enumerate(preferences[u]):
            rank[u][w] = pos
    unhappy = 0
    for x in range(n):
        for u in preferences[x]:
            if u == partner[x]:
                break
            if rank[u][x] < rank[u][partner[u]]:
                unhappy += 1
                break
    return unhappy`;

// Pseudocode activeLine -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 6, 5: 10, 6: 11, 7: 12, 8: 15, 9: 16, 10: 18 };

const LIMIT = 40;

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try { data = JSON.parse(text); } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`); }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "n", "preferences" and "pairs".');
  const { n, preferences, pairs } = data;
  if (!Number.isInteger(n) || n < 2 || n % 2 !== 0) throw new Error("n must be an even integer of at least 2.");
  if (n > LIMIT) throw new Error(`n (${n}) exceeds the visualization limit of ${LIMIT}; LeetCode allows up to 500.`);
  if (!Array.isArray(preferences) || preferences.length !== n) throw new Error(`preferences must have exactly n = ${n} rows.`);
  preferences.forEach((row, u) => {
    if (!Array.isArray(row) || row.length !== n - 1) throw new Error(`preferences[${u}] must list the other ${n - 1} friends.`);
    const seen = new Set(row);
    if (seen.size !== n - 1 || row.some(w => !Number.isInteger(w) || w < 0 || w >= n || w === u)) {
      throw new Error(`preferences[${u}] must be a permutation of every friend except ${u}.`);
    }
  });
  if (!Array.isArray(pairs) || pairs.length !== n / 2) throw new Error(`pairs must have n / 2 = ${n / 2} entries.`);
  const covered = new Set();
  pairs.forEach(pair => {
    if (!Array.isArray(pair) || pair.length !== 2 || pair[0] === pair[1] || pair.some(p => !Number.isInteger(p) || p < 0 || p >= n)) {
      throw new Error(`Invalid pair ${JSON.stringify(pair)}.`);
    }
    pair.forEach(p => covered.add(p));
  });
  if (covered.size !== n) throw new Error("Each friend must appear in exactly one pair.");
  return { n, preferences, pairs };
}

export function buildTrace({ n, preferences, pairs }) {
  const partner = Array(n).fill(0);
  for (const [x, y] of pairs) { partner[x] = y; partner[y] = x; }
  const rank = preferences.map(() => Array(n).fill(-1));
  preferences.forEach((row, u) => row.forEach((w, pos) => { rank[u][w] = pos; }));
  const unhappy = Array(n).fill(false);
  const frames = [];
  const snap = extra => ({ partner: partner.slice(), unhappy: unhappy.slice(), x: -1, u: -1, ...extra });

  frames.push({ phase: "setup", activeLine: 3, message: "Pair each friend with partner[x] and partner[y].", ...snap({}) });
  frames.push({ phase: "setup", activeLine: 4, message: "Rank table built: rank[u][w] is the position of w in u's list.", ...snap({}) });

  let count = 0;
  for (let x = 0; x < n; x++) {
    frames.push({ phase: "scan", activeLine: 6, message: `Friend ${x} is paired with ${partner[x]}. Look at friends ${x} ranks above that partner.`, ...snap({ x }) });
    for (const u of preferences[x]) {
      if (u === partner[x]) {
        frames.push({ phase: "check", activeLine: 7, message: `Reached partner ${u}; no more candidates for friend ${x}.`, ...snap({ x, u }) });
        break;
      }
      frames.push({ phase: "check", activeLine: 8, message: `${x} prefers ${u} over partner ${partner[x]}. Does ${u} prefer ${x} over partner ${partner[u]}?`, ...snap({ x, u }) });
      if (rank[u][x] < rank[u][partner[u]]) {
        unhappy[x] = true;
        count++;
        frames.push({ phase: "record", activeLine: 9, message: `${u} prefers ${x} over ${partner[u]}, so friend ${x} is unhappy.`, ...snap({ x, u }) });
        break;
      }
    }
  }
  frames.push({ phase: "done", activeLine: 10, message: `Return ${count} unhappy friends.`, ...snap({}) });
  return { input: { n, preferences, pairs }, result: count, frames };
}
