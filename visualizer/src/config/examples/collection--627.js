// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed stored categories swap in a single pass",
    "input": "{\"salary\":[{\"id\":1,\"name\":\"Ari\",\"sex\":\"m\",\"salary\":4200},{\"id\":2,\"name\":\"Bela\",\"sex\":\"f\",\"salary\":5100},{\"id\":3,\"name\":\"Cai\",\"sex\":\"m\",\"salary\":3600},{\"id\":4,\"name\":\"Dara\",\"sex\":\"f\",\"salary\":6800},{\"id\":5,\"name\":\"Eli\",\"sex\":\"f\",\"salary\":4700}]}"
  },
  {
    "label": "All m entries become f",
    "input": "{\"salary\":[{\"id\":1,\"name\":\"Finn\",\"sex\":\"m\",\"salary\":2300},{\"id\":2,\"name\":\"Gray\",\"sex\":\"m\",\"salary\":3400}]}"
  },
  {
    "label": "All f entries become m",
    "input": "{\"salary\":[{\"id\":1,\"name\":\"Hana\",\"sex\":\"f\",\"salary\":3900},{\"id\":2,\"name\":\"Ira\",\"sex\":\"f\",\"salary\":5200}]}"
  },
  {
    "label": "An empty salary table needs no changes",
    "input": "{\"salary\":[]}"
  }
];
