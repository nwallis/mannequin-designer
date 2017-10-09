module.exports = {
    files: {
        javascripts: {
            order: {
                before: [
                    'app/rappid.min.js'
                ]
            },
            joinTo: {
                'app.js': 'app/*.js'
            }
        }
    },
    paths: {
        public: "dist"
    },
    npm: {
        enabled: false
    }
};
