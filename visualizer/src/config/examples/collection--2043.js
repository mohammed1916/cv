// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed transactions include insufficient funds and corrections",
    "input": "{\"balance\":[120,45,300,80],\"operations\":[[\"transfer\",3,2,90],[\"withdraw\",1,150],[\"deposit\",1,60],[\"transfer\",1,4,130],[\"withdraw\",2,35],[\"transfer\",4,4,20],[\"deposit\",7,10]]}"
  },
  {
    "label": "An invalid destination must not debit the source",
    "input": "{\"balance\":[50,70],\"operations\":[[\"transfer\",1,9,20],[\"withdraw\",1,50]]}"
  },
  {
    "label": "Zero money still requires a valid account",
    "input": "{\"balance\":[0],\"operations\":[[\"withdraw\",1,0],[\"deposit\",1,0],[\"transfer\",1,2,0]]}"
  },
  {
    "label": "Exact balance may be withdrawn completely",
    "input": "{\"balance\":[85,10],\"operations\":[[\"withdraw\",1,85],[\"withdraw\",1,1],[\"transfer\",2,1,10]]}"
  }
];
