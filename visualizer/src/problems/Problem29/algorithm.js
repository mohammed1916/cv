export const code = [
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
