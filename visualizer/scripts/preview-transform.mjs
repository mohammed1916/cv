import fs from 'fs'
import path from 'path'
import { WITHOUT, typesFile, findJsx, detectPattern, cap } from './transform-lib.mjs'
import { transformExOnly } from './transform-exonly-lib.mjs'

const problemsDir = path.resolve('src/problems')
const target = process.argv[2]
if (!target) { console.error('usage: node scripts/preview-transform.mjs ProblemXXX'); process.exit(1) }

const jf = findJsx(target)
const code = fs.readFileSync(jf, 'utf8')
console.log('Pattern:', detectPattern(code))
const newCode = transformExOnly(code, target)
if (newCode == null) {
  console.log('NOT TRANSFORMABLE')
} else {
  fs.writeFileSync('/tmp/transformed-preview.jsx', newCode)
  console.log('Wrote /tmp/transformed-preview.jsx')
}
