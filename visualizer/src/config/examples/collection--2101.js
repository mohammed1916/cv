// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A directed chain connects clusters through different radii",
    "input": "{\"bombs\":[[0,0,5],[4,0,3],[7,0,5],[11,2,4],[14,2,2],[30,8,1]]}"
  },
  {
    "label": "Reach in one direction need not work in reverse",
    "input": "{\"bombs\":[[0,0,9],[8,0,1]]}"
  },
  {
    "label": "Isolated bombs only detonate themselves",
    "input": "{\"bombs\":[[0,0,1],[10,0,2],[0,12,3]]}"
  },
  {
    "label": "Coincident centers remain separate bombs",
    "input": "{\"bombs\":[[6,6,1],[6,6,3],[8,6,1],[11,6,2]]}"
  }
];
