'use strict';

const RED = new Color(255, 0, 0);
const GREEN = new Color(0, 255, 0);
const BLUE = new Color(0, 0, 255);
const WHITE = new Color(255, 255, 255);

class ContourerManager{
    constructor(drawFunc){
        this.viewport = new ScalableViewportManager(
            new Vector(0, 0),
            0.01
        );
        this.zoomSensitivity = 0.3;
        this.contourSpacing = 1.0;
    }
    changeDrawFunc(drawFunc, includeSrc, isAnimated = false){
        const createFieldKernel = coord => {
            const fieldFunc =
`vec2 cPos = (vec2(threadId) * uScale) + uPos;
vec2 res;
` +
            drawFunc.trim() + '\n' +
//`gl_FragData[0] = vec4(
//    res,
//    0.0, 0.0
//);
`gl_FragData[0] = packFloat(res.` + coord + `);
`;
            return this.gpgpuManager.createKernel(
                fieldFunc, [], this.dims, [
                    {
                        type: 'float',
                        name: 'uScale'
                    },
                    {
                        type: 'vec2',
                        name: 'uPos'
                    }
                ].concat(isAnimated ? [
                    {
                        type: 'float',
                        name: 'time'
                    }
                ] : []), 1, GPGPUManager.PACK_FLOAT_INCLUDE + includeSrc.trim() + '\n\n'
            );
        };
        this.fieldKernelX = createFieldKernel('x');
        this.fieldKernelY = createFieldKernel('y');

        this.viewport.scale = 10.0 / this.dims.width;
        this.viewport.pos = new Vector(-this.dims.width, -this.dims.height).divide(2.0).multiply(this.viewport.scale);
        this.contourSpacing = 1.0;

        this.isAnimated = isAnimated;
    }
    useCanvas(canvas){
        this.ctx = GPGPUManager.getCanvasContext(canvas);
        this.gpgpuManager = new GPGPUManager(this.ctx, false);
        this.dims = getCanvasDims(this.ctx);

        this.plotKernel = this.gpgpuManager.createGraphicalKernel(
            ContourerManager.plotFunc, ['uFieldX', 'uFieldY'], this.dims, [
                {
                    type: 'float',
                    name: 'uContourSpacing'
                }
            ], GPGPUManager.PACK_FLOAT_INCLUDE + ContourerManager.FIELD_CHECK_INCLUDE
        );
    }
    destroyContext(){
        this.ctx.canvas.width = 1;
        this.ctx.canvas.height = 1;
    }
    changeZoom(changeAmount, zoomPoint = new Vector(this.dims.width / 2, this.dims.height / 2)){
        this.viewport.scaleAtPoint(
            -changeAmount * this.zoomSensitivity,
            zoomPoint
        );
    }
    changeContourSpacing(changeAmount){
        this.contourSpacing *= Math.exp(changeAmount * this.zoomSensitivity);
    }
    translate(translateAmount){
        this.viewport.translate(translateAmount);
    }
    drawContours(time = 0){
        const uniformAssignments = {
            uScale: this.viewport.scale,
            uPos: this.viewport.pos.toArray()
        };
        if(this.isAnimated){
            uniformAssignments['time'] = time;
        }
        const fieldResultX = this.fieldKernelX.run([], this.dims, uniformAssignments, false);
        const fieldResultY = this.fieldKernelY.run([], this.dims, uniformAssignments, false);
        this.plotKernel.run([fieldResultX.textures[0], fieldResultY.textures[0]], this.dims, {
            uContourSpacing: this.contourSpacing
        });
        fieldResultX.dispose();
        fieldResultY.dispose();
    }
};

ContourerManager.plotFunc =
`ivec2 lineIndex = ivec2(floor(vec2(
    unpackFloat(texture2D(uFieldX, vCoord)),
    unpackFloat(texture2D(uFieldY, vCoord))
) / uContourSpacing));
vec2 cmpField = vec2(lineIndex) * uContourSpacing;
ivec2 drawData = ivec2(greaterThanEqual(
    fieldCheck(threadId, ivec2(0, 1), cmpField) +
    fieldCheck(threadId, ivec2(1, 0), cmpField) +
    fieldCheck(threadId, ivec2(0, -1), cmpField) +
    fieldCheck(threadId, ivec2(-1, 0), cmpField),
    ivec2(1)));
if(all(equal(drawData, ivec2(0)))){
    gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
}
else{
    vec2 isAxis = vec2(equal(lineIndex, ivec2(0)));
    vec2 lineColor = vec2(drawData) * (1.0 - 0.5 * isAxis);
    gl_FragData[0] = vec4(lineColor.x, 0.5 * dot(vec2(drawData), isAxis), lineColor.y, 1.0);
}
`;

ContourerManager.FIELD_CHECK_INCLUDE =
`vec2 getField(ivec2 pos){
    return vec2(
        unpackFloat(arrGet(uFieldX, pos)),
        unpackFloat(arrGet(uFieldY, pos))
    );
}

ivec2 fieldCheck(ivec2 cPos, ivec2 dir, vec2 cmpField){
    ivec2 oPos = cPos + dir;
    if(all(greaterThanEqual(oPos, ivec2(0))) && all(lessThan(oPos, uDims))){
        return ivec2(lessThan(getField(oPos), cmpField));
    }
    else return ivec2(0);
}

`;

class ContourerAnimationManager{
    constructor(manager, numFrames = 1000){
        this.manager = manager;
        this.isAnimating = false;
        this.numFrames = numFrames;
        this.currentFrame = 0;
        this.onStopCallback = null;
        this.animationLoop = this.animationLoop.bind(this);
    }
    start(startFrame = 0, onDraw = null){
        this.currentFrame = startFrame;
        this.isAnimating = true;
        this.onDraw = onDraw;
        window.requestAnimationFrame(this.animationLoop);
    }
    animationLoop(timestamp){
        if(this.isAnimating){
            this.manager.drawContours(this.currentFrame / this.numFrames);
            if(this.onDraw != null){
                this.onDraw(this.currentFrame);
            }
            this.currentFrame = (this.currentFrame + 1) % this.numFrames;
            window.requestAnimationFrame(this.animationLoop);
        }
        else{
            if(this.onStopCallback != null){
                this.onStopCallback();
            }
        }
    }
    stop(onStopCallback = null){
        if(this.isAnimating){
            this.isAnimating = false;
            this.onStopCallback = onStopCallback;
        }
        else{
            if(onStopCallback != null){
                onStopCallback();
            }
        }
    }
};

function init(){
    const manager = new ContourerManager();
    initRender(manager);
}
