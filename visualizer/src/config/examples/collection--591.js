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
  },
  {
    "label": "Single empty element",
    "input": "{\"code\":\"<A></A>\"}"
  },
  {
    "label": "Repeated tag names nest cleanly",
    "input": "{\"code\":\"<X><X>deep</X></X>\"}"
  },
  {
    "label": "Longest allowed nesting",
    "input": "{\"code\":\"<T0><T1><T2><T3><T4><T5><T6><T7><T8><T9><T10><T11><T12><T13><T14><T15><T16><T17><T18><T19><T20><T21><T22><T23><T24><T25><T26><T27><T28><T29>payload</T29></T28></T27></T26></T25></T24></T23></T22></T21></T20></T19></T18></T17></T16></T15></T14></T13></T12></T11></T10></T9></T8></T7></T6></T5></T4></T3></T2></T1></T0>\"}"
  },
  {
    "label": "Long run: 12 nested tags with text",
    "input": "{\"code\":\"<G0><G1><G2><G3><G4><G5><G6><G7><G8><G9><G10><G11>aafaceaefddbbdabcddcdebcfdaafbfdafdfeded</G11></G10></G9></G8></G7></G6></G5></G4></G3></G2></G1></G0>\"}"
  }
];
