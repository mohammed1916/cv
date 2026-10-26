// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Null allowed and excluded referee",
    "customers": [
      {
        "id": 11,
        "name": "Mira",
        "referee_id": null
      },
      {
        "id": 12,
        "name": "Oren",
        "referee_id": 7
      },
      {
        "id": 13,
        "name": "Tara",
        "referee_id": 3
      },
      {
        "id": 14,
        "name": "Ivo",
        "referee_id": 7
      },
      {
        "id": 15,
        "name": "Nila",
        "referee_id": 11
      }
    ],
    "refereeId": 7
  },
  {
    "label": "All null referees",
    "customers": [
      {
        "id": 21,
        "name": "Eli",
        "referee_id": null
      },
      {
        "id": 22,
        "name": "Uma",
        "referee_id": null
      }
    ],
    "refereeId": 7
  },
  {
    "label": "Empty table",
    "customers": [],
    "refereeId": 7
  }
];
