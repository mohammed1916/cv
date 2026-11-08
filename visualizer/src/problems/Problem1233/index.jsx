import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "sort", label: "Sort", description: "Order the paths so each parent comes before its sub-folders." },
    { id: "scan", label: "Visit", description: "Look at the next path in sorted order." },
    { id: "check", label: "Check parent", description: "Test whether the path lies under the last kept folder." },
    { id: "keep", label: "Keep", description: "The path is not covered, so it stays in the answer." },
    { id: "done", label: "Result", description: "Return the kept folders." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Folder paths (e.g. {"folder":["/src/app/ui","/src","/src/app","/lib/io","/lib"]})',
  url: "https://leetcode.com/problems/remove-sub-folders-from-the-filesystem/",
  complexity: "O(n log n) time for sorting plus the total path length, and O(n) extra space. The visualization accepts up to 64 paths.",
  examples: [
    { label: "Nested folders", input: '{"folder": ["/src/app/ui", "/src", "/src/app", "/lib/io", "/src/appx", "/lib/io/tmp/x", "/lib"]}' },
    { label: "Prefix is not a parent", input: '{"folder": ["/app/log", "/app/logs", "/app/log/archive", "/app/cache"]}' },
    { label: 'Single folder', input: '{\"folder\":[\"/a\"]}' },
    { label: 'Sibling folders are both kept', input: '{\"folder\":[\"/a/b\",\"/a/c\"]}' },
    { label: 'Long run: sixty-four nested paths', input: '{\"folder\":[\"/b/d/vg\",\"/gc/m/fo/n\",\"/nu\",\"/ayk/h/hdb\",\"/ts/fkz/bs/p\",\"/cg/c\",\"/om\",\"/yxs/zs/hox\",\"/ytq\",\"/ptr/nxn\",\"/dw/fan/n/eb\",\"/yb/oas\",\"/ze/sz\",\"/tt/cin/afl\",\"/mf/v/k/s\",\"/bke/blj/a/nci\",\"/zc/xyx\",\"/v/cn/mjx/bje\",\"/ak/o/o/oy\",\"/mzx/ne\",\"/gy/k/op/c\",\"/x/xs\",\"/cs/b/i\",\"/oz/evu\",\"/r/n\",\"/ioz\",\"/zyf\",\"/fv/oj/fe\",\"/ajz/tuh/q\",\"/v/o/con\",\"/lh/in/fy/mai\",\"/vze/gxn/lmo/j\",\"/zfe/v\",\"/n/l/i\",\"/jh/dk/mex\",\"/na/ilx\",\"/p/lk/hh\",\"/i\",\"/s/gl/j\",\"/ctw/oho\",\"/if\",\"/fxw\",\"/hy/px\",\"/k/df/y\",\"/stg/zdp\",\"/qqi\",\"/moy/ek/fx\",\"/jqc\",\"/k/mw\",\"/sp/nh/k/yix\",\"/jj\",\"/f/igj/s\",\"/hvl/mtu/rhv/wep\",\"/x\",\"/qwv/it\",\"/cs/os/o/cr\",\"/z/f\",\"/kgy/x/swo/x\",\"/ju/k/v\",\"/hg/htf/x\",\"/bm\",\"/y/ht/py/uov\",\"/sha\",\"/tm/t/aa\"]}' },
  ],
};

export default function RemoveSubfoldersWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <IndexedSequence label="Sorted folder paths" length={step.ordered.length}
        active={step.index}
        valueAt={index => step.ordered[index]}
        roleAt={index => {
          const processed = step.index >= 0 ? index <= step.index : step.phase === "done";
          if (!processed) return "pending";
          return step.kept.includes(step.ordered[index]) ? "kept" : "removed";
        }} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
