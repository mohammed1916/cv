const pad = v => String(v).padStart(2, '0')
const fits = (value, pattern) => [...pattern].every((p, i) => p === '?' || p === value[i])

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with time.')
  const { time } = input
  if (typeof time !== 'string' || !/^[0-9?]{2}:[0-9?]{2}$/.test(time)) throw new Error('time must look like "1?:?4", with digits or ? in each place.')
  return { time }
}

export function buildTrace({ time }) {
  const hourPattern = time.slice(0, 2)
  const minutePattern = time.slice(3)
  const frames = [{ phase: 'start', activeLine: L('split the pattern'), hours: [], minutes: [], message: `Split ${time} into hours ${hourPattern} and minutes ${minutePattern}.` }]
  const hours = []
  for (let h = 0; h < 24; h++) if (fits(pad(h), hourPattern)) hours.push(h)
  frames.push({ phase: 'hours', activeLine: L('count the hours'), hours: hours.slice(), minutes: [], message: `${hours.length} hours from 00 to 23 fit ${hourPattern}.` })
  const minutes = []
  for (let m = 0; m < 60; m++) if (fits(pad(m), minutePattern)) minutes.push(m)
  frames.push({ phase: 'minutes', activeLine: L('count the minutes'), hours: hours.slice(), minutes: minutes.slice(), message: `${minutes.length} minutes from 00 to 59 fit ${minutePattern}.` })
  const result = hours.length * minutes.length
  frames.push({ phase: 'done', activeLine: L('return the product'), hours: hours.slice(), minutes: minutes.slice(), message: `${hours.length} x ${minutes.length} = ${result} valid times.` })
  return { input: { time }, result, hours, frames }
}

export const code = `count the valid clock times that match a pattern with ? wildcards
read the pattern from the input
split the pattern into the hour part and the minute part
count the hours from 00 to 23 that fit the hour part
count the minutes from 00 to 59 that fit the minute part
return the product of the two counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_valid_times(time):
    def fits(value, pattern):
        return all(p == "?" or p == v for p, v in zip(pattern, value))

    hours = sum(1 for h in range(24) if fits("%02d" % h, time[:2]))
    minutes = sum(1 for m in range(60) if fits("%02d" % m, time[3:]))
    return hours * minutes
`
