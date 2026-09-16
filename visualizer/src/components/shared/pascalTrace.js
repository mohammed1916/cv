export const PASCAL_CODE = {
  triangle: ['def generate(numRows):','    triangle = []','    for i in range(numRows):','        row = [1] * (i + 1)','        for j in range(1, i):','            row[j] = triangle[i-1][j-1] + triangle[i-1][j]','        triangle.append(row)','    return triangle'],
  row: ['def getRow(rowIndex):','    row = [1]','    for i in range(1, rowIndex + 1):','        row.append(1)','        for j in range(i - 1, 0, -1):','            row[j] += row[j-1]','    return row'],
};

export function buildPascalStory(text, mode) {
  const size = Number(text), minimum = mode === 'triangle' ? 1 : 0, maximum = mode === 'triangle' ? 30 : 33;
  if (!String(text).trim() || !Number.isInteger(size) || size < minimum || size > maximum) throw new Error(`Enter an integer from ${minimum} to ${maximum}.`);
  const frames = [], rows = [];
  if (mode === 'triangle') {
    frames.push({ activeLine: 2, phase: 'init', visibleRows: 0, row: [], i: -1, j: -1, message: 'Start with an empty triangle.' });
    for (let i = 0; i < size; i++) {
      const row = Array(i+1).fill(1);
      frames.push({ activeLine: 4, phase: 'border', visibleRows: i, row: [...row], i, j: -1, message: `Row ${i}: the boundary values are 1. Interior slots will receive two-parent sums.` });
      for (let j=1;j<i;j++) {
        const a=rows[i-1][j-1],b=rows[i-1][j];row[j]=a+b;
        frames.push({ activeLine: 6, phase: 'sum', visibleRows: i, row: [...row], i, j, a, b, message: `Two parents above: ${a} + ${b} = ${row[j]}.` });
      }
      rows.push(row);
      frames.push({ activeLine: 7, phase: 'save', visibleRows: i+1, row: null, i, j: -1, message: `Save row ${i}; it can now supply the next row's parents.` });
    }
    frames.push({ activeLine: 8, phase: 'done', visibleRows: size, row: null, i: size-1, j: -1, message: `Return all ${size} rows.` });
  } else {
    const row=[1];
    frames.push({ activeLine: 2, phase: 'init', row:[1], previous:[], i:0, j:-1, message:'Row 0 is [1]. Reuse this buffer for every later row.' });
    for(let i=1;i<=size;i++) {
      const previous=[...row];row.push(1);
      frames.push({ activeLine:4, phase:'border', row:[...row], previous, i,j:-1,message:`Append the new right boundary. Update the interior from right to left.` });
      for(let j=i-1;j>0;j--) {
        const a=row[j-1],b=row[j];row[j]=a+b;
        frames.push({ activeLine:6, phase:'sum',row:[...row],previous,i,j,a,b,message:`Slot ${j}: old left ${a} + old current ${b} = ${row[j]}. Slots to the left are still untouched.` });
      }
    }
    frames.push({ activeLine:7,phase:'done',row:[...row],previous:[],i:size,j:-1,message:`Return row ${size} using ${row.length} buffer slots.` });
  }
  return {mode,size,rows,frames};
}
