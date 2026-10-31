export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 8 || s.length > 40) throw new Error('Enter a JSON string of 8-40 characters (an email or a phone number).')
  const email = /^[A-Za-z]{2,10}@[A-Za-z]{2,10}\.[A-Za-z]{2,10}$/.test(s)
  const phone = /^[0-9+\-() ]+$/.test(s) && (s.match(/\d/g) || []).length >= 10 && (s.match(/\d/g) || []).length <= 13
  if (!email && !phone) throw new Error('Not recognised: an email is name@domain.ext with letters only (2-10 each); a phone number has 10-13 digits plus + - ( ) or spaces.')
  return s
}
export function buildTrace(s) {
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: 2, partial: '', message: `Decide whether "${s}" is an email or a phone number: only emails contain an @.` }]
  let result
  if (s.includes('@')) {
    const lower = s.toLowerCase()
    frames.push({ phase: 'email', pythonLine: 3, activeLine: 3, partial: lower, message: `Email: lowercase everything: "${lower}".` })
    const [name, domain] = lower.split('@')
    result = name[0] + '*****' + name[name.length - 1] + '@' + domain
    frames.push({ phase: 'mask', pythonLine: 5, activeLine: 5, partial: result, message: `Keep the first and last letter of "${name}" around five stars and keep the domain: "${result}".` })
  } else {
    const digits = [...s].filter(c => c >= '0' && c <= '9')
    frames.push({ phase: 'phone', pythonLine: 6, activeLine: 7, partial: digits.join(''), message: `Phone: drop separators and keep the ${digits.length} digits.` })
    const local = '***-***-' + digits.slice(-4).join('')
    frames.push({ phase: 'mask', pythonLine: 7, activeLine: 8, partial: local, message: `The last four digits stay visible; the rest of the local number becomes "${local}".` })
    result = digits.length === 10 ? local : '+' + '*'.repeat(digits.length - 10) + '-' + local
    frames.push({ phase: 'country', pythonLine: digits.length === 10 ? 9 : 10, activeLine: digits.length === 10 ? 9 : 10, partial: result,
      message: digits.length === 10 ? 'Exactly 10 digits means no country code: use the local mask.' : `${digits.length - 10} extra leading digit(s) form the country code: prefix "+${'*'.repeat(digits.length - 10)}-".` })
  }
  frames.push({ phase: 'done', pythonLine: result.includes('@') ? 5 : result.startsWith('+') ? 10 : 9, activeLine: result.startsWith('+') || result.includes('@') ? (result.includes('@') ? 5 : 10) : 9, partial: result, message: `Masked result: ${result}` })
  return { input: s, result, frames }
}
export const code = `function maskPII(s)
  if s contains an "@" sign then
    lowercase every letter of s
    split s into name and domain at the "@"
    return first letter of name, "*****", last letter of name, "@", domain
  otherwise treat s as a phone number
    keep only the digits of s
    set local to "***-***-" followed by the last four digits
    if there are exactly 10 digits then return local
    return "+", one star per digit beyond 10, "-", local`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def mask_pii(s):
    if '@' in s:
        s = s.lower()
        name, domain = s.split('@')
        return name[0] + '*****' + name[-1] + '@' + domain
    digits = [c for c in s if '0' <= c <= '9']
    local = '***-***-' + ''.join(digits[-4:])
    if len(digits) == 10:
        return local
    return '+' + '*' * (len(digits) - 10) + '-' + local
`
