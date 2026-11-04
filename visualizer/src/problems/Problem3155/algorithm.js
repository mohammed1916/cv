// LeetCode 3155: each data center has servers, starting money, a sale price
// per server and an upgrade cost per server. Selling a server adds its price to the money,
// upgrading costs one unit each, and a sold server cannot be upgraded. For a center with n
// servers, k upgrades are affordable when money + sell × (n - k) ≥ cost × k. Test k from n
// downward and stop at the first affordable value.

const MAX_CENTERS = 6
const MAX_SERVERS = 20
const MAX_VALUE = 200

const CODE_TEXT = `function upgradableForCenters(centers) {
  const results = []
  for (const [servers, money, sell, cost] of centers) {
    let result = 0
    for (let k = servers; k >= 0; k--) {
      const sold = servers - k
      const funds = money + sell * sold
      if (funds >= cost * k) {
        result = k
        break
      }
    }
    results.push(result)
  }
  return results
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_upgradable_servers(centers):
    results = []
    for servers, money, sell, cost in centers:
        best = 0
        for k in range(servers, -1, -1):
            sold = servers - k
            funds = money + sell * sold
            if funds >= cost * k:
                best = k
                break
        results.append(best)
    return results
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const centers = JSON.parse(text)
  if (!Array.isArray(centers) || centers.length < 1 || centers.length > MAX_CENTERS) throw new Error(`Use a list of 1 to ${MAX_CENTERS} centers.`)
  for (const row of centers) {
    if (!Array.isArray(row) || row.length !== 4) throw new Error('Each center is [servers, money, sell, cost].')
    const [servers, money, sell, cost] = row
    if (!Number.isInteger(servers) || servers < 0 || servers > MAX_SERVERS) throw new Error(`servers is an integer from 0 to ${MAX_SERVERS}.`)
    for (const value of [money, sell, cost]) {
      if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`money, sell and cost are integers from 0 to ${MAX_VALUE}.`)
    }
  }
  return centers
}

export function buildTrace(centers) {
  const frames = []
  const results = []
  frames.push({ phase: 'start', pythonLine: PY('results = []'), activeLine: L('const results = []'), centers, center: -1, servers: 0, money: 0, sell: 0, cost: 0, k: -1, sold: 0, funds: 0, results: [], message: `Read ${centers.length} independent center${centers.length === 1 ? '' : 's'}.` })
  centers.forEach(([servers, money, sell, cost], c) => {
    let found = 0
    frames.push({ phase: 'center', pythonLine: PY('for servers, money, sell, cost in centers'), activeLine: L('for (const [servers'), centers, center: c, servers, money, sell, cost, k: -1, sold: 0, funds: money, results: results.slice(), message: `Center ${c + 1}: ${servers} servers, money ${money}, sell ${sell}, upgrade ${cost}.` })
    let settled = false
    for (let k = servers; k >= 0 && !settled; k--) {
      const sold = servers - k
      const funds = money + sell * sold
      const ok = funds >= cost * k
      frames.push({ phase: ok ? 'found' : 'check', pythonLine: PY('if funds >= cost * k'), activeLine: L('if (funds >= cost * k)'), centers, center: c, servers, money, sell, cost, k, sold, funds, feasible: ok, results: results.slice(), message: ok ? `Upgrade ${k}, sell ${sold}: funds ${funds} cover ${cost * k}.` : `Upgrade ${k}, sell ${sold}: funds ${funds} fall short of ${cost * k}.` })
      if (ok) {
        found = k
        settled = true
      }
    }
    results.push(found)
    frames.push({ phase: 'store', pythonLine: PY('results.append(best)'), activeLine: L('results.push(result)'), centers, center: c, servers, money, sell, cost, k: found, sold: servers - found, funds: money + sell * (servers - found), results: results.slice(), message: `Center ${c + 1} can upgrade ${found} server${found === 1 ? '' : 's'}.` })
  })
  frames.push({ phase: 'done', pythonLine: PY('return results'), activeLine: L('return results'), centers, center: -1, servers: 0, money: 0, sell: 0, cost: 0, k: -1, sold: 0, funds: 0, results: results.slice(), message: `Upgrade counts: [${results.join(', ')}].` })
  return { input: centers, result: results, frames }
}
