# Contourer

[![Join the chat at https://gitter.im/krawthekrow/contourer](https://badges.gitter.im/krawthekrow/contourer.svg)](https://gitter.im/krawthekrow/contourer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="https://krawthekrow.github.io/contourer/electric_field_demo.png" alt="Electric field plot in Contour Grapher" width="400" />

See the demo [here](https://krawthekrow.github.io/contourer/)!

Contour graphing is an excellent way to visualise 2-input, 2-output functions.

What are 2-input, 2-output functions, you ask? Here are some examples:
- 2x2 matrices transform 2D vectors to 2D vectors. ([Lorentz Boost](https://en.wikipedia.org/wiki/Lorentz_transformation#Coordinate_transformation))
    - [This is how graphics programming works](https://open.gl/transformations).
    - Lorentz Boost shows, according to special relativity, the _spacetime warp_ an observer experiences when his velocity changes.
- Map projections transform lat-long coordinates to a point in 2D space. (Mercator Warp, [Mercator](https://en.wikipedia.org/wiki/Mercator_projection) to [Mollweide](https://en.wikipedia.org/wiki/Mollweide_projection))
    - In Mercator (the most popular world map projection) to Mollweide (an equal-area projection), we see graphically how [land area is distorted](http://www.progonos.com/furuti/MapProj/Dither/CartProp/AreaPres/areaPres.html) on world maps.
- 2D electric fields assign a 2D field vector to every point in 2D space. ([Dipole Formation](https://www.miniphysics.com/uy1-electric-dipole.html), Attraction to Repulsion)
    - The demo shows electric field lines in blue and equipotential lines in red.
    - This is made possible by the equivalence between the [multipole expansion](https://en.wikipedia.org/wiki/Multipole_expansion) and the [Laurent series](https://en.wikipedia.org/wiki/Laurent_series). Read [Visual Complex Analysis by Tristan Needham](https://www.amazon.com/Visual-Complex-Analysis-Tristan-Needham/dp/0198534469) to learn more.
- Neural networks with 2 input neurons and 2 output neurons map 2 real numbers to 2 real numbers. (Neural Network)
    - This is inspired by [colah's post on neural networks and manifolds](http://colah.github.io/posts/2014-03-NN-Manifolds-Topology/).
- 2D classical physics maps the initial position of a particle in 2D space to its final position in said space. (Galaxy Warp)
    - Galaxy Warp is inspired by the old theory of [differential rotation in galaxies](https://en.wikipedia.org/wiki/Density_wave_theory#Galactic_spiral_arms), which is _not_ how galaxy arms are formed.
- Procedural terrain generation may assign a small 2D deformation to each point in 2D space for more interesting terrain. (Simplex Warp)
    - Using [simplex noise (PDF)](http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf) (a better version of [Perlin noise](http://flafla2.github.io/2014/08/09/perlinnoise.html)) to warp terrain is described in [this GPUGems article](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch01.html) (under Sampling Tips, section 1.3.3).
- Complex functions transform a point on the complex plane (a complex number) to another point on the complex plane. (Everything else)
    - Observe that, for all complex function demos other than Complex Exponentiation, the mesh lines form square-like cells. This illustrates the [conformal (angle-preserving) geometry](https://en.wikipedia.org/wiki/Conformal_map) of [holomorphic (complex-differentiable) functions](https://en.wikipedia.org/wiki/Holomorphic_function). Once again, read [Visual Complex Analysis by Tristan Needham](https://www.amazon.com/Visual-Complex-Analysis-Tristan-Needham/dp/0198534469) to learn more.
    - For Complex Exponentiation, the plot is in polar coordinates rather than Cartesian coordinates to make the effect clearer. It shows how the plot of z<sup>n</sup> changes as n increases from 1 to 4. Intuitively, think of z<sup>n</sup> as r<sup>n</sup>e<sup>i n phi</sup>.

Contourer provides an easy way (well, provided you know GLSL) to plot any of these, _and more_!

Plotted something interesting that's not on the demo? Used my code in your own project? [I'd love to see it!](#contact-me)

Need help understanding the code? Think it can do with some refactoring? Have an awesome idea to share? [Let's talk!](#contact-me)

# How to Plot
**Important Note: If you want to see how a transformation warps the 2D space (like in computer graphics, or map projections), you need to plot the inverse of the function you're considering (see the examples in the demo). See [How it Works](#how-it-works) if you're curious why. Or just trust me on this.**

Plotting is done with the [OpenGL ES 1.0 shading language](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf). It's a C-like language for the GPU with native vector support.

The input coordinate is "cPos" (for current position) and the output coordinate is "res" (for result). For animations, the variable "time" is a uniform (global variable) that goes from 0 to 1 for each cycle.

Note that OpenGL ES does not implicitly cast ints to floats. You will need to write numbers like "23" as "23.0" to avoid compile errors.

OpenGL ES doesn't natively support complex numbers. The complex function examples do, however, provide a small complex number utility library that treats vec2s as complex numbers. You can access it under "Library Functions' on the demo page.

If you don't want to learn OpenGL ES, you can use the following snippet to transform it to effectively C code:

```glsl
float inX = cPos.x, inY = cPos.y, outX, outY;
// Your code here, eg:
// float r = sqrt(inX * inX + inY * inY);
// float phi = time * 20.0 * atan(inY, inX);
// outX = r;
// outY = phi;
res = vec2(outX, outY);
```

If you're still unsure about how to code plot functions, use the examples in the demo as reference.

# How it Works
You've probably heard of [contour plots](https://en.wikipedia.org/wiki/Contour_line) before, in the context of 2-input, 1-output functions like topographic maps. This is achieved by colouring in every point where the function takes on an integer value.

Contourer does precisely that, except for 2-input, 2-output functions. This is equivalent to contouring two separate 2-input, 1-output functions and overlaying one plot over the other. Unfortunately, overlaying contour plots is a very rare use case.

More commonly, we want to see how a 2-input, 2-output functions act on the two-dimensional plane. Amazingly, contour plots can help us with that.

To understand how, we'll first consider how we could visualise a function transforming an image. If our function were y = f(x), then the pixel at position x would be mapped to position y on the screen.

We _could_ position each image pixel on the screen in this manner, but it would be more efficient to do it backwards: for each screen pixel y, we use the inverse function to find the corresponding position x in the image, and sample the image there.

In Contourer's case, we want to draw an infinite grid, so there's no image to sample. Instead, the grid is dynamically generated with another shader program.

To generate a grid, we would ideally want to colour all points that correspond to an image position with an integral x- or y-coordinate. However, the image coordinates we sample would rarely attain exactly integer values. To get around this, we compare the coordinates at each pixel with that of neighbouring pixels, and see if an integer lies between any pair.

If this is confusing, here's a step-by-step example. Let's say we want to see the effects of the function y = 10 * (x - (1.05, 1.05)), which is a translation followed by a scaling. Inverting, we get:

```
res = cPos * 0.1 + vec2(1.05, 1.05);
```

Now consider the following nine points in screen space:

```
(9,  9) (10,  9) (11,  9)
(9, 10) (10, 10) (11, 10)
(9, 11) (10, 11) (11, 11)
```

Using the inverse function, these points correspond to the following points in "grid space":

```
(1.95, 1.95) (2.05, 1.95) (2.15, 1.95)
(1.95, 2.05) (2.05, 2.05) (2.15, 2.05)
(1.95, 2.15) (2.05, 2.15) (2.15, 2.15)
```

We colour a pixel if at least one of its neighbours has an x-coordinate less than its own x-coordinate, and there exists an integer somewhere in between. This leads us to colour the middle column: for each pixel in that column, the pixel on its left satisfies the condition. Doing the same for the y-coordinate, we colour the middle row.

Observe that this effectively results in two overlaid contour plots. Now if only there were an easy way to find inverses for at least some [spe](http://mathworld.wolfram.com/MatrixInverse.html)cial [cla](https://en.wikipedia.org/wiki/Lagrange_inversion_theorem)sses of [fun](https://en.wikipedia.org/wiki/T-symmetry)ctions...

# Technical Details

The graphing is GPU-accelerated with WebGL. I originally intended to use the floating point textures (OES\_texture\_float) extension, but this didn't work reliably on Chrome. In the end, I reverted to a float-packing technique.

Heavy inspiration was taken from the WebGL GPGPU libraries [gpu.js](https://github.com/gpujs/gpu.js) and [WebCLGL](https://github.com/stormcolor/webclgl), but ultimately I had to reimplement it to meet my specific needs.

The UI is implemented with [Bootstrap](http://getbootstrap.com/), [React](https://facebook.github.io/react/) and [ACE editor](https://ace.c9.io/).

# How to Build
Download the source, install build dependencies and start babel watch:

```
git clone https://github.com/krawthekrow/contourer/
cd contourer
npm install

# In another window
npm run babelWatch
```

Any modifications you make would immediately be seen in index-dev.html. Compile and minify the source to see changes in index.html:

```
gulp build
```

# Tests
Uhh... sorry? Did you say something? Oh whoops, I'm late for an appointment. Bye!

# License
Contourer is released under the MIT license.

# Contact Me

Drop me an [email](https://github.com/krawthekrow)!  
Chat me up on [Gitter](https://gitter.im/krawthekrow/contourer)!  
Or if you *really* have to, mention me on [Twitter](https://twitter.com/krawthekrow)...
