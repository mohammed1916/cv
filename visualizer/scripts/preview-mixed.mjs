import fs from 'fs'
import { findJsx } from './transform-lib.mjs'
import { transformMixed } from './transform-mixed-lib.mjs'

const target = process.argv[2]
if (!target) { console.error('usage: node scripts/preview-mixed.mjs ProblemXXX'); process.exit(1) }
const jf = findJsx(target)
const code = fs.readFileSync(jf, 'utf8')
const newCode = transformMixed(code, target)
if (newCode == null) {
  console.log('NOT TRANSFORMABLE')
} else {
  fs.writeFileSync('/tmp/mixed-preview.jsx', newCode)
  console.log('Wrote /tmp/mixed-preview.jsx')
}
