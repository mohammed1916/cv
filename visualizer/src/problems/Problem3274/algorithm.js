const PY = [
  "def checkSameColor(coordinate1, coordinate2):",
  "    def parity(coordinate):",
  "        column = ord(coordinate[0]) - ord('a') + 1",
  "        row = int(coordinate[1])",
  "        return (column + row) % 2",
  "    return parity(coordinate1) == parity(coordinate2)",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function sameSquareColor(coordinate1, coordinate2)' },
  { line: 2, text: 'define parity(square) as (column number + row number) mod 2' },
  { line: 3, text: 'first = parity(coordinate1)' },
  { line: 4, text: 'second = parity(coordinate2)' },
  { line: 5, text: 'return first equals second' },
];

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"coordinate1": "a1", "coordinate2": "c3"}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with coordinate1 and coordinate2');
  }
  for (const name of ['coordinate1', 'coordinate2']) {
    if (typeof data[name] !== 'string' || !/^[a-h][1-8]$/.test(data[name])) {
      throw new Error(`${name} must be a square such as "a1" (letter a-h, digit 1-8)`);
    }
  }
  return { coordinate1: data.coordinate1, coordinate2: data.coordinate2 };
}

export function buildTrace(input) {
  const { coordinate1, coordinate2 } = input;
  const squares = [coordinate1, coordinate2];
  const state = { square: -1, column: null, row: null, parity: null, first: null, second: null, result: null };
  const frames = [];
  const snap = (phase, activeLine, pythonLine, message, explanation) => frames.push({
    phase, activeLine, pythonLine, message, explanation, squares: [...squares], ...state, relatedLines: [activeLine],
  });

  snap('read', 1, at('def checkSameColor'), 'Read both squares.', `The two squares are ${coordinate1} and ${coordinate2}.`);

  const parityOf = (square, index) => {
    state.square = index;
    const column = square.charCodeAt(0) - 96;
    const row = Number(square[1]);
    state.column = column;
    snap('column', 2, at('column = '), `Column of ${square} is ${column}.`, `The letter ${square[0]} is column ${column} (a = 1).`);
    state.row = row;
    snap('row', 2, at('row = '), `Row of ${square} is ${row}.`, `The digit ${square[1]} is row ${row}.`);
    state.parity = (column + row) % 2;
    snap('parity', 3, at('return (column'), `${square}: (${column} + ${row}) mod 2 = ${state.parity}.`, `Only the parity of column plus row decides the color.`);
    return state.parity;
  };

  state.first = parityOf(coordinate1, 0);
  state.second = parityOf(coordinate2, 1);
  state.square = -1;
  snap('compare', 5, at('return parity(coordinate1)'), `Compare parities ${state.first} and ${state.second}.`, 'Equal parities mean the squares share a color.');
  state.result = state.first === state.second;
  snap('done', 5, at('return parity(coordinate1)'), `Result: ${state.result}.`, `The function returns ${state.result}.`);

  return { input, result: state.result, frames };
}
