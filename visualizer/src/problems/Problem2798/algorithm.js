const JS = [
  'function numberOfEmployeesWhoMetTarget(hours, target) {',
  '  let count = 0',
  '  for (const worked of hours) {',
  '    if (worked >= target) {',
  '      count += 1',
  '    }',
  '  }',
  '  return count',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `def numberOfEmployeesWhoMetTarget(hours, target):
    count = 0
    for worked in hours:
        if worked >= target:
            count += 1
    return count`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.hours) || !Number.isInteger(data.target)) throw new Error('Use an object with an hours array and an integer target, for example {"hours":[0,1,2,3,4],"target":2}.')
  if (data.hours.length < 1 || data.hours.length > 50) throw new Error('hours must have 1 to 50 values.')
  if (data.hours.some(v => !Number.isInteger(v) || v < 0 || v > 100000)) throw new Error('hours values must be integers from 0 to 100000.')
  if (data.target < 0 || data.target > 100000) throw new Error('target must be an integer from 0 to 100000.')
  return { hours: [...data.hours], target: data.target }
}

export function buildTrace({ hours, target }) {
  const frames = []
  let count = 0
  frames.push({ phase: 'setup', activeLine: L('let count'), pythonLine: P('count = 0'), index: -1, count, target, met: null, message: 'Start the count at 0.' })
  for (let i = 0; i < hours.length; i++) {
    frames.push({ phase: 'scan', activeLine: L('for (const worked'), pythonLine: P('for worked in hours'), index: i, count, target, met: null, message: `Read employee ${i} with ${hours[i]} hours.` })
    const met = hours[i] >= target
    frames.push({ phase: 'check', activeLine: L('if (worked'), pythonLine: P('if worked >= target'), index: i, count, target, met, message: met ? `${hours[i]} meets the target ${target}.` : `${hours[i]} is below the target ${target}.` })
    if (met) {
      count += 1
      frames.push({ phase: 'count', activeLine: L('count += 1'), pythonLine: P('count += 1'), index: i, count, target, met, message: `Count is now ${count}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), index: -1, count, target, met: null, result: count, message: `Return ${count}.` })
  return { input: { hours, target }, result: count, frames }
}
