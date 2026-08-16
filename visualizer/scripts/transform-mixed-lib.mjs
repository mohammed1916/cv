import { cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Transform "mixed-setter" files: they already have
 *   const [word, setWord] = useState("apple")
 *   const [nums] = useState([1,2,3])   (or with setter)
 *   generateSteps(word, nums)
 * but no text input UI.
 *
 * Strategy: for each state var referenced in generateSteps(...) (or that
 * clearly feeds it), convert to a string-based input state + parsing that
 * produces the same variable name, then inject ManualInputPanel.
 */
export function transformMixed(code, folder) {
  // 1. Find fields referenced in generateSteps( ... )
  const genMatches = [...code.matchAll(/generateSteps\(([^)]*)\)/g)]
  const genArgs = genMatches.map(m => m[1]).join(', ')
  if (!genArgs.trim()) return null

  const argTokens = genArgs.split(',').map(s => s.trim().replace(/^[a-zA-Z]+\(/, '').replace(/\)$/, ''))
  const names = [...new Set(argTokens.map(t => {
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)$/)
    return m ? m[1] : null
  }).filter(Boolean))]

  if (!names.length) return null

  // 2. Find useState declarations for those names
  const fields = []
  for (const name of names) {
    const re = new RegExp(`const \\[${name}(?:,\\s*set${cap(name)})?\\]\\s*=\\s*useState\\(([^)]*)\\)`)
    const m = code.match(re)
    if (!m) continue
    const defaultSrc = m[1].trim()
    let type = 'string'
    let defaultValue = defaultSrc
    if (/^\[/.test(defaultSrc)) { type = 'array'; try { defaultValue = JSON.stringify(eval('(' + defaultSrc + ')')) } catch { /* keep */ } }
    else if (/^[-\d]/.test(defaultSrc)) { type = 'number'; defaultValue = defaultSrc }
    else if (/^['"]/.test(defaultSrc)) { type = 'string'; defaultValue = defaultSrc }
    fields.push({ name, type, defaultSrc, defaultValue })
  }

  if (!fields.length) return null

  // 3. Convert each useState for these fields to a string input state
  let out = code
  for (const f of fields) {
    const re = new RegExp(`const \\[${f.name}(?:,\\s*set${cap(f.name)})?\\]\\s*=\\s*useState\\([^)]*\\)(;?)`)
    const replacement = `const [${f.name}Input, set${cap(f.name)}Input] = useState(${serializeDefault(f)})`
    if (re.test(out)) {
      out = out.replace(re, (m, semi) => `${replacement}${semi || ';'}`)
    }
  }

  // 4. Add parsing useMemo that produces the typed values (same names as before)
  const parseBody = fields.map(f => {
    const parsedName = 'parsed' + cap(f.name)
    if (f.type === 'array') return `const ${parsedName} = JSON.parse(${f.name}Input); if (!Array.isArray(${parsedName})) throw new Error('${f.name} must be an array');`
    if (f.type === 'number') return `const ${parsedName} = Number(${f.name}Input); if (isNaN(${parsedName})) throw new Error('${f.name} must be a number');`
    return `const ${parsedName} = ${f.name}Input;`
  }).join('\n      ')
  const returnVals = fields.map(f => `${f.name}: parsed${cap(f.name)}`).join(', ')
  const fallbackVals = fields.map(f => `${f.name}: ${f.defaultValue}`).join(', ')
  const deps = fields.map(f => `${f.name}Input`).join(', ')

  const parseCode = `const { ${fields.map(f => f.name).join(', ')}, inputError } = useMemo(() => {
    try {
      ${parseBody}
      return { ${returnVals}, inputError: '' };
    } catch (e) {
      return { ${fallbackVals}, inputError: e.message };
    }
  }, [${deps}]);`

  // Insert parse block after the last field's useState declaration
  const lastFieldIdx = Math.max(...fields.map(f => out.indexOf(`${f.name}Input, set${cap(f.name)}Input] = useState`)))
  const lineEnd = out.indexOf('\n', lastFieldIdx)
  out = out.slice(0, lineEnd + 1) + `  ${parseCode}\n` + out.slice(lineEnd + 1)

  // 6. Inject ManualInputPanel
  out = injectManualInputPanel(out, fields.map(f => ({ name: f.name, type: f.type })), 'ex', 'applyEx')

  return out
}

function parseDefault(f) {
  if (f.type === 'array') return f.defaultValue
  if (f.type === 'number') return f.defaultValue
  return f.defaultSrc
}

function serializeDefault(f) {
  // Return a JS expression that produces the default string value
  const raw = parseDefault(f)
  if (f.type === 'string') {
    // defaultSrc already includes quotes like "apple"; re-emit as a JS string literal
    let unquoted
    try { unquoted = eval(raw) } catch { unquoted = raw.replace(/^['"]|['"]$/g, '') }
    return JSON.stringify(String(unquoted))
  }
  if (f.type === 'array') return JSON.stringify(raw)  // raw is a JSON string like [1,2,3]
  return raw // number
}
