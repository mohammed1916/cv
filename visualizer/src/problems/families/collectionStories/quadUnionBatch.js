const specs={558:['grid1 grid2','Compute logical OR of two compressed binary images and compress the result.','A true leaf makes its entire region true, while a false leaf contributes nothing and can reuse the other subtree. Only two mixed regions require four recursive comparisons. Equal result leaves collapse back into one leaf.','decode both binary images into compressed quad trees|short circuit when either region is a true leaf|reuse the other region when one is a false leaf|otherwise combine four matching quadrants and collapse equal leaves|return the compressed OR tree','O(n^2) input decoding; O(number of visited quad-tree nodes) OR time; O(n^2) representation space.']};
const leaf=val=>({isLeaf:true,val:!!val,children:[]});
function compress(children){return children.every(node=>node.isLeaf&&node.val===children[0].val)?leaf(children[0].val):{isLeaf:false,val:true,children};}
function build(grid,r=0,c=0,size=grid.length){if(size===1)return leaf(grid[r][c]);const half=size/2;return compress([build(grid,r,c,half),build(grid,r,c+half,half),build(grid,r+half,c,half),build(grid,r+half,c+half,half)]);}
const solvers={558({grid1,grid2},emit){const first=build(grid1),second=build(grid2),output=grid1.map(row=>row.map(()=>'.')),table=[];function paint(node,r,c,size){if(node.isLeaf){for(let y=r;y<r+size;y++)for(let x=c;x<c+size;x++)output[y][x]=Number(node.val);}else{const h=size/2;[[r,c],[r,c+h],[r+h,c],[r+h,c+h]].forEach(([y,x],i)=>paint(node.children[i],y,x,h));}}function merge(a,b,r,c,size){let result,stage,message;if((a.isLeaf&&a.val)||(b.isLeaf&&b.val)){result=leaf(true);stage='trueLeaf';message='A true leaf dominates OR over this entire region. No deeper comparison is needed.';}else if(a.isLeaf||b.isLeaf){result=a.isLeaf?b:a;stage='reuse';message='The leaf is false everywhere in this region. OR therefore reuses the other subtree unchanged.';}else{const h=size/2,children=[[r,c],[r,c+h],[r+h,c],[r+h,c+h]].map(([y,x],i)=>merge(a.children[i],b.children[i],y,x,h));result=compress(children);stage='combine';message=result.isLeaf?'The four OR results are equal leaves. Replace them with one leaf covering the parent square.':'The four OR quadrants differ, so retain a branch with four ordered children.';}paint(result,r,c,size);table.push([`${r},${c}`,size,a.isLeaf?Number(a.val):'mixed',b.isLeaf?Number(b.val):'mixed',result.isLeaf?Number(result.val):'branch']);emit(message,{matrix:grid1,matrixLabel:'First binary image',region:[r,c,r+size-1,c+size-1],sourceRecords:null,additionalSourceRecords:[{label:'Second binary image (row records)',columns:['row',...grid2[0].map((_,i)=>`c${i}`)],rows:grid2.map((row,i)=>Object.fromEntries([['row',i],...row.map((v,j)=>[`c${j}`,v])]))}],outputMatrix:output.map(row=>[...row]),outputMatrixLabel:'OR result reconstructed from resolved regions',table:table.map(row=>[...row]),tableHeaders:['Region origin','Side','First node','Second node','Result node'],codeStage:stage,metrics:{row:r,column:c,size,compressed:result.isLeaf}},'update');return result;}return merge(first,second,0,0,grid1.length);}};
const python={558:`def intersect(grid1, grid2):
    def leaf(value):
        return {'isLeaf': True, 'val': bool(value), 'children': []}
    def compress(children):
        if all(child['isLeaf'] and child['val'] == children[0]['val'] for child in children):
            return leaf(children[0]['val'])
        return {'isLeaf': False, 'val': True, 'children': children}
    def build(grid, row, col, size):
        if size == 1:
            return leaf(grid[row][col])
        half = size // 2
        return compress([build(grid, r, c, half) for r, c in (
            (row, col), (row, col + half),
            (row + half, col), (row + half, col + half))])
    def merge(first, second):
        if (first['isLeaf'] and first['val']) or (second['isLeaf'] and second['val']):
            return leaf(True)  # step: trueLeaf
        if first['isLeaf']:
            return second  # step: reuse
        if second['isLeaf']:
            return first
        children = [merge(a, b) for a, b in zip(first['children'], second['children'])]
        return compress(children)  # step: combine
    size = len(grid1)
    return merge(build(grid1, 0, 0, size), build(grid2, 0, 0, size))  # step: return`};
const cases={558:[['Mixed images combine reusable and recursively split regions',{grid1:[[1,1,0,0],[1,1,1,0],[0,0,1,1],[0,1,1,1]],grid2:[[0,0,1,0],[0,0,0,1],[1,0,0,0],[0,0,0,0]]}],['Complementary quadrants collapse into one true leaf',{grid1:[[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,1,1]],grid2:[[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0]]}],['An all-zero image reuses the other compressed image',{grid1:[[0,0],[0,0]],grid2:[[1,0],[0,1]]}],['Two false single-cell leaves stay false',{grid1:[[0]],grid2:[[0]]}]]};
function validate(id,input){for(const key of ['grid1','grid2']){const grid=input[key];if(!Array.isArray(grid)||![1,2,4,8].includes(grid.length)||!grid.every(row=>Array.isArray(row)&&row.length===grid.length&&row.every(v=>v===0||v===1)))throw new Error('Each grid must be a binary square with side 1, 2, 4, or 8.');}if(input.grid1.length!==input.grid2.length)throw new Error('Both grids must have the same dimensions.');return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{558:{trueLeaf:2,reuse:3,combine:4}},tags:{558:['Tree','Divide and Conquer']}};
