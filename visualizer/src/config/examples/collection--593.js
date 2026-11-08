// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A translated rotated square with unordered vertices",
    "input": "{\"points\":[[9,9],[3,7],[7,5],[5,11]]}"
  },
  {
    "label": "A rectangle has equal diagonals but unequal sides",
    "input": "{\"points\":[[1,2],[9,2],[9,5],[1,5]]}"
  },
  {
    "label": "Repeated vertices cannot make a square",
    "input": "{\"points\":[[2,2],[2,2],[5,5],[5,5]]}"
  },
  {
    "label": "Four collinear points fail the distance pattern",
    "input": "{\"points\":[[-6,3],[-2,3],[2,3],[6,3]]}"
  },
  {
    "label": "Unit square in shuffled order",
    "input": "{\"points\":[[0,0],[1,1],[0,1],[1,0]]}"
  },
  {
    "label": "Square at the coordinate limits",
    "input": "{\"points\":[[-10000,-10000],[-10000,10000],[10000,10000],[10000,-10000]]}"
  },
  {
    "label": "Rhombus has equal sides but unequal diagonals",
    "input": "{\"points\":[[0,0],[2,1],[0,2],[-2,1]]}"
  },
  {
    "label": "Long run: rotated square with large offset",
    "input": "{\"points\":[[-3183,2145],[-3220,2182],[-3183,2219],[-3146,2182]]}"
  }
];
