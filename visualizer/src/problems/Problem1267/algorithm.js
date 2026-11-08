
export function parseInput(text) {
  const input = JSON.parse(text);

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Use an object with a grid array.');
  }

  const { grid } = input;

  if (
    !Array.isArray(grid) ||
    grid.length < 1 ||
    grid.length > 6 ||
    !Array.isArray(grid[0]) ||
    grid[0].length < 1 ||
    grid[0].length > 6
  ) {
    throw new Error('grid must be at most 6 by 6.');
  }

  const n = grid[0].length;

  if (
    grid.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== n ||
        row.some((v) => v !== 0 && v !== 1)
    )
  ) {
    throw new Error(
      'grid must be rectangular, with only 0 and 1 values.'
    );
  }

  return { grid };
}

export const code = [
  'count servers that communicate (grid):',
  '  determine rows and columns',
  '  count the servers in each row',
  '  count the servers in each column',
  '  set total to 0',
  '  for each cell in the grid',
  '    if the cell holds a server and its row or column has another server then',
  '      add one to total',
  '  return total',
].map((text, index) => ({ line: index + 1, text }));

export const python = `def count_servers(grid):
    rows, cols = len(grid), len(grid[0])
    row_count = [sum(grid[r]) for r in range(rows)]
    col_count = [sum(grid[r][c] for r in range(rows)) for c in range(cols)]
    total = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (row_count[r] > 1 or col_count[c] > 1):
                total += 1
    return total
`;

const L = (text) =>
  code.findIndex((line) => line.text.includes(text)) + 1;

const P = (text) =>
  python.split('\n').findIndex((line) => line.includes(text)) + 1;

export function buildTrace(input) {
  const { grid } = input;
  const rows = grid.length;
  const cols = grid[0].length;

  const rowCount = Array(rows).fill(null);
  const colCount = Array(cols).fill(null);

  const frames = [];
  const counted = [];
  let total = 0;

  function addFrame({
    phase,
    stage,
    activeLine,
    pythonLine,
    cell = null,
    scanAxis = null,
    scanIndex = null,
    scanValue = null,
    runningSum = null,
    message,
  }) {
    frames.push({
      phase,
      stage,
      activeLine,
      pythonLine,
      cell: cell ? [...cell] : null,
      scanAxis,
      scanIndex,
      scanValue,
      runningSum,
      rowCount: [...rowCount],
      colCount: [...colCount],
      counted: counted.map((p) => ({ ...p })),
      total,
      rows,
      cols,
      message,
    });
  }

  addFrame({
    phase: 'start',
    stage: 'input',
    activeLine: 1,
    pythonLine: 1,
    message:
      'Start with the original grid. Each 1 represents a server; each 0 is an empty cell.',
  });

  addFrame({
    phase: 'dimensions',
    stage: 'dimensions',
    activeLine: L('determine rows and columns'),
    pythonLine: P('rows, cols ='),
    message:
      `The grid has ${rows} row${rows === 1 ? '' : 's'} ` +
      `and ${cols} column${cols === 1 ? '' : 's'}.`,
  });

  // Build row_count one cell at a time.
  for (let r = 0; r < rows; r++) {
    let sum = 0;

    addFrame({
      phase: 'row-scan',
      stage: 'rows',
      activeLine: L('count the servers in each row'),
      pythonLine: P('row_count ='),
      scanAxis: 'row',
      scanIndex: r,
      runningSum: 0,
      message: `Begin constructing row_count[${r}].`,
    });

    for (let c = 0; c < cols; c++) {
      const value = grid[r][c];
      sum += value;

      addFrame({
        phase: 'row-scan',
        stage: 'rows',
        activeLine: L('count the servers in each row'),
        pythonLine: P('row_count ='),
        cell: [r, c],
        scanAxis: 'row',
        scanIndex: r,
        scanValue: value,
        runningSum: sum,
        message:
          `Row ${r}: read grid[${r}][${c}] = ${value}. ` +
          `Running sum = ${sum}.`,
      });
    }

    rowCount[r] = sum;

    addFrame({
      phase: 'row-commit',
      stage: 'rows',
      activeLine: L('count the servers in each row'),
      pythonLine: P('row_count ='),
      scanAxis: 'row',
      scanIndex: r,
      runningSum: sum,
      message:
        `Store row_count[${r}] = ${sum}. ` +
        'This row will not need to be counted again.',
    });
  }

  // Build col_count one cell at a time.
  for (let c = 0; c < cols; c++) {
    let sum = 0;

    addFrame({
      phase: 'col-scan',
      stage: 'columns',
      activeLine: L('count the servers in each column'),
      pythonLine: P('col_count ='),
      scanAxis: 'column',
      scanIndex: c,
      runningSum: 0,
      message: `Begin constructing col_count[${c}].`,
    });

    for (let r = 0; r < rows; r++) {
      const value = grid[r][c];
      sum += value;

      addFrame({
        phase: 'col-scan',
        stage: 'columns',
        activeLine: L('count the servers in each column'),
        pythonLine: P('col_count ='),
        cell: [r, c],
        scanAxis: 'column',
        scanIndex: c,
        scanValue: value,
        runningSum: sum,
        message:
          `Column ${c}: read grid[${r}][${c}] = ${value}. ` +
          `Running sum = ${sum}.`,
      });
    }

    colCount[c] = sum;

    addFrame({
      phase: 'col-commit',
      stage: 'columns',
      activeLine: L('count the servers in each column'),
      pythonLine: P('col_count ='),
      scanAxis: 'column',
      scanIndex: c,
      runningSum: sum,
      message:
        `Store col_count[${c}] = ${sum}. ` +
        'This column will not need to be counted again.',
    });
  }

  addFrame({
    phase: 'initialize',
    stage: 'initialize',
    activeLine: L('set total to 0'),
    pythonLine: P('total = 0'),
    message:
      'Both count arrays are ready. Initialize total = 0.',
  });

  // Check every cell using the precomputed counts.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isServer = grid[r][c] === 1;

      addFrame({
        phase: 'inspect',
        stage: 'check',
        activeLine: L('for each cell in the grid'),
        pythonLine: P('if grid[r][c] == 1'),
        cell: [r, c],
        message: isServer
          ? `Inspect server (${r}, ${c}). Look up its row and column counts.`
          : `Cell (${r}, ${c}) is empty. Skip it.`,
      });

      if (!isServer) continue;

      const sharesRow = rowCount[r] > 1;
      const sharesColumn = colCount[c] > 1;

      addFrame({
        phase: 'compare',
        stage: 'check',
        activeLine: L('if the cell holds a server'),
        pythonLine: P('if grid[r][c] == 1'),
        cell: [r, c],
        message:
          `row_count[${r}] = ${rowCount[r]}, ` +
          `col_count[${c}] = ${colCount[c]}. ` +
          `Communication = ${sharesRow} OR ${sharesColumn}.`,
      });

      if (sharesRow || sharesColumn) {
        total += 1;
        counted.push({ row: r, col: c });

        addFrame({
          phase: 'count',
          stage: 'check',
          activeLine: L('add one to total'),
          pythonLine: P('total += 1'),
          cell: [r, c],
          message:
            `Server (${r}, ${c}) can communicate. ` +
            `Increment total to ${total}.`,
        });
      } else {
        addFrame({
          phase: 'skip',
          stage: 'check',
          activeLine: L('if the cell holds a server'),
          pythonLine: P('if grid[r][c] == 1'),
          cell: [r, c],
          message:
            `Server (${r}, ${c}) is alone in both its row and column.`,
        });
      }
    }
  }

  addFrame({
    phase: 'done',
    stage: 'done',
    activeLine: L('return total'),
    pythonLine: P('return total'),
    message: `${total} servers communicate.`,
  });

  return { input, result: total, frames };
}
