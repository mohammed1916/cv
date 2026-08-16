import fs from 'fs'
import path from 'path'
import { WITHOUT, findJsx } from './transform-lib.mjs'

/**
 * Fix redundant self-assignment destructuring lines introduced by the
 * exOnly transformer, e.g.:
 *   const s = s, t = t;      (originally const s = ex.s, t = ex.t;)
 *   const ratings = ratings; (originally const ratings = ex.ratings;)
 * These redeclare the parsed variables -> parse error. We remove the line.
 */
const problemsDir = path.resolve('src/problems')

let fixed = 0
for (const folder of WITHOUT) {
  const jf = findJsx(folder)
  if (!jf) continue
  let code = fs.readFileSync(jf, 'utf8')
  if (!code.includes('ManualInputPanel')) continue

  const before = code
  // Remove whole lines matching `const X = X, Y = Y;` or `const X = X;`
  const lineRe = /^[ \t]*const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1(?:\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\2)*\s*;?[ \t]*\r?\n/gm
  code = code.replace(lineRe, '')

  if (code !== before) {
    fs.writeFileSync(jf, code)
    fixed++
    console.log('fixed:', folder)
  }
}
console.log('Fixed', fixed, 'files')
