export const code = [
  { line: 1, text: "count = 0" },
  { line: 2, text: "for each worked in hours" },
  { line: 3, text: "if worked is at least target" },
  { line: 4, text: "count += 1" },
  { line: 5, text: "return count" },
]

export const python = `def numberOfEmployeesWhoMetTarget(hours, target):
    count = 0
    for worked in hours:
        if worked >= target:
            count += 1
    return count`

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
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, index: -1, count, target, met: null, message: 'Start the count at 0.' })
  for (let i = 0; i < hours.length; i++) {
    frames.push({ phase: 'scan', activeLine: 2, pythonLine: 3, index: i, count, target, met: null, message: `Read employee ${i} with ${hours[i]} hours.` })
    const met = hours[i] >= target
    frames.push({ phase: 'check', activeLine: 3, pythonLine: 4, index: i, count, target, met, message: met ? `${hours[i]} meets the target ${target}.` : `${hours[i]} is below the target ${target}.` })
    if (met) {
      count += 1
      frames.push({ phase: 'count', activeLine: 4, pythonLine: 5, index: i, count, target, met, message: `Count is now ${count}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: 5, pythonLine: 6, index: -1, count, target, met: null, result: count, message: `Return ${count}.` })
  return { input: { hours, target }, result: count, frames }
}
