
// 安装打包依赖
// npm install gulp gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-uglify gulp-if gulp-rename gulp-concat gulp-notify gulp-imagemin gulp-clean gulp-cache gulp-livereload gulp-csso --save-dev

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
    pngquant = require('imagemin-pngquant'),
    clean = require('gulp-clean'),          //进行部署之前，清除dest目录并重建档案
    cache = require('gulp-cache'),          //快取gulp-cache外挂，只有新的或更动的图片会被压缩
    sprite = require('css-sprites-extend').stream,
    livereload = require('gulp-livereload');

//雪碧图需要引用
// var csso = require('gulp-csso');
// var imagemin = require('gulp-imagemin');
// var spritesmith = require('gulp.spritesmith');


// gulp  dev/build
var env = '',
    src_path = './src/',    //源码路径
    out_path = './dest/';   //打包路径
switch(process.argv[3]){
  case '--dev':env = 'dev'; break;
  case '--build':env = 'build'; break;
}

if(env != 'build'){
  out_path = './dev/';
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

// 雪碧图任务 合并icon图标
// gulp.task('sprite', function () {
//   // Generate our spritesheet
//   var spriteData = gulp.src(src_path + 'icons/*.png').pipe(spritesmith({
//     imgName: 'icons.png',
//     cssName: '_icons.sass'
//   }));

//   // Pipe image stream through image optimizer and onto disk
//   spriteData.img
//     .pipe(imagemin())
//     .pipe(gulp.dest(out_path + 'img/'));

//   // Pipe CSS stream through CSS optimizer and onto disk
//   spriteData.css
//     .pipe(csso())
//     .pipe(gulp.dest(out_path + 'sass/'));
// });
// generate sprite.png and _sprite.scss
gulp.task('sprite', function () {
  return gulp.src(src_path + 'sprite/*.png')
    .pipe(sprite({
      src: null,
      out: 'css',
      prefix: '_icon',
      name: '_icons',
      style: '_icons.scss',
      format: 'png',
      cssPath: '../images',
      processor: 'scss',
      template: src_path + 'scss.template.mustache',             //'scss.mustache'
      //retina: true,
      algorithm: 'binary-tree',     //binary-tree
      //retina: false,
      //background: '#FFFFFF',
      //opacity: 0,
      margin: 0
    }))
    .pipe(gulpif('*.png',
      gulp.dest(out_path + 'images/'),
      gulp.dest(out_path + 'scss/')
    ))
    .pipe(notify({ message: 'Sprite task complete' }));
});

// generate scss with base64 encoded images
gulp.task('base64', function () {
  return gulp.src(src_path + 'sprite/*.png')
    .pipe(sprite({
      base64: true,
      style: '_base64.css',
      processor: 'css'
    }))
    .pipe(gulp.dest(out_path + 'css/'));
});

// 设定图片压缩 仅压缩图片质量(用于sprite任务之后)
gulp.task('images', function() {
  return gulp.src(out_path + 'images/*')
    .pipe(cache(
      // imagemin({
      //   progressive: true,
      //   svgoPlugins: [{removeViewBox: false}],
      //   use: [pngquant()]
      // })
      imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      })
    ))
    .pipe(gulp.dest(out_path + 'images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Sass任务 编译Sass
gulp.task('styles', function() {
  gulp.src(src_path + 'sass/app.scss')
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
  gulp.src(src_path + 'js/**/*.js')
    //.pipe(jshint('.jshintrc'))
    //.pipe(jshint.reporter('default'))
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
