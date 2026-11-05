// LeetCode 1086: High Five.
// Each student keeps a min-heap of at most five scores. The smallest kept score sits at the top,
// so a new score either fills an open slot, replaces that smallest score when it is higher, or is skipped.

// Visualization caps (the draft did not verify official bounds).
const MAX_RECORDS = 30;
const MAX_STUDENTS = 6;
const MAX_SCORE = 1000;

const CODE_LINES = `function highFive(items) {
  const top = new Map()
  for (const [id, score] of items) {
    if (!top.has(id)) top.set(id, [])
    const kept = top.get(id)
    if (kept.length < 5) kept.push(score)
    else if (score > Math.min(...kept)) kept[kept.indexOf(Math.min(...kept))] = score
  }
  const result = []
  for (const id of [...top.keys()].sort((a, b) => a - b)) {
    const average = Math.floor(top.get(id).reduce((a, b) => a + b, 0) / 5)
    result.push([id, average])
  }
  return result
}`.split('\n');

const PY_LINES = [
  'import heapq',
  'from collections import defaultdict',
  '',
  'class Solution:',
  '    def highFive(self, items: list[list[int]]) -> list[list[int]]:',
  '        top = defaultdict(list)',
  '        for student_id, score in items:',
  '            heap = top[student_id]',
  '            if len(heap) < 5:',
  '                heapq.heappush(heap, score)',
  '            elif score > heap[0]:',
  '                heapq.heapreplace(heap, score)',
  '        result = []',
  '        for student_id in sorted(top):',
  '            result.append([student_id, sum(top[student_id]) // 5])',
  '        return result',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(Solution().highFive(json.loads(sys.stdin.read()))))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Records', description: 'Read the records and name the students.' },
  { id: 'record', label: 'Read record', description: 'Take the next [student, score] record.' },
  { id: 'decide', label: 'Keep or skip', description: 'Fill an open slot, replace the smallest kept score, or skip.' },
  { id: 'average', label: 'Average', description: 'Average the five kept scores for each student.' },
  { id: 'done', label: 'Answer', description: 'Report each student with their integer average.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing code line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const items = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_RECORDS) {
    throw new Error(`Use a list of 1 to ${MAX_RECORDS} [studentId, score] records.`);
  }
  const counts = new Map();
  for (const record of items) {
    if (!Array.isArray(record) || record.length !== 2) throw new Error('Each record is [studentId, score].');
    const [id, score] = record;
    if (!Number.isInteger(id) || id < 1) throw new Error('studentId is a positive integer.');
    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) throw new Error(`score is an integer from 0 to ${MAX_SCORE}.`);
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  if (counts.size > MAX_STUDENTS) throw new Error(`The visualization shows up to ${MAX_STUDENTS} students.`);
  for (const [id, count] of counts) {
    if (count < 5) throw new Error(`Student ${id} needs at least five records.`);
  }
  return items.map(([id, score]) => [id, score]);
}

function snapshot(top) {
  const out = {};
  for (const id of [...top.keys()].sort((a, b) => a - b)) out[id] = [...top.get(id)].sort((a, b) => a - b);
  return out;
}

export function buildTrace(input) {
  const items = parseInput(input);
  const top = new Map();
  const frames = [];
  const ids = [...new Set(items.map(([id]) => id))].sort((a, b) => a - b);
  frames.push({
    pythonLine: P('top = defaultdict(list)'), phase: 'setup', activeLine: L('const top = new Map()'),
    tops: {}, current: null, decision: null, evicted: null, averages: {}, answer: null,
    message: `Read ${items.length} records for ${ids.length} student${ids.length === 1 ? '' : 's'}.`,
  });
  items.forEach(([id, score], index) => {
    frames.push({
      pythonLine: P('for student_id, score in items:'), phase: 'record', activeLine: L('for (const [id, score] of items)'),
      tops: snapshot(top), current: { index, id, score }, decision: null, evicted: null, averages: {}, answer: null,
      message: `Record ${index + 1}: student ${id} scored ${score}.`,
    });
    if (!top.has(id)) top.set(id, []);
    const heap = top.get(id);
    if (heap.length < 5) {
      heap.push(score);
      frames.push({
        pythonLine: P('heapq.heappush(heap, score)'), phase: 'decide', activeLine: L('if (kept.length < 5)'),
        tops: snapshot(top), current: { index, id, score }, decision: 'fill', evicted: null, averages: {}, answer: null,
        message: `Student ${id} has ${heap.length} of 5 slots filled, so ${score} takes an open slot.`,
      });
    } else {
      const smallest = Math.min(...heap);
      if (score > smallest) {
        heap[heap.indexOf(smallest)] = score;
        frames.push({
          pythonLine: P('heapq.heapreplace(heap, score)'), phase: 'decide', activeLine: L('else if (score > Math.min'),
          tops: snapshot(top), current: { index, id, score }, decision: 'replace', evicted: smallest, averages: {}, answer: null,
          message: `${score} beats the smallest kept score ${smallest}, so ${smallest} is replaced.`,
        });
      } else {
        frames.push({
          pythonLine: P('elif score > heap[0]:'), phase: 'decide', activeLine: L('else if (score > Math.min'),
          tops: snapshot(top), current: { index, id, score }, decision: 'skip', evicted: null, averages: {}, answer: null,
          message: `${score} does not beat the smallest kept score ${smallest}, so it is skipped.`,
        });
      }
    }
  });
  const result = [];
  const averages = {};
  frames.push({
    pythonLine: P('result = []'), phase: 'average', activeLine: L('const result = []'),
    tops: snapshot(top), current: null, decision: null, evicted: null, averages: {}, answer: null,
    message: 'All records are read. Average each student’s five kept scores.',
  });
  for (const id of ids) {
    const kept = top.get(id);
    const sum = kept.reduce((total, value) => total + value, 0);
    const average = Math.floor(sum / 5);
    result.push([id, average]);
    averages[id] = average;
    frames.push({
      pythonLine: P('result.append('), phase: 'average', activeLine: L('const average = Math.floor'),
      tops: snapshot(top), current: null, decision: null, evicted: null, averages: { ...averages }, answer: result.map((pair) => [...pair]),
      message: `Student ${id}: sum ${sum} over five scores, integer average ${average}.`,
    });
  }
  frames.push({
    pythonLine: P('return result'), phase: 'done', activeLine: L('return result'),
    tops: snapshot(top), current: null, decision: null, evicted: null, averages, answer: result,
    message: `Answer: ${result.map(([id, avg]) => `[${id}, ${avg}]`).join(', ')}.`,
  });
  return { input: items, answer: result, frames };
}
