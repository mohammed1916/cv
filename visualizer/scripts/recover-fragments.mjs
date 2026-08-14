import fs from 'fs'
import path from 'path'

/**
 * Recovery: restore missing fragment-opens `<>` that the over-aggressive
 * repair script stripped from panel-const MIP injections.
 *
 * Pattern (original, correct):
 *   const primaryPanel = (
 *     <>
 *       <ManualInputPanel ... />
 *     <div>...</div>
 *     </>)
 *
 * After repair, `<>` was removed:
 *   const primaryPanel = (
 *       <ManualInputPanel ... />
 *     <div>...</div>
 *     </>)
 *
 * Fix: for each `<ManualInputPanel` that is NOT already preceded (within the
 * same `const x = (` block) by a fragment-open `<>`, insert `\n    <>\n` right
 * before it.
 *
 * Only runs on files that currently have MORE `</>` than `<>` (orphaned closes).
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
  if (closes <= opens) continue  // balanced or over-open, skip

  let out = code
  // Insert `<>` before the first <ManualInputPanel that is not preceded by an open.
  // We insert right after the `const X = (` line when the MIP follows.
  const panelConstRe = /(const (primaryPanel|vizPanel|leftPanel|centerPanel)\s*=\s*\(\s*\n)([\s\S]*?<ManualInputPanel)/
  const m = panelConstRe.exec(out)
  if (m) {
    // Check the gap between `(` and MIP already has <>
    const gap = m[3]
    if (!/<>\s*\n/.test(gap)) {
      out = out.replace(m[0], `${m[1]}    <>\n${m[3]}`)
    }
  } else {
    // Fallback: insert `<>` right before the first ManualInputPanel
    const idx = out.indexOf('<ManualInputPanel')
    if (idx !== -1) {
      const lineStart = out.lastIndexOf('\n', idx) + 1
      // ensure previous non-empty line isn't already `<>`
      const prevLine = out.slice(0, lineStart).trimEnd().split('\n').pop() || ''
      if (!/^<\s*$/.test(prevLine.trim())) {
        out = out.slice(0, lineStart) + '    <>\n' + out.slice(lineStart)
      }
    }
  }

  if (out !== code) {
    fs.writeFileSync(file, out)
    fixed++
    fixedList.push(f)
  }
}
console.log('Restored <> opens in', fixed, 'files')
console.log(fixedList.join(', '))
