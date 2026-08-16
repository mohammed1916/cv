import fs from 'fs'
import path from 'path'
import { WITHOUT, findJsx } from './transform-lib.mjs'

// For each inputState file that was transformed with raw-value input (field='input'),
// determine the correct generateSteps param name and report.
const out = []
for (const folder of WITHOUT) {
  const jf = findJsx(folder)
  if (!jf) continue
  let code = fs.readFileSync(jf, 'utf8')
  if (!code.includes('ManualInputPanel')) continue
  // Detect bad transform: state input + inputInput and const { input, ... }
  if (!/const \[input, setInput\]/.test(code)) continue
  if (!/const \{ input, inputError \}/.test(code)) continue

  // Find generateSteps signature
  const sig = code.match(/function generateSteps\(([^)]*)\)/)
  const args = sig ? sig[1].split(',').map(s => s.trim()).filter(Boolean) : []
  out.push({ folder, args })
}
console.log(JSON.stringify(out, null, 2))
