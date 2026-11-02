// LeetCode 1199: Minimum Time to Build Blocks.
// Think of each entry as a task that finishes at its time. Two tasks that are merged by a split finish when the
// slower one finishes plus the split time. Repeatedly merging the two smallest entries (like Huffman coding)
// gives the minimum finishing time: the slow tasks should be the ones that are merged last.

// Visualization caps (the draft did not verify official bounds).
const MAX_BLOCKS = 8;
const MAX_TIME = 1000;

const CODE_LINES = [
  'FUNCTION minBuildTime(blocks, split)',
  '    pool ← min-heap of the block times',
  '    WHILE pool holds more than one entry',
  '        first ← remove the smallest entry from pool',
  '        second ← remove the smallest entry from pool',
  '        add second + split to pool',
  '    RETURN the single entry left in pool',
];

const PY_LINES = [
  'import heapq',
  '',
  'class Solution:',
  '    def minBuildTime(self, blocks: list[int], split: int) -> int:',
  '        heapq.heapify(blocks)',
  '        while len(blocks) > 1:',
  '            first = heapq.heappop(blocks)',
  '            second = heapq.heappop(blocks)',
  '            heapq.heappush(blocks, second + split)',
  '        return blocks[0]',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().minBuildTime(data["blocks"], data["split"])))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Pool', description: 'Put every block time into the pool of workers.' },
  { id: 'merge', label: 'Merge two', description: 'Take the two smallest entries and merge them with a split.' },
  { id: 'done', label: 'Answer', description: 'The single remaining entry is the finishing time.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with blocks and split.');
  const { blocks, split } = data;
  if (!Array.isArray(blocks) || blocks.length < 1 || blocks.length > MAX_BLOCKS) throw new Error(`blocks has 1 to ${MAX_BLOCKS} times.`);
  for (const time of blocks) {
    if (!Number.isInteger(time) || time < 0 || time > MAX_TIME) throw new Error(`Block times are integers from 0 to ${MAX_TIME}.`);
  }
  if (!Number.isInteger(split) || split < 0 || split > MAX_TIME) throw new Error(`split is an integer from 0 to ${MAX_TIME}.`);
  return { blocks: [...blocks], split };
}

export function buildTrace(input) {
  const { blocks, split } = parseInput(input);
  const pool = [...blocks].sort((a, b) => a - b);
  const merges = [];
  const frames = [];
  frames.push({
    pythonLine: P('heapq.heapify(blocks)'), phase: 'setup', activeLine: L('pool ← min-heap'),
    pool: [...pool], first: null, second: null, merged: null, merges: [], answer: null,
    message: `${pool.length} block${pool.length === 1 ? '' : 's'} in the pool, split time ${split}.`,
  });
  while (pool.length > 1) {
    pool.sort((a, b) => a - b);
    const first = pool.shift();
    const second = pool.shift();
    const merged = second + split;
    pool.push(merged);
    merges.push({ first, second, merged });
    frames.push({
      pythonLine: P('heapq.heappush(blocks, second'), phase: 'merge', activeLine: L('add second + split to pool'),
      pool: [...pool].sort((a, b) => a - b), first, second, merged, merges: merges.map((m) => ({ ...m })), answer: null,
      message: `Merge ${first} and ${second}: the pair finishes at ${second} + ${split} = ${merged}.`,
    });
  }
  const answer = pool[0];
  frames.push({
    pythonLine: P('return blocks[0]'), phase: 'done', activeLine: L('RETURN the single entry'),
    pool: [answer], first: null, second: null, merged: null, merges: merges.map((m) => ({ ...m })), answer,
    message: `One entry is left: the minimum building time is ${answer}.`,
  });
  return { input: { blocks, split }, answer, merges, frames };
}
