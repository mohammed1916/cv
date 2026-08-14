import fs from 'fs'
import path from 'path'
import { WITHOUT, findJsx } from './transform-lib.mjs'
import { transformExState } from './transform-exstate-lib.mjs'

const DRY = process.argv.includes('--dry-run')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]
const FALLBACK_ONLY = process.argv.includes('--fallback')

const files = []
for (const folder of WITHOUT) {
  if (ONLY && folder !== ONLY) continue
  const jf = findJsx(folder)
  if (!jf) continue
  const code = fs.readFileSync(jf, 'utf8')
  if (code.includes('ManualInputPanel')) continue
  // exOnly-with-fallback form
  if (!/const \[ex,\s*setEx\]\s*=\s*useState\(EXAMPLES\[0\]\s*\|\|/.test(code)) continue
  files.push({ folder, jf, code })
}

console.log('exOnly-fallback files:', files.length)
let done = 0, failed = 0
for (const { folder, jf, code } of files) {
  const newCode = transformExState(code, folder, 'ex')
  if (newCode == null) { console.log('SKIP:', folder); failed++; continue }
  if (!DRY) fs.writeFileSync(jf, newCode)
  done++
}
console.log(`Done: ${done}, skipped: ${failed}`)
