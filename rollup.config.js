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

// Add directive bundles
directives.forEach(name => {
    builds.push({
        input: `src/entries/${name}.js`,
        output: {
            file: `dist/senangstart-actions-${name}.js`,
            format: 'iife',
            name: 'SenangStart',
            extend: true // Allow extending the window.SenangStart if it exists? 
            // Actually, each bundle imports Core and calls start().
            // If multiple are loaded, they might overwrite or coexist.
            // Core logic `window.SenangStart = SenangStart` assumes singleton.
            // If they are truly independent, they define SenangStart with just their directive.
            // If user loads multiple... e.g. text.js and show.js.
            // Both define window.SenangStart. The last one wins?
            // "each only support its specific directives only"
            // This suggests they are meant to be used EITHER as full bundle OR as specific bundles.
            // If specific bundles are combined, they need to share the registry.
            // The registry is in `src/core/registry.js`.
            // When bundled with IIFE, each bundle gets its OWN internal modules.
            // So they won't share the registry.
            // This means they CANNOT be mixed in the same page easily if built as standalone IIFEs.
            // Unless they expose an API to register more directives?
            // The core exposes `SenangStart` but not `registerDirective`.
            // The user requirement "output individual directives indipendently... each only support its specific directives only"
            // suggests standalone usage.
            // Supporting "mix and match" would require a shared runtime loader.
            // Given the task, I will stick to standalone independent builds.
        }
    });
    
    // Add minified version for directives too? User implied "output ... like examples".
    // Usually expected in dist.
    builds.push({
        input: `src/entries/${name}.js`,
        output: {
            file: `dist/senangstart-actions-${name}.min.js`,
            format: 'iife',
            name: 'SenangStart'
        },
        plugins: [terser()]
    });
});

export default builds;
