import authoredExamples0 from '../../config/examples/local--12.js';

export const I2R_PATTERNS = ['init', 'check', 'loop', 'append', 'subtract', 'done']

// Map which code line corresponds to which pattern
export const LINE_PATTERN_MAP = {
  1: 'init',   // def intToRoman(num: int) -> str:
  2: 'init',   // values = [1000,900,...]
  3: 'init',   // symbols = ["M","CM",...]
  4: 'init',   // result = ""
  5: 'check',  // for i, val in enumerate(values):
  6: 'loop',   // while num >= val:
  7: 'append', // result += symbols[i]
  8: 'subtract', // num -= val
  9: 'done',   // return result
}

export const SOLUTION_CODE = [
  { line: 1, text: 'def intToRoman(num: int) -> str:' },
  { line: 2, text: '    values = [1000,900,500,400,100,90,50,40,10,9,5,4,1]' },
  { line: 3, text: '    symbols = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]' },
  { line: 4, text: '    result = ""' },
  { line: 5, text: '    for i, val in enumerate(values):' },
  { line: 6, text: '        while num >= val:' },
  { line: 7, text: '            result += symbols[i]' },
  { line: 8, text: '            num -= val' },
  { line: 9, text: '    return result' },
]

export const EXAMPLES = authoredExamples0

export const VALUE_SYMBOL_PAIRS = [
  { value: 1000, symbol: 'M' },
  { value: 900, symbol: 'CM' },
  { value: 500, symbol: 'D' },
  { value: 400, symbol: 'CD' },
  { value: 100, symbol: 'C' },
  { value: 90, symbol: 'XC' },
  { value: 50, symbol: 'L' },
  { value: 40, symbol: 'XL' },
  { value: 10, symbol: 'X' },
  { value: 9, symbol: 'IX' },
  { value: 5, symbol: 'V' },
  { value: 4, symbol: 'IV' },
  { value: 1, symbol: 'I' },
]

export function generateSteps(num) {
  const steps = [];
  let remainingNum = num, result = '', terms = [];
  const push = (activeLine, currentIdx, message) => steps.push({ activeLine, currentIdx,
    currentVal: VALUE_SYMBOL_PAIRS[currentIdx]?.value, currentSymbol: VALUE_SYMBOL_PAIRS[currentIdx]?.symbol,
    remainingNum, result, terms: [...terms], message });
  push(4, -1, 'Initialize the ordered values, symbols, and empty result.');
  for (let i = 0; i < VALUE_SYMBOL_PAIRS.length; i++) {
    const { value, symbol } = VALUE_SYMBOL_PAIRS[i];
    push(5, i, `for: select pair [${i}], ${value} -> ${symbol}`);
    push(6, i, `${remainingNum} >= ${value}? ${remainingNum >= value ? 'Yes: append this symbol.' : 'No: advance to the next pair.'}`);
    while (remainingNum >= value) {
      result += symbol;
      terms = [...terms, { label: symbol, value }];
      push(7, i, `Append ${symbol} to the output.`);
      const before = remainingNum;
      remainingNum -= value;
      push(8, i, `${before} - ${value} = ${remainingNum} remaining.`);
      push(6, i, `${remainingNum} >= ${value}? ${remainingNum >= value ? 'Yes: reuse this pair.' : 'No: advance to the next pair.'}`);
    }
  }
  push(9, -1, `All pairs visited. Return ${result}.`);
  return steps;
}


// ---- Integer to Roman (statement-sourced; see scratch statements/12.md) ----
export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error('Use an integer from 1 to 3999.')
  return n
}

const ROMAN_PAIRS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

export function buildTrace(num) {
  let rest = num
  let out = ''
  const frames = [{ phase: 'start', activeLine: L('set result to an empty string'), remaining: rest, result: '', message: `Convert ${num} by taking the largest symbol value that still fits.` }]
  for (const [value, symbol] of ROMAN_PAIRS) {
    while (rest >= value) {
      rest -= value
      out += symbol
      frames.push({ phase: 'take', activeLine: L('while num is at least value:'), remaining: rest, result: out, message: `Take ${symbol} (${value}). ${rest} remains.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), remaining: 0, result: out, message: `Roman numeral: ${out}.` })
  return { input: num, result: out, frames }
}

export const code = `integer to roman numeral (num):
  set result to an empty string
  for each (value, symbol) pair from largest to smallest:
    while num is at least value:
      append symbol to result
      subtract value from num
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def int_to_roman(num):
    pairs = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
             (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    result = ''
    for value, symbol in pairs:
        while num >= value:
            result += symbol
            num -= value
    return result
`
