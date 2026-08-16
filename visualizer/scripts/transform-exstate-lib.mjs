import { typesFile, buildInputBlock, cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/** Determine fields + types for a folder from ground truth, merged with actual
 * `<var>.` references in the code (more reliable for field names).
 * Also infers types/values from the `EXAMPLES[0] || {fallback}` object literal
 * when code-derived names don't appear in the registry (e.g. fallback `arr` vs registry `tree`). */
export function fieldsForFolder(folder, code, varName, stateLine) {
  const info = typesFile[folder]
  let names = []
  if (code && varName) {
    const re = new RegExp(`\\b${varName}\\.([A-Za-z_][A-Za-z0-9_]*)`, 'g')
    const refs = [...code.matchAll(re)].map(m => m[1])
    names = [...new Set(refs)].filter(n => n !== 'label')
  }
  const infoNames = info && info.types ? Object.keys(info.types) : []
  if (names.length === 0) names = infoNames

  // Parse fallback object literal from state line: `EXAMPLES[0] || { arr: [5,2,-3] }`
  let fallbackObj = null
  if (stateLine) {
    const fbMatch = stateLine.match(/\|\|\s*(\{[\s\S]*?\})/)
    if (fbMatch) {
      try { fallbackObj = eval('(' + fbMatch[1] + ')') } catch { /* ignore */ }
    }
  }

  return names.map(name => {
    let type = info && info.types ? info.types[name] : undefined
    if (!type && fallbackObj && name in fallbackObj) {
      const v = fallbackObj[name]
      type = Array.isArray(v) ? 'array' : typeof v === 'number' ? 'number' : 'string'
    }
    return { name, type: type || 'string' }
  })
}

function replaceRefs(code, fields, varName) {
  let out = code
  for (const f of fields) {
    out = out.split(`${varName}.${f.name}`).join(f.name)
  }
  return out
}

function serializeForSetter(type, expr) {
  if (type === 'array') return `JSON.stringify(${expr})`
  return `String(${expr})`
}

/** Remove now-redundant destructuring lines like `const s = s, t = t;` */
function removeRedundant(code) {
  const redundantRe = /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1(?:\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\2)*\s*;?\n/g
  return code.replace(redundantRe, '')
}

/**
 * Transform an exOnly-style file. `varName` is 'ex' or 'input'.
 * The pattern is:
 *   const [ex, setEx] = useState(EXAMPLES[0]);   (or const [input, setInput] = ...)
 *   generateSteps(ex.a, ex.b) / input.a
 *   applyEx = (e) => { setEx(e); handleReset(); }
 */
export function transformExState(code, folder, varName = 'ex') {
  const setVar = 'set' + varName.charAt(0).toUpperCase() + varName.slice(1)

  // Extract the state line (supports EXAMPLES[0] and EXAMPLES[0] || {fallback})
  const stateLineRe = new RegExp(`const \\[${varName},\\s*${setVar}\\]\\s*=\\s*useState\\(([^;]*?)\\)`)
  const stateLineMatch = code.match(stateLineRe)
  if (!stateLineMatch) return null
  const stateLine = stateLineMatch[1]

  const fields = fieldsForFolder(folder, code, varName, stateLine)
  if (!fields.length) return null

  // Build defaults: try registry example values first, then fallback object values
  const example = typesFile[folder]?.example ?? {}
  const fbMatch = stateLine.match(/\|\|\s*(\{[\s\S]*?\})/)
  let fallbackObj = null
  if (fbMatch) { try { fallbackObj = eval('(' + fbMatch[1] + ')') } catch { /* ignore */ } }

  const buildDefaults = fields.map(f => {
    const v = (example && f.name in example) ? example[f.name] : (fallbackObj && f.name in fallbackObj) ? fallbackObj[f.name] : undefined
    return { ...f, defaultValue: v }
  })

  const { stateCode, parseCode } = buildInputBlock(buildDefaults, [example])

  // 1. Replace the state line (supports `EXAMPLES[0]` and `EXAMPLES[0] || {...}` fallback)
  const stateRe = new RegExp(`const \\[${varName},\\s*${setVar}\\]\\s*=\\s*useState\\(EXAMPLES\\[0\\]\\s*(?:\\|\\|\\s*\\{[^}]*\\})?\\);?`)
  if (!stateRe.test(code)) return null
  const stateBlock = `const [${varName}, ${setVar}] = useState(EXAMPLES[0]);
  ${stateCode}
  ${parseCode}`
  code = code.replace(stateRe, stateBlock)

  // 2. Handle whole-object form generateSteps(ex) / generateSteps(input)
  const genObjectRe = new RegExp(`generateSteps\\(${varName}\\)`)
  if (genObjectRe.test(code)) {
    const argNames = fields.map(f => f.name)
    code = code.replace(genObjectRe, `generateSteps({ ${argNames.join(', ')} })`)
  }

  // 3. Replace var.field references
  code = replaceRefs(code, fields, varName)

  // 3b. Remove redundant destructuring lines
  code = removeRedundant(code)

  // 4. Replace deps [var] -> [fields]
  const depNames = fields.map(f => f.name).join(', ')
  code = code.replace(new RegExp(`\\[${varName}\\]`, 'g'), `[${depNames}]`)

  // 5. Replace applyEx/applyInput
  const applyName = 'apply' + varName.charAt(0).toUpperCase() + varName.slice(1)
  const applyRe = new RegExp(`const ${applyName}\\s*=\\s*useCallback\\(\\s*\\(e\\)\\s*=>\\s*\\{\\s*${setVar}\\(e\\)\\s*;\\s*handleReset\\(\\)\\s*;?\\s*\\},\\s*\\[handleReset\\]\\s*\\);?`)
  const inputSetters = fields.map(f => `set${cap(f.name)}Input(${serializeForSetter(f.type, 'e.' + f.name)})`).join('; ')
  const newApply = `const ${applyName} = useCallback((e) => { ${setVar}(e); ${inputSetters}; handleReset(); }, [handleReset]);`
  if (applyRe.test(code)) {
    code = code.replace(applyRe, newApply)
  } else {
    // Inject applyEx before `const steps`
    const stepsRe = /const steps\s*=/
    if (!stepsRe.test(code)) return null
    const stepsIdx = code.search(stepsRe)
    const lineStart = code.lastIndexOf('\n', stepsIdx) + 1
    code = code.slice(0, lineStart) + newApply + '\n  ' + code.slice(lineStart)
  }

  // 6. Inject ManualInputPanel
  code = injectManualInputPanel(code, fields, varName, applyName)

  return code
}
