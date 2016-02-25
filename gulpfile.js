var gulp = require('gulp')
var path = require('path')
var concat = require('gulp-concat')
var streamqueue = require('streamqueue')

var isDebug = true

gulp.task('default', [
  'app-js'
])

gulp.task('watch', [
  'debug',
  'default'
], function () {
  var watch = require('gulp-watch')
  function watchAndStart (src, task) {
    return watch(src, function (files) {
      gulp.start(task)
    })
  }
  // watchAndStart(['src/**/*.scss'], 'app-css')
  watchAndStart(appJsSrc, 'app-js')
  // watchAndStart(templateWorkerJsSrc, 'template-worker-js')
})

gulp.task('debug', function () {
  isDebug = true
})

var appVendorJs = [
  'googlediff/javascript/diff_match_patch_uncompressed', // Needs to come before cldiffutils and cledit
  'clunderscore/clunderscore', // Needs to come before cledit
  'cldiffutils/cldiffutils',
  'cledit/scripts/cleditCore',
  'cledit/scripts/cleditHighlighter',
  'cledit/scripts/cleditKeystroke',
  'cledit/scripts/cleditMarker',
  'cledit/scripts/cleditSelectionMgr',
  'cledit/scripts/cleditUndoMgr',
  'cledit/scripts/cleditUtils',
  'cledit/scripts/cleditWatcher',
  'cledit/demo/mdGrammar',
  'prismjs/components/prism-core',
  'prismjs/components/prism-markup',
  'prismjs/components/prism-clike',
  'prismjs/components/prism-javascript',
  'prismjs/components/prism-css'
].map(require.resolve)
appVendorJs.push(path.join(path.dirname(require.resolve('prismjs/components/prism-core')), 'prism-!(*.min).js'))

var appJsSrc = ['editor/editor.js']

gulp.task('app-js', function () {
  return buildJs(
    streamqueue({
      objectMode: true
    },
      gulp.src(appVendorJs),
      gulp.src(appJsSrc)
    ), 'app-min.js')
})

function buildJs (srcStream, dest) {
  if (isDebug) {
    var sourcemaps = require('gulp-sourcemaps')
    srcStream = srcStream
      .pipe(sourcemaps.init())
      .pipe(concat(dest, {
        newLine: ';'
      }))
      .pipe(sourcemaps.write('.'))
  } else {
    srcStream = srcStream
      .pipe(size({
        // showFiles: true
      }))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(concat(dest, {
        newLine: ';'
      }))
  }
  return srcStream.pipe(gulp.dest('editor'))
}
