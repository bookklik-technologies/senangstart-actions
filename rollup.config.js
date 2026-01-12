import terser from '@rollup/plugin-terser';

export default [
    // Browser bundle (IIFE)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.js',
            format: 'iife',
            name: 'SenangStart',
            banner: '/**\n * SenangStart Actions v0.1.0\n * Declarative UI framework for humans and AI agents\n * @license MIT\n */'
        }
    },
    // Minified browser bundle
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.min.js',
            format: 'iife',
            name: 'SenangStart'
        },
        plugins: [terser()]
    },
    // ES module bundle
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.esm.js',
            format: 'es',
            banner: '/**\n * SenangStart Actions v0.1.0\n * Declarative UI framework for humans and AI agents\n * @license MIT\n */'
        }
    }
];
