export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with batteryPercentages.')
  const { batteryPercentages } = data
  if (!Array.isArray(batteryPercentages) || batteryPercentages.length < 1 || batteryPercentages.length > 30) throw new Error('batteryPercentages holds 1 to 30 values.')
  if (batteryPercentages.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Each battery percentage is an integer from 0 to 100.')
  return { batteryPercentages }
}

export function buildTrace(input) {
  const battery = input.batteryPercentages
  // Testing device i lowers every later device by one; so device i is still positive when battery[i] minus the tests so far is above zero.
  let tested = 0
  const testedIdx = []
  const frames = [{ phase: 'start', activeLine: L('set tested to 0'), index: -1, levels: [...battery], testedIdx: [], tested, message: 'No devices have been tested yet.' }]
  battery.forEach((value, i) => {
    const current = value - tested
    const live = current > 0
    if (live) {
      tested += 1
      testedIdx.push(i)
    }
    frames.push({ phase: live ? 'test' : 'skip', activeLine: L('if battery of device i'), index: i,
      levels: battery.map((v, j) => (j <= i ? v : Math.max(0, v - tested))), testedIdx: [...testedIdx], tested,
      message: live ? `Device ${i} still has ${current}% after earlier tests, so it is tested. Tested so far: ${tested}.`
        : `Device ${i} is at ${Math.max(0, current)}% and is skipped.` })
  })
  frames.push({ phase: 'done', activeLine: L('return tested'), index: -1, levels: battery.map((v, j) => (testedIdx.includes(j) ? v : Math.max(0, v - tested))), testedIdx: [...testedIdx], tested, message: `Devices tested: ${tested}.` })
  return { input, result: tested, frames }
}

export const code = `count the devices that get tested
  set tested to 0
  for each device i from left to right
    if battery of device i minus tested is greater than 0
      add 1 to tested
  return tested`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_tested(batteryPercentages):
    tested = 0
    for battery in batteryPercentages:
        if battery - tested > 0:
            tested += 1
    return tested
`
