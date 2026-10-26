// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Returned small seats become preferred again",
    "input": "{\"n\":7,\"operations\":[[\"reserve\"],[\"reserve\"],[\"reserve\"],[\"unreserve\",2],[\"reserve\"],[\"reserve\"],[\"unreserve\",1],[\"reserve\"],[\"reserve\"]]}"
  },
  {
    "label": "Fill every seat",
    "input": "{\"n\":3,\"operations\":[[\"reserve\"],[\"reserve\"],[\"reserve\"]]}"
  },
  {
    "label": "Single seat can be reused",
    "input": "{\"n\":1,\"operations\":[[\"reserve\"],[\"unreserve\",1],[\"reserve\"]]}"
  },
  {
    "label": "Returning a larger seat does not skip smaller free seats",
    "input": "{\"n\":5,\"operations\":[[\"reserve\"],[\"reserve\"],[\"reserve\"],[\"unreserve\",3],[\"unreserve\",1],[\"reserve\"]]}"
  }
];
