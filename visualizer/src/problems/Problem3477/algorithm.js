export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.fruits) || !Array.isArray(input.baskets)) throw new Error('Use an object with "fruits" and "baskets" arrays.')
  const { fruits, baskets } = input
  if (fruits.length < 1 || fruits.length > 12) throw new Error('fruits holds 1 to 12 quantities.')
  if (baskets.length !== fruits.length) throw new Error('fruits and baskets must have the same length.')
  const values = [...fruits, ...baskets]
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Quantities and capacities are integers from 1 to 50.')
  return { fruits, baskets }
}

export function buildTrace(input) {
  const { fruits, baskets } = input
  const used = baskets.map(() => false)
  let unplaced = 0
  const frames = [{ phase: 'start', activeLine: L('set unplaced to zero'), fruit: -1, basket: -1, used: [...used], unplaced, message: 'Every basket starts unused and no fruit is unplaced yet.' }]
  fruits.forEach((quantity, fruit) => {
    let placed = false
    for (let basket = 0; basket < baskets.length && !placed; basket++) {
      if (used[basket] || baskets[basket] < quantity) {
        const reason = used[basket] ? 'is already used' : `holds ${baskets[basket]}, too small for ${quantity}`
        frames.push({ phase: 'scan', activeLine: L('if the basket is used'), fruit, basket, used: [...used], unplaced, message: `Basket ${basket} ${reason}, so skip it.` })
        continue
      }
      used[basket] = true
      placed = true
      frames.push({ phase: 'place', activeLine: L('place the fruit here'), fruit, basket, used: [...used], unplaced, message: `Fruit ${quantity} goes into basket ${basket}, which holds ${baskets[basket]}.` })
    }
    if (!placed) {
      unplaced++
      frames.push({ phase: 'unplaced', activeLine: L('add one to unplaced'), fruit, basket: -1, used: [...used], unplaced, message: `No basket fits fruit ${quantity}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return unplaced'), fruit: -1, basket: -1, used: [...used], unplaced, message: `${unplaced} fruit(s) could not be placed.` })
  return { input, result: unplaced, frames }
}

export const code = `count the fruits that cannot be placed into any basket
  set unplaced to zero
  mark every basket as unused
  for each fruit in order
    set placed to false
    for each basket from left to right
      if the basket is used or its capacity is below the fruit then skip it
      otherwise place the fruit here, mark the basket used, set placed to true and stop searching
    if placed is false then add one to unplaced
  return unplaced`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def unplaced_fruits(fruits, baskets):
    used = [False] * len(baskets)
    unplaced = 0
    for quantity in fruits:
        placed = False
        for index, capacity in enumerate(baskets):
            if used[index] or capacity < quantity:
                continue
            used[index] = True
            placed = True
            break
        if not placed:
            unplaced += 1
    return unplaced
`
