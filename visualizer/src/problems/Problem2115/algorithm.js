// LeetCode 2115: Find All Possible Recipes from Given Supplies.
// Recipes depend on ingredients that may be recipes too, so process them like a topological order.
// Each recipe counts its unmet ingredients; supplies start the queue, and a recipe whose count reaches
// zero is made and feeds its own dependents.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object with recipes, ingredients and supplies.') }
  const { recipes, ingredients, supplies } = data ?? {}
  if (!Array.isArray(recipes) || recipes.length < 1 || recipes.length > 10) throw new Error('recipes must hold 1 to 10 names.')
  if (!Array.isArray(ingredients) || ingredients.length !== recipes.length) throw new Error('ingredients needs one list per recipe.')
  if (!Array.isArray(supplies) || supplies.length < 1 || supplies.length > 10) throw new Error('supplies must hold 1 to 10 names.')
  const names = new Set([...recipes, ...supplies, ...ingredients.flat()])
  if (names.size > 30) throw new Error('Keep the total number of distinct names at 30 or fewer.')
  ingredients.forEach(list => { if (!Array.isArray(list) || list.length < 1) throw new Error('Each recipe needs at least one ingredient.') })
  return { recipes, ingredients, supplies }
}

export const code = `function findAllRecipes(recipes, ingredients, supplies) {
  const need = new Map()
  const dependents = new Map()
  recipes.forEach((recipe, i) => {
    need.set(recipe, ingredients[i].length)
    for (const item of ingredients[i]) {
      if (!dependents.has(item)) dependents.set(item, [])
      dependents.get(item).push(recipe)
    }
  })
  const queue = [...supplies]
  const made = []
  while (queue.length) {
    const item = queue.shift()
    for (const recipe of dependents.get(item) ?? []) {
      need.set(recipe, need.get(recipe) - 1)
      if (need.get(recipe) === 0) {
        made.push(recipe)
        queue.push(recipe)
      }
    }
  }
  return made
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: find_all_recipes
from collections import deque

def find_all_recipes(recipes, ingredients, supplies):
    need = {}
    dependents = {}
    for i, recipe in enumerate(recipes):
        need[recipe] = len(ingredients[i])
        for item in ingredients[i]:
            dependents.setdefault(item, []).append(recipe)
    queue = deque(supplies)
    made = []
    while queue:
        item = queue.popleft()
        for recipe in dependents.get(item, []):
            need[recipe] -= 1
            if need[recipe] == 0:
                made.append(recipe)
                queue.append(recipe)
    return made
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'map', label: 'Prerequisite map', description: 'Each recipe lists the ingredients it still needs; each ingredient lists the recipes that use it.' },
  { id: 'pop', label: 'Process item', description: 'Take an item that is in stock and look at the recipes that need it.' },
  { id: 'unlock', label: 'Unlock recipe', description: 'A recipe with no unmet ingredients can be made, and becomes an item in stock.' },
  { id: 'done', label: 'Result', description: 'Every recipe that could be made.' },
]

export function buildTrace({ recipes, ingredients, supplies }) {
  const frames = []
  const need = new Map()
  const dependents = new Map()
  recipes.forEach((recipe, i) => {
    need.set(recipe, ingredients[i].length)
    for (const item of ingredients[i]) {
      if (!dependents.has(item)) dependents.set(item, [])
      dependents.get(item).push(recipe)
    }
  })
  const table = (status = {}) => recipes.map(recipe => ({ recipe, needs: ingredients[recipes.indexOf(recipe)].join(', '), left: need.get(recipe), status: status[recipe] ?? (need.get(recipe) === 0 ? 'made' : 'waiting') }))
  frames.push({ phase: 'map', activeLine: L('const need = new Map'), pythonLine: P('need = {}'), message: `Each recipe needs ${recipes.length} lists of ingredients. Supplies are in stock: ${supplies.join(', ')}.`, item: null, rows: table(), made: [] })
  const queue = [...supplies]
  const made = []
  while (queue.length) {
    const item = queue.shift()
    frames.push({ phase: 'pop', activeLine: L('const item = queue.shift()'), pythonLine: P('item = queue.popleft()'), message: `${item} is in stock; check the recipes that use it.`, item, rows: table(), made: [...made] })
    for (const recipe of dependents.get(item) ?? []) {
      need.set(recipe, need.get(recipe) - 1)
      if (need.get(recipe) === 0) {
        made.push(recipe)
        queue.push(recipe)
        frames.push({ phase: 'unlock', activeLine: L('made.push(recipe)'), pythonLine: P('made.append(recipe)'), message: `${recipe} has all its ingredients, so it can be made and joins the stock.`, item, rows: table({ [recipe]: 'made now' }), made: [...made] })
      } else {
        frames.push({ phase: 'pop', activeLine: L('need.set(recipe'), pythonLine: P('need[recipe] -= 1'), message: `${recipe} still waits for ${need.get(recipe)} more.`, item, rows: table(), made: [...made] })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return made'), pythonLine: P('return made'), message: made.length ? `Possible recipes: ${made.join(', ')}.` : 'No recipe can be made.', item: null, rows: table(), made: [...made] })
  return { input: { recipes, ingredients, supplies }, result: made, frames }
}
