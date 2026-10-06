// Some historical Problem<number> folders implement a different catalog problem.
// Preserve their existing routes and register the missing canonical story separately.
const folders={351:'Problem351Canonical',381:'Problem381Canonical',427:'Problem427Canonical',487:'Problem487Canonical'};
export const authoredRouteFolder=id=>folders[id]??`Problem${id}`;
// Explicitly reviewed same-problem replacements; other existing routes stay guarded.
export const authoredRouteReplacements=new Set(['82','255','426','432','491']);
