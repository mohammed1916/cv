// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH bought AS (
  SELECT DISTINCT pp.user_id, pp.product_id, pi.category
  FROM product_purchases pp
  JOIN product_info pi ON pi.product_id = pp.product_id
  WHERE pp.quantity > 0
), pairs AS (
  SELECT a.product_id AS product1_id, b.product_id AS product2_id,
    COUNT(DISTINCT a.user_id) AS customer_count
  FROM bought a
  JOIN bought b ON b.user_id = a.user_id AND b.product_id > a.product_id
  WHERE a.category = b.category
  GROUP BY a.product_id, b.product_id
)
SELECT product1_id, product2_id, customer_count
FROM pairs
WHERE customer_count >= 2
ORDER BY customer_count DESC, product1_id, product2_id;`

const PYTHON = `def product_pairs(product_purchases, product_info):
    kept = product_purchases[product_purchases.quantity > 0]
    bought = kept.merge(product_info, on='product_id')[['user_id', 'product_id', 'category']].drop_duplicates()
    cat = product_info.set_index('product_id').category
    pairs = []
    for a, b in combinations(sorted(bought.product_id.unique()), 2):
        if cat[a] != cat[b]:
            continue
        common = set(bought[bought.product_id == a].user_id) & set(bought[bought.product_id == b].user_id)
        if len(common) >= 2:
            pairs.append((a, b, len(common)))
    out = pd.DataFrame(pairs, columns=['product1_id', 'product2_id', 'customer_count'])
    return out.sort_values(['customer_count', 'product1_id', 'product2_id'], ascending=[False, True, True])`

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
  for (const row of input.product_info) {
    if (!Number.isInteger(row.product_id) || typeof row.category !== 'string' || !Number.isInteger(row.price)) {
      throw new Error('Each product needs an integer product_id, a category text and an integer price.')
    }
  }
  for (const row of input.product_purchases) {
    if (!Number.isInteger(row.user_id) || !Number.isInteger(row.product_id) || !Number.isInteger(row.quantity) || row.quantity < 0) {
      throw new Error('Each purchase needs integer user_id, product_id and a quantity of 0 or more.')
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

  step('load', 'FROM product_purchases pp', 'def product_pairs', `Load ${purchases.length} purchase rows and ${info.length} products.`, purchases)

  const kept = purchases.filter(row => row.quantity > 0)
  step('filter', 'WHERE pp.quantity > 0', 'kept = ', `Drop the zero-quantity rows; ${kept.length} rows remain.`, kept)

  const bought = []
  const seen = new Set()
  for (const row of kept) {
    const key = `${row.user_id}:${row.product_id}`
    if (seen.has(key)) continue
    seen.add(key)
    bought.push({ user_id: row.user_id, product_id: row.product_id, category: category[row.product_id] })
  }
  bought.sort((a, b) => a.product_id - b.product_id || a.user_id - b.user_id)
  const productIds = [...new Set(bought.map(row => row.product_id))].sort((a, b) => a - b)

  for (const productId of productIds) {
    const own = bought.filter(row => row.product_id === productId)
    step('group', 'bought AS', 'bought = ',
      `Product ${productId} (${category[productId]}) was bought by users ${own.map(row => row.user_id).join(', ')}.`, own)
  }

  const result = []
  for (let i = 0; i < productIds.length; i++) {
    for (let j = i + 1; j < productIds.length; j++) {
      const a = productIds[i]
      const b = productIds[j]
      const pairRows = bought.filter(row => row.product_id === a || row.product_id === b)
      if (category[a] !== category[b]) {
        step('pair', 'WHERE a.category = b.category', 'if cat[a]',
          `Products ${a} and ${b} are in different categories, so the pair is skipped.`, pairRows, result)
        continue
      }
      const usersA = new Set(bought.filter(row => row.product_id === a).map(row => row.user_id))
      const common = [...usersA].filter(user => bought.some(row => row.product_id === b && row.user_id === user))
      const kept2 = common.length >= 2
      if (kept2) result.push({ product1_id: a, product2_id: b, customer_count: common.length })
      step('pair', 'COUNT(DISTINCT a.user_id)', 'common = ',
        `Products ${a} and ${b} share ${common.length} user${common.length === 1 ? '' : 's'}${kept2 ? ', so the pair is kept.' : ', below the threshold of 2.'}`,
        pairRows, result)
    }
  }

  result.sort((x, y) => y.customer_count - x.customer_count || x.product1_id - y.product1_id || x.product2_id - y.product2_id)
  step('output', 'ORDER BY customer_count DESC', 'return out.sort_values', `Return ${result.length} recommended pairs.`, bought, result)
  return { input: { product_info: info, product_purchases: purchases }, result, frames }
}
