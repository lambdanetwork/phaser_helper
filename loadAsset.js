const fs = require('fs');

const str = [];

const files = fs.readFileSync(__dirname+'/src/Scenes/PreloadDefault.ts', 'utf-8');
fs.writeFileSync(__dirname+'/src/Scenes/PreloadScene.ts', files)

function loadFile(dir){
    const files = fs.readdirSync(dir)
    files.forEach(file => {
        const [filename, ext] = file.split('.');
        if(!ext){
            // this is a folder
            const path = dir+'/'+filename
            return loadFile(path)
        }
        

        const isMatch = isExtentionMatch(file, ['png'])
        if(isMatch){
            const newDir = dir.replace('/Users/vidy.alfredo/Documents/Vidy/typescript/Phaser/src/', '../');
            if(file === 'Preview.png'){
                return str.push('../assets/Preview.png')
            }
            str.push(newDir+'/'+file)
        }
    })
}

function isExtentionMatch(str, arr){
    return arr.some(el => {
        return str.indexOf(el) >= 0
    })
}

loadFile(__dirname+'/src/assets');
const results = str.map(dirname => {
    const [file] = dirname.split('/').slice(-1);
    let [filename, ext] = file.split('.');
    filename = filename.replace('@', '_')
    const stringToPut = `import ${filename} from '${dirname}'`;
    return stringToPut
}).join(';\n');

let PreloadContent = fs.readFileSync(__dirname+'/src/Scenes/PreloadScene.ts', 'utf-8');
PreloadContent = PreloadContent.split('\n').map(line => {
    if(line.indexOf('preload') >= 0){
        const loadImages = str.map(dirname => {
            const [file] = dirname.split('/').slice(-1);
            let [filename, ext] = file.split('.');
            filename = filename.replace('@', '_');
            let stringToPut;
            if(dirname.indexOf('Tilesheet') >= 0){
                stringToPut = `\t this.load.spritesheet('${filename}', ${filename}, {
                    frameWidth: 96,
                    frameHeight: 96
                })`;
            } else {
                stringToPut = `\tthis.load.image('${filename}', ${filename})`;
            }
            return stringToPut
        }).join(';\n');

        const defaultLoader = `\tthis.load.on('progress', this.updateBar);\n\tthis.load.on('complete', this.complete);`
        return `\tpreload(){
            \tthis.load.path = 'dist/';\n 
            ${loadImages}
            ${defaultLoader}
        }
        `
    } 
    else if(line.indexOf('create') >= 0){
        return `\t create(): void {
            \tthis.scene.start("GameScene");
          }
        `
    }
    else {
        return line
    }
}).join('\n')


const data = results + '\n'+ PreloadContent

fs.writeFileSync(__dirname+'/src/Scenes/PreloadScene.ts', data)