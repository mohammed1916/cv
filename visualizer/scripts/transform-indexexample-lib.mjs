import { cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Transform "index-into-EXAMPLES" files:
 *   const [exIdx, setExIdx] = useState(0)
 *   const ex = EXAMPLES[exIdx]                 (or const example = ...)
 *   generateSteps(ex.nums) / generateSteps(example.input)
 *   applyExample = (idx) => { setExIdx(idx); handleReset() }
 *
 * Converts to string-based inputs for each field, injects ManualInputPanel.
 * The example buttons keep calling applyExample(idx) which now also sets inputs.
 */
export function transformIndexExample(code, folder) {
  // 1. Find the index state var: const [X, setX] = useState(0)  (camelCase setter)
  const idxRe = /const \[(\w+),\s*set\w+\]\s*=\s*useState\((\d+)\)/
  const idxMatch = code.match(idxRe)
  if (!idxMatch) return null
  const idxVar = idxMatch[1]
  const setIdxVar = 'set' + cap(idxVar)
  // ensure it's used to index EXAMPLES
  if (!new RegExp(`EXAMPLES\\[${idxVar}\\]`).test(code)) return null

  // 2. Find the example object var: const ex = EXAMPLES[idx] or const example = ...
  const objRe = new RegExp(`const (\\w+) = EXAMPLES\\[${idxVar}\\]`)
  const objMatch = code.match(objRe)
  const objVar = objMatch ? objMatch[1] : 'ex'
  if (!objMatch) return null

  // 3. Find fields referenced as <objVar>.field used in generateSteps
  //    (search only the component body, after `export default function`)
  const compStart = code.search(/export default function/)
  const compBody = compStart >= 0 ? code.slice(compStart) : code
  const genMatch = compBody.match(/generateSteps\(([^)]*)\)/)
  if (!genMatch) return null
  const genTokens = genMatch[1].split(',').map(s => s.trim())
  const fieldNames = []
  for (const t of genTokens) {
    const m = t.match(new RegExp(`^${objVar}\\.([A-Za-z_][A-Za-z0-9_]*)`))
    if (m) fieldNames.push(m[1])
  }
  if (!fieldNames.length) return null

  // Determine types from EXAMPLES[0] value
  const fields = fieldNames.map(name => {
    let type = 'array'
    try {
      const src = code.match(/const EXAMPLES\s*=\s*getExamples(?:Or)?\([^)]*\)\s*[;]?/)
      // fallback: default to array/string by name heuristics
      if (/^(s|t|w1|w2|word|text|str|input|expression|secret|guess|queryIP|url|version1|version2|ring|key|path)$/.test(name)) type = 'string'
      else if (/^(n|k|m|target|numCourses|bad|val|num|duration|x|radius|area)$/.test(name)) type = 'number'
    } catch { /* ignore */ }
    return { name, key: name, type }
  })

  // 4. Replace index state with index + input states + parsing
  const inputStates = fields.map(f =>
    `const [${f.name}Input, set${cap(f.name)}Input] = useState("");`
  ).join('\n  ')

  const parseBody = fields.map(f => {
    if (f.type === 'array') {
      return `const parsed${cap(f.name)} = JSON.parse(${f.name}Input); if (!Array.isArray(parsed${cap(f.name)})) throw new Error('${f.name} must be an array');`
    }
    if (f.type === 'number') {
      return `const parsed${cap(f.name)} = Number(${f.name}Input); if (isNaN(parsed${cap(f.name)})) throw new Error('${f.name} must be a number');`
    }
    return `const parsed${cap(f.name)} = ${f.name}Input;`
  }).join('\n      ')
  const returnVals = fields.map(f => `${f.name}: parsed${cap(f.name)}`).join(', ')
  const fallbackVals = fields.map(f => `${f.name}: EXAMPLES[${idxVar}]?.${f.key} ?? ''`).join(', ')
  const deps = fields.map(f => `${f.name}Input`).join(', ')

  const parseCode = `const { ${fields.map(f => f.name).join(', ')}, inputError } = useMemo(() => {
    try {
      ${parseBody}
      return { ${returnVals}, inputError: '' };
    } catch (e) {
      return { ${fallbackVals}, inputError: e.message };
    }
  }, [${deps}]);`

  let out = code
  const idxBlock = `const [${idxVar}, ${setIdxVar}] = useState(0)
  ${inputStates}
  ${parseCode}`
  out = out.replace(idxRe, idxBlock)

  // 4b. Replace <objVar>.field references with parsed field names (in component
  //     body). Keep `const ex = EXAMPLES[idx]` for activeLabel/example highlight.
  const compStart3 = out.search(/export default function/)
  const compSlice = compStart3 >= 0 ? out.slice(compStart3) : out
  let newComp = compSlice
  for (const f of fields) {
    const re = new RegExp(`${objVar}\\.${f.key}`, 'g')
    newComp = newComp.replace(re, f.name)
  }
  if (compStart3 >= 0) out = out.slice(0, compStart3) + newComp

  // 5. Seed inputs from EXAMPLES[0] on mount? Instead, seed in useState default is empty.
  //    To keep it working without clicking, initialize from EXAMPLES[0] via lazy init is complex.
  //    We'll set the default in applyExample AND also in an initial effect via useState default.
  //    Simpler: seed defaults directly:
  out = out.replace(
    new RegExp(`const \\[(${fields.map(f => f.name).join('|')})Input, set\\w+\\] = useState\\(\"\"\\)`),
    (m, fname) => {
      const f = fields.find(x => x.name === fname)
      const def = f.type === 'array' ? 'JSON.stringify(EXAMPLES[0]?.' + f.key + ' ?? [])' : f.type === 'number' ? 'String(EXAMPLES[0]?.' + f.key + ' ?? 0)' : `EXAMPLES[0]?.${f.key} ?? ''`
      return `const [${f.name}Input, set${cap(f.name)}Input] = useState(${def})`
    }
  )

  // 6. Update applyExample to also set inputs
  const applyName = code.includes('applyExample') ? 'applyExample' : 'applyEx'
  const applyRe = new RegExp(`const ${applyName}\\s*=\\s*useCallback\\(\\s*\\(\\w+\\)\\s*=>\\s*\\{\\s*${setIdxVar}\\(\\1\\);\\s*handleReset\\(\\)\\s*;?\\s*\\}\\s*,\\s*\\[handleReset\\]\\s*\\);?`)
  const inputSetters = fields.map(f => `set${cap(f.name)}Input(${f.type === 'array' ? 'JSON.stringify(EXAMPLES[i].' + f.key + ')' : 'String(EXAMPLES[i].' + f.key + ')'})`).join('; ')
  const newApply = `const ${applyName} = useCallback((i) => { ${setIdxVar}(i); ${inputSetters}; handleReset(); }, [handleReset]);`

  const compStart2 = out.search(/export default function/)
  const compBody2 = compStart2 >= 0 ? out.slice(compStart2) : out
  if (new RegExp(`const ${applyName}\\s*=\\s*useCallback\\(\\s*\\(\\w+\\)\\s*=>\\s*\\{\\s*${setIdxVar}\\(`).test(compBody2)) {
    // replace the existing applyExample within component body
    const bodyStart = compStart2 >= 0 ? compStart2 : 0
    const localRe = new RegExp(`const ${applyName}\\s*=\\s*useCallback\\(\\s*\\(\\w+\\)\\s*=>\\s*\\{`)
    const m = localRe.exec(out)
    if (m) {
      // find matching closing `}, [handleReset])` 
      const closeRe = new RegExp(`\\},\\s*\\[handleReset\\]\\s*\\)`)
      const fromIdx = m.index + m[0].length
      const closeMatch = closeRe.exec(out.slice(fromIdx))
      if (closeMatch) {
        const end = fromIdx + closeMatch.index + closeMatch[0].length
        out = out.slice(0, m.index) + newApply + out.slice(end)
      }
    }
  } else {
    // inject into component body before `const steps`
    const stepsRe = /const steps\s*=/
    const stepsMatch = stepsRe.exec(compBody2)
    if (stepsMatch) {
      const stepsIdx = compStart2 + stepsMatch.index
      const lineStart = out.lastIndexOf('\n', stepsIdx) + 1
      out = out.slice(0, lineStart) + newApply + '\n  ' + out.slice(lineStart)
    } else {
      return null
    }
  }

  // 7. Inject ManualInputPanel
  out = injectManualInputPanel(out, fields.map(f => ({ name: f.name, type: f.type })), objVar, applyName)

  return out
}
