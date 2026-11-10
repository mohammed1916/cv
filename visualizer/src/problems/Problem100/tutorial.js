const lessons = {
  2: ['Check the empty pair', 'Two absent children describe the same structure. Settle that base case before reading either value.'],
  3: ['Check structural agreement', 'Equal values elsewhere cannot repair a missing child. If only one node exists here, this pair fails.'],
  4: ['Compare this pair of values', 'Matching structure is not enough: the values at corresponding positions must also agree.'],
  5: ['Move to the left children', 'Matching parent values establish only a local match. Compare the corresponding left subtrees next.'],
  6: ['Move to the right children', 'The left result covers only half of this pair. This implementation also evaluates the right subtrees before combining both results.'],
  7: ['Return the combined result', 'A parent pair matches only if both child comparisons succeed. Return that result to its caller.'],
};
export function sameTreeTutorial({step}) {
  const [title, reason] = step.phase === 'start'
    ? ['Start with the roots', 'Compare corresponding positions together. Each recursive call decides whether one pair of subtrees matches.']
    : lessons[step.activeLine];
  const value = (nodes, id, edges) => {
    const current = step.phase === 'start' ? nodes.find(node => !edges.some(edge => edge.toId === node.id)) : nodes.find(node => node.id === id);
    return current?.val ?? 'null';
  };
  return {
    title: step.phase === 'done' ? 'Report the tree comparison' : title,
    reason, action: step.message, focus: step.phase === 'done' ? ['result'] : ['pair'],
    variables: step.phase === 'done' ? {result:step.finalResult} : {
      p:value(step.pNodes,step.activePId,step.pEdges), q:value(step.qNodes,step.activeQId,step.qEdges),
    },
  };
}
