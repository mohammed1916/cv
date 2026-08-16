import fs from 'fs'
import { findJsx } from './transform-lib.mjs'
import { transformExState } from './transform-exstate-lib.mjs'

const target = process.argv[2]
const jf = findJsx(target)
const code = fs.readFileSync(jf, 'utf8')
const newCode = transformExState(code, target, 'ex')
if (newCode == null) {
  console.log('NOT TRANSFORMABLE')
} else {
  fs.writeFileSync('/tmp/fb-preview.jsx', newCode)
  console.log('Wrote /tmp/fb-preview.jsx')
}
