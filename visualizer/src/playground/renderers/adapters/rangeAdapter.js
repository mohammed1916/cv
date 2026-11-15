// Adapter from scalar containers named low/high/mid (a binary search on the answer) to AnswerRangeBar.
// Pure function: returns the bar props plus the containers it did not consume.

const LOW_NAMES = ['low', 'lo', 'left']
const HIGH_NAMES = ['high', 'hi', 'right']
const MID_NAMES = ['mid', 'middle', 'candidate']
const MIN_NAMES = ['min', 'lower', 'domain_min', 'lo_bound']
const MAX_NAMES = ['max', 'upper', 'domain_max', 'hi_bound']

function numericScalar(container) {
  return container?.category === 'scalar' && typeof container.value === 'number' && Number.isFinite(container.value)
}

function findNamed(scalars, names) {
  for (const name of names) {
    const found = scalars.find((container) => String(container.name ?? container.bindingName ?? '').toLowerCase() === name)
    if (found) return found
  }
  return null
}

export function splitRangeGroup(containers) {
  const scalars = containers.filter(numericScalar)
  const low = findNamed(scalars, LOW_NAMES)
  const high = findNamed(scalars, HIGH_NAMES)
  if (!low || !high) return { rangeProps: null, rest: containers }

  const mid = findNamed(scalars, MID_NAMES)
  const minimum = findNamed(scalars, MIN_NAMES)
  const maximum = findNamed(scalars, MAX_NAMES)
  const props = {
    title: 'Answer search',
    min: minimum ? minimum.value : Math.min(low.value, high.value),
    max: maximum ? maximum.value : Math.max(low.value, high.value),
    low: low.value,
    high: high.value,
    probe: mid ? mid.value : null,
  }
  const consumed = new Set([low, high, mid, minimum, maximum].filter(Boolean))
  return { rangeProps: props, rest: containers.filter((container) => !consumed.has(container)) }
}
