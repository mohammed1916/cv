import fs from 'fs'
import path from 'path'

/**
 * Fix derived-variable collisions introduced by the exOnly transformer.
 *
 * Problem: files with a derived display variable like
 *   `const nums = step?.nums ?? ex.nums;`
 * after transform become
 *   `const nums = step?.nums ?? nums;`
 * which redeclares the parsed `nums` variable -> parse error.
 *
 * Fix: rename the parsed variable to `input<Field>` in the destructure and
 * update generateSteps + the derived line to reference it.
 *
 * Usage: node scripts/fixup-derived-collisions.mjs Problem189 Problem231 ...
 */
const problemsDir = path.resolve('src/problems')

const targets = process.argv.slice(2)
if (!targets.length) {
  console.error('usage: node scripts/fixup-derived-collisions.mjs ProblemXXX ...')
  process.exit(1)
}

for (const folder of targets) {
  const dir = path.join(problemsDir, folder)
  const files = fs.readdirSync(dir)
  const jf = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css') && f !== 'index.jsx')
  if (!jf) { console.log('no jsx:', folder); continue }
  const file = path.join(dir, jf)
  let code = fs.readFileSync(file, 'utf8')

  // Find the parse destructure: const { a, b, inputError } = useMemo(...
  const parseRe = /const \{ ([\w,\s]+)inputError \} = useMemo\(/
  const pm = code.match(parseRe)
  if (!pm) { console.log('no parse block:', folder); continue }
  const names = pm[1].split(',').map(s => s.trim()).filter(Boolean)

  let changed = false
  for (const name of names) {
    const derivedRe = new RegExp(`const ${name} = step\\?\\.${name} \\?\\? ${name};`)
    if (derivedRe.test(code)) {
      const inputName = 'input' + name.charAt(0).toUpperCase() + name.slice(1)
      // 1. Alias in destructure: { nums, k, inputError } -> { nums: inputNums, k, inputError }
      //    Replace the standalone `\bname\b` token inside the destructure only.
      code = code.replace(
        new RegExp(`const \\{ ([\\w,\\s]+?)inputError \\} = useMemo`),
        (m, inner) => m.replace(inner, inner.replace(new RegExp(`\\b${name}\\b`), `${name}: ${inputName}`))
      )
      // 2. Update generateSteps( call (only the first arg usage matching name)
      code = code.replace(
        new RegExp(`generateSteps\\(${name}([,)])`),
        `generateSteps(${inputName}$1`
      )
      // 3. Update derived line: const nums = step?.nums ?? inputNums;
      code = code.replace(
        new RegExp(`const ${name} = step\\?\\.${name} \\?\\? ${name};`),
        `const ${name} = step?.${name} ?? ${inputName};`
      )
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(file, code)
    console.log('fixed:', folder)
  } else {
    console.log('nothing to fix:', folder)
  }
}
