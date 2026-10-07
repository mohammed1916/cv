// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several capacities move packages to different days",
    "input": "{\"weights\":[7,3,11,4,8,2,9,5,6,10,3,8],\"days\":5}"
  },
  {
    "label": "One day must carry everything",
    "input": "{\"weights\":[9,4,7,2],\"days\":1}"
  },
  {
    "label": "One day per package needs only the largest weight",
    "input": "{\"weights\":[6,2,8,3],\"days\":4}"
  },
  {
    "label": "Single indivisible package",
    "input": "{\"weights\":[23],\"days\":1}"
  }
];
