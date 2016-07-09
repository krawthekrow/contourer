'use strict';

class GPGPUKernelResult{
    constructor(ctx, fbo, textures){
        this.ctx = ctx;
        this.fbo = fbo;
        this.textures = textures;
    }
    dispose(){
        if(this.fbo != null){
            this.ctx.deleteFramebuffer(this.fbo);
        }
        this.textures.forEach(texture => {
            this.ctx.deleteTexture(texture);
        });
    }
};

class GPGPUKernel{
    constructor(manager, program, params = [], numOutputs = 1, isGraphical = false){
        this.manager = manager;
        this.program = program;
        this.params = params;
        this.numOutputs = numOutputs;
        this.isGraphical = isGraphical;
    }
    get ctx(){
        return this.manager.ctx;
    }
    get extDB(){
        return this.manager.extDB;
    }
    run(inputTextures, outputDims, paramVals = {}, useFloat = true){
        this.ctx.useProgram(this.program);
        registerUniforms(this.ctx, this.program, this.params, paramVals);
        registerUniforms(this.ctx, this.program, [{
            name: 'uDims',
            type: 'ivec2'
        }], {
            uDims: outputDims.toArray()
        });

        const outputTextures = compute1DArray(this.numOutputs, i =>
            createComputeTexture(this.ctx, outputDims, useFloat ? this.ctx.FLOAT : this.ctx.UNSIGNED_BYTE)
        );

        const fbo = this.isGraphical ? null : createFBO(this.ctx, this.extDB, outputTextures);
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, fbo);

        bindTextures(this.ctx, inputTextures);

        this.ctx.viewport(0, 0, outputDims.width, outputDims.height);
        this.manager.drawFullscreenQuad(this.program);

        return new GPGPUKernelResult(this.ctx, fbo, outputTextures);
    }
};

class GPGPUManager{
    constructor(ctx, useFloat = true){
        this.ctx = ctx;
        this.extDB = this.ctx.getExtension('WEBGL_draw_buffers');
        if(useFloat){
            this.ctx.getExtension('OES_texture_float');
        }

        this.quadPosBuffer = createArrayBuffer(this.ctx, this.ctx.ARRAY_BUFFER, FULLSCREEN_QUAD_POS_ARRAY);
        this.quadIndexBuffer = createArrayBuffer(this.ctx, this.ctx.ELEMENT_ARRAY_BUFFER, FULLSCREEN_QUAD_INDEX_ARRAY);
    }
    drawFullscreenQuad(program){
        this.ctx.useProgram(program);
        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
        this.ctx.drawElements(this.ctx.TRIANGLE_STRIP, FULLSCREEN_QUAD_NUM_VERTICES, this.ctx.UNSIGNED_SHORT, 0);
    }
    readPackedFloatData(dims){
        const buf = new Uint8Array(dims.getArea() * 4);
        this.ctx.readPixels(0, 0, dims.width, dims.height, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, buf);
        return new Float32Array(buf.buffer);
    }
    arrayToTexture(dims, arr, useFloat = true){
        const floatFlattenedArr = new Float32Array(flatten(flatten(arr)))
        const flattenedArr = useFloat ? floatFlattenedArr : (new Uint8Array(flattenedArr.buffer));
        return createComputeTexture(this.ctx, dims, useFloat ? this.ctx.FLOAT : this.ctx.UNSIGNED_BYTE, flattenedArr);
    }
    textureToArray(dims, tex, component = 0){
        const computeFunc = 
`vec2 cVal = texture2D(uInput, vCoord).xy;
gl_FragData[0] = packFloat(cVal.` + 'xyzw'[component] + `);
`;
        const inputNames = ['uInput'];
        const kernel = this.createKernel(
            computeFunc,
            inputNames,
            dims,
            [],
            0,
            GPGPUManager.PACK_FLOAT_INCLUDE
        );

        const results = kernel.run([tex], dims, {}, this.ctx.UNSIGNED_BYTE);
        const output = this.readPackedFloatData(dims);
        results.dispose();

        return compute2DArray(dims, pos =>
            output[pos.y * dims.width + pos.x]
        );
    }
    createKernel(computeFunc, inputNames, outputDims, params = [], numOutputs = 1, includeSrc = '', isGraphical = false){
        const uniforms = [].concat(params, inputNames.map(
            inputName => ({
                type: 'sampler2D',
                name: inputName
            })
        ),[{
            type: 'ivec2',
            name: 'uDims'
        }]);
        const vertShaderSrc = GPGPUManager.createVertShaderSrc(isGraphical);
        const fragShaderSrc = GPGPUManager.createFragShaderSrc(computeFunc.trim().split('\n').map(line => '    ' + line).join('\n') + '\n', uniforms, includeSrc, numOutputs > 1);
        const program = createProgram(this.ctx, vertShaderSrc, fragShaderSrc);

        this.ctx.useProgram(program);
        registerVertexAttrib(this.ctx, program, 'aPos', 2, this.quadPosBuffer);
        registerTextures(this.ctx, program, inputNames);
        return new GPGPUKernel(this, program, params, numOutputs, isGraphical);
    }
    createGraphicalKernel(computeFunc, inputNames, outputDims, params = [], includeSrc = ''){
        return this.createKernel(computeFunc, inputNames, outputDims, params, 0, includeSrc, true);
    }
};

// Credit: https://gist.github.com/TooTallNate/4750953
GPGPUManager.endianness = (() => {
    const b = new ArrayBuffer(4);
    const a = new Uint32Array(b);
    const c = new Uint8Array(b);
    a[0] = 0xdeadbeef;
    if (c[0] == 0xef) return 'LE';
    if (c[0] == 0xde) return 'BE';
    throw new Error('unknown endianness');
})();

GPGPUManager.getCanvasContext = canvas => {
    const options = {
        depth: false,
        antialias: false
    };
    return canvas.getContext('webgl', options) || canvas.getContext('webgl-experimental', options);
};

GPGPUManager.createVertShaderSrc = (flipY = false) =>
`precision highp float;

attribute vec2 aPos;

varying vec2 vCoord;

void main(){
    gl_Position = vec4(` +
    (flipY ? `aPos.x, -aPos.y` : `aPos`) +
    `, 0.0, 1.0);
    vCoord = (aPos + 1.0) / 2.0;
}`;

GPGPUManager.PACK_FLOAT_INCLUDE =
`vec4 round(vec4 x) {
    return floor(x + 0.5);
}

highp float round(highp float x) {
    return floor(x + 0.5);
}

vec2 integerMod(vec2 x, float y) {
    vec2 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}

vec3 integerMod(vec3 x, float y) {
    vec3 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}

vec4 integerMod(vec4 x, vec4 y) {
    vec4 res = floor(mod(x, y));
    return res * step(1.0 - floor(y), -res);
}

highp float integerMod(highp float x, highp float y) {
    highp float res = floor(mod(x, y));
    return res * (res > floor(y) - 1.0 ? 0.0 : 1.0);
}

highp int integerMod(highp int x, highp int y) {
    return int(integerMod(float(x), float(y)));
}

const vec2 MAGIC_VEC = vec2(1.0, -256.0);
const vec4 SCALE_FACTOR = vec4(1.0, 256.0, 65536.0, 0.0);
const vec4 SCALE_FACTOR_INV = vec4(1.0, 0.00390625, 0.0000152587890625, 0.0); // 1, 1/256, 1/65536
highp float unpackFloat(highp vec4 rgba) {
` + ((GPGPUManager.endianness == 'LE') ? '' :
`    rgba.rgba = rgba.abgr;
`) +
`    rgba *= 255.0;
    vec2 gte128;
    gte128.x = rgba.b >= 128.0 ? 1.0 : 0.0;
    gte128.y = rgba.a >= 128.0 ? 1.0 : 0.0;
    float exponent = 2.0 * rgba.a - 127.0 + dot(gte128, MAGIC_VEC);
    float res = exp2(round(exponent));
    rgba.b = rgba.b - 128.0 * gte128.x;
    res = dot(rgba, SCALE_FACTOR) * exp2(round(exponent-23.0)) + res;
    res *= gte128.y * -2.0 + 1.0;
    return res;
}

highp vec4 packFloat(highp float f) {
    highp float F = abs(f);
    highp float sign = f < 0.0 ? 1.0 : 0.0;
    highp float exponent = floor(log2(F));
    highp float mantissa = (exp2(-exponent) * F);
    // exponent += floor(log2(mantissa));
    vec4 rgba = vec4(F * exp2(23.0-exponent)) * SCALE_FACTOR_INV;
    rgba.rg = integerMod(rgba.rg, 256.0);
    rgba.b = integerMod(rgba.b, 128.0);
    rgba.a = exponent*0.5 + 63.5;
    rgba.ba += vec2(integerMod(exponent+127.0, 2.0), sign) * 128.0;
    rgba *= 0.003921569; // 1/255
` + ((GPGPUManager.endianness == 'LE') ? '' :
`    rgba.rgba = rgba.abgr;
`) +
`    return rgba;
}

`;

GPGPUManager.createFragShaderSrc = (computeFunc, uniforms, includeSrc = '', useDrawBuffers = true) => [
    useDrawBuffers ?
`#extension GL_EXT_draw_buffers: require
` : '',
`precision highp float;
precision highp sampler2D;

#define EPS 0.0000001

`,
    ...uniforms.map(uniform =>
`uniform ` + uniform.type + ` ` + uniform.name + `;
`
    ),
`
varying vec2 vCoord;

vec4 arrGet(sampler2D arr, ivec2 id){
    return texture2D(arr, (vec2(id) + vec2(0.5)) / vec2(uDims));
}

`,
    includeSrc,
`void computeFunc(){
    ivec2 threadId = ivec2(vCoord * vec2(uDims));
`,
    computeFunc,
`}

void main(){
    computeFunc();
}`].join('');