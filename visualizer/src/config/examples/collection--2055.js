// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Queries use different outermost enclosed candles",
    "input": "{\"s\":\"**|***|*||****|**|*\",\"queries\":[[0,17],[3,12],[7,16],[0,4],[8,9],[10,17]]}"
  },
  {
    "label": "No candle can enclose a plate",
    "input": "{\"s\":\"*******\",\"queries\":[[0,6],[2,4]]}"
  },
  {
    "label": "Candle-only intervals contain no plates",
    "input": "{\"s\":\"|||||\",\"queries\":[[0,4],[1,3]]}"
  },
  {
    "label": "One candle is insufficient",
    "input": "{\"s\":\"***|***\",\"queries\":[[0,6],[3,3]]}"
  }
];
