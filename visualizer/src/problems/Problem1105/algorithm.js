// Own shelf-partition dynamic programming walkthrough. The sample books are invented for this visualization.
const CODE_TEXT = `function minShelfHeight(books, shelfWidth) {
  const count = books.length
  const dp = [0, ...Array(count).fill(Infinity)]
  for (let end = 1; end <= count; end++) {
    let width = 0
    let tallest = 0
    for (let start = end; start >= 1; start--) {
      const [thickness, height] = books[start - 1]
      width += thickness
      tallest = Math.max(tallest, height)
      if (width > shelfWidth) break
      dp[end] = Math.min(dp[end], dp[start - 1] + tallest)
    }
  }
  return dp[count]
}`

export const python = `def min_shelf_height(books, shelf_width):
    count = len(books)
    dp = [0] + [float("inf")] * count
    for end in range(1, count + 1):
        width = 0
        tallest = 0
        for start in range(end, 0, -1):
            thickness, height = books[start - 1]
            width += thickness
            tallest = max(tallest, height)
            if width > shelf_width:
                break
            dp[end] = min(dp[end], dp[start - 1] + tallest)
    return dp[count]`

const PY = python.split('\n')
export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const STEP = {
  start: ['const dp = [0', 'dp = [0]'],
  prefix: ['for (let end = 1', 'for end in range'],
  extend: ['width += thickness', 'width += thickness'],
  stop: ['if (width > shelfWidth)', 'if width > shelf_width'],
  improve: ['dp[end] = Math.min', 'dp[end] = min'],
  done: ['return dp[count]', 'return dp[count]'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(CODE_TEXT.split('\n'), STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Set the cost of an empty prefix to zero.' },
  { id: 'inspect', label: 'Prefix', description: 'Choose the books for the next prefix end.' },
  { id: 'update', label: 'Shelf', description: 'Grow the last shelf backward while it fits.' },
  { id: 'improve', label: 'Improve', description: 'Keep the cheaper total height for this prefix.' },
  { id: 'done', label: 'Result', description: 'Return the cost for every book.' },
]

export const inputLabel = 'JSON with books as [thickness, height] pairs and shelfWidth, e.g. {"books":[[2,5],[3,4]],"shelfWidth":6}'
export const complexity = 'O(n^2) time and O(n) DP space, where n is the number of books. The visualizer accepts up to 8 books.'
export const examples = [
  { label: 'Sample', input: '{"books":[[2,6],[4,3],[3,5],[5,4],[1,2]],"shelfWidth":8}' },
  { label: 'One shelf', input: '{"books":[[1,2],[1,4],[1,3]],"shelfWidth":10}' },
  { label: 'Every book alone', input: '{"books":[[4,3],[4,5],[4,2]],"shelfWidth":4}' },
  { label: 'Single book fills a shelf', input: '{"books":[[3,7]],"shelfWidth":3}' },
  { label: 'Equal books need separate shelves', input: '{"books":[[2,5],[2,5]],"shelfWidth":2}' },
  { label: 'Widest shelf and tallest book', input: '{"books":[[30,20],[1,1]],"shelfWidth":30}' },
  { label: 'Long run: 8 books', input: '{"books":[[3,5],[8,8],[10,12],[3,3],[2,15],[9,3],[9,9],[10,15]],"shelfWidth":10}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.books) || !Number.isInteger(input.shelfWidth)) throw new Error('Use {"books":[[thickness,height],...],"shelfWidth":n}.')
  if (input.books.length < 1 || input.books.length > 8) throw new Error('Use 1 to 8 books for the visualization.')
  if (input.shelfWidth < 1 || input.shelfWidth > 30) throw new Error('shelfWidth must be an integer from 1 to 30.')
  const books = input.books.map(book => {
    if (!Array.isArray(book) || book.length !== 2 || !book.every(Number.isInteger)) throw new Error('Each book must be [thickness, height] with integers.')
    const [thickness, height] = book
    if (thickness < 1 || thickness > input.shelfWidth) throw new Error('Each thickness must fit on an empty shelf.')
    if (height < 1 || height > 20) throw new Error('Each height must be from 1 to 20.')
    return [thickness, height]
  })
  return { books, shelfWidth: input.shelfWidth }
}

export function buildTrace(input) {
  const { books, shelfWidth } = input
  const count = books.length
  const dp = [0, ...Array(count).fill(Infinity)]
  const show = value => (value === Infinity ? null : value)
  const snap = extra => ({ books, shelfWidth, dp: dp.map(show), ...extra })
  const frames = [frame('start', 'start', 'An empty prefix costs 0; every other prefix is not yet solved.', snap({ end: 0 }))]
  for (let end = 1; end <= count; end++) {
    frames.push(frame('inspect', 'prefix', `Find the cheapest arrangement of the first ${end} book${end === 1 ? '' : 's'}.`, snap({ end })))
    let width = 0
    let tallest = 0
    for (let start = end; start >= 1; start--) {
      const [thickness, height] = books[start - 1]
      width += thickness
      tallest = Math.max(tallest, height)
      if (width > shelfWidth) {
        frames.push(frame('update', 'stop', `Books ${start}..${end} need width ${width}, which is over ${shelfWidth}; stop extending.`, snap({ end, start, width, tallest })))
        break
      }
      frames.push(frame('update', 'extend', `Last shelf holds books ${start}..${end}: width ${width}, tallest ${tallest}.`, snap({ end, start, width, tallest })))
      const candidate = dp[start - 1] + tallest
      if (candidate < dp[end]) {
        dp[end] = candidate
        frames.push(frame('improve', 'improve', `Cost ${dp[start - 1]} + ${tallest} = ${candidate} is the best so far for ${end} books.`, snap({ end, start, width, tallest })))
      }
    }
  }
  frames.push(frame('done', 'done', `Return the minimum total height ${dp[count]}.`, snap({ end: count })))
  return { input, result: dp[count], frames }
}
