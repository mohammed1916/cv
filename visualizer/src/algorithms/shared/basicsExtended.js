import { trace } from './basics.js';

export function twoPointers(input) {
  const { nums, target } = input, { emit, finish } = trace(input);
  let left = 0, right = nums.length - 1;
  const show = (message, line, phase = 'inspect') => emit(message, { nums, left, right, sum: left < right ? nums[left] + nums[right] : null }, line, phase);
  show('Start at opposite ends of the sorted array; use two distinct indices.', 2, 'start');
  while (left < right) {
    const sum = nums[left] + nums[right];
    show(`Read ${nums[left]} + ${nums[right]} = ${sum}; target is ${target}.`, 4);
    if (sum === target) { show(`Indices ${left} and ${right} form a matching pair.`, 5, 'done'); return finish([left, right]); }
    if (sum < target) { left++; show('The sum is too small. Discard the left endpoint: no smaller partner could help it.', 6, 'update'); }
    else { right--; show('The sum is too large. Discard the right endpoint: no larger partner could help it.', 7, 'update'); }
  }
  show('The pointers have met or crossed. No distinct pair matches.', 8, 'done');
  return finish(null);
}

export function slidingWindow(input) {
  const { nums, k } = input, { emit, finish } = trace(input);
  let sum = 0, best = null, left = 0, right = -1;
  const show = (message, line, phase = 'inspect', extra = {}) => emit(message, { nums, left, right, sum, best, ...extra }, line, phase);
  show(`Maintain a window of ${k} items and its running sum.`, 2, 'start');
  for (right = 0; right < nums.length; right++) {
    sum += nums[right];
    show(`Add entering value nums[${right}] = ${nums[right]}.`, 4, 'update', { entering: right });
    if (right >= k) {
      const leaving = left;
      sum -= nums[left++];
      show(`Remove leaving value nums[${leaving}] = ${nums[leaving]}; retain the overlapping items.`, 5, 'update', { leaving });
    }
    if (right >= k - 1) {
      best = best === null ? sum : Math.max(best, sum);
      show(`Complete window [${left}, ${right}] sums to ${sum}; best so far is ${best}.`, 6);
    }
  }
  right = nums.length - 1;
  show(`Return ${best}, the maximum sum among all fixed-size windows.`, 7, 'done');
  return finish(best);
}

export function insertionSort(input) {
  const { emit, finish } = trace(input), nums = [...input.nums];
  let sorted = Math.min(1, nums.length), index = -1, hole = -1, key = null;
  const show = (message, line, phase = 'inspect') => emit(message, { nums, sorted, index, hole, key }, line, phase);
  show('A prefix of length zero or one is already sorted.', 1, 'start');
  for (let i = 1; i < nums.length; i++) {
    key = nums[i]; hole = i; index = i - 1;
    show(`Hold ${key} outside the array and open a hole at index ${i}.`, 3);
    while (index >= 0 && nums[index] > key) {
      nums[index + 1] = nums[index]; hole = index; index--;
      show('Shift a larger value one place right. The held key is safe outside the array.', 5, 'update');
    }
    nums[hole] = key; sorted = i + 1; index = hole; hole = -1;
    show(`Insert ${key} at index ${index}; the sorted prefix now contains ${sorted} items.`, 7, 'update');
    hole = -1; key = null;
  }
  index = -1;
  show('Every value belongs to the sorted prefix. Return the array.', 8, 'done');
  return finish(nums);
}

export function nextGreater(input) {
  const { emit, finish } = trace(input), nums = input.nums, stack = [], output = Array(nums.length).fill(null);
  let index = -1, resolved = -1;
  const show = (message, line, phase = 'inspect') => emit(message, { nums, stack, output, index, resolved }, line, phase);
  show('Keep unresolved indices on a stack; null means no greater value has been found.', 2, 'start');
  for (index = 0; index < nums.length; index++) {
    resolved = -1;
    show(`Inspect ${nums[index]}. Resolve smaller values at the stack top.`, 4);
    while (stack.length && nums[stack.at(-1)] < nums[index]) {
      resolved = stack.pop(); output[resolved] = nums[index];
      show(`The first strictly greater value to the right of index ${resolved} is ${nums[index]}.`, 5, 'update');
    }
    stack.push(index); resolved = -1;
    show(`Push index ${index}. Equal values remain unresolved because greater means strictly greater.`, 6, 'update');
  }
  index = -1;
  show('Indices still on the stack have no greater value to their right.', 7, 'done');
  return finish(output);
}

export function euclideanGcd(input) {
  const { emit, finish } = trace(input);
  let a = input.a, b = input.b, remainder = null;
  const rows = [];
  const show = (message, line, phase = 'inspect') => emit(message, { a, b, remainder, rows }, line, phase);
  show('Common divisors are preserved when replacing (a, b) with (b, a mod b).', 1, 'start');
  while (b !== 0) {
    remainder = a % b; rows.push([a, b, Math.floor(a / b), remainder]);
    show(`${a} = ${Math.floor(a / b)} × ${b} + ${remainder}. Compute the remainder.`, 3);
    [a, b] = [b, remainder];
    show(`Continue with (${a}, ${b}); the gcd is unchanged.`, 4, 'update');
  }
  show(`The second value is zero. The greatest common divisor is ${a}.`, 5, 'done');
  return finish(a);
}
