
export function parseInput(text) {
  const input = JSON.parse(text);

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Use an object with nums and k.');
  }

  const { nums, k } = input;

  if (
    !Array.isArray(nums) ||
    nums.length < 1 ||
    nums.length > 8 ||
    !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)
  ) {
    throw new Error('nums must contain 1–8 integers from 1 to 9.');
  }

  if (!Number.isInteger(k) || k < 0 || k > 20) {
    throw new Error('k must be an integer from 0 to 20.');
  }

  return { nums: [...nums], k };
}

export function raiseCost(values) {
  let high = -Infinity;
  let cost = 0;

  for (const value of values) {
    if (value < high) cost += high - value;
    else high = value;
  }

  return cost;
}

const bruteLines = [
  'function countNonDecreasing(nums, k) {',
  '  let count = 0',
  '  for (let l = 0; l < nums.length; l++) {',
  '    for (let r = l; r < nums.length; r++) {',
  '      let high = -Infinity, cost = 0',
  '      for (let i = l; i <= r; i++) {',
  '        if (nums[i] < high) cost += high - nums[i]',
  '        else high = nums[i]',
  '      }',
  '      if (cost <= k) count++',
  '    }',
  '  }',
  '  return count',
  '}',
];

const optimizedLines = [
  'function countNonDecreasing(nums, k) {',
  '  const deque = []',
  '  let right = nums.length, cost = 0, count = 0',
  '  for (let left = nums.length - 1; left >= 0; left--) {',
  '    while (deque.length && nums[deque[0]] <= nums[left]) {',
  '      const j = deque.shift()',
  '      const next = deque.length ? deque[0] : right',
  '      cost += (next - j) * (nums[left] - nums[j])',
  '    }',
  '    deque.unshift(left)',
  '    while (cost > k) {',
  '      cost -= nums[deque[deque.length - 1]] - nums[right - 1]',
  '      if (deque[deque.length - 1] === right - 1) deque.pop()',
  '      right--',
  '    }',
  '    count += right - left',
  '  }',
  '  return count',
  '}',
];

export const code = bruteLines.map((text, i) => ({
  line: i + 1,
  text,
}));

export const alternativeCode = optimizedLines.map((text, i) => ({
  line: i + 1,
  text,
}));

export const python = `def count_subarrays(nums, k):
    count = 0
    for l in range(len(nums)):
        for r in range(l, len(nums)):
            high, cost = float('-inf'), 0
            for i in range(l, r + 1):
                if nums[i] < high:
                    cost += high - nums[i]
                else:
                    high = nums[i]
            if cost <= k:
                count += 1
    return count`;

export const alternativePython = `from collections import deque

def count_subarrays(nums, k):
    n = len(nums)
    blocks = deque()
    right = n
    cost = 0
    count = 0

    for left in range(n - 1, -1, -1):
        while blocks and nums[blocks[0]] <= nums[left]:
            j = blocks.popleft()
            next_index = blocks[0] if blocks else right
            cost += (next_index - j) * (nums[left] - nums[j])

        blocks.appendleft(left)

        while cost > k:
            cost -= nums[blocks[-1]] - nums[right - 1]
            if blocks[-1] == right - 1:
                blocks.pop()
            right -= 1

        count += right - left

    return count`;

const findLine = (lines, term) =>
  lines.findIndex(line => line.includes(term)) + 1;

function createEmitter(nums, k, approach, source, pySource) {
  const frames = [];
  const pyLines = pySource.split('\n');

  const state = {
    approach,
    phase: 'start',
    l: -1,
    r: -1,
    i: -1,
    at: -1,
    end: -1,
    high: null,
    cost: 0,
    count: 0,
    delta: 0,
    raised: [],
    budget: k,
    matrix: {},
    deque: [],
    blocks: [],
    right: nums.length,
    loop: null,
    transfer: null,
    message: '',
  };

  function emit(phase, message, jsTerm, pyTerm, extra = {}) {
    const snapshot = {
      ...state,
      ...extra,
      phase,
      message,
      activeLine: findLine(source, jsTerm),
      pythonLine: findLine(pyLines, pyTerm),
      raised: [...(extra.raised ?? state.raised)],
      deque: [...(extra.deque ?? state.deque)],
      blocks: (extra.blocks ?? state.blocks).map(b => ({ ...b })),
      matrix: { ...state.matrix },
      loop: state.loop ? { ...state.loop } : null,
      transfer: state.transfer ? { ...state.transfer } : null,
    };

    frames.push(snapshot);
  }

  return { state, frames, emit };
}

function loopState(id, iteration, condition) {
  return {
    id,
    iteration,
    condition,
    branch: condition ? 'repeat' : 'exit',
  };
}

export function buildTrace({ nums, k }) {
  const { state: s, frames, emit } = createEmitter(
    nums, k, 'brute', bruteLines, python
  );

  emit('start', `Budget k = ${k}. Begin checking all subarrays.`,
    'let count = 0', 'count = 0');

  for (let l = 0; l < nums.length; l++) {
    s.l = l;
    s.at = l;
    s.loop = loopState('left', l, true);
    s.transfer = { from: 'array', to: 'window', value: `l = ${l}` };
    emit('loop-check', `Outer loop selects start l = ${l}.`,
      'for (let l', 'for l in range');

    for (let r = l; r < nums.length; r++) {
      s.r = r;
      s.end = r;
      s.i = -1;
      s.cost = 0;
      s.high = null;
      s.delta = 0;
      s.raised = [];
      s.loop = loopState('right', r - l, true);
      s.transfer = {
        from: 'array',
        to: 'window',
        value: `[${l}..${r}]`,
      };

      emit('window', `Examine subarray nums[${l}..${r}].`,
        'for (let r', 'for r in range');

      let high = -Infinity;
      let cost = 0;
      const raised = [];

      for (let i = l; i <= r; i++) {
        s.i = i;
        s.loop = loopState('scan', i - l, true);
        s.transfer = {
          from: 'array',
          to: 'operations',
          value: `nums[${i}] = ${nums[i]}`,
        };

        emit('loop-check', `Scan index ${i} inside the current subarray.`,
          'for (let i', 'for i in range');

        const before = Number.isFinite(high) ? high : nums[i];
        high = Math.max(before, nums[i]);
        const delta = high - nums[i];
        cost += delta;
        raised.push(high);

        s.high = high;
        s.delta = delta;
        s.cost = cost;
        s.raised = [...raised];
        s.loop = null;
        s.transfer = {
          from: 'operations',
          to: 'budget',
          value: `+${delta} → ${cost}`,
        };

        emit('increment',
          `nums[${i}] = ${nums[i]} → ${high}. Spend ${delta} increment(s); total cost ${cost}.`,
          delta > 0 ? 'cost += high' : 'else high =',
          delta > 0 ? 'cost += high' : 'high = nums[i]');
      }

      s.i = -1;
      s.loop = loopState('scan', r - l + 1, false);
      emit('loop-check', 'Inner scan ends; the window cost is known.',
        'for (let i', 'for i in range');

      s.loop = null;
      const valid = cost <= k;
      if (valid) s.count++;

      s.matrix[`${l}-${r}`] = {
        valid,
        cost,
      };

      s.transfer = {
        from: 'budget',
        to: 'matrix',
        value: valid ? `✓ +1` : `✕ ${cost} > ${k}`,
      };

      emit(valid ? 'fits' : 'too-costly',
        `Window [${l}..${r}] costs ${cost}. ${valid ? `Valid: count = ${s.count}.` : `Over budget ${k}.`}`,
        'if (cost <= k)', 'if cost <= k:');
    }

    s.loop = loopState('right', nums.length - l, false);
    emit('loop-check', `All end indices for l = ${l} are complete.`,
      'for (let r', 'for r in range');
  }

  s.loop = loopState('left', nums.length, false);
  s.transfer = null;
  emit('loop-check', 'All subarrays have been examined.',
    'for (let l', 'for l in range');

  s.loop = null;
  s.l = -1;
  s.r = -1;
  s.at = -1;
  s.end = -1;
  s.i = -1;
  s.cost = null;
  emit('done', `${s.count} valid subarrays.`,
    'return count', 'return count', { result: s.count });

  return { input: { nums, k }, result: s.count, frames };
}

function describeBlocks(nums, deque, right) {
  return deque.map((start, index) => ({
    start,
    end: (deque[index + 1] ?? right) - 1,
    height: nums[start],
  }));
}

export function buildAlternativeTrace({ nums, k }) {
  const { state: s, frames, emit } = createEmitter(
    nums, k, 'optimized', optimizedLines, alternativePython
  );

  const n = nums.length;
  const deque = [];
  let right = n;
  let cost = 0;
  let count = 0;

  function sync() {
    s.right = right;
    s.r = right - 1;
    s.end = right - 1;
    s.cost = cost;
    s.count = count;
    s.deque = [...deque];
    s.blocks = describeBlocks(nums, deque, right);

    let high = -Infinity;
    s.raised = [];

    for (let i = s.l; i < right; i++) {
      high = Math.max(high, nums[i]);
      s.raised.push(high);
    }
  }

  sync();
  emit('start',
    'Start from the right. The deque stores starts of descending-height blocks.',
    'const deque =', 'blocks = deque()');

  for (let left = n - 1; left >= 0; left--) {
    s.l = left;
    s.at = left;
    s.i = left;
    s.delta = 0;
    s.loop = loopState('left-reverse', n - 1 - left, true);
    s.transfer = {
      from: 'array',
      to: 'deque',
      value: `prepend ${nums[left]} at [${left}]`,
    };

    sync();
    emit('loop-check', `Move left boundary to ${left}.`,
      'for (let left', 'for left in range');

    let mergeIteration = 0;

    while (true) {
      const merge = deque.length > 0 && nums[deque[0]] <= nums[left];
      s.loop = loopState('merge', mergeIteration, merge);
      sync();

      emit('loop-check',
        merge
          ? `Front block height ${nums[deque[0]]} ≤ new height ${nums[left]}. Merge it.`
          : 'No more blocks need merging.',
        'while (deque.length', 'while blocks and');

      if (!merge) break;

      const j = deque.shift();
      const next = deque.length ? deque[0] : right;
      const added = (next - j) * (nums[left] - nums[j]);
      cost += added;
      s.delta = added;
      s.loop = null;
      s.transfer = {
        from: 'deque',
        to: 'budget',
        value: `${next - j} × ${nums[left] - nums[j]} = +${added}`,
      };

      sync();
      emit('merge',
        `Merge block [${j}..${next - 1}]: raise ${next - j} value(s) from ${nums[j]} to ${nums[left]}, adding ${added} to cost.`,
        'cost += (next - j)', 'cost += (next_index - j)');

      mergeIteration++;
    }

    deque.unshift(left);
    s.loop = null;
    s.transfer = {
      from: 'array',
      to: 'deque',
      value: `push front [${left}]`,
    };

    sync();
    emit('deque-push',
      `Insert index ${left} at the front of the deque.`,
      'deque.unshift(left)', 'blocks.appendleft(left)');

    let shrinkIteration = 0;

    while (true) {
      const shrink = cost > k;
      s.loop = loopState('shrink', shrinkIteration, shrink);
      sync();

      emit('loop-check',
        shrink
          ? `Cost ${cost} exceeds k = ${k}; shrink from the right.`
          : `Cost ${cost} fits within k = ${k}; stop shrinking.`,
        'while (cost > k)', 'while cost > k:');

      if (!shrink) break;

      const last = right - 1;
      const height = nums[deque[deque.length - 1]];
      const saved = height - nums[last];

      cost -= saved;
      if (deque[deque.length - 1] === last) deque.pop();
      right--;

      s.i = last;
      s.delta = -saved;
      s.loop = null;
      s.transfer = {
        from: 'deque',
        to: 'budget',
        value: `−${saved} → ${cost}`,
      };

      sync();
      emit('shrink',
        `Remove index ${last} from the right. Refund ${height} − ${nums[last]} = ${saved}; cost becomes ${cost}.`,
        'cost -= nums[deque', 'cost -= nums[blocks');

      shrinkIteration++;
    }

    s.i = -1;
    s.loop = null;

    const addedCount = right - left;
    count += addedCount;

    for (let r = left; r < right; r++) {
      s.matrix[`${left}-${r}`] = {
        valid: true,
        cost: raiseCost(nums.slice(left, r + 1)),
      };
    }

    // Longer subarrays have at least as much cost.
    for (let r = right; r < n; r++) {
      s.matrix[`${left}-${r}`] = {
        valid: false,
        cost: raiseCost(nums.slice(left, r + 1)),
      };
    }

    s.transfer = {
      from: 'budget',
      to: 'matrix',
      value: `+${addedCount} windows`,
    };

    sync();
    emit('count-window',
      `For left = ${left}, all ${addedCount} subarrays ending at ${left}..${right - 1} fit. Total = ${count}.`,
      'count += right - left', 'count += right - left');
  }

  s.loop = loopState('left-reverse', n, false);
  emit('loop-check', 'The reverse left-boundary loop is complete.',
    'for (let left', 'for left in range');

  s.loop = null;
  s.l = -1;
  s.r = -1;
  s.at = -1;
  s.end = -1;
  s.i = -1;
  s.transfer = null;
  emit('done', `${count} valid subarrays.`,
    'return count', 'return count', { result: count });

  return { input: { nums, k }, result: count, frames };
}
