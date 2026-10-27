export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with mainTank and additionalTank.')
  const { mainTank, additionalTank } = data
  if (!Number.isInteger(mainTank) || mainTank < 1 || mainTank > 100) throw new Error('mainTank is an integer from 1 to 100.')
  if (!Number.isInteger(additionalTank) || additionalTank < 0 || additionalTank > 100) throw new Error('additionalTank is an integer from 0 to 100.')
  return { mainTank, additionalTank }
}

export function buildTrace(input) {
  let main = input.mainTank
  let extra = input.additionalTank
  let distance = 0
  const frames = [{ phase: 'start', activeLine: L('set distance to 0'), main, extra, distance, message: `Start with ${main} liters in the main tank and ${extra} in the auxiliary tank.` }]
  while (main >= 5) {
    main -= 5
    distance += 50
    const moved = extra > 0
    if (moved) {
      extra -= 1
      main += 1
    }
    frames.push({ phase: 'burn', activeLine: L(moved ? 'if the auxiliary tank' : 'while the main tank'), main, extra, distance,
      message: `Burn 5 liters for 50 km. ${moved ? 'One liter moves from the auxiliary tank into the main tank.' : 'The auxiliary tank is empty, so nothing moves.'}` })
  }
  distance += 10 * main
  frames.push({ phase: 'done', activeLine: L('return distance'), main: 0, extra, distance, message: `The last ${main} liters add ${10 * main} km. Total ${distance} km.` })
  return { input, result: distance, frames }
}

export const code = `total distance traveled
  set distance to 0
  while the main tank holds at least 5 liters
    use 5 liters from the main tank and add 50 to distance
    if the auxiliary tank is not empty then move 1 liter into the main tank
  add 10 times the remaining liters in the main tank to distance
  return distance`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_distance(mainTank, additionalTank):
    distance = 0
    while mainTank >= 5:
        mainTank -= 5
        distance += 50
        if additionalTank > 0:
            additionalTank -= 1
            mainTank += 1
    return distance + 10 * mainTank
`
