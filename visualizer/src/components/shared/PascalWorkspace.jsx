import AlgorithmStoryWorkspace from './AlgorithmStoryWorkspace';
import { getExamples } from '../../config/examplesRegistry';
import PascalStory from './PascalStory.jsx';
import { pascalTriangleNarrative, pascalRowNarrative } from './pascalNarrative';
import { buildPascalStory, PASCAL_CODE } from './pascalTrace';
const definitions=Object.fromEntries(['triangle','row'].map(mode=>[mode,{
  narrative: mode === 'triangle' ? pascalTriangleNarrative : pascalRowNarrative,
  title:mode==='triangle'?'Grow Pascal’s Triangle':'Reuse One Pascal Row',
  inputLabel:mode==='triangle'?'Number of rows':'Row index',inputType:'number',initialInput:mode==='triangle'?'5':'4',
  examples:getExamples(`pascal-${mode}`),
  code:PASCAL_CODE[mode].map((text,i)=>({line:i+1,text})),
  linePatterns:mode==='triangle'?{2:'init',4:'init',6:'update',7:'update',8:'done'}:{2:'init',4:'update',6:'update',7:'done'},
  patterns:['init','update','done'],build:input=>buildPascalStory(input,mode),
  renderStory:({story,step})=><PascalStory story={story} step={step}/>,
}]));
export default function PascalWorkspace({mode}) {return <AlgorithmStoryWorkspace definition={definitions[mode]}/>;}
