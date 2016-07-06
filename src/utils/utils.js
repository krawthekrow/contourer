'use strict';

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    static fromPolar(r, phi){
        return new Vector(
            r * Math.cos(phi),
            r * Math.sin(phi)
        );
    }
    add(oVec){
        return new Vector(
            this.x + oVec.x,
            this.y + oVec.y
        );
    }
    subtract(oVec){
        return new Vector(
            this.x - oVec.x,
            this.y - oVec.y
        );
    }
    multiply(scale){
        return new Vector(
            this.x * scale,
            this.y * scale
        );
    }
    divide(scale){
        return new Vector(
            this.x / scale,
            this.y / scale
        );
    }
    equals(oVec){
        return (
            this.x == oVec.x &&
            this.y == oVec.y
        );
    }
    floor(){
        return new Vector(
            Math.floor(this.x),
            Math.floor(this.y)
        );
    }
    dot(oVec){
        return this.x * oVec.x + this.y * oVec.y;
    }
    getLength(){
        return Math.sqrt(this.dot(this));
    }
    getAngle(){
        return Math.atan2(this.y, this.x);
    }
    toArray(){
        return [this.x, this.y];
    }
};

class Dimensions{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
    contains(pos){
        return isPointInRect(pos,
            new Rect(
                new Vector(0, 0),
                this
            )
        );
    }
    getArea(){
        return this.width * this.height;
    }
    toArray(){
        return [this.width, this.height];
    }
};

class Color{
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }
    toArray(){
        return [this.r, this.g, this.b];
    }
};

class Rect{
    constructor(pos, dims){
        this.pos = pos;
        this.dims = dims;
    }
    get x(){
        return this.pos.x;
    }
    get y(){
        return this.pos.y;
    }
    get width(){
        return this.dims.width;
    }
    get height(){
        return this.dims.height;
    }
    get left(){
        return this.pos.x;
    }
    get right(){
        return this.pos.x + this.dims.width;
    }
    get top(){
        return this.pos.y;
    }
    get bottom(){
        return this.pos.y + this.dims.height;
    }
};

function isPointInRect(p, rect){
    return p.x >= rect.left && p.x < rect.right &&
           p.y >= rect.top && p.y < rect.bottom;
}

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const MOUSE_MIDDLE = 1;

function compute1DArray(length, func){
    return new Array(length).fill(undefined).map(
        (unused, i) => func(i)
    );
}

function compute2DArray(dims, func){
    return compute1DArray(dims.height,
        i => compute1DArray(dims.width,
            i2 => func(new Vector(i2, i))
        )
    );
}

const DIRS4 = [
    new Vector(1, 0),
    new Vector(0, 1),
    new Vector(-1, 0),
    new Vector(0, -1)
];

function flatten(arr){
    return [].concat(...arr);
}

class ScalableViewportManager{
    constructor(pos = new Vector(0, 0), scale = 1.0){
        this.pos = pos;
        this.scale = scale;
    }
    viewportToWorld(vec){
        return vec.multiply(this.scale).add(this.pos);
    }
    worldToViewport(vec){
        return vec.subtract(this.pos).divide(this.scale);
    }
    translate(vec){
        this.pos = this.pos.subtract(vec.multiply(this.scale));
    }
    scaleAtPoint(scaleAmount, scalePoint){
        const newScale = this.scale * Math.exp(scaleAmount);
        const newPos = this.pos.add(scalePoint.multiply(this.scale - newScale));
        this.scale = newScale;
        this.pos = newPos;
    }
};
