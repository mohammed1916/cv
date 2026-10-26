export const R2I_PATTERNS = ['init', 'loop', 'check', 'subtract', 'add']

// Map which code line corresponds to which pattern
export const LINE_PATTERN_MAP = {
  6: 'init',    // res = 0
  7: 'loop',    // for i in range(len(s)):
  8: 'loop',    // curr_val = val_map[s[i]]
  9: 'loop',    // next_val = val_map[s[i+1]] if i+1 < len(s) else 0
  10: 'check',  // if curr_val < next_val:
  11: 'subtract', // res -= curr_val  # Subtractive case
  13: 'add',    // res += curr_val
  14: 'loop',   // return res
}

export const SOLUTION_CODE = [
  { line: 1, text: 'def romanToInt(s: str) -> int:' },
  { line: 2, text: '    val_map = {' },
  { line: 3, text: '        "I": 1, "V": 5, "X": 10, "L": 50,' },
  { line: 4, text: '        "C": 100, "D": 500, "M": 1000' },
  { line: 5, text: '    }' },
  { line: 6, text: '    res = 0' },
  { line: 7, text: '    for i in range(len(s)):' },
  { line: 8, text: '        curr_val = val_map[s[i]]' },
  { line: 9, text: '        next_val = val_map[s[i+1]] if i+1 < len(s) else 0' },
  { line: 10, text: '        if curr_val < next_val:' },
  { line: 11, text: '            res -= curr_val  # Subtractive case (IV, IX, etc)' },
  { line: 12, text: '        else:' },
  { line: 13, text: '            res += curr_val' },
  { line: 14, text: '    return res' },
]

export const VAL_MAP = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000,
}

export function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    steps.push({
      activeLine: 6,
      res: 0,
      index: 0,
      currChar: '',
      currVal: 0,
      nextVal: 0,
      operation: 'none',
      message: 'Empty string. Return 0.',
    })
    return steps
  }

  // Initialize
  steps.push({
    activeLine: 6,
    res: 0,
    index: -1,
    currChar: '',
    currVal: 0,
    nextVal: 0,
    operation: 'none',
    message: 'Initialize res = 0. Start loop.',
  })

  let res = 0
  for (let i = 0; i < s.length; i++) {
    const currChar = s[i]
    const currVal = VAL_MAP[currChar]
    const nextVal = i + 1 < s.length ? VAL_MAP[s[i + 1]] : 0

    // Current value step
    steps.push({
      activeLine: 8,
      res,
      index: i,
      currChar,
      currVal,
      nextVal,
      operation: 'none',
      message: `i=${i}: Current char='${currChar}', value=${currVal}`,
    })

    // Check next value
    steps.push({
      activeLine: 9,
      res,
      index: i,
      currChar,
      currVal,
      nextVal,
      operation: 'none',
      message: `i=${i}: Next char='${nextVal > 0 ? s[i + 1] : 'none'}', value=${nextVal}`,
    })

    // Check if subtractive
    let newRes
    if (currVal < nextVal) {
      steps.push({
        activeLine: 10,
        res,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'check',
        message: `i=${i}: ${currVal} < ${nextVal}? YES (subtractive case)`,
      })

      newRes = res - currVal
      steps.push({
        activeLine: 11,
        res: newRes,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'subtract',
        message: `i=${i}: Subtract ${currVal}. res = ${res} - ${currVal} = ${newRes}`,
      })
    } else {
      steps.push({
        activeLine: 10,
        res,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'check',
        message: `i=${i}: ${currVal} < ${nextVal}? NO (normal case)`,
      })

      newRes = res + currVal
      steps.push({
        activeLine: 13,
        res: newRes,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'add',
        message: `i=${i}: Add ${currVal}. res = ${res} + ${currVal} = ${newRes}`,
      })
    }

    res = newRes
  }

  // Final step
  steps.push({
    activeLine: 14,
    res,
    index: s.length,
    currChar: '',
    currVal: 0,
    nextVal: 0,
    operation: 'done',
    message: `Loop complete. Return res = ${res}`,
  })

  return steps
}



