import StoryPanel from './StoryPanel';
import './PascalStory.css';

function Row({values,index,roleAt=()=>''}) {
  return <div className="pascal-story__row"><span>Row {index}</span>{values.map((value,j)=><div key={j} data-role={roleAt(j)}><strong>{value}</strong><small>{roleAt(j)||`#${j}`}</small></div>)}</div>;
}
export default function PascalStory({story,step}) {
  const start=Math.max(0,(step.visibleRows??0)-4);
  return <StoryPanel title={story.mode==='triangle'?'Every interior number has two parents':'Move left before old values disappear'} description={step.message}>
    {step.phase==='sum' && <p><strong>{step.a} + {step.b} = {step.row[step.j]}</strong> at row {step.i}, position {step.j}.</p>}
    {story.mode==='triangle'?<>
      <p>The two outside edges stay 1. Each interior value combines its upper-left and upper-right parents.</p>
      {start>0 && <p>Showing the latest rows {start}–{step.visibleRows-1}; seek backward to inspect earlier rows.</p>}
      <div className="pascal-story__rows" role="region" tabIndex={0} aria-label="Pascal triangle rows">
        {story.rows.slice(start,step.visibleRows).map((row,k)=><Row key={start+k} index={start+k} values={row} roleAt={j=>start+k===step.i-1 && (j===step.j-1||j===step.j)?'parent':''}/>)}
        {step.row && step.row.length>0 && <Row values={step.row} index={step.i} roleAt={j=>j===step.j?'sum':j===0||j===step.i?'edge':step.phase==='border'||j>step.j?'pending':'written'}/>}
      </div>
    </>:<>
      <p>Read from the old row while writing the new one. Right-to-left updates preserve both inputs; left-to-right updates would reuse a value already changed.</p>
      <div className="pascal-story__rows" role="region" tabIndex={0} aria-label="In-place Pascal row update">
        {step.previous.length>0 && <Row values={step.previous} index={step.i-1} roleAt={j=>j===step.j||j===step.j-1?'old input':''}/>}
        <Row values={step.row} index={step.i} roleAt={j=>j===step.j?'written now':step.phase==='done'?'result':j===0||j===step.i?'edge':step.j>0&&j>step.j?'new': 'old'}/>
      </div>
      <p>{step.previous.length>0 ? 'The upper row is an explanatory snapshot. The algorithm keeps only the lower buffer.' : 'Only one row buffer is needed.'}</p>
    </>}
  </StoryPanel>;
}
