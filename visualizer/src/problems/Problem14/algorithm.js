export const phases = [
  { id: 'start', label: 'First word', description: 'Use the first word as the starting prefix.' },
  { id: 'compare', label: 'Check next word', description: 'Test whether the next word starts with the current prefix.' },
  { id: 'trim', label: 'Shorten prefix', description: 'Remove the last character of the prefix and check again.' },
  { id: 'done', label: 'Return prefix', description: 'The prefix is shared by every word.' },
];

export const examples = [
  { label: 'Shared start', input: JSON.stringify({ words: ['lantern', 'lattice', 'latch'] }) },
  { label: 'Nothing shared', input: JSON.stringify({ words: ['moon', 'sun'] }) },
  { label: 'Single word', input: JSON.stringify({ words: ['flower'] }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const words = data?.words;
  if (!Array.isArray(words) || words.length < 1 || words.length > 200
    || words.some(w => typeof w !== 'string' || w.length > 200 || !/^[a-z]*$/.test(w))) {
    throw new Error('Enter {"words":[...]} with 1 to 200 lowercase words, each up to 200 letters.');
  }
  return { words };
}

export function buildTrace({ words }) {
  let prefix = words[0];
  const frames = [{
    phase: 'start', activeLine: 2, message: `Start with the first word as the prefix: "${prefix}".`,
    snapshot: { words, wordIndex: 0, word: words[0], prefix, startsWith: null },
  }];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    while (true) {
      const startsWith = word.startsWith(prefix);
      frames.push({
        phase: 'compare', activeLine: 4,
        message: startsWith
          ? `"${word}" starts with "${prefix}", so the prefix is kept.`
          : `"${word}" does not start with "${prefix}".`,
        snapshot: { words, wordIndex: i, word, prefix, startsWith },
      });
      if (startsWith) break;
      prefix = prefix.slice(0, -1);
      frames.push({
        phase: 'trim', activeLine: 5, message: `Shorten the prefix to "${prefix}".`,
        snapshot: { words, wordIndex: i, word, prefix, startsWith: null },
      });
    }
  }
  frames.push({
    phase: 'done', activeLine: 6, message: `Return "${prefix}".`,
    snapshot: { words, wordIndex: words.length - 1, word: null, prefix, startsWith: null },
  });
  return { input: { words }, result: prefix, frames };
}

export const code = [
  'FUNCTION longestCommonPrefix(words)',
  '    prefix ← words[0]',
  '    FOR EACH word IN words[1..]',
  '        WHILE word does not start with prefix',
  '            remove the last character of prefix',
  '    RETURN prefix',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def longestCommonPrefix(words):
    prefix = words[0]
    for word in words[1:]:
        while not word.startswith(prefix):
            prefix = prefix[:-1]
    return prefix`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
