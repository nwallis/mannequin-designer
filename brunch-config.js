module.exports = {
    files: {
        javascripts: {
            order: {
                before: [
                    'app/designer/joint.shapes.qad.js',
                    'app/designer/index.js',
                ]
            },
            joinTo: {
                'app.js': ['app/designer/*.js']
            }
        },
        templates: {
            joinTo: {
                'templates.js': /app\/templates.*/
            }
        },
        stylesheets: {
            joinTo: {
                "designer.css": /app\/css.*/
            }
        }
    },
    modules: {
        wrapper: function(path, data) {
            if (path.indexOf('jade') !== -1) {
                return `require.define("${path}", function(exports, require, module) { ${data} });\n\n`
            } else {
                return data;
            }
        }
    },
    paths: {
        public: "dist"
    },
    npm: {
        enabled: false
    },
    plugins: {
        static: {},
        jade: {
            options: {}
        }
    }
};
