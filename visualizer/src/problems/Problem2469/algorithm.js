const CODE = [
  'function convertTemperature(celsius) {',
  '  const kelvin = celsius + 273.15',
  '  const fahrenheit = celsius * 1.8 + 32',
  '  return [kelvin, fahrenheit]',
  '}',
]

const PY = [
  'def convert_temperature(celsius):',
  '    kelvin = celsius + 273.15',
  '    fahrenheit = celsius * 1.80 + 32.00',
  '    return [kelvin, fahrenheit]',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'kelvin', label: 'Kelvin', description: 'Shift the scale by 273.15.' },
  { id: 'fahrenheit', label: 'Fahrenheit', description: 'Scale by 1.80 and add 32.' },
  { id: 'done', label: 'Result', description: 'Return both values.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with celsius.')
  const { celsius } = input
  if (typeof celsius !== 'number' || !Number.isFinite(celsius) || celsius < 0 || celsius > 1000) throw new Error('celsius is a number from 0 to 1000.')
  return { celsius }
}

export function buildTrace({ celsius }) {
  const frames = []
  frames.push({ pythonLine: pyLine('kelvin = celsius + 273.15'), phase: 'kelvin', activeLine: codeLine('const kelvin = celsius + 273.15'), celsius, kelvin: null, fahrenheit: null, message: `Add 273.15 to ${celsius}.` })
  const kelvin = celsius + 273.15
  frames.push({ pythonLine: pyLine('kelvin = celsius + 273.15'), phase: 'kelvin', activeLine: codeLine('const kelvin = celsius + 273.15'), celsius, kelvin, fahrenheit: null, message: `Kelvin is ${kelvin.toFixed(5)}.` })
  frames.push({ pythonLine: pyLine('fahrenheit = celsius'), phase: 'fahrenheit', activeLine: codeLine('const fahrenheit = celsius * 1.8 + 32'), celsius, kelvin, fahrenheit: null, message: `Multiply ${celsius} by 1.80 and add 32.` })
  const fahrenheit = celsius * 1.8 + 32
  frames.push({ pythonLine: pyLine('fahrenheit = celsius'), phase: 'fahrenheit', activeLine: codeLine('const fahrenheit = celsius * 1.8 + 32'), celsius, kelvin, fahrenheit, message: `Fahrenheit is ${fahrenheit.toFixed(5)}.` })
  frames.push({ pythonLine: pyLine('return [kelvin'), phase: 'done', activeLine: codeLine('return [kelvin, fahrenheit]'), celsius, kelvin, fahrenheit, message: 'Return both conversions.' })
  return { input: { celsius }, result: [kelvin, fahrenheit], frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
