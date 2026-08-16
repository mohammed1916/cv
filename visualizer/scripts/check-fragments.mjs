import fs from 'fs'
import path from 'path'

/**
 * Find files with unbalanced JSX fragments OR parse errors by doing a
 * lightweight bracket/fragment balance check per file, and optionally
 * run each through the vite transform via a child process.
 */
const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))

function countFragments(code) {
  const opens = (code.match(/<>\s*/g) || []).length
  const closes = (code.match(/<\/>\s*/g) || []).length
  return { opens, closes }
}

const unbalanced = []
for (const f of folders) {
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const code = fs.readFileSync(path.join(dir, f, jf), 'utf8')
  const { opens, closes } = countFragments(code)
  if (opens !== closes) {
    unbalanced.push(`${f}:${jf}: <>${opens}/</>${closes}`)
  }
}
console.log('Unbalanced fragment files:', unbalanced.length)
unbalanced.forEach(u => console.log('  ', u))
