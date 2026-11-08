// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several branches and grandchildren distinguish parent timing",
    "input": "{\"root\":{\"val\":40,\"children\":[{\"val\":12,\"children\":[{\"val\":5,\"children\":[]},{\"val\":17,\"children\":[{\"val\":14,\"children\":[]},{\"val\":19,\"children\":[]}]}]},{\"val\":23,\"children\":[]},{\"val\":61,\"children\":[{\"val\":48,\"children\":[]},{\"val\":72,\"children\":[]},{\"val\":86,\"children\":[{\"val\":81,\"children\":[]}]}]}]}}"
  },
  {
    "label": "An empty tree has no traversal values",
    "input": "{\"root\":null}"
  },
  {
    "label": "Repeated values retain distinct node identities",
    "input": "{\"root\":{\"val\":7,\"children\":[{\"val\":7,\"children\":[{\"val\":7,\"children\":[]}]},{\"val\":7,\"children\":[]},{\"val\":7,\"children\":[]}]}}"
  },
  {
    "label": "A single long child chain exposes reversed traversal order",
    "input": "{\"root\":{\"val\":3,\"children\":[{\"val\":8,\"children\":[{\"val\":15,\"children\":[{\"val\":24,\"children\":[{\"val\":35,\"children\":[]}]}]}]}]}}"
  },
  {
    "label": "Single node with no children",
    "input": "{\"root\":{\"val\":4,\"children\":[]}}"
  },
  {
    "label": "Equal values in sibling branches",
    "input": "{\"root\":{\"val\":7,\"children\":[{\"val\":7,\"children\":[]},{\"val\":7,\"children\":[]}]}}"
  },
  {
    "label": "Extreme values at the limits",
    "input": "{\"root\":{\"val\":10000,\"children\":[{\"val\":0,\"children\":[]},{\"val\":10000,\"children\":[]}]}}"
  },
  {
    "label": "Long run: 30 nodes with generated branches",
    "input": "{\"root\":{\"val\":9,\"children\":[{\"val\":23,\"children\":[{\"val\":9,\"children\":[{\"val\":21,\"children\":[{\"val\":82,\"children\":[{\"val\":64,\"children\":[]},{\"val\":16,\"children\":[]}]},{\"val\":11,\"children\":[{\"val\":38,\"children\":[{\"val\":63,\"children\":[]}]},{\"val\":44,\"children\":[]}]},{\"val\":13,\"children\":[{\"val\":6,\"children\":[{\"val\":56,\"children\":[]}]}]},{\"val\":24,\"children\":[]}]},{\"val\":25,\"children\":[{\"val\":22,\"children\":[]}]},{\"val\":32,\"children\":[{\"val\":63,\"children\":[{\"val\":45,\"children\":[]},{\"val\":59,\"children\":[]}]}]}]},{\"val\":42,\"children\":[]}]},{\"val\":29,\"children\":[{\"val\":24,\"children\":[]}]},{\"val\":83,\"children\":[{\"val\":82,\"children\":[]},{\"val\":86,\"children\":[]}]},{\"val\":54,\"children\":[]},{\"val\":46,\"children\":[{\"val\":95,\"children\":[]}]}]}}"
  }
];
