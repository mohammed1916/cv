// Each solver owns its decisions. Only immutable trace capture is shared.
export function traceAlgorithm(id, input) {
  const frames = [];
  const source = input.nums ?? input.flowerbed ?? input.candies ?? input.accounts ?? input.matrix ?? input.s ?? [input.c];
  const emit = (message, state = {}, phase = 'inspect') => frames.push(structuredClone({
    phase, activeLine: { start: 1, inspect: 3, update: 4, done: 5 }[phase],
    message, sequence: source, index: -1, metrics: {}, ...state,
  }));
  emit('Read the input. No result has been established yet.', {}, 'start');
  const result = solvers[id](input, emit);
  frames.push({ ...frames.at(-1), phase: 'done', activeLine: 5,
    message: `Return ${JSON.stringify(result)}. ${conclusions[id]}`, result: structuredClone(result) });
  return { frames, result };
}

export const conclusions = {
  605: 'Every planted flower preserves an empty neighbor on both sides.',
  611: 'Every counted triple has a smallest pair whose sum exceeds its largest side.',
  628: 'The winner includes either the three largest values or two negative values and the largest positive value.',
  633: 'The two pointers exhaust the possible nonnegative square pairs.',
  643: 'Every window has exactly k entries, so comparing sums also compares averages.',
  645: 'The duplicate uses a slot twice; the missing number never occupies its slot.',
  674: 'Only adjacent strict increases extend a run.',
  697: 'A shortest interval achieving the degree spans a most frequent value from its first to last occurrence.',
  724: 'The pivot itself belongs to neither side sum.',
  747: 'It is enough to compare the largest value with twice the second largest.',
  766: 'Each cell agrees with its northwest neighbor, so every diagonal is constant.',
  832: 'Each row was reversed and each bit was inverted.',
  867: 'Source row and column indices have exchanged roles.',
  896: 'Equal adjacent values do not break either monotonic direction.',
  905: 'The output contains all the same values with evens before odds.',
  922: 'Every output index has the same parity as its value.',
  977: 'The greatest remaining magnitude was placed at the last remaining output position.',
  1047: 'The stack contains no adjacent equal pair; removing one pair may expose another.',
  1207: 'No two distinct values share the same frequency.',
  1295: 'Only numbers whose decimal digit count is even contribute to the count.',
  1431: 'Each child is compared independently against the original maximum.',
  1480: 'Output i is the sum of input positions 0 through i.',
  1512: 'Each new occurrence pairs with all earlier equal values exactly once.',
  1672: 'Each row total is one customer’s wealth; the maximum total wins.',
};

const solvers = {
  605({ flowerbed, n }, emit) {
    const bed = [...flowerbed]; let planted = 0;
    for (let i = 0; i < bed.length; i++) {
      const free = bed[i] === 0 && (i === 0 || bed[i - 1] === 0) && (i === bed.length - 1 || bed[i + 1] === 0);
      if (free) { bed[i] = 1; planted++; }
      emit(free ? `Plant at ${i}: both neighboring slots are empty or outside the bed.` : `Skip ${i}: this slot or a neighbor is occupied.`, { sequence: bed, index: i, metrics: { planted, required: n } }, 'update');
    }
    return planted >= n;
  },
  611({ nums }, emit) {
    const a = [...nums].sort((x, y) => x - y); let count = 0;
    for (let k = a.length - 1; k >= 2; k--) {
      let left = 0, right = k - 1;
      while (left < right) {
        const valid = a[left] + a[right] > a[k];
        const added = valid ? right - left : 0;
        count += added;
        emit(valid ? `With largest side ${a[k]}, all ${added} starts from ${left} to ${right - 1} work with side ${a[right]}.` : `${a[left]} + ${a[right]} is not greater than ${a[k]}; discard this smallest side.`, { sequence: a, index: k, marks: { [left]: 'left', [right]: 'right', [k]: 'largest' }, metrics: { count, added } }, 'update');
        if (valid) right--; else left++;
      }
    }
    return count;
  },
  628({ nums }, emit) {
    const low = [], high = [];
    nums.forEach((value, i) => {
      low.push(value); low.sort((a, b) => a - b); if (low.length > 2) low.pop();
      high.push(value); high.sort((a, b) => b - a); if (high.length > 3) high.pop();
      emit(`Keep the two smallest and three largest after reading ${value}.`, { index: i, metrics: { smallest: low, largest: high } }, 'update');
    });
    const positive = high[0] * high[1] * high[2], negativePair = low[0] * low[1] * high[0];
    emit('Compare the only two extreme candidates; two negatives may beat three positive values.', { metrics: { threeLargest: positive, twoSmallestAndLargest: negativePair } });
    return Math.max(positive, negativePair);
  },
  633({ c }, emit) {
    let left = 0, right = Math.floor(Math.sqrt(c));
    while (left <= right) {
      const sum = left * left + right * right;
      emit(`${left}² + ${right}² = ${sum}. ${sum === c ? 'Found a witness.' : sum < c ? 'Increase the smaller square.' : 'Decrease the larger square.'}`, { metrics: { left, right, sum, target: c }, sequence: [left * left, right * right] });
      if (sum === c) return true;
      if (sum < c) left++; else right--;
    }
    return false;
  },
  643({ nums, k }, emit) {
    let sum = 0, best = -Infinity;
    nums.forEach((value, i) => {
      sum += value;
      if (i >= k) sum -= nums[i - k];
      if (i >= k - 1) best = Math.max(best, sum);
      emit(i < k - 1 ? `Collect ${value}; the first window is not full yet.` : `Window [${i - k + 1}, ${i}] has sum ${sum}; keep the greatest full-window sum.`, { index: i, window: [Math.max(0, i - k + 1), i], metrics: { sum, best: best === -Infinity ? 'no full window' : best, k } }, 'update');
    });
    return best / k;
  },
  645({ nums }, emit) {
    const count = Array(nums.length + 1).fill(0); let duplicate;
    nums.forEach((value, i) => {
      count[value]++; if (count[value] === 2) duplicate = value;
      emit(`Value ${value} has now appeared ${count[value]} time(s).`, { index: i, table: count.slice(1).map((n, j) => [j + 1, n]), metrics: { duplicate: duplicate ?? 'not found' } }, 'update');
    });
    const missing = count.findIndex((n, i) => i > 0 && n === 0);
    emit(`Slot ${missing} was never visited.`, { metrics: { duplicate, missing } });
    return [duplicate, missing];
  },
  674({ nums }, emit) {
    let run = 0, best = 0;
    nums.forEach((value, i) => {
      const extendsRun = i > 0 && value > nums[i - 1];
      run = extendsRun ? run + 1 : 1; best = Math.max(best, run);
      emit(extendsRun ? `${value} > ${nums[i - 1]}: extend the contiguous run.` : `Start a new run at ${i}; equality also breaks a strict increase.`, { index: i, window: [i - run + 1, i], metrics: { run, best } }, 'update');
    });
    return best;
  },
  697({ nums }, emit) {
    const stats = new Map(); let degree = 0, shortest = nums.length;
    nums.forEach((value, i) => {
      const [count, first] = stats.get(value) ?? [0, i];
      stats.set(value, [count + 1, first, i]);
      const span = i - first + 1;
      if (count + 1 > degree) { degree = count + 1; shortest = span; }
      else if (count + 1 === degree) shortest = Math.min(shortest, span);
      emit(`Value ${value}: count ${count + 1}, first ${first}, last ${i}. Compare its span when it matches the greatest frequency.`, { index: i, table: [...stats].map(([v, row]) => [v, ...row]), metrics: { degree, shortest } }, 'update');
    });
    return shortest;
  },
  724({ nums }, emit) {
    const total = nums.reduce((a, b) => a + b, 0); let left = 0;
    for (let i = 0; i < nums.length; i++) {
      const right = total - left - nums[i];
      emit(`At ${i}, exclude ${nums[i]} from both sides: left ${left}, right ${right}.`, { index: i, metrics: { total, left, right } });
      if (left === right) return i;
      left += nums[i];
    }
    return -1;
  },
  747({ nums }, emit) {
    let largest = -1, second = -1, index = -1;
    nums.forEach((value, i) => {
      if (value > largest) { second = largest; largest = value; index = i; }
      else second = Math.max(second, value);
      emit(`Track the two largest values after position ${i}.`, { index: i, metrics: { largest, second, largestIndex: index } }, 'update');
    });
    return largest >= 2 * second ? index : -1;
  },
  766({ matrix }, emit) {
    for (let r = 1; r < matrix.length; r++) for (let c = 1; c < matrix[0].length; c++) {
      const matches = matrix[r][c] === matrix[r - 1][c - 1];
      emit(`Compare (${r}, ${c}) = ${matrix[r][c]} with northwest (${r - 1}, ${c - 1}) = ${matrix[r - 1][c - 1]}.`, { matrix, cell: [r, c], otherCell: [r - 1, c - 1], metrics: { matches } });
      if (!matches) return false;
    }
    return true;
  },
  832({ matrix }, emit) {
    const output = matrix.map(row => row.map(() => null));
    for (let r = 0; r < matrix.length; r++) for (let c = 0; c < matrix[0].length; c++) {
      const from = matrix[0].length - 1 - c;
      output[r][c] = 1 - matrix[r][from];
      emit(`Read source (${r}, ${from}) and invert its bit into (${r}, ${c}).`, { matrix, outputMatrix: output, cell: [r, from], outputCell: [r, c] }, 'update');
    }
    return output;
  },
  867({ matrix }, emit) {
    const output = Array.from({ length: matrix[0].length }, () => Array(matrix.length).fill(null));
    for (let r = 0; r < matrix.length; r++) for (let c = 0; c < matrix[0].length; c++) {
      output[c][r] = matrix[r][c];
      emit(`Move value ${matrix[r][c]} from (${r}, ${c}) to (${c}, ${r}); dimensions swap too.`, { matrix, outputMatrix: output, cell: [r, c], outputCell: [c, r] }, 'update');
    }
    return output;
  },
  896({ nums }, emit) {
    let up = true, down = true;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] < nums[i - 1]) up = false;
      if (nums[i] > nums[i - 1]) down = false;
      emit(`Compare ${nums[i - 1]} with ${nums[i]}; keep each direction that remains possible.`, { index: i, metrics: { nondecreasing: up, nonincreasing: down } }, 'update');
    }
    return up || down;
  },
  905({ nums }, emit) {
    const even = [], odd = [];
    nums.forEach((value, i) => {
      (value % 2 === 0 ? even : odd).push(value);
      emit(`Append ${value} to the ${value % 2 === 0 ? 'even' : 'odd'} group.`, { index: i, output: [...even, ...odd], metrics: { evens: even.length, odds: odd.length } }, 'update');
    });
    return [...even, ...odd];
  },
  922({ nums }, emit) {
    const output = Array(nums.length).fill(null); let even = 0, odd = 1;
    nums.forEach((value, i) => {
      const slot = value % 2 === 0 ? even : odd;
      output[slot] = value;
      if (value % 2 === 0) even += 2; else odd += 2;
      emit(`Place ${value} at ${slot}; move only the ${value % 2 === 0 ? 'even' : 'odd'} write pointer by two.`, { index: i, output, outputIndex: slot, metrics: { nextEven: even, nextOdd: odd } }, 'update');
    });
    return output;
  },
  977({ nums }, emit) {
    const output = Array(nums.length).fill(null); let left = 0, right = nums.length - 1;
    for (let slot = nums.length - 1; slot >= 0; slot--) {
      const from = Math.abs(nums[left]) > Math.abs(nums[right]) ? left++ : right--;
      output[slot] = nums[from] ** 2;
      emit(`The larger endpoint magnitude is ${Math.abs(nums[from])}; write square ${output[slot]} at ${slot}.`, { index: from, output, outputIndex: slot, marks: { [left]: 'left', [right]: 'right' } }, 'update');
    }
    return output;
  },
  1047({ s }, emit) {
    const stack = [];
    [...s].forEach((letter, i) => {
      const remove = stack.at(-1) === letter;
      if (remove) stack.pop(); else stack.push(letter);
      emit(remove ? `Remove ${letter}${letter}; the new stack top may match a later character.` : `Push ${letter}; it does not match the stack top.`, { index: i, output: stack, metrics: { action: remove ? 'pop pair' : 'push', size: stack.length } }, 'update');
    });
    return stack.join('');
  },
  1207({ nums }, emit) {
    const counts = new Map();
    nums.forEach((value, i) => { counts.set(value, (counts.get(value) ?? 0) + 1); emit(`Count occurrence of ${value}.`, { index: i, table: [...counts] }, 'update'); });
    const seen = new Set();
    for (const [value, count] of counts) {
      emit(`Value ${value} occurs ${count} times. ${seen.has(count) ? 'Another value already uses this frequency.' : 'This frequency is new.'}`, { table: [...counts], metrics: { checking: value, count, usedFrequencies: [...seen] } });
      if (seen.has(count)) return false;
      seen.add(count);
    }
    return true;
  },
  1295({ nums }, emit) {
    let count = 0;
    nums.forEach((value, i) => { const digits = String(value).length; if (digits % 2 === 0) count++; emit(`${value} has ${digits} decimal digits; ${digits % 2 === 0 ? 'include' : 'exclude'} it.`, { index: i, metrics: { digits, count } }, 'update'); });
    return count;
  },
  1431({ candies, extraCandies }, emit) {
    const maximum = Math.max(...candies), output = [];
    candies.forEach((value, i) => { const eligible = value + extraCandies >= maximum; output.push(eligible); emit(`Child ${i} could have ${value + extraCandies}, compared with original maximum ${maximum}. Reset the hypothetical gift for each child.`, { index: i, output, metrics: { maximum, extraCandies, eligible } }, 'update'); });
    return output;
  },
  1480({ nums }, emit) {
    const output = []; let sum = 0;
    nums.forEach((value, i) => { const previous = sum; sum += value; output.push(sum); emit(`Prefix through ${i}: ${previous} + ${value} = ${sum}.`, { index: i, output, metrics: { sum } }, 'update'); });
    return output;
  },
  1512({ nums }, emit) {
    const counts = new Map(); let pairs = 0;
    nums.forEach((value, i) => { const previous = counts.get(value) ?? 0; pairs += previous; counts.set(value, previous + 1); emit(`The new ${value} pairs with ${previous} earlier occurrences. Add before incrementing its count.`, { index: i, table: [...counts], metrics: { added: previous, pairs } }, 'update'); });
    return pairs;
  },
  1672({ accounts }, emit) {
    let best = 0;
    accounts.forEach((row, r) => { let wealth = 0; row.forEach((value, c) => { wealth += value; emit(`Customer ${r}, bank ${c}: add ${value} to this customer's running wealth.`, { matrix: accounts, cell: [r, c], metrics: { customer: r, wealth, bestCompleted: best } }, 'update'); }); best = Math.max(best, wealth); emit(`Customer ${r} totals ${wealth}; greatest completed wealth is ${best}.`, { matrix: accounts, metrics: { customer: r, wealth, bestCompleted: best } }); });
    return best;
  },
};
