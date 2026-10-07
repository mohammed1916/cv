// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A branching tree separates root inner nodes and terminal leaves",
    "input": "{\"tree\":[{\"id\":40,\"p_id\":null},{\"id\":12,\"p_id\":40},{\"id\":61,\"p_id\":40},{\"id\":7,\"p_id\":12},{\"id\":19,\"p_id\":12},{\"id\":50,\"p_id\":61},{\"id\":72,\"p_id\":61},{\"id\":68,\"p_id\":72}]}"
  },
  {
    "label": "A singleton is Root even though it has no children",
    "input": "{\"tree\":[{\"id\":9,\"p_id\":null}]}"
  },
  {
    "label": "A long chain has one root one leaf and inner links",
    "input": "{\"tree\":[{\"id\":2,\"p_id\":null},{\"id\":5,\"p_id\":2},{\"id\":11,\"p_id\":5},{\"id\":23,\"p_id\":11}]}"
  },
  {
    "label": "Input row order does not determine the root",
    "input": "{\"tree\":[{\"id\":8,\"p_id\":20},{\"id\":31,\"p_id\":20},{\"id\":20,\"p_id\":null}]}"
  }
];
