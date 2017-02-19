import rollup      from 'rollup';///dist/rollup.es.js'
import nodeResolve from 'rollup-plugin-node-resolve';///dist/rollup-plugin-node-resolve.es6.js'
import commonjs    from 'rollup-plugin-commonjs';///dist/rollup-plugin-commonjs.es.js';
import uglify      from 'rollup-plugin-uglify';///dist/rollup-plugin-uglify.js'

export default {
   entry: 'app/main.js',
   dest: 'dist/build.js', // output a single application bundle
   sourceMap: false,
   format: 'iife',
   plugins: [
      nodeResolve({jsnext: true, module: true}),
      commonjs({
         include: 'node_modules/rxjs/**',
      }),
      uglify()
   ]
}