// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Partial overlap",
    "vals": {
      "ax1": -4,
      "ay1": -2,
      "ax2": 5,
      "ay2": 6,
      "bx1": 1,
      "by1": 3,
      "bx2": 9,
      "by2": 8
    }
  },
  {
    "label": "One contains the other",
    "vals": {
      "ax1": 0,
      "ay1": 0,
      "ax2": 9,
      "ay2": 9,
      "bx1": 2,
      "by1": 3,
      "bx2": 6,
      "by2": 7
    }
  },
  {
    "label": "Touching edge",
    "vals": {
      "ax1": 0,
      "ay1": 0,
      "ax2": 4,
      "ay2": 5,
      "bx1": 4,
      "by1": 0,
      "bx2": 8,
      "by2": 5
    }
  },
  {
    "label": "Disjoint",
    "vals": {
      "ax1": -5,
      "ay1": -5,
      "ax2": -2,
      "ay2": -1,
      "bx1": 2,
      "by1": 3,
      "bx2": 7,
      "by2": 8
    }
  }
];
