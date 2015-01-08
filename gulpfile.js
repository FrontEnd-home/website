
// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),    //图片压缩
    clean = require('gulp-clean'),          //进行部署之前，清除dest目录并重建档案
    cache = require('gulp-cache'),          //快取gulp-cache外挂，只有新的或更动的图片会被压缩
    livereload = require('gulp-livereload');

//雪碧图需要引用
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp.spritesmith');


// gulp  dev/build
var env = '',
    src_path = './src/',
    out_path = './dest/';
switch(process.argv[3]){
  case '--dev':env = 'dev'; break;
  case '--build':env = 'build'; break;
}

if(env != 'build'){
  out_path = './src/';
}

// 定义一些变量
var static_sass = './assets/sass/application.scss',
    test_files = './assets/test/*.scss',
    sass_files = './assets/sass/*.scss',
    sourcemapPath = './assets/css',
    css_file = './assets/css';

// Lint任务 检查脚本
gulp.task('lint', function() {
    gulp.src(src_path + 'js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 清除任务 部署前清除目标文件
gulp.task('clean', function() {  
  return gulp.src([(out_path+'css/'), (out_path+'js/'), (out_path+'img/')], {read: false})
    .pipe(clean());
});

var sprite_files = './public/icons/*',
    test_files = './public/test/';
    

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
    .pipe(gulp.dest(out_path+'images/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(csso())
    .pipe(gulp.dest(out_path+'css/'));
});

gulp.task('images', function() {  
  return gulp.src(src_path+'images/**/*')
    .pipe(cache(
      imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true 
      })
    ))
    .pipe(gulp.dest(out_path + 'img/'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Sass任务 编译Sass
gulp.task('styles', function() {
  gulp.src(static_sass)
      // @style: nested,compact,expanded,compressed
    .pipe(sass({style:'expanded'}))
    //.pipe(autoprefixer())
    //.pipe(sass({sourcemap: true, sourcemapPath: sourcemapPath}))
    .on('error', function (err) {
      console.log(err.message);
    })
    .pipe(gulp.dest(out_path + 'css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(out_path + 'css/'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts 任务 合并，压缩文件
// gulp.task('scripts', function() {
//     gulp.src(src_path + 'js/*.js')
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('./dist'));
// });
gulp.task('scripts', function() {  
  gulp.src(src_path + '**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))
    .pipe(gulp.dest(out_path + 'js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(out_path + 'js/'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// 预设任务
gulp.task('default', ['clean'], function() {  
  gulp.start('styles');
  //gulp.run('styles');
  
  // 监听文件变化
  // gulp.watch('./js/*.js', function(){
  //     gulp.run('lint', 'sass', 'scripts');
  // });
});

//监听文件变化
gulp.task('watch', function() {
  // 看守所有.scss档
  gulp.watch(src_path + 'styles/**/*.scss', ['styles']);

  // 看守所有.js档
  gulp.watch(src_path + 'js/**/*.js', ['scripts']);

  // 看守所有图片档
  gulp.watch(src_path + 'images/**/*', ['images']);

  // 建立即时重整伺服器
  var server = livereload();

  // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
  gulp.watch(['dist/**']).on('change', function(file) {
    server.changed(file.path);
  });

});