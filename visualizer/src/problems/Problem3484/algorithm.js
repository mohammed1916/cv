const CELL = /^[A-E][1-9]$/
const OPERAND = /^(?:[A-E][1-9]|[0-9]+)$/
const FORMULA = /^=([A-E][1-9]|[0-9]+)\+([A-E][1-9]|[0-9]+)$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with rows and ops.')
  const { rows, ops } = input
  if (!Number.isInteger(rows) || rows < 1 || rows > 9) throw new Error('rows is an integer from 1 to 9.')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 30) throw new Error('ops is a list of 1 to 30 operations.')
  for (const op of ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is a list.')
    const [kind, target, value] = op
    if (kind === 'set') {
      if (op.length !== 3 || typeof target !== 'string' || !CELL.test(target) || Number(target[1]) > rows) throw new Error('set needs a cell like A1 within the rows and an integer from 0 to 99.')
      if (!Number.isInteger(value) || value < 0 || value > 99) throw new Error('set needs an integer from 0 to 99.')
    } else if (kind === 'reset') {
      if (op.length !== 2 || typeof target !== 'string' || !CELL.test(target) || Number(target[1]) > rows) throw new Error('reset needs a cell like A1 within the rows.')
    } else if (kind === 'get') {
      if (op.length !== 2 || typeof target !== 'string' || !FORMULA.test(target)) throw new Error('get needs a formula like =A1+3.')
      for (const operand of target.slice(1).split('+')) {
        if (!OPERAND.test(operand) || (CELL.test(operand) && Number(operand[1]) > rows)) throw new Error('Formula operands are cells within the rows or integers.')
      }
    } else {
      throw new Error('Operations are set, reset or get.')
    }
  }
  return { rows, ops }
}

export function buildTrace({ rows, ops }) {
  const cells = new Map()
  const results = []
  const frames = []
  const snap = (extra = {}) => ({ cells: Object.fromEntries(cells), results: [...results], op: -1, ...extra })
  const term = operand => (CELL.test(operand) ? cells.get(operand) ?? 0 : Number(operand))
  frames.push({ ...snap(), pythonLine: P('cells = {}'), phase: 'start', activeLine: L('this.cells = new Map()'), at: '', ok: null, message: `A ${rows}-row sheet with columns A to E. Unset cells read as 0.` })
  for (const [index, op] of ops.entries()) {
    const [kind, target, value] = op
    if (kind === 'set') {
      cells.set(target, value)
      frames.push({ ...snap({ at: target, op: index }), pythonLine: P('def set'), phase: 'set', activeLine: L('this.cells.set(cell, value)'), ok: null, message: `Operation ${index + 1}: ${target} is now ${value}.` })
    } else if (kind === 'reset') {
      cells.delete(target)
      frames.push({ ...snap({ at: target, op: index }), pythonLine: P('def reset'), phase: 'reset', activeLine: L('this.cells.delete(cell)'), ok: null, message: `Operation ${index + 1}: ${target} is reset to 0.` })
    } else {
      const [, left, right] = target.match(FORMULA)
      const sum = term(left) + term(right)
      results.push(sum)
      frames.push({ ...snap({ at: left, right, op: index }), pythonLine: P('def get'), phase: 'get', activeLine: L('return this.term(left) + this.term(right)'), ok: null, message: `Operation ${index + 1}: ${left} + ${right} = ${sum}.` })
    }
  }
  frames.push({ ...snap({ at: '' }), pythonLine: P('return self.term'), phase: 'done', activeLine: L('getValue(formula)'), ok: true, message: `Recorded ${results.length} formula results.` })
  return { input: { rows, ops }, result: results, frames }
}

export const code = `class Spreadsheet {
  constructor(rows) {
    this.rows = rows
    this.cells = new Map()
  }
  setCell(cell, value) {
    this.cells.set(cell, value)
  }
  resetCell(cell) {
    this.cells.delete(cell)
  }
  term(operand) {
    return /^[A-E]/.test(operand) ? this.cells.get(operand) ?? 0 : Number(operand)
  }
  getValue(formula) {
    const [left, right] = formula.slice(1).split('+')
    return this.term(left) + this.term(right)
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class Spreadsheet:
    def __init__(self):
        self.cells = {}
    def set_cell(self, cell, value):
        self.cells[cell] = value
    def reset_cell(self, cell):
        self.cells.pop(cell, None)
    def get_value(self, formula):
        left, right = formula[1:].split('+')
        return self.term(left) + self.term(right)
    def term(self, operand):
        return self.cells.get(operand, 0) if operand[0].isalpha() else int(operand)
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
