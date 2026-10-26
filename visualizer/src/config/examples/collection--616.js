// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping and touching matches form several merged runs",
    "input": "{\"s\":\"starlightstar-mapmoonbeam\",\"words\":[\"star\",\"light\",\"tstar\",\"moon\",\"beam\"]}"
  },
  {
    "label": "Adjacent matches share one pair of tags",
    "input": "{\"s\":\"redbluegold\",\"words\":[\"red\",\"blue\",\"gold\"]}"
  },
  {
    "label": "No matching word leaves the text unchanged",
    "input": "{\"s\":\"quietforest\",\"words\":[\"river\",\"cloud\"]}"
  },
  {
    "label": "Repeated overlapping matches cover the entire text",
    "input": "{\"s\":\"aaaaaaa\",\"words\":[\"aa\",\"aaaa\"]}"
  }
];
