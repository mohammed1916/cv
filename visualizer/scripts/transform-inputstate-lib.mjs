import { typesFile, buildInputBlock, cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Transform an inputState file:
 *   const [input, setInput] = useState(EXAMPLES[0]?.root || [3,9,20,null,null,15,7])
 *   generateSteps(input) / generateSteps(input.root, input.targetSum) / buildList(input.head)
 *   applyEx = (e) => { setInput(e.root); handleReset() }
 *
 * Strategy: detect the fields from `input.<field>` references (excluding label).
 * Replace state with per-field string inputs + parsing, and update references.
 */
export function transformInputState(code, folder) {
  // Detect field references
  const refs = [...code.matchAll(/\binput\.([A-Za-z_][A-Za-z0-9_]*)/g)].map(m => m[1])
  let fieldNames = [...new Set(refs)].filter(n => n !== 'label')

  // If no object refs, it's a raw-value input. Infer field from generateSteps arg.
  if (fieldNames.length === 0) {
    // generateSteps(input) with a raw value - the field is the algorithm's arg
    const gen = code.match(/generateSteps\(input\)/)
    if (gen) {
      // We don't know the internal name; use a generic 'input' field
      fieldNames = ['input']
    } else {
      // buildList(input.head), input.val etc already caught by refs
      return null
    }
  }

  // Get types from ground truth
  const info = typesFile[folder]
  const example = info?.example ?? {}

  const fields = fieldNames.map(name => {
    const v = example ? example[name] : undefined
    let type = info?.types?.[name]
    if (!type) {
      type = Array.isArray(v) ? 'array' : typeof v === 'number' ? 'number' : 'string'
    }
    return { name, type }
  })

  const { stateCode, parseCode } = buildInputBlock(fields, [example])

  // 1. Replace `const [input, setInput] = useState(...)` line
  const stateRe = /const \[input,\s*setInput\]\s*=\s*useState\([\s\S]*?\)\n/
  if (!stateRe.test(code)) return null
  const stateBlock = `const [input, setInput] = useState(${JSON.stringify(example) || 'null'});
  ${stateCode}
  ${parseCode}`
  code = code.replace(stateRe, stateBlock)

  // 2. Replace generateSteps(input) -> generateSteps(field) or generateSteps({...})
  //    For single-field raw input, map generateSteps(input) -> generateSteps(<field>)
  //    For multi-field, map generateSteps(input) -> generateSteps({a, b}) only if whole-object
  const genWholeRe = /generateSteps\(input\)/
  if (genWholeRe.test(code)) {
    if (fields.length === 1) {
      code = code.replace(genWholeRe, `generateSteps(${fields[0].name})`)
    } else {
      code = code.replace(genWholeRe, `generateSteps({ ${fields.map(f => f.name).join(', ')} })`)
    }
  }

  // 3. Replace input.field references with field
  for (const f of fields) {
    code = code.split(`input.${f.name}`).join(f.name)
  }

  // 4. Remove redundant `const X = X` lines
  const redundantRe = /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1(?:\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\2)*\s*;?\n/g
  code = code.replace(redundantRe, '')

  // 5. Replace deps [input] -> [fields]
  const depNames = fields.map(f => f.name).join(', ')
  code = code.replace(/\[input\]/g, `[${depNames}]`)

  // 6. Replace applyEx / applyExample callbacks
  const applyRe = /const apply(?:Ex|Example)\s*=\s*useCallback\(\(e\)\s*=>\s*\{\s*setInput\([^;]*\);\s*handleReset\(\)\s*;?\s*\},\s*\[handleReset\]\s*\);?/
  const inputSetters = fields.map(f => `set${cap(f.name)}Input(${serializeForSetter(f.type, 'e.' + f.name)})`).join('; ')
  const applyName = code.includes('applyExample') ? 'applyExample' : 'applyEx'
  const newApply = `const ${applyName} = useCallback((e) => { ${inputSetters}; handleReset(); }, [handleReset]);`
  if (applyRe.test(code)) {
    code = code.replace(applyRe, newApply)
  } else {
    const stepsRe = /const steps\s*=/
    if (!stepsRe.test(code)) return null
    const stepsIdx = code.search(stepsRe)
    const lineStart = code.lastIndexOf('\n', stepsIdx) + 1
    code = code.slice(0, lineStart) + newApply + '\n  ' + code.slice(lineStart)
  }

  // 7. Inject ManualInputPanel
  code = injectManualInputPanel(code, fields, 'input', applyName)

  return code
}

function serializeForSetter(type, expr) {
  if (type === 'array') return `JSON.stringify(${expr})`
  return `String(${expr})`
}
