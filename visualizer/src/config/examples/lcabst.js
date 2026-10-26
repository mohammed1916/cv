// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Deep nodes in one subtree",
    "arrInput": "[18,7,29,3,12,24,35,null,5,10,15,21,null,32,41]",
    "p": 10,
    "q": 15
  },
  {
    "label": "Across root",
    "arrInput": "[18,7,29,3,12,24,35,null,5,10,15,21,null,32,41]",
    "p": 5,
    "q": 32
  },
  {
    "label": "One node is ancestor",
    "arrInput": "[18,7,29,3,12,24,35,null,5,10,15,21,null,32,41]",
    "p": 7,
    "q": 10
  },
  {
    "label": "Direct siblings",
    "arrInput": "[18,7,29]",
    "p": 7,
    "q": 29
  }
];
