import fs from 'fs'
import { WITHOUT, findJsx, cap } from './transform-lib.mjs'

/**
 * Fix bad raw-value inputState transforms where the field was named `input`
 * but generateSteps expects a specific parameter (root, nums, n, cost, etc.).
 *
 * The generated (bad) code looks like:
 *   const [input, setInput] = useState({...});
 *   const [inputInput, setInputInput] = useState("");
 *   const { input, inputError } = useMemo(() => {
 *     try { const parsedInput = inputInput; return { input: parsedInput, ... }; }
 *     ...
 *   }, [inputInput]);
 *   const steps = useMemo(() => generateSteps(input)... , [input]);
 *   const applyEx = useCallback((e) => { setInputInput(String(e.input)); handleReset(); }, ...);
 *
 * Desired:
 *   const [input, setInput] = useState(<default value>);   // keep raw default
 *   const [<field>Input, set<Field>Input] = useState(<serialized default>);
 *   const { <field>, inputError } = useMemo(... parse ...);
 *   const steps = useMemo(() => generateSteps(<field>)... , [<field>]);
 *   applyEx -> set<Field>Input(serialize(e.<field>))
 */
const problemsDir = 'src/problems'
const bad = [
  ['Problem103', 'root'], ['Problem116', 'root'], ['Problem117', 'root'],
  ['Problem120', 'triangle'], ['Problem122', 'prices'], ['Problem129', 'root'],
  ['Problem130', 'board'], ['Problem137', 'nums'], ['Problem144', 'arr'],
  ['Problem145', 'arr'], ['Problem147', 'arr'], ['Problem151', 's'],
  ['Problem154', 'nums'], ['Problem159', 's'], ['Problem202', 'n'],
  ['Problem204', 'n'], ['Problem586', 'input'], ['Problem746', 'cost'],
]

for (const [folder, field] of bad) {
  const jf = findJsx(folder)
  if (!jf) { console.log('no file', folder); continue }
  let code = fs.readFileSync(jf, 'utf8')
  if (!code.includes('ManualInputPanel')) continue

  // Determine field type from current state / usage
  // The current default for inputInput is "" (string). We need proper type.
  // Try to infer from EXAMPLES ground truth
  const Field = cap(field)

  // 1. Fix state: replace `const [inputInput, setInputInput] = useState("");`
  //    We need the default. Look at original input init or EXAMPLES.
  //    Use JSON-safe defaults.
  const inputInitMatch = code.match(/const \[input,\s*setInput\]\s*=\s*useState\(([^)]*)\)/)
  let defaultExpr = ''
  if (inputInitMatch) {
    defaultExpr = inputInitMatch[1].trim()
  }
  // defaultExpr may be an object like {"label":"Example 1","root":[...]}
  // We want the raw value: try to extract the first field value
  let rawDefault = ''
  try {
    const obj = JSON.parse(defaultExpr.replace(/'/g, '"'))
    if (field === 'input' || obj[field] !== undefined) {
      rawDefault = obj[field]
    }
  } catch (e) {
    // not JSON object; use as-is
    rawDefault = defaultExpr
  }
  if (rawDefault === undefined || rawDefault === null) rawDefault = defaultExpr

  const isArray = Array.isArray(rawDefault)
  const isNum = typeof rawDefault === 'number'
  const defaultStr = isArray ? JSON.stringify(rawDefault) : String(rawDefault)

  // Replace the inputInput state line with a proper typed input state
  code = code.replace(
    /const \[inputInput,\s*setInputInput\]\s*=\s*useState\([^)]*\);/,
    `const [${field}Input, set${Field}Input] = useState(${JSON.stringify(defaultStr)});`
  )

  // 2. Replace the parse block
  //    const { input, inputError } = useMemo(() => { ... return { input: parsedInput, ... } ... }, [inputInput]);
  const parseRe = /const \{ input, inputError \} = useMemo\(\(\) => \{[\s\S]*?\}, \[inputInput\]\);/
  const parseBlock = `const { ${field}, inputError } = useMemo(() => {
    try {
      ${field === 'input' ? `const parsed${Field} = ${field}Input;` : (isArray ? `const parsed${Field} = JSON.parse(${field}Input); if (!Array.isArray(parsed${Field})) throw new Error('${field} must be an array');` : (isNum ? `const parsed${Field} = Number(${field}Input); if (isNaN(parsed${Field})) throw new Error('${field} must be a number');` : `const parsed${Field} = ${field}Input;`))}
      return { ${field}: parsed${Field}, inputError: '' };
    } catch (e) {
      return { ${field}: ${JSON.stringify(rawDefault === undefined || rawDefault === null ? defaultStr : rawDefault)}, inputError: e.message };
    }
  }, [${field}Input]);`
  if (parseRe.test(code)) {
    code = code.replace(parseRe, parseBlock)
  } else {
    console.log('NO PARSE BLOCK:', folder)
  }

  // 3. Replace generateSteps(input) -> generateSteps(field)
  code = code.replace(/generateSteps\(input\)/g, `generateSteps(${field})`)
  // Replace deps [input] -> [field]
  code = code.replace(/\[input\]/g, `[${field}]`)

  // 4. Replace applyEx setter
  code = code.replace(
    /setInputInput\(String\(e\.input\)\)/g,
    `set${Field}Input(${isArray ? 'JSON.stringify(e.' + field + ')' : 'String(e.' + field + ')'})`
  )
  code = code.replace(
    /setInputInput\(JSON\.stringify\(e\.input\)\)/g,
    `set${Field}Input(JSON.stringify(e.${field}))`
  )

  // 5. Fix ManualInputPanel fields/values/onChange
  code = code.replace(
    /fields=\{\[\[\{"key":"input","label":"input","type":"string"\}\]\]\}/,
    `fields={[{"key":"${field}","label":"${field}","type":"${isArray ? 'array' : isNum ? 'number' : 'string'}"}]}`
  )
  code = code.replace(
    /\{\{ input: inputInput \}\}/,
    `{{ ${field}: ${field}Input }}`
  )
  code = code.replace(
    /\{ if \(k === 'input'\) setInputInput\(v\); handleReset\(\); \}/,
    `{ if (k === '${field}') set${Field}Input(v); handleReset(); }`
  )

  fs.writeFileSync(jf, code)
  console.log('fixed:', folder, '->', field)
}
