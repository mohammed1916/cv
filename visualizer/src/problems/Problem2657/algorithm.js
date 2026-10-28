function permutationOf(list, name, n) {
  if (!Array.isArray(list) || list.length !== n || new Set(list).size !== n || list.some(v => !Number.isInteger(v) || v < 1 || v > n)) throw new Error(`${name} must be a permutation of 1 to ${n}.`)
  return list
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.A) || !Array.isArray(data.B)) throw new Error('Use {"A": [...], "B": [...]}.')
  const n = data.A.length
  if (n < 1 || n > 20) throw new Error('Use permutations of 1 to 20 numbers.')
  return { A: permutationOf(data.A, 'A', n), B: permutationOf(data.B, 'B', n) }
}

export function buildTrace(input) {
  const { A, B } = input
  const seenA = new Set(), seenB = new Set()
  let common = 0
  const result = []
  const frames = []
  const maps = () => [
    { name: 'A so far', keyLabel: 'value', valueLabel: '', isSet: true, entries: [...seenA].map(v => [v]) },
    { name: 'B so far', keyLabel: 'value', valueLabel: '', isSet: true, entries: [...seenB].map(v => [v]) },
  ]
  frames.push({ phase: 'start', activeLine: L('seenA = empty set'), index: -1, maps: maps(), ops: [], result: [], message: 'Walk both arrays together. A value counts once it has appeared in both prefixes.' })
  for (let i = 0; i < A.length; i++) {
    seenA.add(A[i])
    const aHit = seenB.has(A[i])
    if (aHit) common++
    frames.push({ phase: 'a', activeLine: L('if A[i] is in seenB'), index: i, maps: maps(),
      ops: [{ map: 'A so far', type: 'insert', key: A[i] }, { map: 'B so far', type: 'lookup', via: 'has', key: A[i], hit: aHit, hitNote: `${A[i]} already appeared in B`, missNote: `${A[i]} has not appeared in B yet` }],
      result: [...result], message: `A[${i}] = ${A[i]}. ${aHit ? 'B has already shown it, so the common count goes up.' : 'B has not shown it yet.'}` })
    seenB.add(B[i])
    const bHit = seenA.has(B[i])
    if (bHit) common++
    frames.push({ phase: 'b', activeLine: L('if B[i] is in seenA'), index: i, maps: maps(),
      ops: [{ map: 'B so far', type: 'insert', key: B[i] }, { map: 'A so far', type: 'lookup', via: 'has', key: B[i], hit: bHit, hitNote: `${B[i]} already appeared in A`, missNote: `${B[i]} has not appeared in A yet` }],
      result: [...result], message: `B[${i}] = ${B[i]}. ${bHit ? 'A has already shown it, so the common count goes up.' : 'A has not shown it yet.'}` })
    result.push(common)
    frames.push({ phase: 'record', activeLine: L('append common'), index: i, maps: maps(), ops: [], result: [...result], message: `Prefix ${i + 1} has ${common} common value(s).` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), index: -1, maps: maps(), ops: [], result: [...result], message: `Prefix common array: [${result.join(', ')}].` })
  return { input, result, frames }
}

export const code = `prefix common array of two permutations
seenA = empty set, seenB = empty set, common = 0
answer = empty list
for each index i
  add A[i] to seenA
  if A[i] is in seenB then add one to common
  add B[i] to seenB
  if B[i] is in seenA then add one to common
  append common to answer
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_the_prefix_common_array(A, B):
    seen_a = set()
    seen_b = set()
    common = 0
    result = []
    for i in range(len(A)):
        seen_a.add(A[i])
        if A[i] in seen_b:
            common += 1
        seen_b.add(B[i])
        if B[i] in seen_a:
            common += 1
        result.append(common)
    return result
`
