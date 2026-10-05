import { sequenceStoryExamples } from '../../../config/sequenceStoryExamples.js';
import { traceAlgorithm, conclusions } from './algorithms.js';

// Reuse the visual vocabulary, not a substitute algorithm selected by a title.
const specs = {
  605: ['Can Place Flowers', 'flowerbed n', 'Greedily occupy the earliest safe empty slot; this leaves at least as much room for later flowers.',
    ['copy bed; planted = 0', 'for each slot i from left to right:', '    if slot and both neighbors are empty:', '        occupy slot; planted += 1', 'return planted >= n'],
    sequenceStoryExamples[605].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(n) space for the displayed copy.'],
  611: ['Valid Triangle Number','nums','Sort side lengths. For a fixed largest side, one successful pair proves a whole interval of starts is valid.',
    ['sort nums; count = 0', 'for largest k, search with left = 0, right = k - 1:', '    compare nums[left] + nums[right] with nums[k]', '    if greater: add right-left, move right; else move left', 'return count'],
    sequenceStoryExamples[611].map(e => [e.label, JSON.parse(e.input)]), 'O(n²) time; O(n) space for a sorted copy.'],
  628: ['Maximum Product of Three Numbers','nums','Keep only the extremes that can participate in an optimal triple; a pair of negative values can turn positive.',
    ['smallest = []; largest = []', 'for value in nums:', '    compare value with retained extrema', '    retain two smallest and three largest', 'return max(product of largest three, smallest two * largest)'],
    sequenceStoryExamples[628].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) algorithm state.'],
  633: ['Sum of Square Numbers','c','Compare the smallest and largest remaining squares. Move the endpoint whose change brings their sum toward the target.',
    ['left = 0; right = floor(sqrt(c))', 'while left <= right:', '    compare left² + right² with c; return true on equality', '    increment left if too small, otherwise decrement right', 'return false if no pair remains'],
    sequenceStoryExamples[633].map(e => [e.label, JSON.parse(e.input)]), 'O(√c) time; O(1) algorithm state.'],
  643: ['Maximum Average Subarray I','nums k','Keep exactly k neighboring values. Subtract the outgoing value as each incoming value arrives.',
    ['sum = 0; best = negative infinity', 'for i, value in nums:', '    add value; remove nums[i-k] once i >= k', '    compare complete window sum with best', 'return best / k'],
    sequenceStoryExamples[643].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) algorithm state.'],
  645: ['Set Mismatch','nums','Count visits to each expected slot from 1 through n. A twice-visited slot and an unvisited slot identify the error.',
    ['count = zeros(n+1)', 'for value in nums:', '    inspect count[value]', '    increment it; remember a value counted twice', 'return [duplicate, slot with count zero]'],
    sequenceStoryExamples[645].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and space.'],
  674: ['Longest Continuous Increasing Subsequence','nums','A contiguous increasing run ends at the first equality or drop. Remember both the current run and the greatest completed length.',
    ['run = best = 0', 'for i, value in nums:', '    compare with the immediately previous value', '    extend run or restart at one; update best', 'return best'],
    sequenceStoryExamples[674].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) state.'],
  697: ['Degree of an Array','nums','For every value retain count, first index, and last index. Among values with the greatest count choose the shortest enclosing span.',
    ['stats = {}; degree = 0; shortest = n', 'for i, value in nums:', '    update its count, first index, and last index', '    replace shortest on higher count; minimize on a tie', 'return shortest'],
    sequenceStoryExamples[697].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and space.'],
  724: ['Find Pivot Index','nums','Compute the total once. Before consuming each value, compare the completed left sum with the remaining right sum.',
    ['total = sum(nums); left = 0', 'for i, value in nums:', '    right = total - left - value; return i if equal', '    left += value', 'return -1'],
    sequenceStoryExamples[724].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) state.'],
  747: ['Largest Number At Least Twice of Others','nums','The second largest is the strongest competitor. Retain its value and the original index of the largest.',
    ['largest = second = -1; index = -1', 'for i, value in nums:', '    compare value with largest and second', '    update the two extrema and largest index', 'return index if largest >= 2*second else -1'],
    sequenceStoryExamples[747].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) state.'],
  766: ['Toeplitz Matrix','matrix','A cell belongs to the same diagonal as its northwest neighbor. Local equality therefore proves whole-diagonal equality.',
    ['read matrix dimensions', 'for every cell outside first row and first column:', '    compare cell with northwest neighbor', '    reject immediately on a mismatch', 'return true after every comparison succeeds'],
    sequenceStoryExamples[766].map(e => [e.label, JSON.parse(e.input)]), 'O(rows × columns) time; O(1) algorithm state.'],
  832: ['Flipping an Image','matrix','For destination column c, read the mirrored source column and invert that bit exactly once.',
    ['allocate output image', 'for each destination row r and column c:', '    source = matrix[r][width-1-c]', '    output[r][c] = 1 - source', 'return output'],
    sequenceStoryExamples[832].map(e => [e.label, JSON.parse(e.input)]), 'O(rows × columns) time and output space.'],
  867: ['Transpose Matrix','matrix','Move each source cell (r,c) to destination (c,r). A rectangular matrix changes shape as well as orientation.',
    ['allocate output with columns rows and rows columns', 'for each source cell (r,c):', '    read matrix[r][c]', '    output[c][r] = matrix[r][c]', 'return output'],
    sequenceStoryExamples[867].map(e => [e.label, JSON.parse(e.input)]), 'O(rows × columns) time and output space.'],
  896: ['Monotonic Array','nums','Track two candidates: nondecreasing and nonincreasing. Each strict comparison can eliminate one candidate.',
    ['up = down = true', 'for adjacent values:', '    test whether this pair rises or falls', '    a fall rejects up; a rise rejects down', 'return up or down'],
    sequenceStoryExamples[896].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time; O(1) state.'],
  905: ['Sort Array By Parity','nums','Partition into even and odd groups, preserving every occurrence. The groups can then be concatenated.',
    ['even = []; odd = []', 'for value in nums:', '    test value modulo 2', '    append to its parity group', 'return even + odd'],
    sequenceStoryExamples[905].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and output space.'],
  922: ['Sort Array By Parity II','nums','Use independent write pointers for even and odd output indices. Each pointer advances by two.',
    ['output = empty slots; even = 0; odd = 1', 'for value in nums:', '    select the matching parity pointer', '    write value; advance that pointer by two', 'return output'],
    sequenceStoryExamples[922].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and output space.'],
  977: ['Squares of a Sorted Array','nums','A sorted signed array can have its greatest magnitude at either end. Fill the squared output from right to left.',
    ['left = 0; right = n-1; allocate output', 'for output slot from n-1 down to 0:', '    compare endpoint magnitudes', '    write larger square; consume that endpoint', 'return output'],
    sequenceStoryExamples[977].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and output space.'],
  1047: ['Remove All Adjacent Duplicates In String','s','The stack is the reduced prefix. A matching incoming character removes its top; otherwise it extends the reduced prefix.',
    ['stack = []', 'for character in s:', '    compare character with stack top', '    pop matching top, otherwise push character', 'return characters remaining on stack'],
    sequenceStoryExamples[1047].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and space.'],
  1207: ['Unique Number of Occurrences','nums','Count each value first. Then check whether a frequency is claimed by more than one value.',
    ['counts = {}; seen frequencies = {}', 'for value in nums:', '    inspect current count', '    increment count; afterwards insert each frequency into seen', 'return false on a repeated frequency, otherwise true'],
    sequenceStoryExamples[1207].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and space.'],
  1295: ['Find Numbers with Even Number of Digits','nums','Count decimal digits rather than testing the parity of the number itself.',
    ['count = 0', 'for value in nums:', '    digits = length of decimal representation', '    increment count when digits is even', 'return count'],
    sequenceStoryExamples[1295].map(e => [e.label, JSON.parse(e.input)]), 'O(total digits) time; O(maximum digits) temporary string space.'],
  1431: ['Kids With the Greatest Number of Candies','candies extraCandies','Find the original maximum once. Give the extra candies hypothetically to one child at a time, allowing ties.',
    ['maximum = max(candies); output = []', 'for each child:', '    compare candies[child] + extraCandies with maximum', '    append whether the child reaches or exceeds maximum', 'return output'],
    sequenceStoryExamples[1431].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and output space.'],
  1480: ['Running Sum of 1d Array','nums','Maintain one accumulator. Each output position records the complete prefix ending there.',
    ['sum = 0; output = []', 'for value in nums:', '    read current value', '    sum += value; append sum', 'return output'],
    sequenceStoryExamples[1480].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and output space.'],
  1512: ['Number of Good Pairs','nums','When a value arrives, pair it with every earlier equal occurrence. Counting before incrementing prevents pairing an index with itself.',
    ['counts = {}; pairs = 0', 'for value in nums:', '    previous = counts[value] or 0', '    pairs += previous; counts[value] = previous + 1', 'return pairs'],
    sequenceStoryExamples[1512].map(e => [e.label, JSON.parse(e.input)]), 'O(n) time and space.'],
  1672: ['Richest Customer Wealth','accounts','Sum bank balances separately for each customer. Compare completed row totals rather than individual balances.',
    ['best = 0', 'for each customer row: wealth = 0', '    read each bank balance', '    accumulate wealth; after row update best', 'return best'],
    sequenceStoryExamples[1672].map(e => [e.label, JSON.parse(e.input)]), 'O(rows × columns) time; O(1) algorithm state.'],
};

function validate(id, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Enter a JSON object with the named input fields.');
  const keys = specs[id][1].split(' ');
  for (const key of keys) if (!(key in value)) throw new Error(`Missing field: ${key}`);
  const integer = n => Number.isSafeInteger(n) && Math.abs(n) <= 10000;
  const vector = a => Array.isArray(a) && a.length >= 1 && a.length <= 80 && a.every(integer);
  for (const key of ['nums','flowerbed','candies']) if (keys.includes(key) && !vector(value[key])) throw new Error(`${key} needs 1–80 integers between -10000 and 10000 for this walkthrough.`);
  if (keys.includes('matrix') || keys.includes('accounts')) {
    const matrix = value.matrix ?? value.accounts;
    if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 12 || !matrix.every(row => vector(row) && row.length <= 12 && row.length === matrix[0].length)) throw new Error('Use a rectangular matrix with 1–12 rows and columns of integers.');
  }
  if (id === 633 && (!Number.isSafeInteger(value.c) || value.c < 0 || value.c > 1000000)) throw new Error('Use an integer c from 0 to 1000000 for the visual trace.');
  if (id === 1047 && (typeof value.s !== 'string' || !/^[a-z]{1,200}$/.test(value.s))) throw new Error('Use 1–200 lowercase English letters.');
  if (id === 605) {
    if (!Number.isInteger(value.n) || value.n < 0 || value.n > value.flowerbed.length) throw new Error('n must be an integer between zero and the bed length.');
    if (!value.flowerbed.every((n,i,a) => (n === 0 || n === 1) && !(n === 1 && a[i-1] === 1))) throw new Error('Use only 0 and 1, with no adjacent existing flowers.');
  }
  if (id === 643 && (!Number.isInteger(value.k) || value.k < 1 || value.k > value.nums.length)) throw new Error('k must be between 1 and the array length.');
  if (id === 628 && value.nums.length < 3) throw new Error('At least three numbers are required.');
  if ([611,747,905,922].includes(id) && value.nums.some(n => n < 0)) throw new Error('Use nonnegative numbers.');
  if ([1295,1512].includes(id) && value.nums.some(n => n < 1)) throw new Error('Use positive numbers.');
  if (id === 747 && (value.nums.length < 2 || value.nums.filter(n => n === Math.max(...value.nums)).length !== 1)) throw new Error('Use at least two numbers with a unique maximum.');
  if (id === 645) {
    const count = Array(value.nums.length + 1).fill(0);
    for (const n of value.nums) { if (n < 1 || n > value.nums.length) throw new Error('Set values must be between 1 and n.'); count[n]++; }
    if (count.slice(1).filter(n => n === 0).length !== 1 || count.slice(1).filter(n => n === 2).length !== 1 || count.some(n => n > 2)) throw new Error('Exactly one value must be duplicated and one missing.');
  }
  if (id === 922 && value.nums.filter(n => n % 2 === 0).length !== value.nums.length / 2) throw new Error('Use equal counts of even and odd values.');
  if (id === 977 && value.nums.some((n,i,a) => i > 0 && n < a[i-1])) throw new Error('Input must be sorted in nondecreasing order.');
  if (id === 832 && (value.matrix.length !== value.matrix[0].length || value.matrix.some(row => row.some(n => n !== 0 && n !== 1)))) throw new Error('Use a square image containing only 0 and 1.');
  if (id === 1431 && (!integer(value.extraCandies) || value.extraCandies < 1 || value.candies.some(n => n < 1))) throw new Error('Candies and extraCandies must be positive integers.');
  if (id === 1672 && value.accounts.some(row => row.some(n => n < 1))) throw new Error('Bank balances must be positive integers.');
  return value;
}

export const definitions = Object.fromEntries(Object.entries(specs).map(([key, [title, fields, strategy, lines, examples, complexity]]) => {
  const id = Number(key);
  return [id, {
    title, strategy, complexity,
    inputLabel: `${fields} (JSON object; bounded for readable traces)`,
    code: lines.map((text, i) => ({ line: i + 1, text })),
    phases: [{id:'start',label:'Set up',description:'Establish the initial state.'},{id:'inspect',label:'Decide',description:strategy},{id:'update',label:'Record progress',description:conclusions[id]},{id:'done',label:'Result',description:conclusions[id]}],
    examples: examples.map(([label, input]) => ({label, input:JSON.stringify(input)})),
    parse: text => validate(id, JSON.parse(text)),
    build: input => traceAlgorithm(id, validate(id, input)),
  }];
}));
