export const legacyCode = [
  'def divide(dividend: int, divisor: int) -> int:',
  '    if dividend == -2147483648 and divisor == -1:',
  '        return 2147483647',
  '    negative = (dividend < 0) != (divisor < 0)',
  '    remaining, base = abs(dividend), abs(divisor)',
  '    quotient = 0',
  '    while remaining >= base:',
  '        chunk, count = base, 1',
  '        while (chunk << 1) <= remaining:',
  '            chunk <<= 1',
  '            count <<= 1',
  '        remaining -= chunk',
  '        quotient += count',
  '    return -quotient if negative else quotient',
].map((text, index) => ({ line: index + 1, text }));

export const linePatterns = { 2: 'check', 3: 'done', 4: 'init', 5: 'init', 6: 'init', 7: 'check', 8: 'init', 9: 'check', 10: 'build', 11: 'build', 12: 'subtract', 13: 'add', 14: 'done' };

export function buildDivision(values) {
  const input = {};
  for (const key of ['dividend', 'divisor']) {
    const raw = String(values[key]).trim(), value = Number(raw);
    if (!/^[+-]?\d+$/.test(raw) || !Number.isInteger(value) || value < -2147483648 || value > 2147483647) throw new Error(`${key} must be a signed 32-bit integer.`);
    input[key] = value;
  }
  if (input.divisor === 0) throw new Error('Divisor cannot be zero.');
  const { dividend, divisor } = input;
  const total = Math.abs(dividend), base = Math.abs(divisor);
  const negative = (dividend < 0) !== (divisor < 0);
  let remaining = total, quotient = 0, chunk = 0, count = 0, taken = [], result = null;
  const frames = [];
  const push = (activeLine, message) => frames.push({ activeLine, phase: linePatterns[activeLine], message,
    remaining, quotient, chunk, count, taken: [...taken], result, negative });
  push(2, 'Check the one overflow case before taking absolute values.');
  if (dividend === -2147483648 && divisor === -1) {
    result = 2147483647;
    push(3, 'Positive 2147483648 exceeds INT_MAX. Return 2147483647.');
    return { input, total, base, frames };
  }
  push(4, negative ? 'Signs differ: negate the quotient at the end.' : 'Signs match: the quotient is non-negative.');
  push(6, `Start with magnitude ${total}, divisor magnitude ${base}, and quotient 0.`);
  push(7, `${remaining} >= ${base}? ${remaining >= base ? 'Yes: find a chunk.' : 'No: no full divisor fits.'}`);
  while (remaining >= base) {
    chunk = base; count = 1;
    push(8, `Start a chunk of ${chunk}, representing 1 divisor.`);
    push(9, `Can the doubled chunk ${chunk + chunk} fit in ${remaining}?`);
    while (chunk + chunk <= remaining) {
      chunk += chunk;
      push(10, `Shift the chunk left: it becomes ${chunk}. Next double its divisor count.`);
      count += count;
      push(11, `Shift the count left: ${count} copies of ${base} make ${chunk}.`);
      push(9, `Can the doubled chunk ${chunk + chunk} fit in ${remaining}?`);
    }
    const before = remaining;
    remaining -= chunk;
    taken = [...taken, { chunk, count }];
    push(12, `Take the largest fitting chunk: ${before} - ${chunk} = ${remaining}.`);
    quotient += count;
    push(13, `Add ${count} to the quotient: now ${quotient}.`);
    push(7, `${remaining} >= ${base}? ${remaining >= base ? 'Yes: find another chunk.' : 'No: division is complete.'}`);
  }
  result = quotient === 0 ? 0 : negative ? -quotient : quotient;
  push(14, `Return ${result}. Leftover magnitude ${remaining} is smaller than ${base}; truncate toward zero.`);
  return { input, total, base, frames };
}

// ---- Divide Two Integers (statement-sourced; see scratch statements/29.md) ----
const INT_MAX = 2147483647
const INT_MIN = -2147483648

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with dividend and divisor.')
  const { dividend, divisor } = obj
  if (!Number.isInteger(dividend) || dividend < INT_MIN || dividend > INT_MAX) throw new Error('Dividend must be a 32-bit signed integer.')
  if (!Number.isInteger(divisor) || divisor < INT_MIN || divisor > INT_MAX) throw new Error('Divisor must be a 32-bit signed integer.')
  if (divisor === 0) throw new Error('Divisor must not be zero.')
  return { dividend, divisor }
}

export function buildTrace({ dividend, divisor }) {
  const negative = (dividend < 0) !== (divisor < 0)
  let a = Math.abs(dividend)
  const b = Math.abs(divisor)
  let quotient = 0
  const frames = [{ phase: 'init', activeLine: L('set a to |dividend| and b to |divisor|'), a, b, quotient, message: `Work with |${dividend}| and |${divisor}|, then fix the sign at the end.` }]
  while (a >= b) {
    let shift = 0
    while (a >= b * 2 ** (shift + 1)) shift++
    a -= b * 2 ** shift
    quotient += 2 ** shift
    frames.push({ phase: 'build', activeLine: L('find the largest doubling of b that still fits in a'), a, b, quotient, message: `Subtract ${b} doubled ${shift} time(s). Remainder ${a}, quotient ${quotient}.` })
  }
  const signed = negative ? -quotient : quotient
  const result = Math.min(INT_MAX, signed)
  frames.push({ phase: 'done', activeLine: L('return'), a, b, quotient: result, message: result === INT_MAX && signed > INT_MAX ? 'The quotient overflows, so return 2147483647.' : `Quotient ${result}.` })
  return { input: { dividend, divisor }, result: result + 0, frames }
}

export const code = `divide (dividend, divisor) without multiplication or division:
  if the result would overflow then return the upper bound
  set the sign to negative when exactly one input is negative
  set a to |dividend| and b to |divisor|
  set quotient to 0
  while a is at least b:
    find the largest doubling of b that still fits in a
    subtract that doubling from a and add its multiple to quotient
  apply the sign and clamp to the 32-bit range
  return quotient`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def divide(dividend, divisor):
    if dividend == -2147483648 and divisor == -1:
        return 2147483647
    negative = (dividend < 0) != (divisor < 0)
    a, b = abs(dividend), abs(divisor)
    quotient = 0
    while a >= b:
        shift = 0
        while a >= (b << (shift + 1)):
            shift += 1
        a -= b << shift
        quotient += 1 << shift
    return -quotient if negative else quotient
`
