import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import flow from 'rollup-plugin-flow';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

import packageJSON from './package.json';

const plugins = () => [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  flow(),
  babel({
    exclude: 'node_modules/**',
  }),
  resolve({
    jsnext: true,
    main: true,
  }),
  commonjs(),
  filesize(),
  cleanup(),
];

export default {
  input: 'src/index.js',
  output: [
    { file: packageJSON.main, format: 'cjs' },
    { file: packageJSON.module, format: 'es' },
  ],
  external: [
    ...Object.keys(packageJSON.dependencies || {}),
  ],
  plugins: plugins(),
};
