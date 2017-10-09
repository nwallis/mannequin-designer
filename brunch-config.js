module.exports = {
    files: {
        javascripts: {
            order: {
                before: [
                    'app/rappid.min.js',
                    'app/joint.shapes.qad.js',
                    'app/selection.js',
                    'app/factory.js',
                    'app/helpers.js',
                    'app/app.js',
                    'app/index.js',
                ]
            },
            joinTo: {
                'app.js': 'app/*.js'
            }
        }
    },
    modules: {
        wrapper: false
    },
    paths: {
        public: "dist"
    },
    npm: {
        enabled: false
    }
};
