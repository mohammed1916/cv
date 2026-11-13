import GraphTraversalView from '../../components/shared/GraphTraversalView';
export const bfsVisuals = [
  {
    id:'graph',title:'Graph',
    select:({run,step})=>Object.fromEntries(Array.from({length:run.input.n},(_,id)=>[String(id),{
      current:step.current===id,neighbour:step.neighbour===id,visited:step.visited.includes(id),done:step.done.includes(id),
    }])),
    reads:({step})=>[step.current,step.neighbour].filter(id=>id!==null && id!==undefined),
    render:({run,step,focused,focusKeys})=><GraphTraversalView n={run.input.n} edges={run.input.edges}
      current={step.current} neighbour={step.neighbour} visited={step.visited} done={step.done}
      frontier={step.frontier} showFrontier={false} focusNodes={focused ? focusKeys.map(Number) : null} />,
  },
  {
    id:'queue',title:'Queue · front first',
    select:({step})=>Object.fromEntries(step.frontier.map((id,index)=>[String(id),`position ${index+1}`])),
    active:({step})=>['dequeue','enqueue','init','not-found'].includes(step.kind),
    dependsOn:['graph'],
    transfer:({step})=>step.kind==='enqueue'
      ? {from:'graph',to:'queue',item:step.neighbour,changedVisual:'queue',operation:'insert'}
      : step.kind==='dequeue'
        ? {from:'queue',to:'graph',item:step.current,changedVisual:'queue',operation:'remove'}
        : null,
  },
  {
    id:'result',title:'Reachability',
    select:({step})=>step.result===undefined ? {} : {path:step.result},
  },
];
