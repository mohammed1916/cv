// Stage-by-stage teaching model: the tables, SQL and pandas steps are written for this site.
const SQL = `(SELECT u.name AS results
FROM MovieRating r JOIN Users u ON u.user_id = r.user_id
GROUP BY u.user_id, u.name
ORDER BY COUNT(*) DESC, u.name ASC LIMIT 1)
UNION ALL
(SELECT m.title
FROM MovieRating r JOIN Movies m ON m.movie_id = r.movie_id
WHERE r.created_at >= '2020-02-01' AND r.created_at < '2020-03-01'
GROUP BY m.movie_id, m.title
ORDER BY AVG(r.rating) DESC, m.title ASC LIMIT 1);`

const PY_SRC = `import pandas as pd

def movie_rating(movies, users, ratings):
    merged = ratings.merge(users, on="user_id")
    counts = merged.groupby(["user_id", "name"]).size().reset_index(name="n")
    top_user = counts.sort_values(["n", "name"], ascending=[False, True]).iloc[0]["name"]
    feb = ratings[(ratings["created_at"] >= "2020-02-01") & (ratings["created_at"] < "2020-03-01")]
    averages = feb.merge(movies, on="movie_id").groupby("title")["rating"].mean().reset_index()
    top_movie = averages.sort_values(["rating", "title"], ascending=[False, True]).iloc[0]["title"]
    return pd.DataFrame({"results": [top_user, top_movie]})`

const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const lineOf = (list, text) => {
  const hit = list.find(l => l.text.includes(text))
  if (!hit) throw new Error(`Missing line: ${text}`)
  return hit.line
}

export const code = lines(SQL)
export const python = PY_SRC
const PY = lines(PY_SRC)
const sqlLine = text => lineOf(code, text)
const pyLine = text => lineOf(PY, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Join each rating to its user and movie.' },
  { id: 'count', label: 'Count', description: 'Count the ratings each user gave.' },
  { id: 'pick-user', label: 'Top user', description: 'Most ratings first, then the smallest name.' },
  { id: 'filter', label: 'February', description: 'Keep only ratings dated in February 2020.' },
  { id: 'average', label: 'Average', description: 'Average the February ratings of each movie.' },
  { id: 'pick-movie', label: 'Top movie', description: 'Highest average first, then the smallest title.' },
  { id: 'output', label: 'Result', description: 'One row for the user and one for the movie.' },
]

const frame = (phase, sql, py, message, rows) => ({
  phase,
  activeLine: sqlLine(sql),
  pythonLine: pyLine(py),
  message,
  rows: rows.map(row => ({ ...row })),
})

const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with movies, users and ratings.')
  const { movies, users, ratings } = input
  if (!Array.isArray(movies) || !Array.isArray(users) || !Array.isArray(ratings)) throw new Error('movies, users and ratings are lists.')
  if (movies.length > 8 || users.length > 8 || ratings.length > 20) throw new Error('Keep the sample small: at most 8 movies, 8 users and 20 ratings.')
  for (const r of ratings) {
    if (!Number.isInteger(r.rating) || r.rating < 1 || r.rating > 5 || !isDate(r.created_at)) {
      throw new Error('Each rating is an integer from 1 to 5 with a YYYY-MM-DD date.')
    }
  }
  return { movies, users, ratings }
}

export function buildTrace(input) {
  const { movies, users, ratings } = input
  const frames = []
  frames.push(frame('load', 'FROM MovieRating r JOIN Users', 'merged = ratings.merge(users', `Start from ${ratings.length} ratings.`, ratings))

  const perUser = []
  for (const u of users) {
    const n = ratings.filter(r => r.user_id === u.user_id).length
    if (n === 0) continue
    perUser.push({ name: u.name, movies: n })
    frames.push(frame('count', 'GROUP BY u.user_id', 'counts = merged.groupby', `${u.name} rated ${n} movie${n === 1 ? '' : 's'}.`, perUser))
  }
  const sortedUsers = [...perUser].sort((a, b) => b.movies - a.movies || byText(a.name, b.name))
  frames.push(frame('pick-user', 'ORDER BY COUNT(*) DESC', 'top_user = counts.sort_values', `Most ratings: ${sortedUsers[0].name}. Ties go to the smaller name.`, sortedUsers))

  const feb = ratings.filter(r => r.created_at >= '2020-02-01' && r.created_at < '2020-03-01')
  frames.push(frame('filter', 'WHERE r.created_at', 'feb = ratings[', `${feb.length} ratings fall in February 2020.`, feb))

  const perMovie = []
  for (const m of movies) {
    const rs = feb.filter(r => r.movie_id === m.movie_id)
    if (rs.length === 0) continue
    const exact = rs.reduce((sum, r) => sum + r.rating, 0) / rs.length
    perMovie.push({ title: m.title, average: Math.round(exact * 100) / 100, exact })
    frames.push(frame('average', 'GROUP BY m.movie_id', 'averages = feb.merge', `${m.title} averages ${(Math.round(exact * 100) / 100).toFixed(2)} in February.`, perMovie))
  }
  const sortedMovies = [...perMovie].sort((a, b) => b.exact - a.exact || byText(a.title, b.title))
  frames.push(frame('pick-movie', 'ORDER BY AVG(r.rating) DESC', 'top_movie = averages.sort_values', sortedMovies.length ? `Best February average: ${sortedMovies[0].title}.` : 'No February ratings, so no movie row.', sortedMovies))

  const result = []
  if (sortedUsers.length) result.push({ results: sortedUsers[0].name })
  if (sortedMovies.length) result.push({ results: sortedMovies[0].title })
  frames.push(frame('output', 'UNION ALL', 'return pd.DataFrame', 'Report the top user, then the top movie.', result))
  return { input, result, frames }
}
