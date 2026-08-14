import fs from 'fs'
import { WITHOUT, findJsx } from './transform-lib.mjs'
import { transformExState } from './transform-exstate-lib.mjs'

const DRY = process.argv.includes('--dry-run')
const REPROCESS = process.argv.includes('--reprocess')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]
const PATTERN = process.argv.find(a => a.startsWith('--pattern='))?.split('=')[1]

function detectPattern(code) {
  if (code.includes('ManualInputPanel')) return 'done'
  if (/const \[ex,\s*setEx\]\s*=\s*useState\(EXAMPLES\[0\]\)/.test(code)) return 'exOnly'
  if (/const \[input,\s*setInput\]\s*=\s*useState\(/.test(code)) return 'inputState'
  return 'other'
}

const files = []
for (const folder of WITHOUT) {
  if (ONLY && folder !== ONLY) continue
  const jf = findJsx(folder)
  if (!jf) continue
  const code = fs.readFileSync(jf, 'utf8')
  const pattern = detectPattern(code)
  if (!REPROCESS && pattern === 'done') continue
  if (PATTERN && pattern !== PATTERN) continue
  if (pattern === 'exOnly' || pattern === 'inputState') {
    files.push({ folder, jf, code, pattern })
  }
}

console.log('files to transform:', files.length)
let done = 0, failed = 0
for (const { folder, jf, code, pattern } of files) {
  const varName = pattern === 'exOnly' ? 'ex' : 'input'
  const newCode = transformExState(code, folder, varName)
  if (newCode == null) {
    console.log('SKIP (unhandled):', folder, pattern)
    failed++
    continue
  }
  if (!DRY) fs.writeFileSync(jf, newCode)
  done++
}
console.log(`Done: ${done}, skipped: ${failed}`)
