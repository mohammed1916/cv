// Knowledge-derived SQL walkthrough. The keyword and post rows are invented for this visualization.
export const sql = `WITH PostWords AS (
  SELECT post_id, word
  FROM WordTokens
)
SELECT p.post_id,
       COALESCE(GROUP_CONCAT(DISTINCT k.topic_id ORDER BY k.topic_id SEPARATOR ','), 'Ambiguous!') AS topics
FROM Posts AS p
LEFT JOIN PostWords AS pw ON pw.post_id = p.post_id
LEFT JOIN Keywords AS k ON k.word = pw.word
GROUP BY p.post_id
ORDER BY p.post_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `import re

def topics_per_post(keywords, posts):
    topics_by_word = {}
    for row in keywords:
        topics_by_word.setdefault(row["word"].lower(), set()).add(row["topic_id"])
    result = []
    for post in posts:
        words = set(re.findall(r"[a-z0-9]+", post["content"].lower()))
        topics = sorted(set().union(*(topics_by_word.get(w, set()) for w in words)))
        result.append({"post_id": post["post_id"], "topics": ",".join(topics) or "Ambiguous!"})
    return sorted(result, key=lambda row: row["post_id"])`
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
  { id: 'load', label: 'Load', description: 'Read the keyword and post rows.' },
  { id: 'index', label: 'Index', description: 'Group the topics that share a keyword word.' },
  { id: 'match', label: 'Match', description: 'Split each post into lowercase whole words and collect its topics.' },
  { id: 'done', label: 'Result', description: 'Return each post with its topics, or Ambiguous!.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Keywords and Posts tables.')
  return {
    Keywords: tableRows(input, 'Keywords', ['topic_id', 'word']),
    Posts: tableRows(input, 'Posts', ['post_id', 'content']),
  }
}

export function buildTrace(input) {
  const { Keywords, Posts } = input
  const frames = []
  frames.push(frame('load', 'FROM Posts', 'def ', `Load ${Posts.length} posts and ${Keywords.length} keyword rows.`, ['post_id', 'content'], Posts))

  const topicsByWord = new Map()
  for (const row of Keywords) {
    const word = row.word.toLowerCase()
    if (!topicsByWord.has(word)) topicsByWord.set(word, new Set())
    topicsByWord.get(word).add(row.topic_id)
  }
  const index = [...topicsByWord].map(([word, topics]) => ({ word, topics: [...topics].sort().join(',') }))
  frames.push(frame('index', 'LEFT JOIN Keywords', 'topics_by_word =', `Index ${topicsByWord.size} distinct keyword words.`, ['word', 'topics'], index))

  const table = []
  const result = []
  for (const post of Posts) {
    const words = [...new Set(post.content.toLowerCase().match(/[a-z0-9]+/g) ?? [])]
    const topics = [...new Set(words.flatMap(word => [...(topicsByWord.get(word) ?? [])]))].sort()
    const topicText = topics.length ? topics.join(',') : 'Ambiguous!'
    result.push({ post_id: post.post_id, topics: topicText })
    table.push({ post_id: post.post_id, words: words.join(' '), topics: topicText })
    const message = topics.length ? `Post ${post.post_id} matches ${topicText}.` : `Post ${post.post_id} has no keyword, so it is Ambiguous!.`
    frames.push(frame('match', 'LEFT JOIN Keywords', 'words = set(', message, ['post_id', 'words', 'topics'], table))
  }

  result.sort((a, b) => a.post_id - b.post_id)
  frames.push(frame('done', 'ORDER BY', 'return sorted(', `Return ${result.length} posts.`, ['post_id', 'topics'], result))
  return { input, result, frames }
}
