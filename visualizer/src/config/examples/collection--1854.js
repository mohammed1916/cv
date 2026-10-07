// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Births and deaths share event years",
    "input": "{\"logs\":[[1962,1987],[1970,2001],[1987,2020],[1978,1987],[1982,2012],[2001,2035],[1987,1994]]}"
  },
  {
    "label": "Tied populations preserve earliest year",
    "input": "{\"logs\":[[1955,1960],[1970,1975]]}"
  },
  {
    "label": "Death year is excluded",
    "input": "{\"logs\":[[1980,1990],[1990,2000]]}"
  },
  {
    "label": "One lifespan",
    "input": "{\"logs\":[[2003,2041]]}"
  }
];
