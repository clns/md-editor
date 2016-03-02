var gulp = require('gulp')
var path = require('path')
var concat = require('gulp-concat')
var streamqueue = require('streamqueue')
var sass = require('gulp-sass')
var bourbon = require('bourbon')

var isDebug = true

gulp.task('default', [
  'assets',
  'app-css',
  'base-css',
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
  watchAndStart(['editor/**/*.scss'], 'app-css')
  watchAndStart(appJsSrc, 'app-js')
  // watchAndStart(templateWorkerJsSrc, 'template-worker-js')
})

gulp.task('debug', function () {
  isDebug = true
})

var appVendorJs = [
  'bezier-easing/build', // required by clanim
  'clanim/clanim',
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
  'markdown-it/dist/markdown-it',
  'markdown-it-abbr/dist/markdown-it-abbr',
  'markdown-it-deflist/dist/markdown-it-deflist',
  'markdown-it-emoji/dist/markdown-it-emoji',
  'markdown-it-footnote/dist/markdown-it-footnote',
  // 'markdown-it-mathjax/markdown-it-mathjax',
  'markdown-it-pandoc-renderer/markdown-it-pandoc-renderer',
  'markdown-it-sub/dist/markdown-it-sub',
  'markdown-it-sup/dist/markdown-it-sup',
  'prismjs/components/prism-core',
  'prismjs/components/prism-markup',
  'prismjs/components/prism-clike',
  'prismjs/components/prism-javascript',
  'prismjs/components/prism-css'
].map(require.resolve)
appVendorJs.push(path.join(path.dirname(require.resolve('prismjs/components/prism-core')), 'prism-!(*.min).js'))

var appJsSrc = ['editor/js/!(app).js', 'editor/js/app.js']

gulp.task('app-js', function () {
  return buildJs(
    streamqueue({
      objectMode: true
    },
      gulp.src(appVendorJs),
      gulp.src(appJsSrc)
    ), 'app-min.js')
})

var appCssSrc = ['editor/styles/!(base).scss']

var appVendorCss = [
  path.join(path.dirname(require.resolve('classets/package')), 'public/icons/style.css')
]

gulp.task('app-css', function () {
  return buildCss(
    streamqueue({
      objectMode: true
    },
      gulp.src(appVendorCss),
      gulp.src(appCssSrc)
    ), 'app-min.css')
})

gulp.task('base-css', function () {
  return buildCss(
    streamqueue({
      objectMode: true
    },
      gulp.src('editor/styles/base.scss')
    ), 'base-min.css')
})

gulp.task('assets', function() {
  var p = path.join(path.dirname(require.resolve('classets/package')), 'public');
 gulp.src(p+'/**/*', {base: p})
  .pipe(gulp.dest(path.join('editor', 'assets')));
});

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

function buildCss (srcStream, dest) {
  if (isDebug) {
    var sourcemaps = require('gulp-sourcemaps')
    srcStream = srcStream
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: bourbon.includePaths.concat('editor/styles')
      }).on('error', sass.logError))
      .pipe(concat(dest))
      .pipe(sourcemaps.write('.'))
  } else {
    srcStream = srcStream
      .pipe(sass({
        includePaths: bourbon.includePaths.concat('editor/styles'),
        outputStyle: 'compressed'
      }).on('error', sass.logError))
      .pipe(concat(dest))
  }
  return srcStream.pipe(gulp.dest('editor'))
}
