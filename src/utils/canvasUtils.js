'use strict';

function getCanvasMousePos(canvas, ev){
    const boundingRect = canvas.getBoundingClientRect();
    return new Vector(
        (ev.clientX - boundingRect.left) * (canvas.width / boundingRect.width),
        (ev.clientY - boundingRect.top) * (canvas.height / boundingRect.height)
    );
}

function getScrollDir(ev){
    if(ev.deltaY == 0) return 0;
    else return ev.deltaY / Math.abs(ev.deltaY);
}

class MouseDownTracker{
    constructor(canvas, initTrackCallback, trackCallback, isTrackingEnabled = ev => true){
        this.initTrackCallback = initTrackCallback;
        this.trackCallback = trackCallback;
        this.isTrackingEnabled = isTrackingEnabled;
        this.canvas = canvas;

        this.onMouseDown = ev => {
            if(this.isTrackingEnabled(ev)){
                this.initTrackCallback(ev);
                window.addEventListener('mousemove', this.onMouseMove);
                window.addEventListener('mouseup', this.onMouseUp);
                this.canvas.removeEventListener('mousedown', this.onMouseDown);
                ev.preventDefault();
            }
        };
        this.onMouseUp = ev => {
            this.trackCallback(ev);
            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
            this.canvas.addEventListener('mousedown', this.onMouseDown);
        };
        this.onMouseMove = ev => {
            this.trackCallback(ev);
        };

        this.canvas.addEventListener('mousedown', this.onMouseDown);
    }
};

class DragManager extends MouseDownTracker{
    constructor(canvas, dragCallback, isDragEnabled = ev => true){
        super(canvas,
            ev => {
                this.prevMousePos = getCanvasMousePos(this.canvas, ev);
            },
            ev => {
                const mousePos = getCanvasMousePos(this.canvas, ev);
                dragCallback(mousePos.subtract(this.prevMousePos));
                this.prevMousePos = mousePos;
            },
            isDragEnabled);
        this.prevMousePos = new Vector(0, 0);
    }
};

function setCanvasSmoothing(ctx, enable){
    ctx.imageSmoothingEnabled = enable;
    ctx.mozImageSmoothingEnabled = enable;
    ctx.webkitImageSmoothingEnabled = enable;
    ctx.mnImageSmoothingEnabled = enable;
}

function createCanvas(container, boundingRect){
    const canvas = document.createElement('canvas');
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;
    canvas.style.position = 'absolute';
    canvas.style.left = boundingRect.left.toString() + 'px';
    canvas.style.top = boundingRect.top.toString() + 'px';
    container.appendChild(canvas);
    return canvas.getContext('2d');
}

function getCanvasDims(ctx){
    return new Dimensions(ctx.canvas.width, ctx.canvas.height);
}
