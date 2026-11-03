// Knowledge-derived teaching version. The sample rows are invented for this visualization.
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const code = [
  "WITH kids_movies AS (SELECT content_id, title FROM Content WHERE Kids_content = 'Y' AND content_type = 'Movies')",
  ", june_airings AS (SELECT content_id, program_date FROM TVProgram WHERE program_date >= '2020-06-01' AND program_date < '2020-07-01')",
  'SELECT DISTINCT k.title FROM kids_movies k JOIN june_airings j ON j.content_id = k.content_id',
  'ORDER BY k.title',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def friendly_movies(content, tv_program):',
  "    movies = content[(content['Kids_content'] == 'Y') & (content['content_type'] == 'Movies')]",
  "    june = tv_program[(tv_program['program_date'] >= '2020-06-01') & (tv_program['program_date'] < '2020-07-01')]",
  "    merged = june.merge(movies, on='content_id')",
  "    return merged[['title']].drop_duplicates().sort_values('title')",
].join('\n')

const codeLines = code.map(row => row.text)
const pythonLines = python.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

const sqlLine = text => lineOf(codeLines, text)
const pyLine = text => lineOf(pythonLines, text)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.content) || !Array.isArray(input.tv_program)) throw new Error('Use content and tv_program lists.')
  if (input.content.length > 12 || input.tv_program.length > 30) throw new Error('Use at most 12 content rows and 30 airings.')
  const content = input.content.map(row => {
    if (!row || !Number.isInteger(row.content_id) || typeof row.title !== 'string') throw new Error('Each content row needs an integer content_id and a title.')
    if (row.Kids_content !== 'Y' && row.Kids_content !== 'N') throw new Error("Kids_content is 'Y' or 'N'.")
    if (typeof row.content_type !== 'string') throw new Error('content_type is a text value.')
    return { content_id: row.content_id, title: row.title, Kids_content: row.Kids_content, content_type: row.content_type }
  })
  const tv_program = input.tv_program.map(row => {
    if (!row || !DATE.test(row.program_date) || !Number.isInteger(row.content_id) || typeof row.channel !== 'string') {
      throw new Error('Each airing needs a YYYY-MM-DD program_date, an integer content_id and a channel.')
    }
    return { program_date: row.program_date, content_id: row.content_id, channel: row.channel }
  })
  return { content, tv_program }
}

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace(input) {
  const { content, tv_program } = input
  const frames = []
  const add = (phase, sql, py, message, rows) => frames.push({
    phase, activeLine: sqlLine(sql), pythonLine: pyLine(py), message, rows: rows.map(row => ({ ...row })),
  })

  add('load', 'FROM Content', 'def friendly_movies', `Read ${tv_program.length} airings and ${content.length} content rows.`, tv_program)

  const kidsMovies = new Map(content
    .filter(row => row.Kids_content === 'Y' && row.content_type === 'Movies')
    .map(row => [row.content_id, row.title]))
  const eligible = [...kidsMovies].map(([content_id, title]) => ({ content_id, title }))
  add('content', "Kids_content = 'Y'", "['Kids_content'] == 'Y'", `${eligible.length} kid-friendly movies are candidates.`, eligible)

  const accepted = []
  for (const airing of [...tv_program].sort((a, b) => compare(a.program_date, b.program_date))) {
    const inJune = airing.program_date >= '2020-06-01' && airing.program_date < '2020-07-01'
    const title = kidsMovies.get(airing.content_id)
    if (inJune && title !== undefined) accepted.push({ content_id: airing.content_id, title, program_date: airing.program_date })
    add('window', 'program_date >= ', "program_date'] >= ",
      `${airing.program_date} content ${airing.content_id}: ${inJune && title !== undefined ? 'kept' : 'skipped'}.`, accepted)
  }

  const titles = [...new Set(accepted.map(row => row.title))].sort(compare).map(title => ({ title }))
  add('output', 'JOIN june_airings', 'merge(', `${titles.length} distinct titles remain.`, titles)
  add('done', 'ORDER BY k.title', 'return merged', `Returned ${titles.length} titles.`, titles)

  return { input, result: titles.map(row => ({ ...row })), frames }
}
