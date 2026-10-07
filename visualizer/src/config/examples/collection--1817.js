// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated logs collapse before user bucketing",
    "input": "{\"logs\":[[7,4],[3,2],[7,4],[7,5],[9,1],[3,6],[7,8],[9,1],[11,3],[11,7],[11,9],[11,10]],\"k\":5}"
  },
  {
    "label": "One user repeats one minute",
    "input": "{\"logs\":[[2,8],[2,8],[2,8]],\"k\":3}"
  },
  {
    "label": "Every user active once",
    "input": "{\"logs\":[[1,4],[2,4],[3,4]],\"k\":2}"
  },
  {
    "label": "One user fills the last bucket",
    "input": "{\"logs\":[[5,1],[5,2],[5,3],[5,4]],\"k\":4}"
  }
];
