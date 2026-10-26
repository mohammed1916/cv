// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One insertion releases several waiting values",
    "input": "{\"n\":8,\"operations\":[[5,\"elm\"],[2,\"birch\"],[1,\"ash\"],[4,\"dogwood\"],[8,\"hazel\"],[3,\"cedar\"],[7,\"gum\"],[6,\"fir\"]]}"
  },
  {
    "label": "First slot remains empty",
    "input": "{\"n\":4,\"operations\":[[3,\"fern\"],[4,\"moss\"]]}"
  },
  {
    "label": "Arrive in exact order",
    "input": "{\"n\":3,\"operations\":[[1,\"oak\"],[2,\"pine\"],[3,\"yew\"]]}"
  },
  {
    "label": "Single slot",
    "input": "{\"n\":1,\"operations\":[[1,\"grove\"]]}"
  }
];
