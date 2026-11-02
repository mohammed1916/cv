export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with celsius.')
  const { celsius } = input
  if (typeof celsius !== 'number' || !Number.isFinite(celsius) || celsius < 0 || celsius > 1000) throw new Error('celsius is a number from 0 to 1000.')
  return { celsius }
}

export function buildTrace({ celsius }) {
  const frames = []
  frames.push({ pythonLine: PL('kelvin = '), phase: 'kelvin', activeLine: CL('kelvin <-'), kelvin: null, fahrenheit: null, message: `Add 273.15 to ${celsius}.` })
  const kelvin = celsius + 273.15
  frames.push({ pythonLine: PL('kelvin = '), phase: 'kelvin', activeLine: CL('kelvin <-'), kelvin, fahrenheit: null, message: `Kelvin is ${kelvin.toFixed(5)}.` })
  frames.push({ pythonLine: PL('fahrenheit = '), phase: 'fahrenheit', activeLine: CL('fahrenheit <-'), kelvin, fahrenheit: null, message: `Multiply ${celsius} by 1.80 and add 32.` })
  const fahrenheit = celsius * 1.8 + 32
  frames.push({ pythonLine: PL('fahrenheit = '), phase: 'fahrenheit', activeLine: CL('fahrenheit <-'), kelvin, fahrenheit, message: `Fahrenheit is ${fahrenheit.toFixed(5)}.` })
  frames.push({ pythonLine: PL('return [kelvin'), phase: 'done', activeLine: CL('RETURN'), kelvin, fahrenheit, message: 'Return both conversions.' })
  return { input: { celsius }, result: [kelvin, fahrenheit], frames }
}

export const code = `FUNCTION convertTemperature(celsius)
  kelvin <- celsius plus 273.15
  fahrenheit <- celsius times 1.80 plus 32
  RETURN [kelvin, fahrenheit]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def convert_temperature(celsius):
    kelvin = celsius + 273.15
    fahrenheit = celsius * 1.80 + 32.00
    return [kelvin, fahrenheit]
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
