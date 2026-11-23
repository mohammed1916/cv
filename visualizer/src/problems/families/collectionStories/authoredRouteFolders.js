// Some historical Problem<number> folders implement a different catalog problem.
// Preserve their existing routes and register the missing canonical story separately.
const folders={};
export const authoredRouteFolder=id=>folders[id]??`Problem${id}`;
// Explicitly reviewed same-problem replacements; other existing routes stay guarded.
export const authoredRouteReplacements=new Set(['82','255','426','432','491','510','550','558','564','568','573','574','586']);
