import { cap } from './transform-lib.mjs'

/**
 * Find the start offset (index just after the opening '>') of the root element
 * in a `return ( ... )` JSX block. Robust against '>' inside quoted strings and {expr}.
 */
export function findRootDivStart(code, returnIndex) {
  let i = returnIndex
  if (code.startsWith('return', i)) i += 'return'.length
  while (i < code.length && /\s/.test(code[i])) i++
  if (code[i] === '(') {
    i++
    while (i < code.length && /\s/.test(code[i])) i++
  }
  if (code[i] === '<') {
    let j = i + 1
    let braceDepth = 0
    while (j < code.length) {
      const c = code[j]
      if (c === '"' || c === "'" || c === '`') {
        const quote = c
        j++
        while (j < code.length && code[j] !== quote) {
          if (code[j] === '\\') j++
          j++
        }
        j++
        continue
      }
      if (c === '{') { braceDepth++; j++; continue }
      if (c === '}') { braceDepth--; j++; continue }
      if (c === '>' && braceDepth === 0) return j + 1
      j++
    }
  }
  return -1
}

function removeExamplesMap(code) {
  const idx = code.indexOf('{EXAMPLES.map(')
  if (idx === -1) return { code, removed: false }
  let depth = 1
  let i = idx + 1
  while (i < code.length && depth > 0) {
    const c = code[i]
    if (c === '{') depth++
    else if (c === '}') depth--
    i++
  }
  if (depth !== 0) return { code, removed: false }
  return { code: code.slice(0, idx) + code.slice(i), removed: true }
}

/**
 * Inject <ManualInputPanel> into the file, targeting the main component's
 * primary/viz panel const (where the input state vars are in scope).
 * Wraps existing panel JSX in a fragment with MIP as the first child.
 *
 * If the fragment-wrap paren scanner fails (e.g. unbalanced `)` in JSX text),
 * it falls back to injecting MIP into the root element of the panel.
 */
export function injectManualInputPanel(code, fields, varName = 'ex', applyName = 'applyEx') {
  // Add import
  if (!/ManualInputPanel/.test(code)) {
    const cssImport = code.match(/(import\s+['"][^'"]*\.css['"];?)/)
    if (cssImport) {
      code = code.replace(cssImport[1], `${cssImport[1]}\nimport ManualInputPanel from '../../components/shared/ManualInputPanel'`)
    } else {
      const lastImport = code.match(/import[^;]*;\n/g)
      if (lastImport) {
        const idx = code.lastIndexOf(lastImport[lastImport.length - 1])
        code = code.slice(0, idx + lastImport[lastImport.length - 1].length) +
          `\nimport ManualInputPanel from '../../components/shared/ManualInputPanel'` +
          code.slice(idx + lastImport[lastImport.length - 1].length)
      } else {
        code = `import ManualInputPanel from '../../components/shared/ManualInputPanel'\n` + code
      }
    }
  }

  const fieldsJson = JSON.stringify(fields.map(f => ({ key: f.name, label: f.name, type: f.type })))
  const valuesObj = '{ ' + fields.map(f => `${f.name}: ${f.name}Input`).join(', ') + ' }'
  const onChangeFn = `(k, v) => { ${fields.map(f => `if (k === '${f.name}') set${cap(f.name)}Input(v)`).join('; ')}; handleReset(); }`

  const hasExistingExamples = /\{EXAMPLES\.map\(/.test(code)
  const showExamplesProp = hasExistingExamples ? 'showExamples={false}' : ''

  const mipJsx = `
      <ManualInputPanel
        fields={${fieldsJson}}
        values={${valuesObj}}
        onChange={${onChangeFn}}
        examples={EXAMPLES}
        activeLabel={${varName}?.label}
        applyExample={${applyName}}
        inputError={inputError}
        ${showExamplesProp}
      />
`

  if (!hasExistingExamples) {
    const { code: c2, removed } = removeExamplesMap(code)
    if (removed) code = c2
  }

  // Try fragment-wrap on the panel const first (safe: matches a `const x = (` statement)
  const panelConstRe = /const (primaryPanel|vizPanel|leftPanel|centerPanel)\s*=\s*\(/
  const panelMatch = code.match(panelConstRe)
  if (panelMatch) {
    const openParen = panelMatch.index + panelMatch[0].length - 1
    let depth = 0
    let i = openParen
    while (i < code.length) {
      const c = code[i]
      if (c === '(') depth++
      else if (c === ')') {
        depth--
        if (depth === 0) break
      }
      i++
    }
    if (i < code.length) {
      const insertAt = openParen + 1
      const closeAt = i
      code = code.slice(0, insertAt) + '\n    <>\n' + mipJsx + code.slice(insertAt, closeAt) + '\n    </>' + code.slice(closeAt)
      return code
    }
  }

  // Fallback (safe): inject into root div of the component's `return (`
  const fnStart = code.search(/export default function/)
  let searchFrom = 0
  if (fnStart !== -1) {
    const fnBody = code.slice(fnStart)
    const ret = fnBody.search(/\breturn\s*\(/)
    if (ret !== -1) searchFrom = fnStart + ret
  }
  if (searchFrom >= 0) {
    const rootStart = findRootDivStart(code, searchFrom)
    if (rootStart !== -1) {
      code = code.slice(0, rootStart) + mipJsx + code.slice(rootStart)
    }
  }

  return code
}
