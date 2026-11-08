
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
    throw new Error('grid must be between 1x1 and 6x6.');
  }

  const cols = grid[0].length;

  if (
    grid.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== cols ||
        row.some((value) => value !== 0 && value !== 1)
    )
  ) {
    throw new Error(
      'grid must be rectangular, containing only 0 and 1.'
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

  function pushFrame({
    phase,
    stage,
    activeLine,
    pythonLine,
    cell = null,
    scanAxis = null,
    scanIndex = null,
    scanValue = null,
    previousSum = null,
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
      previousSum,
      runningSum,
      rowCount: [...rowCount],
      colCount: [...colCount],
      counted: counted.map((point) => ({ ...point })),
      rows,
      cols,
      total,
      message,
    });
  }

  pushFrame({
    phase: 'start',
    stage: 'input',
    activeLine: 1,
    pythonLine: 1,
    message:
      'Inspect the input grid. A value of 1 represents a server.',
  });

  pushFrame({
    phase: 'dimensions',
    stage: 'dimensions',
    activeLine: L('determine rows and columns'),
    pythonLine: P('rows, cols ='),
    message: `The grid has ${rows} rows and ${cols} columns.`,
  });

  // Construct row_count, one row at a time.
  for (let r = 0; r < rows; r++) {
    let sum = 0;

    pushFrame({
      phase: 'row-begin',
      stage: 'rows',
      activeLine: L('count the servers in each row'),
      pythonLine: P('row_count ='),
      scanAxis: 'row',
      scanIndex: r,
      previousSum: 0,
      runningSum: 0,
      message: `Begin scanning row ${r}. Running sum = 0.`,
    });

    for (let c = 0; c < cols; c++) {
      const previousSum = sum;
      const scanValue = grid[r][c];

      sum += scanValue;

      pushFrame({
        phase: 'row-scan',
        stage: 'rows',
        activeLine: L('count the servers in each row'),
        pythonLine: P('row_count ='),
        cell: [r, c],
        scanAxis: 'row',
        scanIndex: r,
        scanValue,
        previousSum,
        runningSum: sum,
        message:
          `Read grid[${r}][${c}] = ${scanValue}. ` +
          `${previousSum} + ${scanValue} = ${sum}.`,
      });
    }

    rowCount[r] = sum;

    pushFrame({
      phase: 'row-commit',
      stage: 'rows',
      activeLine: L('count the servers in each row'),
      pythonLine: P('row_count ='),
      scanAxis: 'row',
      scanIndex: r,
      previousSum: sum,
      runningSum: sum,
      message: `Store row_count[${r}] = ${sum}.`,
    });
  }

  // Construct col_count, one column at a time.
  for (let c = 0; c < cols; c++) {
    let sum = 0;

    pushFrame({
      phase: 'col-begin',
      stage: 'columns',
      activeLine: L('count the servers in each column'),
      pythonLine: P('col_count ='),
      scanAxis: 'column',
      scanIndex: c,
      previousSum: 0,
      runningSum: 0,
      message: `Begin scanning column ${c}. Running sum = 0.`,
    });

    for (let r = 0; r < rows; r++) {
      const previousSum = sum;
      const scanValue = grid[r][c];

      sum += scanValue;

      pushFrame({
        phase: 'col-scan',
        stage: 'columns',
        activeLine: L('count the servers in each column'),
        pythonLine: P('col_count ='),
        cell: [r, c],
        scanAxis: 'column',
        scanIndex: c,
        scanValue,
        previousSum,
        runningSum: sum,
        message:
          `Read grid[${r}][${c}] = ${scanValue}. ` +
          `${previousSum} + ${scanValue} = ${sum}.`,
      });
    }

    colCount[c] = sum;

    pushFrame({
      phase: 'col-commit',
      stage: 'columns',
      activeLine: L('count the servers in each column'),
      pythonLine: P('col_count ='),
      scanAxis: 'column',
      scanIndex: c,
      previousSum: sum,
      runningSum: sum,
      message: `Store col_count[${c}] = ${sum}.`,
    });
  }

  pushFrame({
    phase: 'initialize',
    stage: 'initialize',
    activeLine: L('set total to 0'),
    pythonLine: P('total = 0'),
    message:
      'Both count arrays are ready. Initialize total to zero.',
  });

  // Reuse the precomputed information.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isServer = grid[r][c] === 1;

      pushFrame({
        phase: 'inspect',
        stage: 'check',
        activeLine: L('for each cell in the grid'),
        pythonLine: P('for c in range(cols)'),
        cell: [r, c],
        message: isServer
          ? `Inspect server (${r}, ${c}).`
          : `Cell (${r}, ${c}) is empty. Skip it.`,
      });

      if (!isServer) continue;

      const sharesRow = rowCount[r] > 1;
      const sharesColumn = colCount[c] > 1;

      pushFrame({
        phase: 'compare',
        stage: 'check',
        activeLine: L('if the cell holds a server'),
        pythonLine: P('if grid[r][c] == 1'),
        cell: [r, c],
        message:
          `row_count[${r}] = ${rowCount[r]} and ` +
          `col_count[${c}] = ${colCount[c]}. ` +
          `${sharesRow} OR ${sharesColumn} = ` +
          `${sharesRow || sharesColumn}.`,
      });

      if (sharesRow || sharesColumn) {
        total++;
        counted.push({ row: r, col: c });

        pushFrame({
          phase: 'count',
          stage: 'check',
          activeLine: L('add one to total'),
          pythonLine: P('total += 1'),
          cell: [r, c],
          message:
            `Server (${r}, ${c}) communicates. ` +
            `Increment total to ${total}.`,
        });
      } else {
        pushFrame({
          phase: 'skip',
          stage: 'check',
          activeLine: L('if the cell holds a server'),
          pythonLine: P('if grid[r][c] == 1'),
          cell: [r, c],
          message:
            `Server (${r}, ${c}) is isolated. ` +
            'Neither count exceeds one.',
        });
      }
    }
  }

  pushFrame({
    phase: 'done',
    stage: 'done',
    activeLine: L('return total'),
    pythonLine: P('return total'),
    message: `${total} servers can communicate.`,
  });

  return { input, result: total, frames };
}
