import resolve from "@rollup/plugin-node-resolve";
import {babel} from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "dist/esm/index.js",
    output: {
        file: "dist/bundle.js",
        name: "tests",
        format: "iife",
        sourcemap: true,
        compact: true,
        strict: true,
    },
    plugins: [
        resolve({
            preferBuiltins: true
        }),
        commonjs(),
        babel({
            sourceMaps: true,
            inputSourceMap: false,
            babelHelpers: 'bundled',
            babelrc: false,
            exclude: [/\/core-js\//],
            presets: [[
                "@babel/preset-env", {
                    targets: "> 0.25%, not dead",
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: false,
                    spec: true,
                    forceAllTransforms: true,
                    debug: true
                }
            ]],
            plugins: []
        })
    ]
};
