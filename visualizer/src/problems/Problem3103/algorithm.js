// Teaching SQL walkthrough. The sample tweets, date range and tie rule are invented for this visualization.
export const sql = `SELECT hashtag, COUNT(*) AS hashtag_count
FROM TweetTags
WHERE tweet_date >= '2024-02-01' AND tweet_date < '2024-03-01'
GROUP BY hashtag
ORDER BY hashtag_count DESC, hashtag DESC
LIMIT 3`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def trending(tweets):
    tags = tweets["tweet"].apply(lambda t: sorted(set(re.findall(r"#\\w+", t))))
    tagged = tweets.assign(tags=tags).explode("tags").dropna(subset=["tags"])
    window = tagged[(tagged["tweet_date"] >= "2024-02-01") & (tagged["tweet_date"] < "2024-03-01")]
    counts = window.groupby("tags").size()
    by_name = sorted(counts.items(), key=lambda kv: kv[0], reverse=True)
    ranked = sorted(by_name, key=lambda kv: -kv[1])
    return ranked[:3]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the tweets.' },
  { id: 'extract', label: 'Extract', description: 'List the distinct hashtags in each tweet.' },
  { id: 'filter', label: 'Filter', description: 'Keep tag rows inside the date range.' },
  { id: 'count', label: 'Count', description: 'Count each hashtag once per tweet.' },
  { id: 'done', label: 'Result', description: 'Output the three highest counts.' },
]

const COLUMNS = ['tweet_id', 'tweet_date', 'tweet']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Tweets table.')
  const rows = input.Tweets
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Tweets needs 1 to 12 rows.')
  return {
    Tweets: rows.map(row => {
      if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) throw new Error(`Tweets rows need ${COLUMNS.join(', ')}.`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.tweet_date)) throw new Error('tweet_date must look like 2024-02-03.')
      return Object.fromEntries(COLUMNS.map(column => [column, row[column]]))
    }),
  }
}

export function buildTrace(input) {
  const { Tweets } = input
  const frames = []
  frames.push(frame('load', 'SELECT hashtag', 'def ', `Read ${Tweets.length} tweets.`, COLUMNS, Tweets))

  const tagRows = []
  const listed = []
  for (const row of Tweets) {
    const tags = [...new Set(row.tweet.match(/#\w+/g) ?? [])]
    listed.push({ tweet_id: row.tweet_id, tweet_date: row.tweet_date, hashtags: tags.join(', ') })
    for (const hashtag of tags) tagRows.push({ tweet_id: row.tweet_id, tweet_date: row.tweet_date, hashtag })
    frames.push(frame('extract', 'FROM TweetTags', 'tags =', `Tweet ${row.tweet_id} has ${tags.length} distinct hashtag${tags.length === 1 ? '' : 's'}.`, ['tweet_id', 'tweet_date', 'hashtags'], listed))
  }

  const kept = tagRows.filter(row => row.tweet_date >= '2024-02-01' && row.tweet_date < '2024-03-01')
  frames.push(frame('filter', 'WHERE', 'window =', `Keep ${kept.length} tag row${kept.length === 1 ? '' : 's'} dated in February 2024.`, ['tweet_id', 'tweet_date', 'hashtag'], kept))

  const counts = new Map()
  const summary = []
  for (const row of kept) {
    counts.set(row.hashtag, (counts.get(row.hashtag) ?? 0) + 1)
    summary.length = 0
    for (const [hashtag, count] of counts) summary.push({ hashtag, hashtag_count: count })
    frames.push(frame('count', 'GROUP BY', 'counts =', `Count tweet ${row.tweet_id} for ${row.hashtag}; it now has ${counts.get(row.hashtag)}.`, ['hashtag', 'hashtag_count'], summary))
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : 0))
  const result = ranked.slice(0, 3).map(([hashtag, count]) => ({ hashtag, hashtag_count: count }))
  frames.push(frame('done', 'LIMIT', 'return', `Return the top ${result.length} hashtag${result.length === 1 ? '' : 's'}.`, ['hashtag', 'hashtag_count'], result))
  return { input, result, frames }
}
