// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlaps span negative and positive street positions",
    "input": "{\"lights\":[[-6,4],[-2,3],[3,5],[8,2],[12,4]]}"
  },
  {
    "label": "Equal separated peaks choose the smaller position",
    "input": "{\"lights\":[[-8,1],[9,1]]}"
  },
  {
    "label": "Right endpoints remain illuminated",
    "input": "{\"lights\":[[2,2],[6,2]]}"
  },
  {
    "label": "A zero-radius light covers one integer point",
    "input": "{\"lights\":[[7,0]]}"
  },
  {
    "label": "Single lamp",
    "input": "[[0,3]]"
  },
  {
    "label": "Three lamps at one position",
    "input": "[[5,2],[5,2],[5,2]]"
  },
  {
    "label": "Lamps at both ends of the range",
    "input": "[[-50,50],[50,0]]"
  },
  {
    "label": "Long run: 20 lamps",
    "input": "[[-26,33],[-19,12],[43,0],[-25,17],[1,50],[39,23],[0,27],[42,17],[13,36],[39,28],[-47,48],[12,25],[45,49],[39,23],[50,39],[43,1],[28,7],[36,37],[21,43],[18,21]]"
  }
];
