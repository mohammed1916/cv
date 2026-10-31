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
  push('start', L('set counts to'), 'Every visit to a domain also counts as a visit to each parent domain, so each entry credits all of its dot-suffixes.', { pythonLine: 2 })
  cpdomains.forEach((entry, i) => {
    const [num, domain] = entry.split(' ')
    const n = Number(num)
    push('parse', L('split entry'), `Split "${entry}" into count ${n} and domain "${domain}".`, { index: i, pythonLine: 4 })
    const parts = domain.split('.')
    for (let j = 0; j < parts.length; j++) {
      const sub = parts.slice(j).join('.')
      counts.set(sub, (counts.get(sub) || 0) + n)
      push('credit', L('add n to counts'), `Credit "${sub}" with ${n}: total is now ${counts.get(sub)}.`, { index: i, sub, pythonLine: 9 })
    }
  })
  const result = [...counts.entries()].map(([d, c]) => `${c} ${d}`)
  push('done', L('return one'), `${result.length} distinct (sub)domains counted.`, { pythonLine: 10 })
  return { input: cpdomains, result, frames }
}
export const code = `set counts to an empty map from domain to count
for each entry in cpdomains
  split entry into the count num and the domain
  set n to the integer value of num
  split domain into labels parts on each dot
  for each j from 0 to the number of labels minus 1
    set sub to the labels from parts[j] to the end, joined by dots
    add n to counts[sub], starting from 0
return one "count domain" string for each key in counts, in insertion order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def subdomain_visits(cpdomains):
    counts = {}
    for entry in cpdomains:
        num, domain = entry.split(' ')
        n = int(num)
        parts = domain.split('.')
        for j in range(len(parts)):
            sub = '.'.join(parts[j:])
            counts[sub] = counts.get(sub, 0) + n
    return [f"{c} {d}" for d, c in counts.items()]
`
