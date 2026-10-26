// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested content includes apparent tags inside opaque CDATA",
    "input": "{\"code\":\"<ARCHIVE><ENTRY>field notes</ENTRY><![CDATA[<BROKEN> stays literal & </OTHER>]]><ENTRY><PAGE>seven</PAGE></ENTRY></ARCHIVE>\"}"
  },
  {
    "label": "A closing tag cannot skip the most recent opening tag",
    "input": "{\"code\":\"<ROOT><INNER>notes</ROOT></INNER>\"}"
  },
  {
    "label": "A second complete root is still invalid",
    "input": "{\"code\":\"<ONE>first</ONE><TWO>second</TWO>\"}"
  },
  {
    "label": "An unterminated CDATA section never becomes ordinary text",
    "input": "{\"code\":\"<ROOT><![CDATA[unfinished data</ROOT>\"}"
  }
];
