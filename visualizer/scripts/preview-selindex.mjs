import fs from 'fs'
import { findJsx } from './transform-lib.mjs'
import { transformSelIndex } from './transform-selindex-lib.mjs'

const target = process.argv[2]
const jf = findJsx(target)
const code = fs.readFileSync(jf, 'utf8')
const newCode = transformSelIndex(code, target)
if (newCode == null) {
  console.log('NOT TRANSFORMABLE')
} else {
  fs.writeFileSync('/tmp/selindex-preview.jsx', newCode)
  console.log('Wrote /tmp/selindex-preview.jsx')
}
