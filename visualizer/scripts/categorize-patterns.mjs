import fs from 'fs'
import path from 'path'

const report = JSON.parse(fs.readFileSync(path.resolve('scripts/manual-input-report.json'), 'utf8'))
const without = report.without
const problemsDir = path.resolve('src/problems')

const analysis = []
for (const p of without) {
  const dir = path.join(problemsDir, p.folder)
  const files = fs.readdirSync(dir)
  const jsxFile = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css'))
  if (!jsxFile) continue
  const code = fs.readFileSync(path.join(dir, jsxFile), 'utf8')

  // Categorize the state pattern used
  let pattern = 'unknown'
  const mEx = code.match(/const \[ex,\s*setEx\]\s*=\s*useState\(EXAMPLES\[0\]\)/)
  const mInput = code.match(/const \[input,\s*setInput\]\s*=\s*useState\(/)
  const mArrInput = code.match(/const \[(\w+)Input,\s*set\1\]\s*=\s*useState\(/)
  if (mEx) pattern = 'exOnly'
  else if (mInput) pattern = 'inputState'
  else if (mArrInput) pattern = 'namedInputState'
  else if (/<input[\s\S]*?value=\{/.test(code)) pattern = 'hasInputElement'
  else pattern = 'hardcodedOrOther'

  // What does generateSteps get called with?
  const genMatch = code.match(/generateSteps\(([^)]*)\)/)
  const genArgs = genMatch ? genMatch[1].trim() : ''

  analysis.push({ folder: p.folder, number: p.number, title: p.title, pattern, genArgs })
}

const counts = {}
for (const a of analysis) counts[a.pattern] = (counts[a.pattern] || 0) + 1
console.log('Pattern counts:', counts)
fs.writeFileSync('scripts/without-patterns.json', JSON.stringify(analysis, null, 2))

// Show samples of each
for (const pat of Object.keys(counts)) {
  console.log(`\n=== ${pat} (${counts[pat]}) samples ===`)
  analysis.filter(a => a.pattern === pat).slice(0, 12).forEach(a => console.log(`${a.folder}\t${a.title}\tgenArgs: ${a.genArgs}`))
}
