import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parse } from '@babel/parser';
import { generateAtoiSteps, SOLUTION_CODE as atoiCode } from './Problem8/algorithm.js';
import { generateSteps as toRoman, SOLUTION_CODE as romanCode } from './Problem12/algorithm.js';
import { generateSteps as fromRoman, SOLUTION_CODE as integerCode } from './Problem13/algorithm.js';

function python(source, entry, inputs) {
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nf=eval(p["entry"])\nprint(json.dumps([f(x) for x in p["inputs"]]))'], {
    input: JSON.stringify({ source, entry, inputs }), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return JSON.parse(result.stdout);
}

function displayedCode(path) {
  const ast = parse(readFileSync(new URL(path, import.meta.url), 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  const declaration = ast.program.body.flatMap(node => node.declarations || []).find(node => node.id.name === 'SOLUTION_CODE');
  return declaration.init.elements.map(node => node.properties.find(property => property.key.name === 'text').value.value).join('\n');
}

test('median, palindrome, number palindrome, and regex handoffs contain runnable Python', () => {
  assert.deepEqual(python(displayedCode('./Problem4/MedianOfTwoSortedArraysVisualizer.jsx'), 'lambda pair: Solution().findMedianSortedArrays(*pair)', [[[1, 3], [2]], [[1, 2], [3, 4]], [[], [1]], [[0, 0], [0, 0]]]), [2, 2.5, 1, 0]);
  assert.deepEqual(python(displayedCode('./Problem5/PalindromeVisualizer.jsx'), 'Solution().longestPalindrome', ['', 'cbbd', 'racecar']), ['', 'bb', 'racecar']);
  assert.deepEqual(python(displayedCode('./Problem9/PalindromeNumberVisualizer.jsx'), 'isPalindrome', [0, 121, -121, 10, 1221]), [true, true, false, false, true]);
  assert.deepEqual(python(displayedCode('./Problem10/RegularExpressionMatchingVisualizer.jsx'), 'lambda pair: isMatch(*pair)', [['aa', 'a'], ['aa', 'a*'], ['ab', '.*'], ['aab', 'c*a*b']]), [false, true, true, true]);
});

test('atoi handles empty input, stops, signs, bounds, and exact 200-digit accumulation', () => {
  const cases = [['', 0], ['   ', 0], ['+', 0], ['-+12', 0], ['42', 42], ['   -042', -42], ['1337c0d3', 1337], ['0-1', 0], ['words and 987', 0], ['2147483647', 2147483647], ['2147483648', 2147483647], ['-2147483648', -2147483648], ['-2147483649', -2147483648], ['9'.repeat(200), 2147483647], ['-' + '9'.repeat(199), -2147483648], ['0'.repeat(200), 0], ['\t42', 0], ['²', 0]];
  const actual = python(atoiCode.map(line => line.text).join('\n'), 'Solution().myAtoi', cases.map(([input]) => input));
  cases.forEach(([input, expected], index) => {
    const frames = generateAtoiSteps(input);
    assert.equal(actual[index], expected, input);
    assert.equal(frames.at(-1).result, expected, input);
    for (const frame of frames.filter(frame => frame.phase === 'digit')) {
      assert.equal(frame.unsignedValue, BigInt(frame.digits).toString());
      assert.equal(frame.result, frame.unsignedValue, 'sign is applied only after scanning');
    }
  });
});

test('all Roman numerals 1–3999 round-trip and agree with executed Python', () => {
  const inputs = Array.from({ length: 3999 }, (_, index) => index + 1);
  const expected = python(romanCode.map(line => line.text).join('\n'), 'intToRoman', inputs);
  const decoded = python(integerCode.map(line => line.text).join('\n'), 'romanToInt', expected);
  for (const num of inputs) {
    const frames = toRoman(num);
    assert.equal(frames.at(-1).result, expected[num - 1]);
    assert.equal(decoded[num - 1], num);
    assert.equal(fromRoman(expected[num - 1]).at(-1).res, num);
    assert.deepEqual(frames.filter(frame => frame.activeLine === 5).map(frame => frame.currentIdx), Array.from({ length: 13 }, (_, i) => i));
    for (const frame of frames.filter(frame => frame.activeLine === 8)) {
      assert.equal(frame.terms.reduce((sum, term) => sum + term.value, 0) + frame.remainingNum, num);
    }
  }
});

test('N-Queens displayed source is executable and returns valid boards', () => {
  const jsx = readFileSync(new URL('./Problem51/NQueensVisualizer.jsx', import.meta.url), 'utf8');
  const code = [...jsx.slice(jsx.indexOf('const SOLUTION_CODE'), jsx.indexOf('const EXAMPLES')).matchAll(/text: ("(?:[^"\\]|\\.)*")/g)].map(match => JSON.parse(match[1])).join('\n');
  const results = python(code, 'solveNQueens', [1, 2, 3, 4, 5]);
  assert.deepEqual(results.map(boards => boards.length), [1, 0, 0, 2, 10]);
  for (const boards of results) for (const board of boards) {
    const cols = board.map(row => row.indexOf('Q'));
    assert.equal(new Set(cols).size, board.length);
    assert.equal(new Set(cols.map((col, row) => row - col)).size, board.length);
    assert.equal(new Set(cols.map((col, row) => row + col)).size, board.length);
  }
});
