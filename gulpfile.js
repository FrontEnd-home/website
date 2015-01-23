
// 安装打包依赖
// npm install gulp gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-uglify gulp-if gulp-rename gulp-concat gulp-notify gulp-imagemin gulp-clean gulp-cache gulp-livereload gulp-csso --save-dev

// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    transport = require("gulp-seajs-transport"),
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

var env = '',
    src_path = './src/',    //源码路径
    out_path = './dest/';   //打包路径
switch(process.argv[3]){
  case '--dev':env = 'dev'; break;
  case '--build':env = 'build'; break;
}

if(env != 'build'){
  out_path = './public/';
}

// 定义一些变量
var static_sass = './sass/app.scss',
    test_files = './assets/test/*.scss',
    sass_files = './assets/sass/*.scss',
    sourcemapPath = './assets/css',
    css_file = './assets/css';

// 清除任务 部署前清除目标文件
gulp.task('clean', function() {
  return gulp.src([(out_path+'css/'), (out_path+'img/')], {read: false})
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

//js相关的任务
var paths = {
    libs: [
        "src/js/libs/underscore.js",
        "src/js/libs/zepto.js",
        "src/js/libs/sea-debug.js",
        "src/js/libs/class.js"
    ],
    seajs: [
        "src/js/common/*",
        "src/js/core/*",
        "src/js/page/*",
        "src/js/app.js"    
    ],
    page:[
        "src/js/mods/routes.js",
        "src/js/mods/common/*",
        "src/js/mods/page/*"
    ]
};
var output = {
    dir: "public/js",
    libs:"farman.libs.js",
    seajs:"farman.sea-mods.js",
    pagejs:"farman.page.js",
    main: "farman.js",
    mainmin: "farman.min.js"
};

gulp.task('js-clean', [], function(cb){
  return gulp.src(output.dir, {read: false})
    .pipe(clean());
});

gulp.task('jshint',['js-clean'], function() {
  return gulp.src(paths.seajs)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('js-libs-dev',['js-clean'], function() {
  return gulp.src(paths.libs)
    .pipe(concat(output.libs))
    .pipe(gulp.dest(output.dir));
});

gulp.task('js-sea-dev',['js-libs-dev'], function() {
  return gulp.src(paths.seajs)
    .pipe(transport())
    .pipe(concat(output.seajs))
    .pipe(gulp.dest(output.dir));
});

gulp.task('js-page-dev', ['js-clean'], function() {
  return gulp.src(paths.page)
    .pipe(transport())
    .pipe(concat(output.pagejs))
    .pipe(gulp.dest(output.dir));
});

gulp.task('jsdev',['js-sea-dev','js-page-dev'], function() {
  var src = [
    [output.dir, output.libs].join("/"),
    [output.dir, output.seajs].join("/")
  ];
  return gulp.src(src)
    .pipe(concat(output.main))
    .pipe(gulp.dest(output.dir));
});

gulp.task('jsonline',['jsdev'], function() {
  var src = [
    [output.dir, output.main].join("/"),
  ];
  return gulp.src(src)
    .pipe(uglify())
    .pipe(concat(output.mainmin))
    .pipe(gulp.dest(output.dir));
});