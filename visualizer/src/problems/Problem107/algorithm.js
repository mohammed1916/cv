import { traceLevelOrder } from '../../components/shared/traceLevelOrder.js';
export function generateSteps(text) {
  return traceLevelOrder(text).map(frame=>({...frame,
    reversedLevels:frame.phase==='done'?[...frame.levels].reverse():[],
    message:frame.phase==='done'?'Reverse the order of completed levels. Keep the node order inside each level.':frame.message,
  }));
}
