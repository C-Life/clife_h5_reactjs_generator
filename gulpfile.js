var releaseDest = '../app-h5-zip/'; // 发布目录

var gulp = require('gulp'), // 基础库
    watch = require('gulp-watch'); // watch库，解决新增文件不能监听的bug
watchPath = require('gulp-watch-path'), // 用于解析watch结果的库
    browserSync = require('browser-sync'), // 用于自动刷新页面
    babel = require('gulp-babel'), // babel，用于转换es6后缀文件
    concat = require('gulp-concat'), // 文件合并
    autoprefixer = require('gulp-autoprefixer'), // 自动添加hack
    less = require('gulp-less'), // less文件处理
    // sass = require('gulp-sass'),                    // sass文件处理
    // importCss = require('gulp-import-css'), // css文件导入
    importCss = require('gulp-cssimport'), // css文件导入
    minifyCss = require('gulp-clean-css'), // css文件压缩
    minifyImg = require('gulp-imagemin'), // img文件压缩
    uglify = require('gulp-uglify'), // js压缩
    del = require('del'), // 删除文件或目录
    replace = require('gulp-replace'), // 字符替换
    webpack = require('webpack-stream'), // webpack
    named = require('vinyl-named'), // 配合webpack的命名插件
    rev = require('gulp-rev'), // 更改版本名
    revCollector = require('gulp-rev-collector'), // 更新静态资源引用路径
    // sourcemaps = require('gulp-sourcemaps'),        // sourcemaps插件
    zip = require('gulp-zip'), // zip压缩插件
    tar = require('gulp-tar'), // tar打包插件
    gzip = require('gulp-gzip'), // gzip压缩插件
    plumber = require('gulp-plumber'); // gulp错误检测

require('babel-plugin-transform-runtime');
var work = parseInt(getArg('--work'));
var path = getArg('--path');
var version = getArg('--ver');
var autoRefresh = getArg('--autorefresh') === 'yes' ? true : false;
var match = ('/' + path).match(/^.*[\/\\](.+?)[\/\\](.+?)[\/\\]*$/);
var lineName = match[1]; // 产品线
var projName = match[2]; // 项目目录名
process.title = getArg('--title');

// 默认任务
gulp.task('default', function() {
    if (!work || !path) {
        console.log('Error: Missing parameters!');
        return;
    }
    switch (work) {
        case 1: // 自动构建
            return autoBuild(autoRefresh);
            break;
        case 2: // 预发布项目
            return zipProj();
            break;
        case 3: // 初始化项目
            return initProj();
            break;
        case 5: // 预发布公共文件
            return zipCommon();
            break;
        case 6: //发布单独的公共文件
            return zipAloneCommon();
            break;
        case 9: // 构建公共文件
            return buildCommon();
            break;
    }
});

// 获取参数
function getArg(name) {
    var argv = process.argv;
    for (var i in argv) {
        if (argv[i] === name) {
            return argv[+i + 1];
        }
    }
    return null;
}

// 发布单独的公共文件
function zipAloneCommon() {
    var comPath = lineName + '/';
    console.log("开始打包公共文件------------------");
    var filename = 'common.zix';
    var src = lineName + '/tmp/common/';
    var dist = releaseDest + lineName + '/';
    return new Promise(function(resolve, reject) {
        var s1 = 4;
        cleanTemp();
        // 移动其它静态文件
        gulp.src([comPath + '**',
            '!' + comPath + '**/*.js',
            '!' + comPath + '**/*.css',
            '!' + comPath + 'src/**',
            '!' + comPath + 'src',
        ]).
        pipe(gulp.dest(src)).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        // 压缩JS
        gulp.src(comPath + 'static/**/*.js').
        pipe(replace(/\/\*debug>[\s\S]*<debug\*\//g, '')). // 清除debug标记
        pipe(uglify()).
        pipe(gulp.dest(src + 'static/')).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        // 压缩CSS
        gulp.src(comPath + 'static/**/*.css').
        pipe(minifyCss()).
        pipe(gulp.dest(src + 'static/')).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        //处理版本json文件
        gulp.src(comPath + 'static/version.json').
        pipe(gulp.dest(src)).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
    }).then(function() {
        // 压缩优化处理完成，开始打包
        return gulp.src(lineName + '/tmp/' + '**').
        pipe(zip(filename)).
            // pipe(tar(filename)).
            // pipe(gzip()).
        pipe(gulp.dest(dist)).
        on('end', function() {
            cleanTemp();
            console.log('预发布公共文件完成\n发布地址：%s%s', dist, filename);
        });
    });
}

// 预发布项目
function zipProj() {
    var filename = projName + '-' + version + '.zix';
    var src = lineName + '/tmp/' + projName + '/';
    var dist = releaseDest + lineName + '/';
    return new Promise(function(resolve, reject) {
        var s1 = 5;
        cleanTemp();
        // 移动其它静态文件
        gulp.src([path + 'static/**',
            '!' + path + 'static/js/**',
            '!' + path + 'static/css/**',
            '!' + path + 'static/img/**'
        ]).
        pipe(gulp.dest(src + 'static/')).
        on('end', function() {
            console.log('>>> 移动其它静态文件.......................[done]');
            if (--s1 === 0) resolve('done');
        });
        // 移动HTML文件
        gulp.src(path + 'page/**').
        pipe(replace(/\<script[^>]+\/vm\/(?:virtual|debug)App.+?>.+?script>/g, '')). // 清除虚拟文件引用
        pipe(replace(/\<script[^>]+\:9600\/app.js.+?>.+?script>/g, '')). // 清除weinre文件
        pipe(replace(/\<script[^>]+\/target-script-min.+?>.+?script>/g, '')). // 清除weinre文件
        pipe(gulp.dest(src + 'page/')).
        on('end', function() {
            console.log('>>> 移动HTML文件...........................[done]');
            if (--s1 === 0) resolve('done');
        });
        // 压缩JS
        gulp.src(path + 'static/js/**/*.js').
        pipe(replace(/\/\*debug>[\s\S]*<debug\*\//g, '')). // 清除debug标记
        pipe(uglify()).
        pipe(gulp.dest(src + 'static/js/')).
        on('end', function() {
            console.log('>>> 压缩JS文件.............................[done]');
            if (--s1 === 0) resolve('done');
        });
        // 压缩CSS
        gulp.src(path + 'static/css/**/*.css').
            // pipe(minifyCss({restructuring:false})).
        pipe(minifyCss()).
        pipe(gulp.dest(src + 'static/css/')).
        on('end', function() {
            console.log('>>> 压缩CSS文件............................[done]');
            if (--s1 === 0) resolve('done');
        });
        // 优化图片
        gulp.src(path + 'static/img/**/*').
        pipe(minifyImg({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        })).
        pipe(gulp.dest(src + 'static/img/')).
        on('end', function() {
            console.log('>>> 压缩图片文件...........................[done]');
            if (--s1 === 0) resolve('done');
        });
    }).then(function() {
        // 压缩优化处理完成，开始打包
        var tmpPath = lineName + '/tmp/' + projName + '/';
        return stamp(zipMyProj);

        // 修改html和css文件，给静态文件打戳
        function stamp(cb) {
            return gulp.src([tmpPath + 'static/**', '!' + tmpPath + 'static/images/**']).
            pipe(rev()).
                // pipe(gulp.dest(dest.res)).  // 目前只需计算文件摘要，不进行重命名
            pipe(rev.manifest()).
            pipe(gulp.dest(tmpPath + '../rev/')).
            on('end', function() {
                return gulp.src([tmpPath + '../rev/*.json', tmpPath + 'static/**/*.css', tmpPath + 'static/**/*.js']).
                pipe(revCollector({
                        replaceReved: true
                    })).
                    // 修改为 ?v=stamp 形式
                pipe(replace(/\-([0-9a-z]{8,})\.(png|jpg|gif|ico|otf)/g, function(a, b, c) {
                    return '.' + c + '?v=' + b;
                })).
                // 修改为 ?v=stamp 形式
                pipe(replace(/\-([0-9a-z]{8,})\.(mp4|avi|ogg|webm|swf)/g, function(a, b, c) {
                    return '.' + c + '?v=' + b;
                })).
                pipe(gulp.dest(tmpPath + 'static/')).
                on('end', function() {
                    return gulp.src([tmpPath + '../rev/*.json', tmpPath + 'page/**/*.html']).
                    pipe(revCollector({
                            replaceReved: true
                        })).
                        // 修改为 ?v=stamp 形式
                    pipe(replace(/\-([0-9a-z]{8,})\.((min\.)?css|(min\.)?js)/g, function(a, b, c) {
                        return '.' + c + '?v=' + b;
                    })).
                    pipe(replace(/\-([0-9a-z]{8,})\.(png|jpg|gif|ico|otf)/g, function(a, b, c) {
                        return '.' + c + '?v=' + b;
                    })).
                    pipe(replace(/\-([0-9a-z]{8,})\.(mp4|avi|ogg|webm|swf)/g, function(a, b, c) {
                        return '.' + c + '?v=' + b;
                    })).
                    pipe(gulp.dest(tmpPath + 'page/')).
                    on('end', function() {
                        console.log('>>> 静态资源版本控制.......................[done]');
                        if (typeof cb === 'function') return cb();
                    });
                });
            });
        }

        function zipMyProj() {
            return gulp.src([lineName + '/tmp/' + '**', '!' + lineName + '/tmp/rev{,/**}']).
            pipe(zip(filename)).
            pipe(gulp.dest(dist)).
            on('end', function() {
                cleanTemp();
                console.log('-------------------------------------------\n预发布项目完成\n发布地址：%s%s', dist, filename);
            });
        }
    });
}

// 清除临时文件夹
function cleanTemp(cb) {
    try {
        del(lineName + '/tmp/' + '**', cb);
    } catch (e) {}
}

// 初始化项目
function initProj() {
    return new Promise(function(resolve, reject) {
        var s1 = 4;
        packJS().on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        buildLess().on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        buildSass().on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        buildCSS().on('end', function() {
            if (--s1 === 0) resolve('done');
        });
    }).then(function() {
        console.log('初始化项目完成');
    });
}

// 预发布公共文件
function zipCommon() {
    var comPath = lineName + '/common/';
    // var filename = 'common.tar';
    var filename = 'common.zix';
    var src = lineName + '/tmp/common/';
    var dist = releaseDest + lineName + '/';
    return new Promise(function(resolve, reject) {
        var s1 = 3;
        cleanTemp();
        // 移动其它静态文件
        gulp.src([comPath + '**',
            '!' + comPath + '**/*.js',
            '!' + comPath + '**/*.css',
            '!' + comPath + 'src/**',
            '!' + comPath + 'src',
        ]).
        pipe(gulp.dest(src)).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        // 压缩JS
        gulp.src(comPath + 'static/**/*.js').
        pipe(replace(/\/\*debug>[\s\S]*<debug\*\//g, '')). // 清除debug标记
        pipe(uglify()).
        pipe(gulp.dest(src + 'static/')).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        // 压缩CSS
        gulp.src(comPath + 'static/**/*.css').
        pipe(minifyCss()).
        pipe(gulp.dest(src + 'static/')).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
    }).then(function() {
        // 压缩优化处理完成，开始打包
        return gulp.src(lineName + '/tmp/' + '**').
        pipe(zip(filename)).
            // pipe(tar(filename)).
            // pipe(gzip()).
        pipe(gulp.dest(dist)).
        on('end', function() {
            cleanTemp();
            console.log('预发布公共文件完成\n发布地址：%s%s', dist, filename);
        });
    });
}

// 构建公共文件
function buildCommon() {
    var baseSrc = path + '../common/src/';
    var baseDist = path + '../common/static/';
    return new Promise(function(resolve, reject) {
        var s1 = 3;
        buildCSS(baseSrc + '**/*.css', baseDist).on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        packJS(baseSrc + '**/*.{js,jsx,es6}', baseDist).on('end', function() {
            if (--s1 === 0) resolve('done');
        });
        // 移动其它静态文件
        gulp.src([baseSrc + '**',
            '!' + baseSrc + '**/*.js',
            '!' + baseSrc + '**/*.css',
            '!' + baseSrc + '**/*.es6',
            '!' + baseSrc + '**/*.jsx'
        ]).
        pipe(gulp.dest(baseDist)).
        on('end', function() {
            if (--s1 === 0) resolve('done');
        });
    }).then(function() {
        console.log('构建公共文件完成');
    });
}

// 开启自动构建
function autoBuild(autoRefresh) {
    watch(path + 'src/**/*.{js,jsx,es6}', function(event) {
        console.log('js building...');
        packJS();
    });
    watch(path + 'src/**/*.{css,less,scss}', function(event) {
        var paths = watchPath(event, path + 'src/', path + 'src/'); // 检测less及scss文件
        if (paths.srcFilename.indexOf('.less') > -1) { // 分捡less文件
            buildLess(paths.srcPath, paths.distDir);
        } else if (paths.srcFilename.indexOf('.scss') > -1) { // 分捡sass文件
            buildSass(paths.srcPath, paths.distDir);
        } else {
            buildCSS();
        }
    });
    if (autoRefresh) {
        browserSync({
            files: path + 'static/**',
            startPath: '/' + projName + '/page/',
            server: {
                baseDir: path + '../',
                index: 'index.html'
            }
        });
    }
}

/**
 * 打包JS文件
 * 如提供src及dist参数，则只构建src指定的文件并输出到dist指定的目标
 * @param    {string}   src  可选，构建源文件
 * @param    {string}   dist 可选，目的文件
 */
function packJS(src, dist) {
    src = src || (path + 'src/js/app*.{js,jsx,es6}');
    dist = dist || (path + 'static/js/');
    return gulp.src(src).
    pipe(plumber({
        errorHandler: function(e) {
            console.log(e);
        }
    })).
    pipe(named()).
    pipe(webpack({
        module: {
            loaders: [{
                test: /\.js|jsx|es6$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['react', 'es2015', 'stage-0']
                }
            }, {
                test: /\.(png|jpg|gif|woff|woff2)$/,
                loader: 'url-loader?limit=8192'
            }],
        },
    })).
    pipe(gulp.dest(dist));
}

/**
 * 构建less文件
 * 如提供src及dist参数，则只构建src指定的文件并输出到dist指定的目标
 * @param    {string}   src  可选，构建源文件
 * @param    {string}   dist 可选，目的文件
 */
function buildLess(src, dist) {
    src = src || (path + 'src/**/*.less');
    dist = dist || (path + 'static/');
    console.log('less building...');
    return gulp.src(src).
    pipe(plumber({
        errorHandler: function(e) {
            console.log(e);
        }
    })).
    pipe(less()).
    pipe(importCss()). // 处理 @import url
        // pipe(autoprefixer('last 2 Chrome versions', 'Firefox > 20')).
    pipe(gulp.dest(dist));
}

/**
 * 构建sass文件
 * 如提供src及dist参数，则只构建src指定的文件并输出到dist指定的目标
 * @param    {string}   src  可选，构建源文件
 * @param    {string}   dist 可选，目的文件
 */
function buildSass(src, dist) {
    src = src || (path + 'src/**/*.scss');
    dist = dist || (path + 'static/');
    // console.log('sass building...');
    return {
        on: function(a, cb) {
            return cb();
        }
    };
    /*return gulp.src(src).
        pipe(plumber({errorHandler: function(e){
            console.log(e);
        }})).
        pipe(sass()).
    pipe(importCss()). // 处理 @import url
        // pipe(autoprefixer('last 2 Chrome versions', 'Firefox > 20')).
        pipe(gulp.dest(dist));*/
}

/**
 * 构建css文件
 * 如提供src及dist参数，则只构建src指定的文件并输出到dist指定的目标
 * @param    {string}   src  可选，构建源文件
 * @param    {string}   dist 可选，目的文件
 */
function buildCSS(src, dist) {
    var src = src || (path + 'src/**/*.css');
    var dist = dist || (path + 'static/');
    console.log('css building...');
    return gulp.src(src).
    pipe(plumber({
        errorHandler: function(e) {
            console.log(e);
        }
    })).
    pipe(importCss()). // 处理 @import url
        // pipe(autoprefixer('last 2 Chrome versions', 'Firefox > 20')).
    pipe(autoprefixer('Chrome > 10', 'Firefox > 10')).
    pipe(gulp.dest(dist));
}