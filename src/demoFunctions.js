'use strict';

class DemoFunctions{
};

DemoFunctions.INCLUDES = {
    pi:
`const float PI = 3.1415926535897932384626433832795;

`,
    complexLib:
`vec2 complexMult(vec2 a, vec2 b){
    return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
}

vec2 complexDiv(vec2 a, vec2 b){
    float divisor = dot(b, b);
    return vec2(dot(a, b), a.y * b.x - a.x * b.y) / divisor;
}

vec2 complexPow(vec2 a, vec2 b){
    float r = length(a), phi = atan(a.y, a.x);
    float newR = pow(r, b.x) * exp(-b.y * phi);
    float newPhi = b.y * log(r) + b.x * phi;
    return newR * vec2(cos(newPhi), sin(newPhi));
}

vec2 complexExp(vec2 b){
    return exp(b.x) * vec2(cos(b.y), sin(b.y));
}

vec2 complexLog(vec2 x){
    return vec2(log(length(x)), atan(x.y, x.x));
}

`,
    gamma:
`/**
 * Translated to OpenGL ES from math.js
 * https://github.com/josdejong/mathjs
 *
 * Math.js is an extensive math library for JavaScript and Node.js,
 * It features real and complex numbers, units, matrices, a large set of
 * mathematical functions, and a flexible expression parser.
 *
 * @version 3.2.1
 * @date    2016-04-26
 *
 * @license
 * Copyright (C) 2013-2016 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

vec2 gammaStep(vec2 x, int i, vec2 n, float p){
    float real = n.x + float(i);
    float den = real * real + n.y * n.y;
    if(den != 0.0){
        return x + vec2(p * real / den, -(p * n.y) / den);
    }
    else return vec2(0.0);
}

vec2 gamma(vec2 n){
    n.x -= 1.0;
    vec2 x = vec2(0.99999999999999709182, 0.0);
	x = gammaStep(x, 1, n, 57.156235665862923517);
	x = gammaStep(x, 2, n, -59.597960355475491248);
	x = gammaStep(x, 3, n, 14.136097974741747174);
	x = gammaStep(x, 4, n, -0.49191381609762019978);
	x = gammaStep(x, 5, n, 0.33994649984811888699e-4);
	x = gammaStep(x, 6, n, 0.46523628927048575665e-4);
	x = gammaStep(x, 7, n, -0.98374475304879564677e-4);
	x = gammaStep(x, 8, n, 0.15808870322491248884e-3);
	x = gammaStep(x, 9, n, -0.21026444172410488319e-3);
	x = gammaStep(x, 10, n, 0.21743961811521264320e-3);
	x = gammaStep(x, 11, n, -0.16431810653676389022e-3);
	x = gammaStep(x, 12, n, 0.84418223983852743293e-4);
	x = gammaStep(x, 13, n, -0.26190838401581408670e-4);
	x = gammaStep(x, 14, n, 0.36899182659531622704e-5);
    vec2 t = vec2(n.x + 4.7421875 + 0.5, n.y);
    float twoPiSqrt = sqrt(2.0 * PI);

    n.x += 0.5;
    vec2 result = complexPow(t, n);
    result *= twoPiSqrt;
    float r = exp(-t.x);
    t = r * vec2(cos(-t.y), sin(-t.y));

    return complexMult(complexMult(result, t), x);
}

`,
    rotateWithTime:
`vec2 rotateWithTime(vec2 v){
    float cosT = cos(time * 2.0 * PI), sinT = sin(time * 2.0 * PI);
    return vec2(
        v.x * cosT - v.y * sinT,
        v.x * sinT + v.y * cosT
    );
}

`,
    snoise:
`//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
  }
						
// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

`
};

DemoFunctions.functions = {
    lorentz: {
        displayName: 'Lorentz Boost',
        isAnimated: true,
        numFrames: 200,
        includeSrc: DemoFunctions.INCLUDES.pi,
        drawFunc:
`float beta = sin(time * 2.0 * PI) * 0.9;
float gamma = 1.0 / sqrt(1.0 - beta * beta);
res = gamma * vec2(
    cPos.x * 1.0 + cPos.y * beta,
    cPos.y * 1.0 + cPos.x * beta
);

`
    },
//    rotation: {
//        displayName: 'Rotation',
//        isAnimated: true,
//        numFrames: 800,
//        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.rotateWithTime,
//        drawFunc:
//`res = rotateWithTime(cPos);
//`
//    },
    mercatorwarp: {
        displayName: 'Mercator Warp',
        isAnimated: true,
        numFrames: 800,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib + DemoFunctions.INCLUDES.rotateWithTime,
        drawFunc:
`vec2 scaledPos = cPos * 0.6;
vec2 invMercator = vec2(scaledPos.x, 2.0 * atan(exp(scaledPos.y)) - 0.5 * PI) * 8.0;
res = rotateWithTime(invMercator);
`
    },
    mercatorMollweide: {
        displayName: 'Mercator to Mollweide',
        isAnimated: true,
        numFrames: 100,
        includeSrc: DemoFunctions.INCLUDES.pi,
        drawFunc:
`vec2 scaledPos = cPos * 0.3;
float theta = asin(scaledPos.y * 2.0 / PI);
vec2 invMollweide = vec2(
    scaledPos.x / cos(theta),
    asin((2.0 * theta + sin(2.0 * theta)) / PI)
);
vec2 invMercator = vec2(scaledPos.x, 2.0 * atan(exp(scaledPos.y)) - 0.5 * PI);
float mixParam = - cos(time * 2.0 * PI) / 2.0 + 0.5;
res = (invMollweide * mixParam + invMercator * (1.0 - mixParam)) * 8.0;
`
    },
    dipole: {
        displayName: 'Dipole Formation',
        isAnimated: true,
        numFrames: 300,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib,
        drawFunc:
`float dist = sin(time * 2.0 * PI + PI / 2.0) * 2.0 + 2.5;
res = 50.0 / (2.0 * dist) * (
    complexLog(cPos - vec2(dist, 0.0)) -
    complexLog(cPos - vec2(-dist, 0.0))
);
`
    },
    attractRepel: {
        displayName: 'Attraction to Repulsion',
        isAnimated: true,
        numFrames: 1000,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib,
        drawFunc: 
`res = 10.0 * (
    complexLog(cPos - vec2(1.0, 0.0)) +
    sin(time * 2.0 * PI - PI / 2.0) * complexLog(cPos - vec2(-1.0, 0.0))
);
`
    },
    neuralnetwork: {
        displayName: 'Neural Network',
        isAnimated: true,
        numFrames: 200,
        includeSrc: DemoFunctions.INCLUDES.pi,
        drawFunc: 
`float mixParam = -cos(time * 2.0 * PI) / 2.0 + 0.5;
vec2 unsigmoid = -log(1.0 / ((cPos + vec2(3.3, 3.0)) / 6.3) - 1.0);
res = (vec2(
    unsigmoid.x * 2.0 + unsigmoid.y * 1.0,
    unsigmoid.x * 2.0 + unsigmoid.y * 3.0
) - vec2(1.0, -2.0)) * mixParam + cPos * (1.0 - mixParam);
`
    },
    galaxy: {
        displayName: 'Galaxy Warp',
        isAnimated: true,
        numFrames: 200,
        includeSrc: DemoFunctions.INCLUDES.pi,
        drawFunc: 
`float mixParam = -cos(time * 2.0 * PI) / 2.0 + 0.5;
vec2 polPos = vec2(length(cPos), atan(cPos.y, cPos.x));
polPos = vec2(polPos.x, polPos.y - mixParam / 50.0 * sqrt(1.0 / pow(polPos.x / 40.0, 3.0)));
res = vec2(polPos.x * cos(polPos.y), polPos.x * sin(polPos.y));
`
    },
    simplex: {
        displayName: 'Simplex Warp',
        isAnimated: true,
        numFrames: 1000,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.snoise,
        drawFunc: 
`vec2 circleVary = 2.0 * vec2(
    cos(time * 2.0 * PI),
    sin(time * 2.0 * PI)
);
res = 2.0 * (cPos +
0.5 * vec2(
    snoise(vec4(cPos * 0.25, circleVary + vec2(100.0, 100.0))),
    snoise(vec4(cPos * 0.25, circleVary + vec2(200.0, 200.0)))
));
`
    },
    exponentiation: {
        displayName: 'Complex Exponentiation',
        isAnimated: true,
        numFrames: 300,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib,
        drawFunc: 
`vec2 cartRes = 10.0 * complexPow(cPos, vec2(1.0 / (2.5 - 1.5 * cos(time * 2.0 * PI)), 0.0));
res = vec2(length(cartRes), 10.0 * atan(cartRes.y, cartRes.x));
`
    },
    mobius: {
        displayName: 'Mobius Transformation',
        isAnimated: true,
        numFrames: 1000,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib + DemoFunctions.INCLUDES.rotateWithTime,
        drawFunc:
`res = rotateWithTime(10.0 * complexDiv(
    complexMult(vec2(0.5, 3.0), cPos) + vec2(0.5, 1.5),
    complexMult(vec2(4.0, 1.5), cPos) + vec2(2.0, 3.5)
));
`
    },
//    log: {
//        displayName: 'Complex Logarithm',
//        isAnimated: true,
//        numFrames: 1000,
//        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib + DemoFunctions.INCLUDES.rotateWithTime,
//        drawFunc: 
//`res = rotateWithTime(10.0 * complexLog(cPos));
//`
//    },
//    sin: {
//        displayName: 'Complex Sine',
//        isAnimated: true,
//        numFrames: 300,
//        includeSrc: DemoFunctions.INCLUDES.complexLib + DemoFunctions.INCLUDES.rotateWithTime,
//        drawFunc: 
//`vec2 exponent = vec2(-cPos.y, cPos.x);
//res = rotateWithTime(complexDiv(
//    complexExp(exponent) - complexExp(-exponent),
//    vec2(0.0, 2.0)
//));
//`
//    },
    arcsin: {
        displayName: 'Complex Inverse Sine',
        isAnimated: true,
        numFrames: 200,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib,
        drawFunc: 
`vec2 invSin = - 10.0 * complexMult(complexLog(complexPow(vec2(1.0, 0.0) - complexPow(cPos, vec2(2.0, 0.0)), vec2(0.5, 0.0)) + complexMult(cPos, vec2(0.0, 1.0))), vec2(0.0, 1.0));
float mixParam = - cos(time * 2.0 * PI) / 2.0 + 0.5;
res = invSin * mixParam + cPos * (1.0 - mixParam);
`
    },
    gamma: {
        displayName: 'Gamma Function',
        isAnimated: true,
        numFrames: 400,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib + DemoFunctions.INCLUDES.gamma + DemoFunctions.INCLUDES.rotateWithTime,
        drawFunc:
`res = rotateWithTime(10.0 * gamma((cPos + vec2(2.0, 0.0)) / 2.0));
`
    },
    madness: {
        displayName: 'Complex ???',
        isAnimated: true,
        numFrames: 800,
        includeSrc: DemoFunctions.INCLUDES.pi + DemoFunctions.INCLUDES.complexLib,
        drawFunc: 
`vec2 madness = - 10.0 * complexMult(complexLog(complexPow(vec2(2.0, 3.0) - complexPow(cPos * 2.0, vec2(2.0, 1.0)), vec2(0.5, 1.0)) + complexMult(cPos * 2.0, vec2(2.0, 1.0))), vec2(2.0, 1.0));
float mixParam = - cos(time * 2.0 * PI) / 2.0 + 0.5;
res = madness * mixParam + cPos * (1.0 - mixParam);
`
    },
};
