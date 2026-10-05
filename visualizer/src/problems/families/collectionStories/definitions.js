import { advanceSpecs, validateAdvance } from './expansionAdvanceSpecs.js';
import { progressSpecs, validateProgress } from './expansionProgressSpecs.js';
import { continuingSpecs, validateContinuing } from './expansionNextSpecs.js';
import { solvers } from './algorithms.js';
import { specs } from './specs.js';
import { collectionStoryMetadata } from './metadata.js';
import { collectionStoryExamples } from '../../../config/collectionStoryExamples.js';
import { nextSpecs, validateNext } from './nextSpecs.js';
import { expansionSpecs, validateExpansion } from './expansionSpecs.js';
import { dpSpecs, validateDP } from './expansionDPSpecs.js';
import { moreSpecs, validateMore } from './expansionMoreSpecs.js';
import { laterSpecs, validateLater } from './expansionLaterSpecs.js';

function validate(id, input) {
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  require(input && typeof input === 'object' && !Array.isArray(input), 'Use a JSON object.');
  for (const key of specs[id][0].split(' ')) require(key in input, `Missing ${key}.`);
  if (id in nextSpecs) return validateNext(id,input);
  if (id in expansionSpecs) return validateExpansion(id,input);
  if (id in dpSpecs) return validateDP(id,input);
  if (id in moreSpecs) return validateMore(id,input);
  if (id in advanceSpecs) return validateAdvance(id,input);
  if (id in progressSpecs) return validateProgress(id,input);
  if (id in continuingSpecs) return validateContinuing(id,input);
  if (id in laterSpecs) return validateLater(id,input);
  const integer = (v, min = -10000, max = 10000) => Number.isSafeInteger(v) && v >= min && v <= max;
  const vector = (v, minLength = 1, maxLength = 80) => Array.isArray(v) && v.length >= minLength && v.length <= maxLength && v.every(n => integer(n));
  const text = v => typeof v === 'string' && v.length >= 1 && v.length <= 120;
  const list = v => Array.isArray(v) && v.length >= 1 && v.length <= 40 && v.every(w => text(w) && w.length <= 40);
  for (const key of ['bills','people','aliceSizes','bobSizes','arr','prices','fruits','nums','deck','times','pushed','popped','tokens','days','costs','num']) {
    if (key in input) require(vector(input[key], key === 'tokens' ? 0 : 1), `${key}: use at most 80 integers between -10000 and 10000 (nonempty except tokens).`);
  }
  for (const key of ['s','s1','s2','pattern','name','typed','order']) if (key in input) require(text(input[key]), `${key}: use 1-120 characters.`);
  for (const key of ['words','emails','strs']) if (key in input) require(list(input[key]), `${key}: use 1-40 strings, each 1-40 characters.`);
  for (const key of ['grid','matrix']) if (key in input) {
    const a = input[key];
    require(Array.isArray(a) && a.length >= 1 && a.length <= 10 && a.every(row => vector(row, 1, 10) && row.length === a[0].length), `${key}: use a rectangular matrix of 1-10 rows and columns.`);
    if (id !== 861) require(a.length === a[0].length, 'This problem requires a square matrix.');
    if (id !== 931) require(a.every(row => row.every(v => v >= 0 && v <= (id === 861 ? 1 : 50))), 'Use binary entries for flips or heights from 0 to 50.');
  }
  if (id === 860) require(input.bills.every(v => [5,10,20].includes(v)), 'Bills must be 5, 10, or 20.');
  if ([868,869].includes(id)) require(integer(input.n, 1, 1000000000), 'n must be a positive integer at most one billion.');
  if (id === 881) require(integer(input.limit,1) && input.people.every(v => v >= 1 && v <= input.limit), 'Each positive weight must fit the positive boat limit.');
  if (id === 884) require([input.s1,input.s2].every(s => /^[a-z]+( [a-z]+)*$/.test(s)), 'Use lowercase words separated by single spaces.');
  if (id === 888) {
    require([...input.aliceSizes,...input.bobSizes].every(v => v > 0), 'Candy box sizes must be positive.');
    const sum = a => a.reduce((x,y) => x+y,0), delta = (sum(input.aliceSizes)-sum(input.bobSizes))/2;
    require(input.aliceSizes.some(a => input.bobSizes.includes(a-delta)), 'Provide sizes with at least one balancing exchange.');
  }
  if ([890,893,953,1002].includes(id)) require(input.words.every(w => /^[a-z]+$/.test(w)), 'Use lowercase English words.');
  if (id === 890) require(/^[a-z]+$/.test(input.pattern) && input.words.every(w => w.length === input.pattern.length), 'All words must have the same length as the lowercase pattern.');
  if (id === 893) require(input.words.every(w => w.length === input.words[0].length), 'All words must have equal length.');
  if ([898,941,978].includes(id)) require(input.arr.every(v => v >= 0), 'Use nonnegative array values.');
  if (id === 899) require(/^[a-z]+$/.test(input.s) && integer(input.k,1,input.s.length), 'Use lowercase text and 1 <= k <= its length.');
  if (id === 901) require(input.prices.every(v => v > 0), 'Prices must be positive.');
  if (id === 904) require(input.fruits.every(v => v >= 0), 'Fruit types must be nonnegative integers.');
  if (id === 908) require(integer(input.k,0), 'k must be a nonnegative integer at most 10000.');
  if (id === 914) require(input.deck.every(v => v >= 0), 'Card values must be nonnegative.');
  if (id === 915) require(input.nums.length >= 2 && input.nums.some((_,i,a) => i < a.length-1 && Math.max(...a.slice(0,i+1)) <= Math.min(...a.slice(i+1))), 'Provide an array with a valid split into two nonempty partitions.');
  if (id === 917) require(/^[\x21-\x7e]+$/.test(input.s), 'Use printable ASCII characters without spaces.');
  if (id === 921) require(/^[()]+$/.test(input.s), 'Only parentheses are allowed.');
  if (id === 925) require([input.name,input.typed].every(s => /^[a-z]+$/.test(s)), 'Use lowercase English letters.');
  if (id === 926) require(/^[01]+$/.test(input.s), 'Use a binary string.');
  if (id === 929) require(input.emails.every(e => /^[a-z][a-z.+]*@[a-z]+(?:\.[a-z]+)+$/.test(e)), 'Use lowercase addresses with a nonempty local name and dotted domain.');
  if (id === 930) require(input.nums.every(v => v === 0 || v === 1) && integer(input.goal,0,input.nums.length), 'Use binary values and a goal from zero through the array length.');
  if (id === 933) require(input.times.every((v,i,a) => v > 0 && (!i || v > a[i-1])), 'Timestamps must be positive and strictly increasing.');
  if (id === 942) require(/^[ID]+$/.test(input.s), 'Only I and D instructions are allowed.');
  if (id === 944) require(input.strs.every(s => /^[a-z]+$/.test(s) && s.length === input.strs[0].length), 'Use lowercase strings of equal length.');
  if (id === 945) require(input.nums.every(v => v >= 0), 'Use nonnegative values.');
  if (id === 946) require(new Set(input.pushed).size === input.pushed.length && new Set(input.popped).size === input.popped.length && input.pushed.length === input.popped.length && input.pushed.every(v => input.popped.includes(v)), 'pushed and popped must be permutations of the same distinct values.');
  if (id === 948) require(input.tokens.every(v => v >= 0) && integer(input.power,0), 'Token costs and power must be nonnegative.');
  if (id === 950) require(input.deck.every(v => v > 0) && new Set(input.deck).size === input.deck.length, 'Use distinct positive card values.');
  if (id === 953) require(/^[a-z]{26}$/.test(input.order) && new Set(input.order).size === 26, 'order must be a permutation of the 26 lowercase letters.');
  if (id === 961) {
    const counts = new Map(); for (const v of input.nums) counts.set(v,(counts.get(v)||0)+1);
    require(input.nums.length >= 4 && input.nums.length%2 === 0 && [...counts.values()].filter(n => n === input.nums.length/2).length === 1 && [...counts.values()].filter(n => n !== 1).length === 1, 'Use 2N values, N >= 2, with one value occurring N times and all others once.');
  }
  if (id === 962) require(input.nums.length >= 2, 'Use at least two values.');
  if (id === 970) require(integer(input.x,1,100) && integer(input.y,1,100) && integer(input.bound,0,1000000), 'Use bases 1-100 and a bound from 0 to 1000000.');
  if (id === 973) require(Array.isArray(input.points) && input.points.length >= 1 && input.points.length <= 60 && input.points.every(p => vector(p,2,2)) && integer(input.k,1,input.points.length), 'Use 1-60 coordinate pairs and k within that count.');
  if (id === 974) require(integer(input.k,1), 'Use a positive divisor at most 10000.');
  if (id === 976) require(input.nums.length >= 3 && input.nums.every(v => v > 0), 'Use at least three positive side lengths.');
  if (id === 983) require(input.days.every((v,i,a) => v >= 1 && v <= 365 && (!i || v > a[i-1])) && input.costs.length === 3 && input.costs.every(v => v > 0), 'Use strictly increasing travel days 1-365 and three positive pass costs.');
  if (id === 985) require(Array.isArray(input.queries) && input.queries.length >= 1 && input.queries.length <= 80 && input.queries.every(q => vector(q,2,2) && integer(q[1],0,input.nums.length-1)), 'Use 1-80 [delta,index] queries with indices inside nums.');
  if (id === 989) require(input.num.every(v => v >= 0 && v <= 9) && (input.num.length === 1 || input.num[0] !== 0) && integer(input.k,0), 'Use decimal digits without leading zeros and k from zero through 10000.');
  if (id === 991) require(integer(input.startValue,1,1000000000) && integer(input.target,1,1000000000), 'Use positive startValue and target at most one billion.');
  if (id === 997) require(integer(input.n,1,40) && Array.isArray(input.trust) && input.trust.length <= 100 && input.trust.every(p => vector(p,2,2) && p.every(v => integer(v,1,input.n)) && p[0] !== p[1]) && new Set(input.trust.map(p => p.join(','))).size === input.trust.length, 'Use n from 1-40 and up to 100 distinct directed trust pairs, with no self-trust.');
  if (id === 999) require(Array.isArray(input.board) && input.board.length === 8 && input.board.every(row => Array.isArray(row) && row.length === 8 && row.every(v => ['.','R','B','p'].includes(v))) && input.board.flat().filter(v => v === 'R').length === 1, 'Use an 8 by 8 board with exactly one R, and only R, B, p, or . cells.');
  if (id === 1005) require(integer(input.k,1), 'Use 1-10000 sign flips.');
  return input;
}

export const definitions = Object.fromEntries(Object.entries(specs).map(([key,[fields,goal,strategy,code,complexity]]) => {
  const id = Number(key);
  return [id, {
    ...collectionStoryMetadata[id], goal, strategy, complexity,
    inputLabel: `${fields} (JSON; bounded for readable playback)`,
    code: code.split('|').map((text,i) => ({line:i+1,text})),
    examples: collectionStoryExamples[id],
    phases: [{id:'start',label:'Set up',description:goal},{id:'inspect',label:'Decide',description:strategy},{id:'update',label:'Record progress',description:strategy},{id:'done',label:'Return',description:goal}],
    parse: text => validate(id,JSON.parse(text)),
    build: raw => {
      const input = validate(id,raw), frames = [];
      let sequence = input[fields.split(' ')[0]];
      if (typeof sequence === 'number') sequence = [...String(sequence)];
      if (id === 973) sequence = input.points.map(p => `(${p})`);
      if (id === 1424) sequence = input.nums.map(row => `[${row}]`);
      const emit = (message,state = {},phase = 'inspect') => frames.push(structuredClone({sequence,index:-1,metrics:{},...state,message,phase,activeLine:{start:1,inspect:3,update:4}[phase]}));
      emit(goal,{},'start');
      const result = solvers[id](input,emit);
      frames.push(structuredClone({...frames.at(-1),phase:'done',activeLine:5,message:`Return ${JSON.stringify(result)}. ${goal}`,result}));
      return {frames,result};
    },
  }];
}));
