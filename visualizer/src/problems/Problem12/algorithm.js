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

export const EXAMPLES = [
  {
    label: '3',
    num: 3,
    note: 'Simple: III',
  },
  {
    label: '58',
    num: 58,
    note: 'Mixed: LVIII',
  },
  {
    label: '1994',
    num: 1994,
    note: 'Complex: MCMXCIV',
  },
]

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

