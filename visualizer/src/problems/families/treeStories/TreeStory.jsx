import AlgorithmWorkspace from '../../../components/shared/AlgorithmWorkspace';
import TreeDiagram from '../../../components/shared/TreeDiagram';
import IndexedSequence from '../../../components/shared/IndexedSequence';
import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout';
import styles from './TreeStory.module.css';

const display=value=>typeof value==='object'?JSON.stringify(value):String(value);
export default function TreeStory({definition}) {
 return <AlgorithmWorkspace definition={definition} renderVisual={({step})=><>
  <div className={styles.trees}>{step.trees.map(({label,root},index)=><section key={index} className={styles.tree}>
   <h3>{label}</h3><TreeDiagram {...binaryTreeLayout(root)} activeIds={new Set(step.active)}
    labelForNode={node=>step.nodeLabels?.[node.id]!==undefined?`return ${step.nodeLabels[node.id]}`:step.active.includes(node.id)?'Current':''}/>
  </section>)}</div>
  {step.output&&<IndexedSequence label="Recorded values / traversal frontier" length={step.output.length} active={step.output.length-1} valueAt={i=>display(step.output[i])}/>}
  {Object.keys(step.metrics).length>0&&<table><caption>Current decision state</caption><tbody>{Object.entries(step.metrics).map(([key,value])=><tr key={key}><th>{key}</th><td>{display(value)}</td></tr>)}</tbody></table>}
  {step.phase==='done'&&<output aria-label="Algorithm result">Result: {display(step.result)}</output>}
 </>} renderReasoning={()=><>
  <h3>Goal</h3><p>{definition.goal}</p><h3>Why these steps work</h3><p>{definition.strategy}</p>
  <h3>Boundary cases to compare</h3><ul>{definition.examples.slice(1).map(e=><li key={e.label}>{e.label}</li>)}</ul>
  <p>The code panel shows teaching pseudocode. Diagrams preserve node identity, including repeated values; playback snapshots are independent of later mutations.</p>
 </>}/>;
}
