// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Missing low and threshold bonuses share one employee roster",
    "input": "{\"employee\":[{\"empId\":10,\"name\":\"Mira\",\"supervisor\":null,\"salary\":6000},{\"empId\":20,\"name\":\"Dev\",\"supervisor\":10,\"salary\":4200},{\"empId\":30,\"name\":\"Lina\",\"supervisor\":10,\"salary\":3900},{\"empId\":40,\"name\":\"Omar\",\"supervisor\":20,\"salary\":3500},{\"empId\":50,\"name\":\"Nia\",\"supervisor\":20,\"salary\":3700},{\"empId\":60,\"name\":\"Pavel\",\"supervisor\":30,\"salary\":4100}],\"bonus\":[{\"empId\":10,\"bonus\":1800},{\"empId\":20,\"bonus\":999},{\"empId\":40,\"bonus\":1000},{\"empId\":50,\"bonus\":0},{\"empId\":60,\"bonus\":750}]}"
  },
  {
    "label": "No bonus rows preserves every employee",
    "input": "{\"employee\":[{\"empId\":7,\"name\":\"Ari\",\"supervisor\":null,\"salary\":4000},{\"empId\":8,\"name\":\"Bo\",\"supervisor\":7,\"salary\":3000}],\"bonus\":[]}"
  },
  {
    "label": "Exactly 1000 does not qualify",
    "input": "{\"employee\":[{\"empId\":9,\"name\":\"Cleo\",\"supervisor\":null,\"salary\":5000}],\"bonus\":[{\"empId\":9,\"bonus\":1000}]}"
  },
  {
    "label": "No employee rows means no output",
    "input": "{\"employee\":[],\"bonus\":[]}"
  }
];
