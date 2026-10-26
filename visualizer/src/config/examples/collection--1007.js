// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both target rows require different numbers of rotations",
    "input": "{\"tops\":[4,2,4,6,4,3,4,1,4,5],\"bottoms\":[2,4,4,4,6,4,3,4,4,4]}"
  },
  {
    "label": "A later domino blocks both first candidates",
    "input": "{\"tops\":[2,3,6],\"bottoms\":[5,4,1]}"
  },
  {
    "label": "Top row already uniform",
    "input": "{\"tops\":[6,6,6,6],\"bottoms\":[1,2,3,4]}"
  },
  {
    "label": "Either direction needs one rotation",
    "input": "{\"tops\":[3,5],\"bottoms\":[5,3]}"
  }
];
