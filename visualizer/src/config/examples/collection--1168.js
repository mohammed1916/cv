// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cheap pipes combine houses while selected wells anchor supply",
    "input": "{\"n\":6,\"wells\":[8,3,9,7,2,10],\"pipes\":[[1,2,2],[2,3,1],[3,4,4],[4,5,2],[5,6,3],[1,6,12],[2,5,8]]}"
  },
  {
    "label": "Without pipes every house needs its own well",
    "input": "{\"n\":3,\"wells\":[4,7,5],\"pipes\":[]}"
  },
  {
    "label": "Expensive pipes lose to individual wells",
    "input": "{\"n\":3,\"wells\":[2,3,4],\"pipes\":[[1,2,20],[2,3,30]]}"
  },
  {
    "label": "A zero-cost well and pipes can supply everything for free",
    "input": "{\"n\":4,\"wells\":[0,8,9,6],\"pipes\":[[1,2,0],[2,3,0],[3,4,0]]}"
  }
];
