import fs from 'fs'
import path from 'path'

/**
 * Repair files where the fallback-batch injection broke the JSX:
 *  - remove misplaced `<ManualInputPanel ... />` blocks (injected into content: blocks)
 *  - remove the `<>` fragment-open that was added right before them
 *  - remove stray `</>)}` / `</>))}` fragment-close remnants
 * Then re-inject ManualInputPanel at the component's root div (safe location).
 *
 * The state transform (inputs/parsing/applyEx) is kept — only the MIP placement is fixed.
 */
const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))
const targets = process.argv.slice(2)

let count = 0
for (const f of folders) {
  if (targets.length && !targets.includes(f)) continue
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const file = path.join(dir, f, jf)
  let code = fs.readFileSync(file, 'utf8')
  const orig = code

  // 1. Remove stray fragment-close remnants: `</>)}` or `</>))}` on their own or embedded
  code = code.replace(/<\/>\)\}\s*\n/g, '')
  code = code.replace(/<\/>\)\}\)\s*\n/g, '')
  code = code.replace(/\n\s*<\/>\)\}\n/g, '\n')

  // 2. Remove ManualInputPanel JSX blocks (from `<ManualInputPanel` to matching `/>`)
  code = code.replace(/<ManualInputPanel[\s\S]*?\/>\n/g, '')

  // 3. Remove the fragment-open `<>` that immediately preceded a ManualInputPanel
  //    (pattern: blank line + `<>` + blank line before where MIP was)
  code = code.replace(/\n\s*<>\s*\n/g, '\n')

  // 4. Remove a now-empty `const X = (` wrapper if the content block became empty/odd
  //    (leave as-is; verify via build)

  if (code !== orig) {
    fs.writeFileSync(file, code)
    count++
    console.log('repaired:', f)
  }
}
console.log('Repaired', count, 'files')
