const _ = require('underscore')
const childProcess = require('child_process')
module.exports = function (grunt) {
  grunt.registerTask('checkClassLinkDependencyVersions', function () {
    let reportError = false
    const referencedClassLinkPackages = getReferencedClassLinkPackages()
    for (const { name, tag, version } of referencedClassLinkPackages) {
      if (tag && tag !== 'latest') {
        const npmPackageVersions = getNPMPackageVersions(name, ['latest', tag])
        const latestVersion = npmPackageVersions.latest
        const latestBranchVersion = npmPackageVersions[tag]
        grunt.log.warn(`[${tag}] ${name}: ${version} listed in package.json but latest is: ${latestVersion} OR ${latestBranchVersion}`)
      } else {
        const latestVersion = getNPMPackageVersions(name, ['latest']).latest
        if (latestVersion !== version) {
          reportError = true
          grunt.log.error(`${name}: ${version} listed in package.json but latest is: ${latestVersion}`)
        } else {
          grunt.log.ok(`${name}: ${version} - up to date`)
        }
      }
    }
    if (reportError) {
      grunt.fail.warn('Error in ClassLink Dependency Versions')
    }
  })
  grunt.registerTask('default', ['dev'])
  grunt.registerTask('dev', 'Just continuously compiles typescript on changes to src directory', ['ts:dev'])
  grunt.registerTask('make:build', ['ts:build'])
  grunt.registerTask('make:release', 'Cleans and builds the project for release', ['clean:release', 'ts:release', 'clean:postRelease'])
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-ts')
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      release: ['types', 'dist', '.tscache'],
      postRelease: ['.tscache']
    },
    watch: {
      forPM2: {
        files: ['**/*', '!**/node_modules/**']
      }
    },
    ts: {
      options: {
        fast: 'watch'
      },
      dev: {
        tsconfig: true,
        watch: 'src'
      },
      build: {
        tsconfig: true
      },
      release: {
        tsconfig: true
      },
      types: {
        tsconfig: true,
        src: ['index.ts'],
        options: {
          declaration: true,
          declarationDir: './types',
          emitDeclarationOnly: false
        }
      }
    }
  })

  function getDebouncedAndThrottled (fn, minTimeBetweenRuns = 10000, maxTimeToWaitForMultipleFiles = 5000, immediate = false) {
    return _.debounce(
      _.throttle(fn, minTimeBetweenRuns)
      , maxTimeToWaitForMultipleFiles, immediate)
  }

  const debouncedThrottledPM2Restart = getDebouncedAndThrottled(() => {
    grunt.log.writeln('Issuing PM2 restart')
    _command('pm2', ['restart', 'all'])
  })
  const debouncedThrottledNPMUpdateRestart = getDebouncedAndThrottled(() => {
    grunt.log.writeln('Issuing PM2 restart')
    _command('npm', ['i'])
    debouncedThrottledPM2Restart()
  })
  grunt.event.on('watch', function (action, filepath, target) {
    if (target !== 'forPM2') return
    if (filepath === 'package.json' || filepath === 'npm-shrinkwrap.json') {
      debouncedThrottledNPMUpdateRestart()
    } else {
      debouncedThrottledPM2Restart()
    }
  })
}

function _command (cmd, args) {
  const result = childProcess.spawnSync(cmd, args)
  if (result.status !== 0) {
    throw new Error('[_command] failed to execute command: ' + result.stderr + '/' + result.error)
  }
  return result.stdout.toString().replace(/^\s+|\s+$/g, '')
}

function getNPMPackageVersions (packageName, tags = ['latest']) {
  const ret = {}
  const reLabel = /^([^:]+): (.+)$/gm
  const results = childProcess.execSync(`npm dist-tag ls ${packageName}`).toString()
  const matches = results.matchAll(reLabel)
  for (const match of matches) {
    if (tags.indexOf(match[1]) >= 0) ret[match[1]] = match[2]
  }
  return ret
}

function getReferencedClassLinkPackages () {
  const reTag = /-([^.]+)./
  const rePrefix = /^[^0-9]/
  const ret = []
  const pkg = require('./package.json')
  if (pkg.dependencies) {
    for (const name in pkg.dependencies) {
      if (pkg.dependencies.hasOwnProperty(name)) {
        const version = pkg.dependencies[name].replace(rePrefix, '')
        const match = reTag.exec(version)
        const tag = (match ? match[1] : 'latest')
        if (name.startsWith('@classlink')) {
          ret.push({ name, tag, version })
        }
      }
    }
  }
  return ret
}
