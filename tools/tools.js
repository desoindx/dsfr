#!/usr/bin/env node

const yargs = require('yargs');
const build = require('./build/build');
const buildRouting = require('./generate/routing');
const { deployFavicons } = require('./build/copy');

/**
 * Build
 */
const buildBuilder = (yargs) => {
  return yargs
    .usage('Usage: $0 -p core accordions')
    .example(
      '$0 -p core accordions -jcm',
      'compile les fichiers scripts et styles du package core et accordions en les minifiant'
    )
    .option('packages', {
      alias: 'p',
      describe: 'liste des id des packages à compiler. Si non renseigné, tous les packages sont compilés',
      type: 'array'
    })
    .option('scripts', {
      alias: '-j',
      describe: 'Filtre de compilation, inclue les scripts',
      type: 'boolean'
    })
    .option('styles', {
      alias: '-c',
      describe: 'Filtre de compilation, inclue les styles',
      type: 'boolean'
    })
    .option('examples', {
      alias: '-h',
      describe: 'Filtre de compilation, inclue les examples',
      type: 'boolean'
    })
    .option('minify', {
      alias: '-m',
      describe: 'Minifie les styles et les scripts',
      type: 'boolean'
    })
    .option('legacy', {
      alias: '-l',
      describe: 'Compilation des scripts supportant les systèmes antérieurs',
      type: 'boolean'
    })
    .option('sourcemap', {
      alias: '-s',
      describe: 'Compilation des scripts et styles avec sourcemaps',
      type: 'boolean'
    })
    .option('test', {
      alias: '-t',
      describe: 'Applique les tests de styles et d‘accessibilité',
      type: 'boolean'
    })
    .option('clean', {
      describe: 'Supprime le dossier public avant compilation pour repartir de zéro',
      type: 'boolean'
    })
    .option('main', {
      describe: 'Compilation consolidée de tous les packages en un seul fichiers',
      type: 'boolean'
    })
    .option('markdowns', {
      describe: 'Génère les fichiers readme',
      type: 'boolean'
    })
    .option('list', {
      describe: 'Compile la liste des examples',
      type: 'boolean'
    });
};

const buildHandler = async (argv) => {
  const all = argv.scripts === undefined && argv.styles === undefined && argv.examples === undefined;

  const settings = {
    styles: argv.styles || all,
    scripts: argv.scripts || all,
    examples: argv.examples || all,
    packages: argv.packages,
    minify: argv.minify,
    legacy: argv.legacy,
    sourcemap: argv.sourcemap,
    clean: argv.clean,
    test: argv.test,
    markdowns: argv.markdowns,
    main: argv.main,
    list: argv.list
  };

  await build(settings);
};

/**
 * Release
 */

const releaseBuilder = (yargs) => {
  return yargs
    .usage('Usage: $0')
    .example(
      '$0',
      ''
    );
};

const releaseHandler = async (argv) => {
  await build({
    styles: true,
    scripts: true,
    examples: true,
    clean: true,
    test: true,
    minify: true,
    legacy: true,
    sourcemap: true,
    markdowns: true,
    main: true,
    list: true
  });
};

/**
 * Deploy
 */
const deployBuilder = (yargs) => {
  return yargs
    .usage('Usage: $0')
    .example(
      '$0',
      ''
    );
};

const deployHandler = async (argv) => {
  await build({
    styles: true,
    scripts: true,
    examples: true,
    clean: true,
    legacy: true,
    main: true,
    list: true
  });
  await buildRouting();
  deployFavicons();
};

yargs
  .scriptName('tools')
  .command(
    'build',
    'compilation de package',
    buildBuilder,
    buildHandler
  )
  .command(
    'release',
    'compilation la plus complète pour livraison',
    releaseBuilder,
    releaseHandler
  )
  .command(
    'deploy',
    'compilation pour déploiement sur netlify',
    deployBuilder,
    deployHandler
  )
  .command(
    'tmp',
    '',
    (yargs) => {
      return yargs
        .usage('Usage: $0')
        .example(
          '$0',
          ''
        );
    }, (argv) => {
    })
  .help()
  .argv;
