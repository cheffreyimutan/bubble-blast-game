const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yauzl = require('yauzl');
const root = path.resolve(__dirname, '../..');

function hashStream(stream) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex').toUpperCase()));
    stream.on('error', reject);
  });
}

function files(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix + entry.name;
    return entry.isDirectory()
      ? files(path.join(dir, entry.name), relative + '/')
      : [relative];
  });
}

function archiveHashes(file, prefix) {
  return new Promise((resolve, reject) => {
    yauzl.open(file, { lazyEntries: true }, (error, zip) => {
      if (error) return reject(error);
      const hashes = new Map();
      zip.on('error', reject);
      zip.on('end', () => resolve(hashes));
      zip.on('entry', entry => {
        if (!entry.fileName.startsWith(prefix) || entry.fileName.endsWith('/')) {
          return zip.readEntry();
        }
        zip.openReadStream(entry, async (error, stream) => {
          if (error) return reject(error);
          try {
            hashes.set(entry.fileName.slice(prefix.length), await hashStream(stream));
            zip.readEntry();
          } catch (error) {
            zip.close();
            reject(error);
          }
        });
      });
      zip.readEntry();
    });
  });
}

(async () => {
  const production = new Map();
  for (const name of files(path.join(root, 'www'))) {
    production.set(name, await hashStream(fs.createReadStream(path.join(root, 'www', name))));
  }
  const packages = [];
  for (const [extension, prefix] of [['apk', 'assets/public/'], ['aab', 'base/assets/public/']]) {
    const name = `Pop-A-Boba-Flavor-Journey-v1.3-code4-release.${extension}`;
    const file = path.join(root, 'builds', name);
    const packaged = await archiveHashes(file, prefix);
    const mismatches = [...production].filter(([name, hash]) => packaged.get(name) !== hash).map(([name]) => name);
    packages.push({
      file: name,
      sha256: await hashStream(fs.createReadStream(file)),
      checkedAssets: production.size,
      mismatches,
      extraRuntimeFiles: [...packaged.keys()].filter(name => !production.has(name))
    });
  }
  const result = {
    rootHtml: await hashStream(fs.createReadStream(path.join(root, 'index.html'))),
    productionHtml: production.get('index.html'),
    packages
  };
  fs.mkdirSync(path.join(__dirname, 'evidence'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'evidence', 'packages.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (result.rootHtml !== result.productionHtml || packages.some(p => p.mismatches.length)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
