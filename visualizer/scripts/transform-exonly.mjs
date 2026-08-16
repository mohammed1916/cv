import fs from 'fs'
import { WITHOUT, findJsx, detectPattern } from './transform-lib.mjs'
import { transformExOnly } from './transform-exonly-lib.mjs'

const DRY = process.argv.includes('--dry-run')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]
const REPROCESS = process.argv.includes('--reprocess')

const files = []
for (const folder of WITHOUT) {
  if (ONLY && folder !== ONLY) continue
  const jf = findJsx(folder)
  if (!jf) continue
  const code = fs.readFileSync(jf, 'utf8')
  // Skip already-transformed files (they have ManualInputPanel injected)
  if (!REPROCESS && code.includes('ManualInputPanel')) continue
  if (detectPattern(code) !== 'exOnly') continue
  files.push({ folder, jf, code })
}

console.log('exOnly files to transform:', files.length)
let done = 0, failed = 0
for (const { folder, jf, code } of files) {
  const newCode = transformExOnly(code, folder)
  if (newCode == null) {
    console.log('SKIP (unhandled):', folder)
    failed++
    continue
  }
  if (!DRY) fs.writeFileSync(jf, newCode)
  done++
}
console.log(`Done: ${done}, skipped: ${failed}`)
