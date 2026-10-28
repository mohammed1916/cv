const isSeries = (series, name) => {
  if (!Array.isArray(series) || series.length < 1 || series.length > 8) throw new Error(`${name} needs 1 to 8 entries for the visualization.`)
  series.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error(`${name}[${i}] must be [timestamp, value].`)
    const [t, v] = pair
    if (!Number.isInteger(t) || t < 1 || t > 1000000000) throw new Error(`${name}[${i}] timestamp must be an integer from 1 to 1000000000.`)
    if (!Number.isInteger(v) || v < 1 || v > 1000000000) throw new Error(`${name}[${i}] value must be an integer from 1 to 1000000000.`)
    if (i > 0 && t <= series[i - 1][0]) throw new Error(`${name} timestamps must be strictly increasing.`)
  })
}

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use an object with series1 and series2.')
  isSeries(obj.series1, 'series1')
  isSeries(obj.series2, 'series2')
  return { series1: obj.series1, series2: obj.series2 }
}

export function buildTrace(input) {
  const { series1, series2 } = input
  const stamps = [...new Set([...series1, ...series2].map(p => p[0]))].sort((a, b) => a - b)
  const frames = []
  const result = []
  let i = 0
  let j = 0
  for (const t of stamps) {
    while (i < series1.length && series1[i][0] < t) i++
    while (j < series2.length && series2[j][0] < t) j++
    const v1 = i < series1.length ? series1[i][1] : 0
    const v2 = j < series2.length ? series2[j][1] : 0
    result.push([t, v1 + v2])
    frames.push({ phase: 'stamp', activeLine: L('add the values'), t, v1, v2, result: result.map(r => r.slice()), message: `Timestamp ${t}: series 1 gives ${v1} and series 2 gives ${v2}, so the sum is ${v1 + v2}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), t: null, v1: null, v2: null, result, message: 'The aggregated series is complete.' })
  return { input, result, frames }
}

export const code = `aggregate two time series(series1, series2)
  set stamps to the sorted distinct timestamps from both series
  set i and j to 0 and set result to an empty list
  for each timestamp t in stamps do
    move i forward while series1 at i has a timestamp before t
    move j forward while series2 at j has a timestamp before t
    set v1 to the value at i, or 0 if i is past the end
    set v2 to the value at j, or 0 if j is past the end
    add the values v1 and v2 and append [t, sum] to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def aggregate_two_time_series(series1, series2):
    stamps = sorted({t for t, _ in series1} | {t for t, _ in series2})
    result = []
    i = 0
    j = 0
    for t in stamps:
        while i < len(series1) and series1[i][0] < t:
            i += 1
        while j < len(series2) and series2[j][0] < t:
            j += 1
        v1 = series1[i][1] if i < len(series1) else 0
        v2 = series2[j][1] if j < len(series2) else 0
        result.append([t, v1 + v2])
    return result
`
