import { cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Transform the "currentExample" pattern used across many problems:
 *   const examples = useMemo(() => getExamplesOr('251', []), [])
 *   const [currentExample, setCurrentExample] = useState(0)
 *   const [currentStep, setCurrentStep] = useState(0)
 *   const example = examples[currentExample] || { input: [], output: [] }
 *   const steps = useMemo(() => generateSteps(example.input), [example])
 *
 * Converts to string inputs + ManualInputPanel.
 */
export function transformCurrentExample(code, folder) {
  // Detect the index state
  const idxRe = /const \[(\w+),\s*set\1\]\s*=\s*useState\(0\)\s*\n\s*const \[currentStep,\s*setCurrentStep\]/
  // but setter may be camelCase: setCurrentExample
  const idxRe2 = /const \[(currentExample|exampleIdx|activeExample|selectedExample),\s*set\w+\]\s*=\s*useState\(0\)/
  const m = code.match(idxRe2)
  if (!m) return null
  const idxVar = m[1]
  const setIdxVar = 'set' + cap(idxVar)

  // Find examples source var: `const examples = useMemo(...)` OR `const EXAMPLES = getExamples...`
  let examplesVar = null
  const exLower = code.match(/const (examples|exampleList|sampleData)\s*=\s*useMemo\(\(\)\s*=>\s*getExamplesOr\(/)
  const exUpper = code.match(/const (EXAMPLES)\s*=\s*getExamples(?:Or)?\(/)
  if (exLower) examplesVar = exLower[1]
  else if (exUpper) examplesVar = exUpper[1]
  if (!examplesVar) return null

  // Find example object var and its fields used in generateSteps
  const objRe = new RegExp(`const (\\w+) = ${examplesVar}\\[${idxVar}\\]`)
  const objMatch = code.match(objRe)
  if (!objMatch) return null
  const objVar = objMatch[1]

  const compStart = code.search(/export default function/)
  const compBody = compStart >= 0 ? code.slice(compStart) : code
  const genMatch = compBody.match(/generateSteps\(([^)]*)\)/)
  if (!genMatch) return null
  const genTokens = genMatch[1].split(',').map(s => s.trim())
  const fieldNames = []
  for (const t of genTokens) {
    const fm = t.match(new RegExp(`^${objVar}\\.([A-Za-z_][A-Za-z0-9_]*)`))
    if (fm) fieldNames.push(fm[1])
  }
  if (!fieldNames.length) return null

  // Types by name heuristics
  const fields = fieldNames.map(name => {
    let type = 'array'
    if (/^(input|nums|arr|list|intervals|matrix|grid|board|words|prices|gas|cost|points|tokens|strs|schedules|logs)$/.test(name)) type = 'array'
    else if (/^(n|k|m|num|target|val|bad|x|duration|numRows)$/.test(name)) type = 'number'
    else type = 'string'
    return { name, key: name, type }
  })

  // Build replacement
  const inputStates = fields.map(f =>
    `const [${f.name}Input, set${cap(f.name)}Input] = useState("");`
  ).join('\n  ')

  const parseBody = fields.map(f => {
    if (f.type === 'array') return `const parsed${cap(f.name)} = JSON.parse(${f.name}Input); if (!Array.isArray(parsed${cap(f.name)})) throw new Error('${f.name} must be an array');`
    if (f.type === 'number') return `const parsed${cap(f.name)} = Number(${f.name}Input); if (isNaN(parsed${cap(f.name)})) throw new Error('${f.name} must be a number');`
    return `const parsed${cap(f.name)} = ${f.name}Input;`
  }).join('\n      ')
  const returnVals = fields.map(f => `${f.name}: parsed${cap(f.name)}`).join(', ')
  const fallbackVals = fields.map(f => `${f.name}: ${examplesVar}[${idxVar}]?.${f.key} ?? ''`).join(', ')
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
  // Insert after the currentExample state line
  const idxLineRe = new RegExp(`(const \\[${idxVar},\\s*set\\w+\\]\\s*=\\s*useState\\(0\\))`)
  out = out.replace(idxLineRe, (m) => `${m}
  ${inputStates}
  ${parseCode}`)

  // Seed defaults from examples[0]
  out = out.replace(
    new RegExp(`const \\[(${fields.map(f => f.name).join('|')})Input,\\s*set\\w+\\] = useState\\(\"\"\\)`),
    (m, fname) => {
      const f = fields.find(x => x.name === fname)
      const def = f.type === 'array' ? `JSON.stringify(${examplesVar}[0]?.${f.key} ?? [])` : f.type === 'number' ? `String(${examplesVar}[0]?.${f.key} ?? 0)` : `${examplesVar}[0]?.${f.key} ?? ''`
      return `const [${f.name}Input, set${cap(f.name)}Input] = useState(${def})`
    }
  )

  // Replace example.field refs with parsed fields (component body)
  const compStart2 = out.search(/export default function/)
  const compSlice2 = compStart2 >= 0 ? out.slice(compStart2) : out
  let newComp2 = compSlice2
  for (const f of fields) {
    newComp2 = newComp2.split(`${objVar}.${f.key}`).join(f.name)
  }
  // fix deps [example] -> [field1, field2]
  const depNames = fields.map(f => f.name).join(', ')
  newComp2 = newComp2.replace(new RegExp(`\\[${objVar}\\]`, 'g'), `[${depNames}]`)
  if (compStart2 >= 0) out = out.slice(0, compStart2) + newComp2

  // applyExample: find and update to set inputs. Pattern: applyExample = (i) => { setCurrentExample(i); handleReset() }
  const applyName = code.includes('applyExample') ? 'applyExample' : 'applyEx'
  const inputSetters = fields.map(f => `set${cap(f.name)}Input(${f.type === 'array' ? 'JSON.stringify(' + examplesVar + '[i].' + f.key + ')' : 'String(' + examplesVar + '[i].' + f.key + ')'})`).join('; ')
  const newApply = `const ${applyName} = useCallback((i) => { ${setIdxVar}(i); ${inputSetters}; handleReset(); }, [handleReset]);`

  const body2 = compStart2 >= 0 ? out.slice(compStart2) : out
  const existingApply = new RegExp(`const ${applyName}\\s*=\\s*useCallback\\(\\s*\\(\\w+\\)\\s*=>\\s*\\{`)
  if (existingApply.test(body2)) {
    const m2 = existingApply.exec(body2)
    const fromIdx = compStart2 + m2.index + m2[0].length
    const closeRe = new RegExp(`\\},\\s*\\[handleReset\\]\\s*\\)`)
    const closeMatch = closeRe.exec(out.slice(fromIdx))
    if (closeMatch) {
      const end = fromIdx + closeMatch.index + closeMatch[0].length
      out = out.slice(0, compStart2 + m2.index) + newApply + out.slice(end)
    }
  } else {
    const stepsRe = /const steps\s*=/
    const sm = stepsRe.exec(body2)
    if (sm) {
      const stepsIdx = compStart2 + sm.index
      const lineStart = out.lastIndexOf('\n', stepsIdx) + 1
      out = out.slice(0, lineStart) + newApply + '\n  ' + out.slice(lineStart)
    } else return null
  }

  // Inject ManualInputPanel
  out = injectManualInputPanel(out, fields.map(f => ({ name: f.name, type: f.type })), objVar, applyName)

  return out
}
