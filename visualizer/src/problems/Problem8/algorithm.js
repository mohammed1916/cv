export const INT_MIN = -(2 ** 31)
export const INT_MAX = 2 ** 31 - 1

export const ATOI_PATTERNS = ['whitespace', 'sign', 'digit', 'stop', 'clamp_min', 'clamp_max', 'final']

// Map which code line corresponds to which pattern
export const LINE_PATTERN_MAP = {
  3: 'whitespace', // i = 0
  4: 'whitespace', // n = len(s)
  5: 'whitespace', // while i < n and s[i] == " ":
  6: 'whitespace', // i += 1
  8: 'sign',       // sign = 1
  9: 'sign',       // if i < n and s[i] in "+-":
  10: 'sign',      // sign = -1 if s[i] == "-" else 1
  11: 'sign',      // i += 1
  13: 'digit',     // result = 0
  14: 'digit',     // while i < n and "0" <= s[i] <= "9":
  15: 'digit',     // result = result * 10 + int(s[i])
  16: 'digit',     // i += 1
  18: 'stop',      // result *= sign
  19: 'clamp_min', // if result < -2**31:
  20: 'clamp_min', // return -2**31
  21: 'clamp_max', // if result > 2**31 - 1:
  22: 'clamp_max', // return 2**31 - 1
  23: 'final',     // return result
}

export const SOLUTION_CODE = [
  { line: 1, text: 'class Solution(object):' },
  { line: 2, text: '    def myAtoi(self, s):' },
  { line: 3, text: '        i = 0' },
  { line: 4, text: '        n = len(s)' },
  { line: 5, text: '        while i < n and s[i] == " ":' },
  { line: 6, text: '            i += 1' },
  { line: 7, text: '' },
  { line: 8, text: '        sign = 1' },
  { line: 9, text: '        if i < n and s[i] in "+-":' },
  { line: 10, text: '            sign = -1 if s[i] == "-" else 1' },
  { line: 11, text: '            i += 1' },
  { line: 12, text: '' },
  { line: 13, text: '        result = 0' },
  { line: 14, text: '        while i < n and "0" <= s[i] <= "9":' },
  { line: 15, text: '            result = result * 10 + int(s[i])' },
  { line: 16, text: '            i += 1' },
  { line: 17, text: '' },
  { line: 18, text: '        result *= sign' },
  { line: 19, text: '        if result < -2**31:' },
  { line: 20, text: '            return -2**31' },
  { line: 21, text: '        if result > 2**31 - 1:' },
  { line: 22, text: '            return 2**31 - 1' },
  { line: 23, text: '        return result' },
]

export function isDigit(char) {
  return char >= '0' && char <= '9'
}

function clampResult(value) {
  if (value < INT_MIN) return INT_MIN
  if (value > INT_MAX) return INT_MAX
  return value
}

function getCodeHighlight(step) {
  if (!step) return { activeLine: 5, relatedLines: [3, 4, 5, 6] }

  if (step.phase === 'whitespace') return { activeLine: 6, relatedLines: [5, 6] }
  if (step.phase === 'sign') return { activeLine: 10, relatedLines: [8, 9, 10, 11] }
  if (step.phase === 'digit') return { activeLine: 15, relatedLines: [13, 14, 15, 16] }
  if (step.phase === 'stop') return { activeLine: 18, relatedLines: [18, 23] }
  if (step.phase === 'clamp-min') return { activeLine: 20, relatedLines: [18, 19, 20] }
  if (step.phase === 'clamp-max') return { activeLine: 22, relatedLines: [18, 21, 22] }

  return { activeLine: 23, relatedLines: [18, 23] }
}

function makeStep(base) {
  const code = getCodeHighlight(base)
  return { ...base, activeLine: code.activeLine, relatedLines: code.relatedLines }
}

export function generateAtoiSteps(input) {
  const steps = []
  const n = input.length
  let index = 0
  let sign = 1
  let unsignedValue = 0n
  let digits = ''

  while (index < n && input[index] === ' ') {
    steps.push(makeStep({
      phase: 'whitespace',
      index,
      currentChar: input[index],
      sign,
      unsignedValue: unsignedValue.toString(),
      digits,
      result: 0,
      description: `Ignore whitespace at index ${index}.`,
      stopReason: null,
      clamped: null,
    }))
    index += 1
  }

  if (index < n && (input[index] === '+' || input[index] === '-')) {
    sign = input[index] === '-' ? -1 : 1
    steps.push(makeStep({
      phase: 'sign',
      index,
      currentChar: input[index],
      sign,
      unsignedValue: unsignedValue.toString(),
      digits,
      result: 0,
      description: `Read '${input[index]}' and set sign to ${sign === -1 ? 'negative' : 'positive'}.`,
      stopReason: null,
      clamped: null,
    }))
    index += 1
  }

  while (index < n && isDigit(input[index])) {
    digits += input[index]
    unsignedValue = unsignedValue * 10n + BigInt(input[index])
    steps.push(makeStep({
      phase: 'digit',
      index,
      currentChar: input[index],
      sign,
      unsignedValue: unsignedValue.toString(),
      digits,
      result: unsignedValue.toString(),
      description: `Read digit '${input[index]}' and extend the number to ${unsignedValue}.`,
      stopReason: null,
      clamped: null,
    }))
    index += 1
  }

  let signedResult = digits ? unsignedValue * BigInt(sign) : 0n
  let stopReason

  if (!digits) {
    stopReason = index < n ? `Parsing stops at '${input[index]}' because no digits were read.` : 'No digits were found, so the result stays 0.'
  } else if (index < n) {
    stopReason = `Parsing stops at '${input[index]}' because it is not a digit.`
  } else {
    stopReason = 'Reached the end of the string after reading digits.'
  }

  steps.push(makeStep({
    phase: 'stop',
    index,
    currentChar: index < n ? input[index] : null,
    sign,
    unsignedValue: unsignedValue.toString(),
    digits,
    result: signedResult.toString(),
    description: stopReason,
    stopReason,
    clamped: null,
  }))

  if (signedResult < INT_MIN) {
    steps.push(makeStep({
      phase: 'clamp-min',
      index,
      currentChar: null,
      sign,
      unsignedValue: unsignedValue.toString(),
      digits,
      result: INT_MIN,
      description: `Value is below ${INT_MIN}, so clamp to INT_MIN.`,
      stopReason,
      clamped: 'min',
    }))
  } else if (signedResult > INT_MAX) {
    steps.push(makeStep({
      phase: 'clamp-max',
      index,
      currentChar: null,
      sign,
      unsignedValue: unsignedValue.toString(),
      digits,
      result: INT_MAX,
      description: `Value is above ${INT_MAX}, so clamp to INT_MAX.`,
      stopReason,
      clamped: 'max',
    }))
  }

  const finalResult = Number(clampResult(signedResult))
  steps.push(makeStep({
    phase: 'final',
    index,
    currentChar: null,
    sign,
    unsignedValue: unsignedValue.toString(),
    digits,
    result: finalResult,
    description: `Return ${finalResult}.`,
    stopReason,
    clamped: BigInt(finalResult) !== signedResult ? (finalResult === INT_MIN ? 'min' : 'max') : null,
  }))

  return steps
}

