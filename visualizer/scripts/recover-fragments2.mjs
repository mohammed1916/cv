import fs from 'fs'
import path from 'path'

/**
 * Comprehensive recovery for the over-aggressive repair damage.
 *
 * Damage: repair stripped `<ManualInputPanel .../>` blocks AND `<>` fragment
 * opens, leaving orphaned `</>` closes. This script restores balance by
 * adding `<>` before every `<ManualInputPanel` (and its panel-const) that is
 * missing the open, for files that still have MIP. For files that LOST their
 * MIP entirely, we can't restore MIP here, but we re-run the transformer
 * afterwards.
 *
 * This script ONLY fixes fragment balance for files that still contain
 * `<ManualInputPanel` (75 files). The 201 files that lost MIP are handled by
 * re-running their transformer (recover-restore.mjs).
 */
const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))

let fixed = 0
const fixedList = []
for (const f of folders) {
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const file = path.join(dir, f, jf)
  let code = fs.readFileSync(file, 'utf8')
  if (!code.includes('<ManualInputPanel')) continue

  const opens = (code.match(/<>\s*\n/g) || []).length
  const closes = (code.match(/<\/>\s*\n/g) || []).length
  const deficit = closes - opens
  if (deficit <= 0) continue

  // Insert `<>` before the FIRST <ManualInputPanel (the injected one).
  const idx = code.indexOf('<ManualInputPanel')
  if (idx === -1) continue
  const lineStart = code.lastIndexOf('\n', idx) + 1
  const prevLine = code.slice(0, lineStart).trimEnd().split('\n').pop() || ''
  // Only insert if we're not already right after a `<>` and the line before is a `const X = (` or `content: (`
  const prefix = code.slice(0, lineStart)
  const lastOpenParen = prefix.lastIndexOf('(')
  const tail = prefix.slice(lastOpenParen)
  if (/<>\s*$/.test(tail)) continue // already has open

  code = code.slice(0, lineStart) + '    <>\n' + code.slice(lineStart)
  fs.writeFileSync(file, code)
  fixed++
  fixedList.push(f)
}
console.log('Fixed fragment balance in', fixed, 'files')
console.log(fixedList.join(', '))
