import fs from 'fs'
import { findJsx } from './transform-lib.mjs'
import { transformCurrentExample } from './transform-currentexample-lib.mjs'

const target = process.argv[2]
const jf = findJsx(target)
const code = fs.readFileSync(jf, 'utf8')
const newCode = transformCurrentExample(code, target)
if (newCode == null) {
  console.log('NOT TRANSFORMABLE')
} else {
  fs.writeFileSync('/tmp/ce-preview.jsx', newCode)
  console.log('Wrote /tmp/ce-preview.jsx')
}
