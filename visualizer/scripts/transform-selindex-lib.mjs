import { cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Transform "sel-index" pattern files:
 *   const [sel, setSel] = useState(0);
 *   const { nodes } = EXAMPLES[sel];      (or const nodes = EXAMPLES[sel].arr)
 *   const steps = useMemo(() => generateSteps(nodes), [nodes]);
 *   const applyExample = useCallback((i) => { setSel(i); handleReset(); }, [handleReset]);
 *
 * Converts to a string-based input for each field derived from EXAMPLES[sel],
 * injects ManualInputPanel, and keeps example buttons working by setting inputs.
 */
export function transformSelIndex(code, folder) {
  // 1. Detect the sel-index pattern
  const selRe = /const \[sel,\s*setSel\]\s*=\s*useState\((\d+)\)/
  if (!selRe.test(code)) return null

  // Find fields: `const { a, b } = EXAMPLES[sel]` or `const a = EXAMPLES[sel].x`
  // Also find fields referenced in generateSteps( ... )
  const genMatch = code.match(/generateSteps\(([^)]*)\)/)
  if (!genMatch) return null
  const genArgTokens = genMatch[1].split(',').map(s => s.trim())
  const genNames = genArgTokens.map(t => {
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)$/)
    return m ? m[1] : null
  }).filter(Boolean)

  if (!genNames.length) return null

  // Determine the field names as they appear in EXAMPLES[sel].X
  // Look at `const { a, b } = EXAMPLES[sel]` (destructure) or `const a = EXAMPLES[sel].a`
  const fieldMap = {} // localName -> exampleKey
  for (const name of genNames) {
    // const { name } = EXAMPLES[sel] -> key == name
    const destRe = new RegExp(`const \\{ [^}]*\\b${name}\\b[^}]* \\} = EXAMPLES\\[sel\\]`)
    if (destRe.test(code)) {
      fieldMap[name] = name
      continue
    }
    // const name = EXAMPLES[sel].key
    const assignRe = new RegExp(`const ${name} = EXAMPLES\\[sel\\]\\.([A-Za-z0-9_]+)`)
    const m = code.match(assignRe)
    if (m) { fieldMap[name] = m[1]; continue }
  }
  if (!Object.keys(fieldMap).length) return null

  // 2. Determine types from the first example value
  const examplesSrc = code.match(/const EXAMPLES\s*=\s*getExamples(?:Or)?\([^)]*\)/)
  // We'll infer types from EXAMPLES[0] usage; default to JSON-string for objects.
  const fields = Object.entries(fieldMap).map(([local, key]) => {
    return { name: local, key, type: 'array' }
  })

  // 3. Replace sel state with input states + parsing
  const inputStates = fields.map(f =>
    `const [${f.name}Input, set${cap(f.name)}Input] = useState(JSON.stringify(EXAMPLES[0]?.[${JSON.stringify(f.key)}] ?? null));`
  ).join('\n  ')

  const parseBody = fields.map(f => {
    if (f.type === 'array') {
      return `const parsed${cap(f.name)} = JSON.parse(${f.name}Input); if (!Array.isArray(parsed${cap(f.name)})) throw new Error('${f.name} must be an array');`
    }
    return `const parsed${cap(f.name)} = ${f.name}Input;`
  }).join('\n      ')
  const returnVals = fields.map(f => `${f.name}: parsed${cap(f.name)}`).join(', ')
  const fallbackVals = fields.map(f => `${f.name}: EXAMPLES[sel]?.${f.key}`).join(', ')
  const deps = fields.map(f => `${f.name}Input`).join(', ')

  const parseCode = `const { ${fields.map(f => f.name).join(', ')}, inputError } = useMemo(() => {
    try {
      ${parseBody}
      return { ${returnVals}, inputError: '' };
    } catch (e) {
      return { ${fallbackVals}, inputError: e.message };
    }
  }, [${deps}]);`

  // Replace `const [sel, setSel] = useState(0);` with sel + inputs + parse
  let out = code
  const selBlock = `const [sel, setSel] = useState(0);
  ${inputStates}
  ${parseCode}`
  out = out.replace(selRe, selBlock)

  // 4. Remove the original `const { a, b } = EXAMPLES[sel]` / `const a = EXAMPLES[sel].x` lines
  //    (the parsed values now provide a, b)
  for (const [local, key] of Object.entries(fieldMap)) {
    // remove `const { a, b } = EXAMPLES[sel];`
    const destLineRe = new RegExp(`const \\{ [^}]*\\b${local}\\b[^}]* \\} = EXAMPLES\\[sel\\];?\\n`)
    out = out.replace(destLineRe, '')
    // remove `const local = EXAMPLES[sel].key;`
    const assignLineRe = new RegExp(`const ${local} = EXAMPLES\\[sel\\]\\.${key};?\\n`)
    out = out.replace(assignLineRe, '')
  }

  // 5. applyExample sets the inputs (in addition to sel)
  const applyRe = /const applyExample\s*=\s*useCallback\(\(i\)\s*=>\s*\{\s*setSel\(i\);\s*handleReset\(\);\s*\},\s*\[handleReset\]\s*\);?/
  const inputSetters = fields.map(f => `set${cap(f.name)}Input(JSON.stringify(EXAMPLES[i].${f.key}))`).join('; ')
  const newApply = `const applyExample = useCallback((i) => { setSel(i); ${inputSetters}; handleReset(); }, [handleReset]);`
  if (applyRe.test(out)) {
    out = out.replace(applyRe, newApply)
  } else {
    // fallback: inject before generateSteps
    const stepsRe = /const steps\s*=/
    if (!stepsRe.test(out)) return null
    const stepsIdx = out.search(stepsRe)
    const lineStart = out.lastIndexOf('\n', stepsIdx) + 1
    out = out.slice(0, lineStart) + newApply + '\n  ' + out.slice(lineStart)
  }

  // 6. Inject ManualInputPanel (with examples, using applyExample)
  out = injectManualInputPanel(out, fields.map(f => ({ name: f.name, type: f.type })), 'ex', 'applyExample')

  return out
}
