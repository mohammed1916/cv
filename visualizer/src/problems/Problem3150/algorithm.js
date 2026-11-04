// SQL walkthrough. The sample tables and the limits (140 characters, three hashtags, three mentions) are this visualization's own.
export const sql = `SELECT tweet_id
FROM Tweets
WHERE LENGTH(content) > 140
   OR LENGTH(content) - LENGTH(REPLACE(content, '#', '')) > 3
   OR LENGTH(content) - LENGTH(REPLACE(content, '@', '')) > 3
ORDER BY tweet_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def invalid_tweets(tweets):
    text = tweets["content"]
    too_long = text.str.len() > 140
    too_many_tags = text.str.count("#") > 3
    too_many_mentions = text.str.count("@") > 3
    bad = too_long | too_many_tags | too_many_mentions
    return tweets.loc[bad, ["tweet_id"]].sort_values("tweet_id").to_dict("records")`
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
  { id: 'length', label: 'Length', description: 'Count the characters of each tweet.' },
  { id: 'hashtag', label: 'Hashtags', description: 'Count the hashtag marks.' },
  { id: 'mention', label: 'Mentions', description: 'Count the mention marks and decide.' },
  { id: 'done', label: 'Result', description: 'Return the invalid tweet ids.' },
]

const COLUMNS = ['tweet_id', 'content']
const LIMIT_CHARS = 140
const LIMIT_TAGS = 3

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Tweets table.')
  const Tweets = tableRows(input, 'Tweets', COLUMNS)
  for (const row of Tweets) {
    if (!Number.isInteger(row.tweet_id)) throw new Error('tweet_id is an integer.')
    if (typeof row.content !== 'string' || row.content.length > 300) throw new Error('content is text of at most 300 characters.')
  }
  return { Tweets }
}

const count = (text, mark) => text.split(mark).length - 1

export function buildTrace(input) {
  const { Tweets } = input
  const frames = []
  frames.push(frame('load', 'FROM Tweets', 'def ', `Load ${Tweets.length} tweets.`, COLUMNS, Tweets))

  const done = []
  const result = []
  for (const tweet of [...Tweets].sort((a, b) => a.tweet_id - b.tweet_id)) {
    const chars = tweet.content.length
    const tooLong = chars > LIMIT_CHARS
    done.push({ tweet_id: tweet.tweet_id, chars, hashtags: '', mentions: '', invalid: '' })
    frames.push(frame('length', 'LENGTH(content) > 140', 'too_long =', `Tweet ${tweet.tweet_id} has ${chars} characters${tooLong ? ', over the limit.' : '.'}`, ['tweet_id', 'chars', 'hashtags', 'mentions', 'invalid'], done))
    if (tooLong) {
      done.at(-1).invalid = 'yes'
      result.push({ tweet_id: tweet.tweet_id })
      frames.push(frame('length', 'WHERE LENGTH(content) > 140', 'bad =', `Tweet ${tweet.tweet_id} is invalid on length alone.`, ['tweet_id', 'chars', 'hashtags', 'mentions', 'invalid'], done))
      continue
    }
    const hashtags = count(tweet.content, '#')
    done.at(-1).hashtags = hashtags
    frames.push(frame('hashtag', "REPLACE(content, '#', '')", 'too_many_tags =', `Tweet ${tweet.tweet_id} has ${hashtags} hashtag mark${hashtags === 1 ? '' : 's'}.`, ['tweet_id', 'chars', 'hashtags', 'mentions', 'invalid'], done))
    if (hashtags > LIMIT_TAGS) {
      done.at(-1).invalid = 'yes'
      result.push({ tweet_id: tweet.tweet_id })
      continue
    }
    const mentions = count(tweet.content, '@')
    done.at(-1).mentions = mentions
    const bad = mentions > LIMIT_TAGS
    done.at(-1).invalid = bad ? 'yes' : 'no'
    frames.push(frame('mention', "REPLACE(content, '@', '')", 'too_many_mentions =', `Tweet ${tweet.tweet_id} has ${mentions} mention mark${mentions === 1 ? '' : 's'}${bad ? ', so it is invalid.' : '.'}`, ['tweet_id', 'chars', 'hashtags', 'mentions', 'invalid'], done))
    if (bad) result.push({ tweet_id: tweet.tweet_id })
  }
  result.sort((a, b) => a.tweet_id - b.tweet_id)
  frames.push(frame('done', 'ORDER BY tweet_id', 'return', `Return ${result.length} invalid tweet${result.length === 1 ? '' : 's'}.`, ['tweet_id'], result))
  return { input, result, frames }
}
