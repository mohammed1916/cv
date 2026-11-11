import DPDependencyView from '../../components/shared/DPDependencyView';
import {TrackedValues} from '../../components/shared/adaptive/AdaptiveStage';

export const shelfVisuals = [
  {
    id:'dp', title:'Prefix costs',
    select:({step})=>Object.fromEntries(step.snapshot.dp.map((value,i)=>[String(i),value])),
    reads:({step})=>['candidate','improve','done','prefix'].includes(step.kind)
      ? [step.snapshot.end,...(step.snapshot.start ? [step.snapshot.start-1] : [])] : [],
    render:({step,focused,focusKeys})=><DPDependencyView title="Minimum height for each prefix" shape="linear" values={step.snapshot.dp}
      target={[0,step.snapshot.end ?? 0]} sources={step.snapshot.start ? [{cell:[0,step.snapshot.start-1],chosen:step.kind==='improve'}] : []}
      focusCells={focused && focusKeys.length ? focusKeys.map(key=>[0,Number(key)]) : null}
      recurrence="dp[end] = min(dp[end], dp[start-1] + tallest)" />,
  },
  {
    id:'books',title:'Books in their original order',
    select:({run})=>Object.fromEntries(run.input.books.map((book,i)=>[String(i+1),book])),
    reads:({step})=>step.snapshot.start ? Array.from({length:step.snapshot.end-step.snapshot.start+1},(_,i)=>step.snapshot.start+i) : [],
    render:props=><TrackedValues {...props} format={book=>`${book[0]} wide × ${book[1]} tall`} />,
  },
  // Adding this registration is sufficient for ALL three modes. No tutorial renderer or scene edit.
  {
    id:'variables',title:'Current variables',
    select:({step})=>Object.fromEntries(['end','start','width','tallest','candidate'].filter(key=>step.snapshot[key]!==undefined).map(key=>[key,step.snapshot[key]])),
    reads:({step})=>['fit','stop'].includes(step.kind) ? ['width'] : step.kind==='candidate' ? ['tallest','candidate'] : [],
  },
];
