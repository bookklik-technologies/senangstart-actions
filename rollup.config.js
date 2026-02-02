import terser from '@rollup/plugin-terser';

const directives = [
    'data', 'text', 'show', 'if', 'for', 'model', 'bind', 'on', 
    'ref', 'effect', 'transition', 'cloak', 'id', 'teleport',
    'html', 'init'
];

const builds = [
    // Main Browser bundle (IIFE)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.js',
            format: 'iife',
            name: 'SenangStart',
            banner: '/**\n * SenangStart Actions v0.1.0\n * Declarative UI framework for humans and AI agents\n * @license MIT\n */'
        }
    },
    // Main Minified browser bundle
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.min.js',
            format: 'iife',
            name: 'SenangStart'
        },
        plugins: [terser()]
    },
    // Main ES module bundle
    {
        input: 'src/index.js',
        output: {
            file: 'dist/senangstart-actions.esm.js',
            format: 'es',
            banner: '/**\n * SenangStart Actions v0.1.0\n * Declarative UI framework for humans and AI agents\n * @license MIT\n */'
        }
    }
];

// Core Bundle (Shared Runtime)
builds.push({
    input: 'src/core/senangstart.js',
    output: {
        file: 'dist/senangstart-actions-core.js',
        format: 'iife',
        name: 'SenangStart'
    }
});

builds.push({
    input: 'src/core/senangstart.js',
    output: {
        file: 'dist/senangstart-actions-core.min.js',
        format: 'iife',
        name: 'SenangStart'
    },
    plugins: [terser()]
});

// Add directive bundles
directives.forEach(name => {
    const globals = (id) => {
        const normalizedId = id.replace(/\\/g, '/');
        if (normalizedId.includes('core/senangstart.js')) return 'SenangStart';
        if (normalizedId.includes('core/registry.js')) return 'SenangStart.internals.registry';
        if (normalizedId.includes('reactive.js')) return 'SenangStart.internals.reactive';
        if (normalizedId.includes('walker.js')) return 'SenangStart.internals.walker';
        return id;
    };

    const external = (id) => {
        const normalizedId = id.replace(/\\/g, '/');
        const isExternal = normalizedId.includes('core/senangstart.js') || 
            normalizedId.includes('core/registry.js') || 
            normalizedId.includes('reactive.js') || 
            normalizedId.includes('walker.js');
        
        return isExternal;
    };

    builds.push({
        input: `src/entries/${name}.js`,
        output: {
            file: `dist/senangstart-actions-${name}.js`,
            format: 'iife',
            name: 'SenangStart',
            extend: true,
            globals
        },
        external
    });
    
    builds.push({
        input: `src/entries/${name}.js`,
        output: {
            file: `dist/senangstart-actions-${name}.min.js`,
            format: 'iife',
            name: 'SenangStart',
            extend: true,
            globals
        },
        external,
        plugins: [terser()]
    });
});

export default builds;
