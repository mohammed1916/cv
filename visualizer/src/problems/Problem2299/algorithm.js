const SPECIALS = '!@#$%^&*()-+'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 'password') throw new Error('Use an object with exactly the key "password".')
  const { password } = value
  if (typeof password !== 'string' || password.length < 1 || password.length > 30 || !/^[\x21-\x7e]+$/.test(password)) throw new Error('password is 1 to 30 printable characters with no spaces.')
  return { password }
}

export function buildTrace({ password }) {
  const chars = [...password]
  const frames = [{ phase: 'start', activeLine: L('if length is less than 8'), active: -1, roles: {}, state: { length: password.length }, message: 'Check the rules in order. The first failed rule makes the password weak.' }]
  const rules = [
    { phase: 'length', line: 'if length is less than 8', ok: password.length >= 8, text: `Length ${password.length} ${password.length >= 8 ? 'meets' : 'is below'} the minimum of 8.` },
    { phase: 'lower', line: 'if no lowercase letter', ok: /[a-z]/.test(password), text: 'Looking for a lowercase letter.' },
    { phase: 'upper', line: 'if no uppercase letter', ok: /[A-Z]/.test(password), text: 'Looking for an uppercase letter.' },
    { phase: 'digit', line: 'if no digit', ok: /[0-9]/.test(password), text: 'Looking for a digit.' },
    { phase: 'special', line: 'if no special character', ok: chars.some(c => SPECIALS.includes(c)), text: `Looking for one of ${SPECIALS}.` },
  ]
  for (const rule of rules) {
    frames.push({ phase: rule.phase, activeLine: L(rule.line), active: -1, roles: {}, state: { passed: rule.ok }, message: `${rule.text} ${rule.ok ? 'Found, so this rule passes.' : 'Not found, so the password is weak.'}` })
    if (!rule.ok) return finish(false, rule.line, 'The rule above failed, so the password is weak.')
  }
  for (let i = 1; i < chars.length; i++) {
    const same = chars[i] === chars[i - 1]
    frames.push({ phase: 'adjacent', activeLine: L('if character i equals'), active: i, roles: { [i - 1]: 'pair', [i]: same ? 'repeat' : 'checked' }, state: { index: i, repeat: same }, message: same ? `Positions ${i - 1} and ${i} are both "${chars[i]}", so the password is weak.` : `Positions ${i - 1} and ${i} differ.` })
    if (same) return finish(false, 'if character i equals', 'Two equal characters are adjacent, so the password is weak.', chars)
  }
  return finish(true, 'return true', 'Every rule passes, so the password is strong.', chars)

  function finish(result, line, message, items = chars) {
    frames.push({ phase: 'done', activeLine: L(line), active: -1, roles: {}, state: { result }, message })
    return { input: { password }, result, items, frames }
  }
}

export const code = `strong password check
  if length is less than 8 then return false
  if no lowercase letter then return false
  if no uppercase letter then return false
  if no digit then return false
  if no special character then return false
  for each index i from 1 to the last index
    if character i equals character i minus 1 then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def strong_password(password):
    specials = "!@#$%^&*()-+"
    if len(password) < 8:
        return False
    if not any(ch.islower() for ch in password):
        return False
    if not any(ch.isupper() for ch in password):
        return False
    if not any(ch.isdigit() for ch in password):
        return False
    if not any(ch in specials for ch in password):
        return False
    for i in range(1, len(password)):
        if password[i] == password[i - 1]:
            return False
    return True
`
