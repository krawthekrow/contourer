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
    run(inputTextures, outputDims, paramVals = {}, outputType = this.ctx.FLOAT){
        this.ctx.useProgram(this.program);
        registerUniforms(this.ctx, this.program, this.params, paramVals);
        registerUniforms(this.ctx, this.program, [{
            name: 'uDims',
            type: 'ivec2'
        }], {
            uDims: outputDims.toArray()
        });

        const outputTextures = compute1DArray(this.numOutputs, i =>
            createComputeTexture(this.ctx, outputDims, outputType)
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
    constructor(ctx){
        this.ctx = ctx;
        this.extDB = this.ctx.getExtension('WEBGL_draw_buffers');
        this.ctx.getExtension('OES_texture_float');

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
    arrayToTexture(dims, arr){
        const flattenedArr = new Float32Array(flatten(flatten(arr)))
        return createComputeTexture(this.ctx, dims, this.ctx.FLOAT, flattenedArr);
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
`float integerMod(float x, float y) {
	float res = floor(mod(x, y));
	if (res > floor(y) - 1.0) return 0.0;
	else return res;
}

vec4 packFloat(float f) {
	if (f == 0.0) return vec4(0.0);
	float F = abs(f);
	float exponent = floor(log2(F));
	float mantissa = exp2(-exponent) * F;
	exponent = exponent + floor(log2(mantissa));
	float mantissa_part1 = integerMod(F * exp2(23.0-exponent), 256.0);
	float mantissa_part2 = integerMod(F * exp2(15.0-exponent), 256.0);
	float mantissa_part3 = integerMod(F * exp2(7.0-exponent), 128.0);
	exponent += 127.0;
	return vec4(
        mantissa_part1,
        mantissa_part2,
        128.0 * integerMod(exponent, 2.0) + mantissa_part3,
        128.0 * (f < 0.0 ? 1.0 : 0.0) + exponent / 2.0
    ) * 0.003921569;
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
