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
  }
];
