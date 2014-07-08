({
    baseUrl: "js",

    mainConfigFile: "js/main.js",

    //How to optimize all the JS files in the build output directory.
    //Right now only the following values
    //are supported:
    //- "uglify": (default) uses UglifyJS to minify the code.
    //- "uglify2": in version 2.1.2+. Uses UglifyJS2.
    //- "closure": uses Google's Closure Compiler in simple optimization
    //mode to minify the code. Only available if running the optimizer using
    //Java.
    //- "closure.keepLines": Same as closure option, but keeps line returns
    //in the minified files.
    //- "none": no minification will be done.
    optimize: "uglify",

    uglify: {
        max_line_length: 1000
    },
    
    wrapShim: true,
    
    name: "libs/almond/almond",
    insertRequire: ["main"],
    include: [ "domReady", "main" ],
    out: "build/voxview.min.js",
    wrap: true
})