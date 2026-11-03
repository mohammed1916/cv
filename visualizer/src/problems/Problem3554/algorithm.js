// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH user_categories AS (
  SELECT DISTINCT pp.user_id, pi.category
  FROM product_purchases pp
  JOIN product_info pi ON pi.product_id = pp.product_id
), category_pairs AS (
  SELECT a.category AS category1, b.category AS category2,
    COUNT(DISTINCT a.user_id) AS shared_users
  FROM user_categories a
  JOIN user_categories b ON b.user_id = a.user_id AND b.category > a.category
  GROUP BY a.category, b.category
)
SELECT category1, category2, shared_users
FROM category_pairs
WHERE shared_users >= 2
ORDER BY shared_users DESC, category1, category2;`

const PYTHON = `def category_pairs(product_purchases, product_info):
    merged = product_purchases.merge(product_info, on='product_id')
    user_cats = merged[['user_id', 'category']].drop_duplicates()
    pairs = []
    for c1, c2 in combinations(sorted(user_cats.category.unique()), 2):
        users1 = set(user_cats[user_cats.category == c1].user_id)
        users2 = set(user_cats[user_cats.category == c2].user_id)
        shared = len(users1 & users2)
        if shared >= 2:
            pairs.append((c1, c2, shared))
    out = pd.DataFrame(pairs, columns=['category1', 'category2', 'shared_users'])
    return out.sort_values(['shared_users', 'category1', 'category2'], ascending=[False, True, True])`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON
const pyLines = PYTHON.split('\n')

function at(text) {
  const found = code.find(line => line.text.includes(text))
  if (!found) throw new Error(`Missing SQL line: ${text}`)
  return found.line
}

function pyAt(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.product_info) || !Array.isArray(input.product_purchases)) {
    throw new Error('Use an object with product_info and product_purchases lists.')
  }
  if (input.product_info.length > 10 || input.product_purchases.length > 20) throw new Error('Use at most 10 products and 20 purchases.')
  const known = new Set()
  for (const row of input.product_info) {
    if (!Number.isInteger(row.product_id) || typeof row.category !== 'string' || row.category === '') {
      throw new Error('Each product needs an integer product_id and a non-empty category.')
    }
    known.add(row.product_id)
  }
  for (const row of input.product_purchases) {
    if (!Number.isInteger(row.user_id) || !Number.isInteger(row.product_id) || !known.has(row.product_id)) {
      throw new Error('Each purchase needs an integer user_id and a product_id that appears in product_info.')
    }
  }
  return {
    product_info: input.product_info.map(row => ({ ...row })),
    product_purchases: input.product_purchases.map(row => ({ ...row })),
  }
}

export function buildTrace(input) {
  const { product_info: info, product_purchases: purchases } = input
  const category = Object.fromEntries(info.map(row => [row.product_id, row.category]))
  const frames = []
  const step = (phase, sqlKey, pyKey, message, rows, result = []) => frames.push({
    phase, activeLine: at(sqlKey), pythonLine: pyAt(pyKey), message,
    rows: rows.map(row => ({ ...row })), result: result.map(row => ({ ...row })),
  })

  step('load', 'FROM product_purchases pp', 'def category_pairs', `Load ${purchases.length} purchase rows and ${info.length} products.`, purchases)

  const merged = purchases.map(row => ({ user_id: row.user_id, product_id: row.product_id, category: category[row.product_id] }))
  step('join', 'JOIN product_info pi', 'merged = ', 'Attach each purchase its product category.', merged)

  const userCats = []
  const seen = new Set()
  for (const row of merged) {
    const key = `${row.user_id}:${row.category}`
    if (!seen.has(key)) { seen.add(key); userCats.push({ user_id: row.user_id, category: row.category }) }
  }
  userCats.sort((a, b) => a.user_id - b.user_id || (a.category < b.category ? -1 : a.category > b.category ? 1 : 0))
  const users = [...new Set(userCats.map(row => row.user_id))]
  for (const userId of users) {
    const own = userCats.filter(row => row.user_id === userId)
    step('user', 'user_categories AS', 'user_cats = ',
      `User ${userId} bought from ${own.map(row => row.category).join(' and ')}.`, own)
  }

  const categories = [...new Set(userCats.map(row => row.category))].sort()
  const result = []
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const c1 = categories[i]
      const c2 = categories[j]
      const sharedUsers = users.filter(userId => userCats.some(row => row.user_id === userId && row.category === c1)
        && userCats.some(row => row.user_id === userId && row.category === c2))
      const pairRows = userCats.filter(row => row.category === c1 || row.category === c2)
      const keep = sharedUsers.length >= 2
      if (keep) result.push({ category1: c1, category2: c2, shared_users: sharedUsers.length })
      step('pair', 'COUNT(DISTINCT a.user_id)', 'shared = ',
        `${c1} and ${c2} share ${sharedUsers.length} user${sharedUsers.length === 1 ? '' : 's'}${keep ? ', so the pair is kept.' : ', below the threshold of 2.'}`,
        pairRows, result)
    }
  }

  result.sort((x, y) => y.shared_users - x.shared_users || (x.category1 < y.category1 ? -1 : x.category1 > y.category1 ? 1 : x.category2 < y.category2 ? -1 : x.category2 > y.category2 ? 1 : 0))
  step('output', 'ORDER BY shared_users DESC', 'return out.sort_values', `Return ${result.length} recommended category pairs.`, userCats, result)
  return { input: { product_info: info, product_purchases: purchases }, result, frames }
}
