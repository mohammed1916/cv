export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with flowers, newFlowers, target, full and partial.')
  const { flowers, newFlowers, target, full, partial } = input
  if (!Array.isArray(flowers) || flowers.length < 1 || flowers.length > 8) throw new Error('flowers has 1 to 8 gardens.')
  if (!flowers.every(x => Number.isInteger(x) && x >= 1 && x <= 20)) throw new Error('Each garden has 1 to 20 flowers.')
  if (!Number.isInteger(newFlowers) || newFlowers < 1 || newFlowers > 60) throw new Error('newFlowers is an integer from 1 to 60.')
  if (!Number.isInteger(target) || target < 1 || target > 20) throw new Error('target is an integer from 1 to 20.')
  if (!Number.isInteger(full) || full < 1 || full > 20) throw new Error('full is an integer from 1 to 20.')
  if (!Number.isInteger(partial) || partial < 1 || partial > 20) throw new Error('partial is an integer from 1 to 20.')
  return { flowers, newFlowers, target, full, partial }
}

export function buildTrace({ flowers, newFlowers, target, full, partial }) {
  const f = [...flowers].sort((a, b) => a - b)
  const n = f.length
  const base = f.filter(x => x >= target).length
  const frames = []
  let best = 0
  frames.push({ pythonLine: PL('f = sorted'), phase: 'setup', activeLine: CL('const f = '), at: -1, f, complete: base, range: null, message: `Sort the gardens: ${f.join(' ')}. ${base} already reach ${target}.` })
  for (let c = base; c <= n; c++) {
    let cost = 0
    for (let j = n - c; j < n; j++) cost += Math.max(0, target - f[j])
    if (cost > newFlowers) {
      frames.push({ pythonLine: PL('if cost > new_flowers'), phase: 'count', activeLine: CL('if (cost > newFlowers)'), at: -1, f, complete: c, cost, range: null, message: `Completing the ${c} largest gardens costs ${cost}, more than ${newFlowers}. Stop.` })
      break
    }
    const rest = newFlowers - cost
    if (c === n) {
      best = Math.max(best, n * full)
      frames.push({ pythonLine: PL('best = max(best, n * full)'), phase: 'all', activeLine: CL('best = Math.max(best, n * full)'), at: -1, f, complete: n, cost, range: null, message: `Every garden can reach ${target}. The beauty is ${n} x ${full} = ${n * full}.` })
      continue
    }
    frames.push({ pythonLine: PL('rest = new_flowers - cost'), phase: 'count', activeLine: CL('const rest'), at: n - c, f, complete: c, cost, rest, range: null, message: `Complete the ${c} largest for ${cost} flowers. ${rest} remain for the smallest incomplete garden.` })
    let lo = f[0]
    let hi = target - 1
    frames.push({ pythonLine: PL('lo, hi = f[0]'), phase: 'search', activeLine: CL('let lo = f[0]'), at: 0, f, complete: c, cost, rest, range: { lo, hi, probe: null, verdict: null }, message: `The smallest incomplete garden can end between ${lo} and ${hi}.` })
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2)
      let need = 0
      for (let i = 0; i < n - c; i++) need += Math.max(0, mid - f[i])
      const ok = need <= rest
      frames.push({ pythonLine: PL('mid = (lo + hi + 1)'), phase: 'probe', activeLine: CL('const mid'), at: 0, f, complete: c, cost, rest, range: { lo, hi, probe: mid, verdict: ok }, message: `Try ${mid}: raising the ${n - c} smaller gardens costs ${need}, ${ok ? 'within' : 'over'} ${rest}.` })
      if (ok) lo = mid
      else hi = mid - 1
    }
    const value = c * full + lo * partial
    best = Math.max(best, value)
    frames.push({ pythonLine: PL('best = max(best, c * full'), phase: 'candidate', activeLine: CL('best = Math.max(best, c * full'), at: 0, f, complete: c, cost, rest, range: { lo, hi, probe: null, verdict: null }, value, message: `${c} complete x ${full} + minimum ${lo} x ${partial} = ${value}.` })
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('return best;'), at: -1, f, complete: 0, range: null, message: `The maximum total beauty is ${best}.` })
  return { input: { flowers, newFlowers, target, full, partial }, result: best, frames }
}

export const code = `function maximumBeauty(flowers, newFlowers, target, full, partial) {
  const f = [...flowers].sort((a, b) => a - b);
  const n = f.length;
  const base = f.filter(x => x >= target).length;
  let best = 0;
  for (let c = base; c <= n; c++) {
    let cost = 0;
    for (let j = n - c; j < n; j++) cost += Math.max(0, target - f[j]);
    if (cost > newFlowers) break;
    const rest = newFlowers - cost;
    if (c === n) {
      best = Math.max(best, n * full);
      continue;
    }
    let lo = f[0];
    let hi = target - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      let need = 0;
      for (let i = 0; i < n - c; i++) need += Math.max(0, mid - f[i]);
      if (need <= rest) lo = mid;
      else hi = mid - 1;
    }
    best = Math.max(best, c * full + lo * partial);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def maximum_beauty(flowers, new_flowers, target, full, partial):
    f = sorted(flowers)
    n = len(f)
    base = sum(1 for x in f if x >= target)
    best = 0
    for c in range(base, n + 1):
        cost = sum(max(0, target - x) for x in f[n - c:])
        if cost > new_flowers:
            break
        rest = new_flowers - cost
        if c == n:
            best = max(best, n * full)
            continue
        lo, hi = f[0], target - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            need = sum(max(0, mid - x) for x in f[:n - c])
            if need <= rest:
                lo = mid
            else:
                hi = mid - 1
        best = max(best, c * full + lo * partial)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
