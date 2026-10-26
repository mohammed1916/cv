export function parseInput(text) {
  const arr = JSON.parse(text)
  const ok = s => typeof s === 'string' && /^[1-9][0-9]{0,5} [a-z]+(\.[a-z]+){0,3}$/.test(s)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 10 || !arr.every(ok)) throw new Error('Enter a JSON array of 1-10 strings like "900 google.mail.com": a count up to 6 digits, a space, then 1-4 dot-separated lowercase labels (visualization caps).')
  return [...arr]
}
export function buildTrace(cpdomains) {
  const counts = new Map()
  const frames = []
  const snap = () => [...counts.entries()]
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, entries: snap(), index: -1, sub: null, ...extra })
  push('start', 2, 'Every visit to a domain also counts as a visit to each parent domain, so each entry credits all of its dot-suffixes.')
  cpdomains.forEach((entry, i) => {
    const [num, domain] = entry.split(' ')
    const n = Number(num)
    push('parse', 4, `Split "${entry}" into count ${n} and domain "${domain}".`, { index: i })
    const parts = domain.split('.')
    for (let j = 0; j < parts.length; j++) {
      const sub = parts.slice(j).join('.')
      counts.set(sub, (counts.get(sub) || 0) + n)
      push('credit', 9, `Credit "${sub}" with ${n}: total is now ${counts.get(sub)}.`, { index: i, sub })
    }
  })
  const result = [...counts.entries()].map(([d, c]) => `${c} ${d}`)
  push('done', 10, `${result.length} distinct (sub)domains counted.`)
  return { input: cpdomains, result, frames }
}
export const code = `def subdomainVisits(cpdomains):
    counts = {}
    for entry in cpdomains:
        num, domain = entry.split(' ')
        n = int(num)
        parts = domain.split('.')
        for j in range(len(parts)):
            sub = '.'.join(parts[j:])
            counts[sub] = counts.get(sub, 0) + n
    return [f"{c} {d}" for d, c in counts.items()]`.split('\n').map((text, index) => ({ line: index + 1, text }))
