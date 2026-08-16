import fs from 'fs'
import path from 'path'

const report = JSON.parse(fs.readFileSync(path.resolve('scripts/manual-input-report.json'), 'utf8'))
const without = report.without
const problemsDir = path.resolve('src/problems')

const analysis = []
for (const p of without) {
  const dir = path.join(problemsDir, p.folder)
  const files = fs.readdirSync(dir)
  const jsxFile = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css'))
  if (!jsxFile) continue
  const code = fs.readFileSync(path.join(dir, jsxFile), 'utf8')

  const hasVisualizationPanel = /function VisualizationPanel/.test(code)
  const rendersExampleButtons = /EXAMPLES\.map|EXAMPLES\.map\(/.test(code)
  const usesLuminoDock = /LuminoDockPanel/.test(code)
  const hasInputState = /const \[input, setInput\]\s*=\s*useState/.test(code)
  const hasInputArrayState = /const \[input, setInput\]\s*=\s*useState\(EXAMPLES\[0\]\?\.\w+/.test(code)
  const hasExState = /const \[ex, setEx\]\s*=\s*useState/.test(code)
  const hasGenericVisualizer = /from '\.\.\/\.\.\/Visualizer'|from "\.\.\/\.\.\/Visualizer"/.test(code)
  const usesGenerateStepsDirect = /generateSteps\(/.test(code)
  const hasPortalRender = /createPortal/.test(code)

  // What does the primary panel look like - does it render an input field?
  const hasInputElement = /<input[\s\S]*?value=\{/.test(code)

  analysis.push({
    folder: p.folder,
    number: p.number,
    title: p.title,
    hasVisualizationPanel,
    rendersExampleButtons,
    usesLuminoDock,
    hasInputState,
    hasInputArrayState,
    hasExState,
    hasGenericVisualizer,
    usesGenerateStepsDirect,
    hasPortalRender,
    hasInputElement,
  })
}

const count = (fn) => analysis.filter(fn).length
console.log('Total without:', analysis.length)
console.log('hasVisualizationPanel:', count(a => a.hasVisualizationPanel))
console.log('rendersExampleButtons:', count(a => a.rendersExampleButtons))
console.log('usesLuminoDock:', count(a => a.usesLuminoDock))
console.log('hasInputState (const [input,setInput]):', count(a => a.hasInputState))
console.log('  of those inputArrayState:', count(a => a.hasInputArrayState))
console.log('hasExState:', count(a => a.hasExState))
console.log('hasGenericVisualizer:', count(a => a.hasGenericVisualizer))
console.log('usesGenerateStepsDirect:', count(a => a.usesGenerateStepsDirect))
console.log('hasPortalRender:', count(a => a.hasPortalRender))
console.log('hasInputElement:', count(a => a.hasInputElement))

fs.writeFileSync('scripts/without-structure-analysis.json', JSON.stringify(analysis, null, 2))
