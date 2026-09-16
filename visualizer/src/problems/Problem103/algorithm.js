import { traceLevelOrder } from '../../components/shared/traceLevelOrder.js';

// The queue always traverses left to right; only the completed output row reverses.
export function generateSteps(text) {
  const output=[];
  const lines={3:2,4:4,7:7,8:10,9:11,10:12,11:13,12:15,13:17};
  for(const frame of traceLevelOrder(text)) {
    const levels=frame.levels.map((row,i)=>i%2?[...row].reverse():row);
    const levelNum=frame.phase==='level-done'?levels.length-1:levels.length;
    const leftToRight=levelNum%2===0;
    const mapped={...frame,activeLine:lines[frame.activeLine],result:levels,levelNum,leftToRight,level:frame.currentLevel};
    if(frame.phase==='level-done') {
      const level=leftToRight?frame.currentLevel:[...frame.currentLevel].reverse();
      output.push({...mapped,phase:'reverse',activeLine:14,result:levels.slice(0,-1),level,message:leftToRight?'Keep this row in traversal order.':'Reverse this completed row; the FIFO queue stays unchanged.'});
      output.push({...mapped,level,message:`Save output row ${levelNum}: [${level.join(', ')}].`});
      output.push({...mapped,phase:'direction',activeLine:16,level,leftToRight:!leftToRight,message:'Flip the output direction for the next level.'});
    } else output.push(mapped);
  }
  return output;
}
