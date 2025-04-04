import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

const zip = new JSZip();
zip.file('icon.png', fs.readFileSync('icon.png'));
zip.file('plugin.json', fs.readFileSync('plugin.json'));
zip.file('readme.md', fs.readFileSync('readme.md'));
zip.file('ChangeLog.md', fs.readFileSync('ChangeLog.md'));
loadFile('', 'build');

zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream('Plugin.zip'))
  .on('finish', () => console.log('\nSuccessfully Compiled ✅'));

function loadFile(root: string, folder: string) {
  const files = fs.readdirSync(folder);
  files.forEach(file => {
    const filePath = path.join(folder, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      zip.folder(path.join(root, file));
      loadFile(path.join(root, file), filePath);
      return;
    }
    zip.file(path.join(root, file), fs.readFileSync(filePath));
  });
}
