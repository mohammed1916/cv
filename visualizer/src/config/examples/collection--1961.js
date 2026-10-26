// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The target ends at a later complete-word boundary",
    "input": "{\"s\":\"silverriverbend\",\"words\":[\"silver\",\"river\",\"bend\",\"at\",\"dawn\"]}"
  },
  {
    "label": "Target ends inside a word",
    "input": "{\"s\":\"moonlig\",\"words\":[\"moon\",\"light\",\"trail\"]}"
  },
  {
    "label": "All words together are still too short",
    "input": "{\"s\":\"pineforest\",\"words\":[\"pine\",\"for\"]}"
  },
  {
    "label": "The first complete word matches",
    "input": "{\"s\":\"harbor\",\"words\":[\"harbor\",\"lights\"]}"
  }
];
