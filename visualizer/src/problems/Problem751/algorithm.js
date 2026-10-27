const toInt = ip => ip.split('.').reduce((total, part) => total * 256 + Number(part), 0)
const toIp = n => [2 ** 24, 2 ** 16, 2 ** 8, 1].map(scale => Math.floor(n / scale) % 256).join('.')

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (typeof spec.ip !== 'string' || !/^(\d{1,3}\.){3}\d{1,3}$/.test(spec.ip) || spec.ip.split('.').some(p => Number(p) > 255)) {
    throw new Error('Enter ip as a dotted IPv4 address.')
  }
  if (!Number.isInteger(spec.n) || spec.n < 1 || spec.n > 1000) throw new Error('n is an integer from 1 to 1000.')
  if (toInt(spec.ip) + spec.n > 2 ** 32) throw new Error('The range runs past 255.255.255.255.')
  return spec
}

export function buildTrace(spec) {
  let start = toInt(spec.ip), remaining = spec.n
  const blocks = []
  const frames = [{ phase: 'start', activeLine: L('start = first'), start: toIp(start), remaining, blocks: [], message: `Cover ${remaining} addresses from ${spec.ip} with the fewest aligned blocks.` }]
  while (remaining > 0) {
    // The largest block that starts here, is aligned to its own size, and fits in the remaining addresses.
    let size = 1
    while (size * 2 <= remaining && start % (size * 2) === 0) size *= 2
    const prefix = 32 - Math.log2(size)
    blocks.push(`${toIp(start)}/${prefix}`)
    start += size
    remaining -= size
    frames.push({ phase: 'block', activeLine: L('append the CIDR block'), start: toIp(start), remaining, blocks: [...blocks], message: `${blocks.at(-1)} covers ${size} address(es) and is aligned.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), start: null, remaining: 0, blocks: [...blocks], message: `${blocks.length} block(s) cover the range.` })
  return { input: spec, result: blocks, frames }
}

export { toInt, toIp }

export const code = `function ipToCIDR(ip, n):
  start = first address of ip, as a 32-bit number
  result = empty list
  while addresses are left to cover (n > 0):
    size = 1
    while doubling size keeps it aligned to start and it fits in n:
      double size
    append the CIDR block that starts at start and has size addresses
    start = start + size
    n = n - size
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ip_to_cidr(ip, n):
    start = sum(int(part) << (8 * (3 - i)) for i, part in enumerate(ip.split('.')))
    result = []
    while n > 0:
        size = 1
        while size * 2 <= n and start % (size * 2) == 0:
            size *= 2
        result.append(f'{start >> 24}.{(start >> 16) & 255}.{(start >> 8) & 255}.{start & 255}/{32 - size.bit_length() + 1}')
        start += size
        n -= size
    return result`
