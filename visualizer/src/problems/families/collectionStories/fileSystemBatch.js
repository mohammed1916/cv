const specs={588:['operations','Maintain directories and file contents while answering sorted listings and reads.','A directory trie resolves each path component. Directory creation fills missing ancestors; appends modify one file; listing a directory sorts its immediate names, while listing a file returns only its own name.','initialize an empty root directory|resolve path components through directory children|create directories or append file content for update operations|return sorted immediate entries or requested file content for reads|return the results of all operations','O(path length) expected traversal plus O(k log k) directory listing for k children; O(stored paths and content) space.']};
const directory=()=>({file:false,children:new Map(),content:''});
function apply(root,operation){const[type,path,content]=operation,parts=path.split('/').filter(Boolean);let current=root;for(let i=0;i<parts.length;i++){if(current.file)throw new Error(`Cannot traverse through a file: ${parts.slice(0,i).join('/')}`);const name=parts[i],last=i===parts.length-1;if(!current.children.has(name)){if(type==='mkdir')current.children.set(name,directory());else if(type==='addContentToFile'&&last)current.children.set(name,{file:true,children:new Map(),content:''});else throw new Error(`Path does not exist: ${path}`);}current=current.children.get(name);}if(type==='mkdir'){if(current.file)throw new Error('mkdir cannot turn an existing file into a directory.');return null;}if(type==='addContentToFile'){if(!current.file)throw new Error('File content cannot be appended to a directory.');current.content+=content;return null;}if(type==='readContentFromFile'){if(!current.file)throw new Error('Read requires a file path.');return current.content;}return current.file?[parts.at(-1)]:[...current.children.keys()].sort();}
function entries(root){const rows=[];function visit(node,path){rows.push([path,node.file?'file':'directory',node.file?node.content:'',node.file?node.content.length:node.children.size]);for(const[name,child]of [...node.children].sort(([a],[b])=>a.localeCompare(b)))visit(child,path==='/'?`/${name}`:`${path}/${name}`);}visit(root,'/');return rows;}
const solvers={588({operations},emit){const root=directory(),answer=[];for(let i=0;i<operations.length;i++){const operation=operations[i],result=apply(root,operation);answer.push(result);const messages={mkdir:'Walk the path and create every missing directory. Existing directories retain their children.',addContentToFile:'Resolve the parent directory, create the file if absent, then append text without replacing earlier content.',ls:'A directory listing contains only immediate child names in lexicographic order. A file listing contains its own basename.',readContentFromFile:'Resolve this exact file and return all accumulated content.'};emit(messages[operation[0]],{sequence:operation,table:entries(root),tableHeaders:['Absolute path','Kind','File content','Characters / child entries'],output:answer.map(value=>value===null?'null':Array.isArray(value)?JSON.stringify(value):value),codeStage:operation[0],metrics:{operation:i+1,type:operation[0],path:operation[1],result:result===null?'null':JSON.stringify(result)}},'update');}return answer;}};
const python={588:`class FileSystem:
    def __init__(self):
        self.root = self.directory()

    @staticmethod
    def directory():
        return {'file': False, 'children': {}, 'content': ''}

    def resolve(self, path):
        node = self.root
        for name in filter(None, path.split('/')):
            node = node['children'][name]
        return node

    def ls(self, path):
        node = self.resolve(path)
        return [path.rsplit('/', 1)[-1]] if node['file'] else sorted(node['children'])  # step: ls

    def mkdir(self, path):
        node = self.root
        for name in filter(None, path.split('/')):
            node = node['children'].setdefault(name, self.directory())  # step: mkdir

    def addContentToFile(self, filePath, content):
        parentPath, name = filePath.rsplit('/', 1)
        parent = self.resolve(parentPath)
        node = parent['children'].setdefault(name, {'file': True, 'children': {}, 'content': ''})
        node['content'] += content  # step: addContentToFile

    def readContentFromFile(self, filePath):
        return self.resolve(filePath)['content']  # step: readContentFromFile

def simulateFileSystem(operations):
    filesystem = FileSystem()
    results = []
    for operation in operations:
        results.append(getattr(filesystem, operation[0])(*operation[1:]))
    return results  # step: return`};
const cases={588:[['Build nested folders append notes and compare file and directory listings',{operations:[['ls','/'],['mkdir','/studio/notes'],['mkdir','/studio/assets'],['addContentToFile','/studio/notes/session','First sketch.'],['addContentToFile','/studio/notes/session',' Add shadows.'],['addContentToFile','/studio/notes/ideas','Try warm colors.'],['ls','/studio'],['ls','/studio/notes'],['ls','/studio/notes/session'],['readContentFromFile','/studio/notes/session']]}],['An empty root can be listed repeatedly',{operations:[['ls','/'],['mkdir','/'],['ls','/']]}],['Repeated mkdir preserves files and append preserves earlier content',{operations:[['mkdir','/lab'],['addContentToFile','/lab/log','A'],['mkdir','/lab'],['addContentToFile','/lab/log','B'],['readContentFromFile','/lab/log']]}],['Listing sorts immediate names without descending into folders',{operations:[['mkdir','/zebra/nested'],['mkdir','/amber'],['addContentToFile','/middle','Root file'],['ls','/'],['ls','/zebra'],['ls','/middle']]}]]};
function validate(id,input){if(!Array.isArray(input.operations)||input.operations.length<1||input.operations.length>60)throw new Error('Use 1-60 file-system operations.');const root=directory();let total=0;for(const op of input.operations){if(!Array.isArray(op)||!['ls','mkdir','addContentToFile','readContentFromFile'].includes(op[0])||op.length!==(op[0]==='addContentToFile'?3:2)||typeof op[1]!=='string'||!/^\/(?:[a-z]+(?:\/[a-z]+)*)?$/.test(op[1])||op[1].length>100)throw new Error('Use a supported operation and an absolute path with lowercase names, no trailing slash except root.');if(op[0]==='addContentToFile'){if(typeof op[2]!=='string'||op[2].length<1||op[2].length>200)throw new Error('Append content must contain 1-200 characters.');total+=op[2].length;if(total>2000)throw new Error('Keep total file content within 2000 characters for the visual table.');}apply(root,op);}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{588:{mkdir:3,addContentToFile:3,ls:4,readContentFromFile:4}},tags:{588:['Design','Trie','Hash Table']}};
