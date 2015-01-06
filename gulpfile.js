
// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

//雪碧图需要引用
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp.spritesmith');

// 定义一些变量
var static_sass = './assets/sass/application.css.scss',
    test_files = './assets/test/*.scss',
    test_sass = './assets/sass/application.scss',
    sass_files = './assets/sass/*.scss',
    sourcemapPath = './assets/css',
    css_file = './assets/css';

// Lint任务 检查脚本
gulp.task('lint', function() {
    gulp.src('./js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


var sprite_files = './public/icons/*',
    test_files = './public/test/',
    sprite_output_path = './public/test/';

// 雪碧图任务 合并icon图标
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(sprite_files+'/*.png').pipe(spritesmith({
    imgName: 'icons.png',
    cssName: '_icons.sass'
  }));

  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(imagemin())
    .pipe(gulp.dest(sprite_output_path+'/images/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(csso())
    .pipe(gulp.dest(sprite_output_path+'/css/'));
});

// Sass任务 编译Sass
gulp.task('sass', function() {
    gulp.src(static_sass)
        // @style: nested,compact,expanded,compressed
        .pipe(sass({style:'expanded'}))
        //.pipe(sass({sourcemap: true, sourcemapPath: sourcemapPath}))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest(css_file));
});

// Scripts 任务 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('lint', 'sass', 'scripts');

    // 监听文件变化
    gulp.watch('./js/*.js', function(){
        gulp.run('lint', 'sass', 'scripts');
    });
});