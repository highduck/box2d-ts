import typescript from "rollup-plugin-typescript2";

export default {
    input: "HelloWorld.ts",
    output: {
        file: "dist/helloworld.js",
        name: "helloworld",
        format: "iife"
    },
    plugins: [
        typescript({
            clean: true,
            tsconfigOverride: {
                compilerOptions: {
                    target: "ES2015",
                    module: "ES2015"
                }
            }
        }),
    ]
};
