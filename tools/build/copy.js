const { copyDir, copyFile } = require('../utilities/file');
const root = require('../utilities/root');
const { getPackages } = require('../utilities/config');

const copyDirs = (src, dest, dirs, ext, removeOrphans) => {
  for (const dir of dirs) copyDir(`${src}${dir}`, `${dest}${dir}`, ext, removeOrphans);
};

const copyFiles = (src, dest, files, ext, force, removeOrphans) => {
  for (const file of files) {
    copyFile(`${src}${file}`, `${dest}${file}`, ext, force, removeOrphans);
  }
};

const copyStyles = (pck, removeOrphans) => {
  const src = root(`src/${pck}/`);
  const dest = root(`public/src/${pck}/`);

  copyDirs(src, dest, ['styles', 'generated/styles'], ['scss'], removeOrphans);
  copyFiles(src, dest, ['index.scss', 'main.scss'], false, removeOrphans);
};

const copyScripts = (pck, removeOrphans) => {
  const src = root(`src/${pck}/`);
  const dest = root(`public/src/${pck}/`);

  copyDirs(src, dest, ['scripts', 'generated/scripts'], ['js'], removeOrphans);
  copyFiles(src, dest, ['index.js', 'main.js', 'api.js'], false, removeOrphans);
};

const copyTemplates = (pck, removeOrphans) => {
  const src = root(`src/${pck}/`);
  const dest = root(`public/src/${pck}/`);

  copyDirs(src, dest, ['templates', 'generated/templates'], ['ejs', 'js'], removeOrphans);
  copyFiles(src, dest, ['index.ejs'], false, removeOrphans);
};

const copyImages = (removeOrphans) => {
  const src = root('examples/img');
  const dest = root('public/example/img');

  copyDir(src, dest, ['jpg', 'png', 'svg'], removeOrphans);
};

const copyAssets = (removeOrphans) => {
  const src = root('assets/');
  const dest = root('public/dist/');

  copyDir(src, dest, ['woff', 'woff2', 'ico', 'jpg', 'png', 'svg', 'webmanifest'], removeOrphans);
};

const copyPackages = (removeOrphans) => {
  const packages = getPackages();

  for (const pck of packages) {
    copyStyles(pck, removeOrphans);
    copyScripts(pck, removeOrphans);
    copyTemplates(pck, removeOrphans);
  }
};

const deployFavicons = () => {
  const src = root('assets/favicons');
  const dest = root('public/');

  copyDir(src, dest, ['ico', 'jpg', 'png', 'svg', 'webmanifest']);
};

module.exports = { copyFiles, copyStyles, copyScripts, copyTemplates, copyImages, copyAssets, copyPackages, deployFavicons };
