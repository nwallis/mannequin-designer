module.exports = {
    files: {
        javascripts: {
            order: {
                before: [
                    'app/designer/joint.shapes.qad.js',
                    'app/designer/selection.js',
                    'app/designer/factory.js',
                    'app/signer/helpers.js',
                    'app/signer/app.js',
                    'app/signer/index.js',
                ]
            },
            joinTo: {
                'app.js': ['app/designer/*.js']
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
