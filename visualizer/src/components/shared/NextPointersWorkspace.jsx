import authoredExamples0 from '../../config/examples/next-pointers-perfect.js';
import authoredExamples1 from '../../config/examples/next-pointers-sparse.js';
import AlgorithmStoryWorkspace from './AlgorithmStoryWorkspace';

import NextPointersStory from './NextPointersStory';
import { perfectPointerNarrative, sparsePointerNarrative } from './nextPointerNarrative';
import { buildNextPointerStory, NEXT_POINTER_CODE } from './nextPointerStory';

const definitions = Object.fromEntries(['perfect','sparse'].map(mode=>[mode,{
  narrative: mode === 'perfect' ? perfectPointerNarrative : sparsePointerNarrative,
  title:'Tree & Next Pointers', inputLabel:'Level-order tree', inputType:'array',
  initialInput:({perfect: authoredExamples0, sparse: authoredExamples1})[mode][0].input,
  examples:({perfect: authoredExamples0, sparse: authoredExamples1})[mode],
  code:NEXT_POINTER_CODE[mode].map((text,index)=>({line:index+1,text})),
  linePatterns:mode==='perfect'?{2:'check',5:'visit',7:'update',9:'update',10:'visit',11:'visit',12:'done'}:{2:'init',4:'init',7:'check',8:'update',9:'visit',10:'visit',11:'visit',12:'done'},
  patterns:['init','check','visit','update','done'],
  build:input=>buildNextPointerStory(input,mode),
  renderStory:({story,step})=><NextPointersStory story={story} step={step}/>,
}]));
export default function NextPointersWorkspace({mode}) {
  return <AlgorithmStoryWorkspace definition={definitions[mode]}/>;
}
