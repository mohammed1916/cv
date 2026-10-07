// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved ballots give one candidate a late lead",
    "input": "{\"candidate\":[{\"id\":4,\"name\":\"Mira\"},{\"id\":9,\"name\":\"Tao\"},{\"id\":15,\"name\":\"Leena\"},{\"id\":21,\"name\":\"Ravi\"}],\"vote\":[{\"id\":100,\"candidateId\":9},{\"id\":101,\"candidateId\":4},{\"id\":102,\"candidateId\":15},{\"id\":103,\"candidateId\":9},{\"id\":104,\"candidateId\":4},{\"id\":105,\"candidateId\":21},{\"id\":106,\"candidateId\":15},{\"id\":107,\"candidateId\":9},{\"id\":108,\"candidateId\":4},{\"id\":109,\"candidateId\":9}]}"
  },
  {
    "label": "A single ballot is enough to select a winner",
    "input": "{\"candidate\":[{\"id\":8,\"name\":\"Nora\"},{\"id\":12,\"name\":\"Ishan\"}],\"vote\":[{\"id\":100,\"candidateId\":12}]}"
  },
  {
    "label": "Duplicate names still use separate candidate IDs",
    "input": "{\"candidate\":[{\"id\":1,\"name\":\"Alex\"},{\"id\":2,\"name\":\"Alex\"},{\"id\":3,\"name\":\"Jo\"}],\"vote\":[{\"id\":100,\"candidateId\":1},{\"id\":101,\"candidateId\":2},{\"id\":102,\"candidateId\":2},{\"id\":103,\"candidateId\":3},{\"id\":104,\"candidateId\":2}]}"
  },
  {
    "label": "Candidates without votes do not create winning groups",
    "input": "{\"candidate\":[{\"id\":3,\"name\":\"Uma\"},{\"id\":6,\"name\":\"Vik\"},{\"id\":10,\"name\":\"Wen\"}],\"vote\":[{\"id\":100,\"candidateId\":6},{\"id\":101,\"candidateId\":6},{\"id\":102,\"candidateId\":6}]}"
  }
];
