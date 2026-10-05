const bst=[24,11,38,5,17,31,46,2,8,14,20,28,34,42,51];
const rows={
  606:[['Sparse branches need structural parentheses',{root:[9,4,15,null,6,12,18,5,null,null,13]}],['Only a right child',{root:[7,null,11]}],['Only a left child',{root:[7,3]}],['Single node',{root:[-8]}]],
  617:[['Different shapes overlap at several levels',{root1:[7,3,11,1,5,null,14,null,2],root2:[4,8,6,null,9,5,10,7]}],['One input is empty',{root1:[],root2:[6,2,9]}],['Overlapping single nodes',{root1:[-4],root2:[9]}],['Unmatched opposite branches',{root1:[3,2],root2:[8,null,5]}]],
  623:[['Insert across a wide middle frontier',{root:bst,val:7,depth:3}],['Replace the root',{root:[8,3,12],val:2,depth:1}],['Insert below deepest nodes',{root:[5,2,9],val:4,depth:3}],['Sparse frontier',{root:[6,null,10,8],val:3,depth:3}]],
  637:[['Several levels with mixed magnitudes',{root:[14,5,23,2,9,18,31,-4,4,7,12,16,20]}],['Fractional average',{root:[3,2,7]}],['Negative values',{root:[-8,-3,-12,-6,null,-10]}],['Only one level',{root:[19]}]],
  653:[['Complement found across two branches',{root:bst,k:62}],['No two values can reach target',{root:[8,3,12,1,5,10,14],k:40}],['Single node cannot be used twice',{root:[7],k:14}],['Two values at extremes',{root:[5,-2,13],k:11}]],
  654:[['Several decreasing-stack pops',{nums:[8,3,5,12,7,2,10,15,6,9]}],['Increasing input makes a left chain',{nums:[2,5,8,11]}],['Decreasing input makes a right chain',{nums:[11,8,5,2]}],['Single element',{nums:[17]}]],
  669:[['Prune both outer regions',{root:bst,low:12,high:43}],['Root itself must disappear',{root:[10,4,17,2,7,14,20],low:12,high:22}],['Keep one exact value',{root:[8,3,12,1,6,10,15],low:10,high:10}],['Everything excluded',{root:[4,2,7],low:20,high:30}]],
  671:[['Minimum repeated above distinct candidates',{root:[3,3,8,3,5,8,12,3,4]}],['No second distinct value',{root:[6,6,6,6,6]}],['Only root',{root:[9]}],['Candidate in a deeper branch',{root:[2,2,7,2,4]}]],
  687:[['Matching arms combine below the root',{root:[8,5,8,5,5,8,3,5,null,5,5]}],['All values match',{root:[4,4,4,4,4,4,4]}],['Every edge differs',{root:[1,2,3,4,5]}],['Empty tree',{root:[]}]],
  700:[['Search a deep interior node',{root:bst,val:31}],['Target is absent',{root:[10,4,16,2,7,13,19],val:14}],['Return the whole tree',{root:[8,3,12],val:8}],['Return a leaf',{root:[8,3,12],val:3}]],
  701:[['Insert between existing values',{root:bst,val:33}],['Empty tree',{root:[],val:7}],['New minimum',{root:[9,4,16,2,6,13,20],val:1}],['New maximum',{root:[9,4,16,2,6,13,20],val:25}]],
  872:[['Different internal structure, same leaf order',{root1:[9,4,14,2,6,11,18],root2:[5,2,7,null,null,6,8,null,null,11,18]}],['Only leaf order differs',{root1:[8,2,5],root2:[9,5,2]}],['Equal single leaves',{root1:[13],root2:[13]}],['Different leaf counts',{root1:[4,2,6],root2:[2]}]],
  897:[['Wide BST becomes a sorted right chain',{root:bst}],['Already a right chain',{root:[2,null,5,null,8,null,11]}],['Left chain',{root:[12,9,null,6,null,3]}],['Single node',{root:[6]}]],
  938:[['Range crosses the root and several branches',{root:bst,low:8,high:34}],['Inclusive endpoints',{root:[10,4,16,2,7,13,19],low:4,high:13}],['No value in range',{root:[8,3,12],low:20,high:25}],['Single exact match',{root:[9],low:9,high:9}]],
  965:[['Deep tree with one late mismatch',{root:[6,6,6,6,6,6,6,null,null,6,6,null,null,6,7]}],['All nodes agree',{root:[3,3,3,3,null,3,3]}],['Root differs from child',{root:[4,5]}],['One node',{root:[0]}]],
};
export const treeStoryExamples=Object.fromEntries(Object.entries(rows).map(([id,cases])=>[id,cases.map(([label,input])=>({label,input:JSON.stringify(input)}))]));
