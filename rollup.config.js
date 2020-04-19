import { terser } from 'rollup-plugin-terser';

export default {
  input: 'swizzle.js',
  output: {
    format: 'iife',
    file: 'swizzle-min.js',
    plugins: [terser()],
  },
};
