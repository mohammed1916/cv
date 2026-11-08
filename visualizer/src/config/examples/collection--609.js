// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Content groups cross directories and filenames",
    "input": "{\"paths\":[\"archive/sketch a.txt(blue) b.txt(green) c.txt(amber)\",\"archive/final cover.txt(blue) notes.txt(gray)\",\"backup x.txt(green) y.txt(blue) z.txt(violet)\"]}"
  },
  {
    "label": "Identical filenames with different contents are not duplicates",
    "input": "{\"paths\":[\"one report.txt(red)\",\"two report.txt(teal)\"]}"
  },
  {
    "label": "Duplicates can share one directory",
    "input": "{\"paths\":[\"lab a.txt(orbit) b.txt(orbit) c.txt(orbit)\"]}"
  },
  {
    "label": "Every distinct content group can remain a singleton",
    "input": "{\"paths\":[\"desk first.txt(sun) second.txt(moon)\",\"shelf third.txt(star)\"]}"
  },
  {
    "label": "Single file in the root",
    "input": "{\"paths\":[\"root a.txt(red)\"]}"
  },
  {
    "label": "Equal contents across directories",
    "input": "{\"paths\":[\"d1 a.txt(red)\",\"d2 b.txt(red)\",\"d3 c.txt(red)\"]}"
  },
  {
    "label": "Same contents with the same directory",
    "input": "{\"paths\":[\"lab a.txt(orbit) b.txt(orbit)\",\"lab c.txt(orbit)\"]}"
  },
  {
    "label": "Long run: 20 directories",
    "input": "{\"paths\":[\"dir0 f0.txt(c3)\",\"dir1 f1.txt(c2)\",\"dir2 f2.txt(c0)\",\"dir3 f3.txt(c3)\",\"dir4 f4.txt(c3)\",\"dir5 f5.txt(c2)\",\"dir6 f6.txt(c1)\",\"dir7 f7.txt(c1)\",\"dir8 f8.txt(c1)\",\"dir9 f9.txt(c0)\",\"dir10 f10.txt(c1)\",\"dir11 f11.txt(c3)\",\"dir12 f12.txt(c0)\",\"dir13 f13.txt(c2)\",\"dir14 f14.txt(c4)\",\"dir15 f15.txt(c3)\",\"dir16 f16.txt(c0)\",\"dir17 f17.txt(c4)\",\"dir18 f18.txt(c0)\",\"dir19 f19.txt(c1)\"]}"
  }
];
