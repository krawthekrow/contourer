'use strict';

function compileShader(ctx, src, type){
    const shader = ctx.createShader(type);
    ctx.shaderSource(shader, src);
    ctx.compileShader(shader);
    if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
        console.log(src);
        throw 'Shader compile error: ' + ctx.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(ctx, vertSrc, fragSrc){
    const program = ctx.createProgram();
    ctx.attachShader(program, compileShader(ctx, vertSrc, ctx.VERTEX_SHADER));
    ctx.attachShader(program, compileShader(ctx, fragSrc, ctx.FRAGMENT_SHADER));
    ctx.linkProgram(program);
    return program;
}

function createComputeTexture(ctx, dims, texType = ctx.FLOAT, contents = null){
    const tex = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, tex);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, dims.width, dims.height, 0, ctx.RGBA, texType, contents);
    return tex;
}

function createFBO(ctx, extDB, textures){
    const fbo = ctx.createFramebuffer();
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);
    if(textures.length > 1){
        extDB.drawBuffersWEBGL(compute1DArray(textures.length,
            i => extDB['COLOR_ATTACHMENT' + i.toString() + '_WEBGL']
        ));
        textures.forEach((tex, i) => {
            ctx.framebufferTexture2D(ctx.FRAMEBUFFER, extDB['COLOR_ATTACHMENT' + i.toString() + '_WEBGL'], ctx.TEXTURE_2D, tex, 0);
        });
    }
    else{
        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, textures[0], 0);
    }
    if(ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) != ctx.FRAMEBUFFER_COMPLETE){
        throw 'GL_FRAMEBUFFER_COMPLETE failed.';
    }
    return fbo;
}

function createArrayBuffer(ctx, bufType, contents){
    const buf = ctx.createBuffer();
    ctx.bindBuffer(bufType, buf);
    ctx.bufferData(bufType, contents, ctx.STATIC_DRAW);
    return buf;
}

function registerVertexAttrib(ctx, program, attribName, itemSize, buf){
    const attrib = ctx.getAttribLocation(program, attribName);
    ctx.enableVertexAttribArray(attrib);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.vertexAttribPointer(attrib, itemSize, ctx.FLOAT, false, 0, 0);
}

function registerTextures(ctx, program, texNames){
    texNames.forEach((texName, i) => {
        const texLoc = ctx.getUniformLocation(program, texName);
        ctx.uniform1i(texLoc, i);
    });
}

function registerUniforms(ctx, program, uniforms, vals){
    uniforms.forEach(uniform => {
        const uniformLoc = ctx.getUniformLocation(program, uniform.name);
        if(uniform.type == 'int'){
            ctx.uniform1i(uniformLoc, vals[uniform.name]);
        }
        else if(uniform.type == 'float'){
            ctx.uniform1f(uniformLoc, vals[uniform.name]);
        }
        else if(/^ivec[2-4]$/g.test(uniform.type)){
            ctx['uniform' + uniform.type[4].toString() + 'iv'](uniformLoc, new Int32Array(vals[uniform.name]));
        }
        else if(/^vec[2-4]$/g.test(uniform.type)){
            ctx['uniform' + uniform.type[3].toString() + 'fv'](uniformLoc, new Float32Array(vals[uniform.name]));
        }
    });
}

function bindTextures(ctx, textures){
    textures.forEach((texture, i) => {
        ctx.activeTexture(ctx['TEXTURE' + i.toString()]);
        ctx.bindTexture(ctx.TEXTURE_2D, texture);
    });
}

const FULLSCREEN_QUAD_POS_ARRAY = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0,
]);

const FULLSCREEN_QUAD_INDEX_ARRAY = new Uint16Array([
    0, 1, 2,
    0, 2, 3
]);

const FULLSCREEN_QUAD_NUM_VERTICES = 6;
