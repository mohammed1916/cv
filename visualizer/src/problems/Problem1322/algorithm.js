// Walkthrough of the query stages on invented sample rows. The sample tables are invented.
const SQL_TEXT = `WITH counts AS (
  SELECT ad_id,
         SUM(CASE WHEN action = 'Clicked' THEN 1 ELSE 0 END) AS clicked,
         SUM(CASE WHEN action = 'Viewed' THEN 1 ELSE 0 END) AS viewed
  FROM Ads
  GROUP BY ad_id
)
SELECT ad_id,
       ROUND(CASE WHEN clicked + viewed = 0 THEN 0
                  ELSE 100.0 * clicked / (clicked + viewed) END, 2) AS ctr
FROM counts
ORDER BY ctr DESC, ad_id ASC`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def ads_performance(ads):
    flags = ads.assign(clicked=(ads["action"] == "Clicked").astype(int),
                       viewed=(ads["action"] == "Viewed").astype(int))
    totals = flags.groupby("ad_id", as_index=False)[["clicked", "viewed"]].sum()
    denom = totals["clicked"] + totals["viewed"]
    totals["ctr"] = (100 * totals["clicked"] / denom).where(denom > 0, 0).round(2)
    return totals.sort_values(["ctr", "ad_id"], ascending=[False, True])[["ad_id", "ctr"]]
`

export const phases = [
  { id: 'load', label: 'Actions', description: 'Read every ad action.' },
  { id: 'group', label: 'Counts', description: 'Count clicks and views per ad.' },
  { id: 'ctr', label: 'Rate', description: 'Turn the counts into a percentage.' },
  { id: 'order', label: 'Order', description: 'Highest rate first, then smallest ad id.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Ads: [
    { ad_id: 1, user_id: 1, action: 'Clicked' },
    { ad_id: 1, user_id: 2, action: 'Viewed' },
    { ad_id: 1, user_id: 3, action: 'Viewed' },
    { ad_id: 2, user_id: 1, action: 'Clicked' },
    { ad_id: 2, user_id: 2, action: 'Clicked' },
    { ad_id: 2, user_id: 3, action: 'Viewed' },
    { ad_id: 3, user_id: 1, action: 'Ignored' },
    { ad_id: 4, user_id: 1, action: 'Clicked' },
    { ad_id: 4, user_id: 2, action: 'Viewed' },
    { ad_id: 5, user_id: 1, action: 'Viewed' },
  ],
}

export const examples = [{ label: 'Five ads', input: JSON.stringify(sample) },
    { label: "Single viewed ad", input: "{\"Ads\":[{\"ad_id\":1,\"user_id\":1,\"action\":\"Viewed\"}]}" },
    { label: "Zero clicks, ties by ad id", input: "{\"Ads\":[{\"ad_id\":3,\"user_id\":1,\"action\":\"Ignored\"},{\"ad_id\":2,\"user_id\":1,\"action\":\"Ignored\"}]}" },
    { label: "Twelve clicks on one ad", input: "{\"Ads\":[{\"ad_id\":9,\"user_id\":1,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":2,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":3,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":4,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":5,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":6,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":7,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":8,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":9,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":10,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":11,\"action\":\"Clicked\"},{\"ad_id\":9,\"user_id\":12,\"action\":\"Clicked\"}]}" },
    { label: "Long run: twelve random rows", input: "{\"Ads\":[{\"ad_id\":3,\"user_id\":1,\"action\":\"Clicked\"},{\"ad_id\":3,\"user_id\":2,\"action\":\"Clicked\"},{\"ad_id\":4,\"user_id\":3,\"action\":\"Viewed\"},{\"ad_id\":4,\"user_id\":4,\"action\":\"Viewed\"},{\"ad_id\":3,\"user_id\":5,\"action\":\"Ignored\"},{\"ad_id\":3,\"user_id\":6,\"action\":\"Viewed\"},{\"ad_id\":3,\"user_id\":7,\"action\":\"Ignored\"},{\"ad_id\":4,\"user_id\":8,\"action\":\"Ignored\"},{\"ad_id\":1,\"user_id\":9,\"action\":\"Viewed\"},{\"ad_id\":2,\"user_id\":10,\"action\":\"Viewed\"},{\"ad_id\":3,\"user_id\":11,\"action\":\"Viewed\"},{\"ad_id\":2,\"user_id\":12,\"action\":\"Clicked\"}]}" }]
export const inputLabel = 'Object with an Ads list (action is Clicked, Viewed or Ignored)'
export const complexity = 'O(r log a) for r action rows and a ads, dominated by the final sort. The visualization caps the table at 12 rows.'
export const reasoning = [
  'Each ad gets two counters: clicks and views. Ignored rows match neither counter, so they never reach the denominator.',
  'An ad with no clicks and no views would divide by zero, so its rate is defined as zero.',
  'The final order puts the best rate first and breaks ties with the smaller ad id.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

const ACTION_COLUMNS = ['ad_id', 'user_id', 'action']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Ads)) throw new Error('Use an object with an Ads list.')
  if (input.Ads.length > 12) throw new Error('Keep Ads to 12 rows.')
  for (const row of input.Ads) {
    if (!Number.isInteger(row.ad_id) || !['Clicked', 'Viewed', 'Ignored'].includes(row.action)) throw new Error('Each row needs an integer ad_id and an action of Clicked, Viewed or Ignored.')
  }
  return { Ads: input.Ads }
}

export function buildTrace({ Ads }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Ads', 'def ads_performance', `Read ${Ads.length} action rows.`, 'Ads', ACTION_COLUMNS, Ads)
  const ids = [...new Set(Ads.map(row => row.ad_id))].sort((a, b) => a - b)
  const counts = ids.map(ad_id => ({
    ad_id,
    clicked: Ads.filter(row => row.ad_id === ad_id && row.action === 'Clicked').length,
    viewed: Ads.filter(row => row.ad_id === ad_id && row.action === 'Viewed').length,
  }))
  push('group', 'GROUP BY ad_id', 'groupby("ad_id"', `Count clicks and views for ${ids.length} ads.`, 'counts', ['ad_id', 'clicked', 'viewed'], counts)
  const rated = counts.map(row => {
    const total = row.clicked + row.viewed
    const ctr = total === 0 ? 0 : Number((100 * row.clicked / total).toFixed(2))
    return { ...row, ctr }
  })
  push('ctr', 'ROUND(CASE', 'totals["ctr"] =', 'Divide clicks by clicks plus views, using zero when both are missing.', 'rated', ['ad_id', 'clicked', 'viewed', 'ctr'], rated)
  const ordered = [...rated].sort((a, b) => b.ctr - a.ctr || a.ad_id - b.ad_id)
  push('order', 'ORDER BY ctr', 'sort_values', 'Sort by rate descending, then ad id ascending.', 'ordered', ['ad_id', 'clicked', 'viewed', 'ctr'], ordered)
  const result = ordered.map(({ ad_id, ctr }) => ({ ad_id, ctr }))
  push('done', 'ORDER BY ctr', 'return totals', `Return ${result.length} rows.`, 'Result', ['ad_id', 'ctr'], result)
  return { input: { Ads }, result, frames }
}
