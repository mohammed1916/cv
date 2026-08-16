import fs from 'fs'
import path from 'path'

/**
 * Transformation engine for adding manual input to visualizers.
 * Handles the three main patterns:
 *  - exOnly:   const [ex, setEx] = useState(EXAMPLES[0]); generateSteps(ex.a, ex.b)
 *  - inputState: const [input, setInput] = useState(EXAMPLES[0]?.root || ...)
 *  - hardcodedOrOther: const [nums] = useState([...]) etc (no setters)
 *
 * Usage: node scripts/transform-manual-input.mjs [--batch exOnly|inputState|hardcoded] [--dry-run]
 */

const problemsDir = path.resolve('src/problems')
const report = JSON.parse(fs.readFileSync(path.resolve('scripts/manual-input-report.json'), 'utf8'))
const typesFile = JSON.parse(fs.readFileSync(path.resolve('scripts/field-types.json'), 'utf8'))

const WITHOUT = new Set(report.without.map(p => p.folder))

// ---- helpers -------------------------------------------------------------

function findJsx(folder) {
  const dir = path.join(problemsDir, folder)
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir)
  const jf = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css') && f !== 'index.jsx')
  return jf ? path.join(dir, jf) : null
}

function serializeDefault(fieldType, value) {
  if (fieldType === 'array') return JSON.stringify(JSON.stringify(value ?? []))
  if (fieldType === 'number') return String(value ?? 0)
  if (fieldType === 'boolean') return String(value ?? false)
  return JSON.stringify(String(value ?? ''))
}

/** Generate the parse expression for a single field */
function parseExpr(field, fieldType, errorVar) {
  const varName = field
  if (fieldType === 'array') {
    return `const parsed${cap(field)} = JSON.parse(${field}Input); if (!Array.isArray(parsed${cap(field)})) throw new Error('${field} must be an array');`
  }
  if (fieldType === 'number') {
    return `const parsed${cap(field)} = Number(${field}Input); if (isNaN(parsed${cap(field)})) throw new Error('${field} must be a number');`
  }
  if (fieldType === 'boolean') {
    return `const parsed${cap(field)} = ${field}Input === 'true';`
  }
  // string - direct
  return `const parsed${cap(field)} = ${field}Input;`
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Build the input-state + parsing block given fields: [{name, type, defaultValue}]
 * Returns { stateCode, parseCode, valuesCode }
 */
function buildInputBlock(fields, examples) {
  const defaultExample = examples?.[0] ?? {}
  const valFor = (f) => (f.defaultValue !== undefined ? f.defaultValue : defaultExample[f.name])
  const stateCode = fields
    .map(f => {
      const def = valFor(f)
      return `const [${f.name}Input, set${cap(f.name)}Input] = useState(${serializeDefault(f.type, def)});`
    })
    .join('\n  ')

  const parseBody = fields.map(f => parseExpr(f.name, f.type)).join('\n      ')
  const returnValues = fields.map(f => `${f.name}: parsed${cap(f.name)}`).join(', ')
  const fallbackValues = fields.map(f => `${f.name}: ${serializeDefault(f.type, valFor(f))}`).join(', ')
  const deps = fields.map(f => `${f.name}Input`).join(', ')

  const parseCode = `const { ${fields.map(f => f.name).join(', ')}, inputError } = useMemo(() => {
    try {
      ${parseBody}
      return { ${returnValues}, inputError: '' };
    } catch (e) {
      return { ${fallbackValues}, inputError: e.message };
    }
  }, [${deps}]);`

  return { stateCode, parseCode }
}

/** Detect pattern for a file */
function detectPattern(code) {
  if (/const \[ex,\s*setEx\]\s*=\s*useState\(EXAMPLES\[0\]\)/.test(code)) return 'exOnly'
  if (/const \[input,\s*setInput\]\s*=\s*useState\(/.test(code)) return 'inputState'
  if (/const \[(\w+),\s*set\1\]\s*=\s*useState\(/.test(code)) return 'namedInputState'
  return 'hardcodedOrOther'
}

export { WITHOUT, typesFile, findJsx, detectPattern, buildInputBlock, cap }
