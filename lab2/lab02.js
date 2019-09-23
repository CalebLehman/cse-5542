// Author - Caleb Lehman (lehman.346)
// Date - TODO

var userHandler = (function() {
    // *** VARIABLES ***
    var mouseX;
    var mouseY;
    var currColor = null;
    var currShape = null;
    var globalToggle = false;

    // *** INITIALIZATION ***
    // Initialization function for user handler
    function init() {
        document.addEventListener(
            "keydown",
            userKeyDown,
            false
        );
        document.addEventListener(
            "mousedown",
            userMouseDown,
            false
        );
    }

    // *** HANDLERS ***
    // Process user key inputs
    function userKeyDown(event) {
        var shapeString =
            document.getElementById("nextShapeText").innerHTML;
        var colorString =
            document.getElementById("nextColorText").innerHTML;
        switch (event.keyCode) {
            // Shape keys
            case 80: // "p"
                shapeString = "Point";
                currShape = "p";
                break;
            case 72: // "h"
                shapeString = "Horizontal Line";
                currShape = "h";
                break;
            case 86: // "v"
                shapeString = "Vertical Line";
                currShape = "v";
                break;
            case 84: // "t"
                shapeString = "Triangle";
                currShape = "t";
                break;
            case 81: // "q"
                shapeString = "Square";
                currShape = "q";
                break;
            case 79: // "o"
                shapeString = "Circle";
                currShape = "o";
                break;

            // Color keys
            case 82: // "r"
                colorString = "Red";
                currColor = "r";
                graphics.colorCurr(currColor);
                break;
            case 66: // "b"
                colorString = "Blue";
                currColor = "b";
                graphics.colorCurr(currColor);
                break;
            case 71: // "g"
                colorString = "Green";
                currColor = "g";
                graphics.colorCurr(currColor);
                break;

            // Command keys
            case 83: // "s"
                if (globalToggle) {
                    if (event.shiftKey) {
                        graphics.scaleUpGlobal();
                    } else {
                        graphics.scaleDownGlobal();
                    }
                } else {
                    if (event.shiftKey) {
                        graphics.scaleUpCurr();
                    } else {
                        graphics.scaleDownCurr();
                    }
                }
                graphics.drawScene();
                break;
            case 87: // "w"
                if (event.shiftKey) {
                    globalToggle = true;
                    document.getElementById("globalToggleText").innerHTML = "On";
                } else {
                    globalToggle = false;
                    document.getElementById("globalToggleText").innerHTML = "Off";
                    graphics.bakeGlobals();
                }
                break;
            case 27: // "Esc"
                graphics.unselectCurrentShape();
                graphics.drawScene();
                break;

            // Misc. keys
            case 68: // "d"
                graphics.drawScene();
                break;
            case 67: // "c"
                mouseX = null;
                mouseY = null;
                currColor = null;
                currShape = null;
                shapeString = "No shape selected";
                colorString = "No color selected";
                globalToggle = false;

                graphics.clear();
                graphics.drawScene();
                break;
        }

        document.getElementById("nextShapeText").innerHTML =
            shapeString;
        document.getElementById("nextColorText").innerHTML =
            colorString;
    }

    // Update stored mouse coordinates with
    // coordinates of an event
    function updateMouse(event) {
        var canvas = document.getElementById("canvas")
        var canvasRect = canvas.getBoundingClientRect();
        mouseX = event.clientX - canvasRect.left;
        mouseY = event.clientY - canvasRect.top;

        if ((0 > mouseX) || (mouseX >= canvas.width)) {
            mouseX = null;
        }
        if ((0 > mouseY) || (mouseY >= canvas.height)) {
            mouseY = null;
        }
    }

    // Process a user mouse down input
    // in order to select or draw an object
    function userMouseDown(event) {
        document.addEventListener(
            "mouseup",
            userMouseUp,
            false
        );
        document.addEventListener(
            "mousemove",
            userMouseDrag,
            false
        );


        updateMouse(event);

        // Check if click was inside canvas
        if (   (mouseX    != null) && (mouseY    != null)
            && (currShape != null) && (currColor != null)
        ) {
            // Try to select object with click coordinates
            var hit = graphics.selectCurrentShape(mouseX, mouseY);

            // If no object was selected and aren't
            // currently in world/global mode, then
            // need to draw a new shape
            if ((!hit) && (!globalToggle)) {
                graphics.addShape(
                    currShape,
                    mouseX,
                    mouseY,
                    currColor
                );
            }
            graphics.drawScene();
        }
    }

    // Process a user mouse drag
    // in order to move or rotate
    // an object/world
    function userMouseDrag(event) {
        var canvas = document.getElementById("canvas");
        var canvasRect = canvas.getBoundingClientRect();

        if (event.ctrlKey) {
            // Translation
            if ((mouseX != null) && (mouseY != null)) {
                deltaX = (event.clientX - canvasRect.left) - mouseX;
                deltaY = (event.clientY - canvasRect.top ) - mouseY;
                if (globalToggle) {
                    graphics.transGlobal(deltaX, deltaY);
                } else {
                    graphics.transCurr(deltaX, deltaY);
                }
                graphics.drawScene();
            }
        } else {
            // Rotation
            if (mouseX != null) {
                deltaX = (event.clientX - canvasRect.left) - mouseX;
                if (globalToggle) {
                    graphics.rotateGlobal(
                        2 * Math.PI * deltaX / canvas.width
                    );
                } else {
                    graphics.rotateCurr(
                        2 * Math.PI * deltaX / canvas.width
                    );
                }
                graphics.drawScene();
            }
        }
        mouseX = event.clientX - canvasRect.left;
        mouseY = event.clientY - canvasRect.top;
    }

    function userMouseUp(event) {
        document.removeEventListener(
            "mouseup",
            userMouseUp,
            false
        );
        document.removeEventListener(
            "mousemove",
            userMouseDrag,
            false
        );
    }

    return {
        // *** PUBLIC ***
        init: init
    };
}());


// Class for storing shape data necessary for drawing
class Shape {
    constructor(type, trans, rot, scale, color) {
        this.type  = type;
        this.trans = trans;
        this.rot   = rot;
        this.scale = scale;
        this.color = color;
    }
}

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Current list of shapes to draw
    var shapes;
    var currentIndex;
    var globalRot;
    var globalScale;
    var clrColor;

    const scaleFactor = 1.5; // Factor scaling operations use


    // Buffers for each shape type
    const vertexBuffScale = 0.2;
    var pointVertexBuff;
    var lineVertexBuff;
    var triVertexBuff;
    var squareVertexBuff;
    var circleVertexBuff;

    // Buffers for each color to use
    const MAX_LENGTH = 32; // Upper bound on number of vertices any one shape can use
    var rBuff;
    var gBuff;
    var bBuff;
    var pBuff;

    // *** INITIALIZATION ***
    // Initialize WebGL context and set up shaders
    function init() {
        clear();

        // Set up context
        var canvas = document.getElementById("canvas");
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth  = canvas.width;
        gl.viewportHeight = canvas.height;

        // Set up shaders
        shaderProgram = setup_shaders.initShaders(gl);
        // Vertex position attribute
        shaderProgram.vertexPositionAttribute =
            gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(
            shaderProgram.vertexPositionAttribute
        );
        // Vertex color attribute
        shaderProgram.vertexColorAttribute =
            gl.getAttribLocation(shaderProgram, "color");
        gl.enableVertexAttribArray(
            shaderProgram.vertexColorAttribute
        );
        shaderProgram.transformMatrix =
            gl.getUniformLocation(shaderProgram, "transform");

        // Initialize shape buffers
        initPoint();
        initLine();
        initTri();
        initSquare();
        initCircle();

        // Initialize color buffers
        initColors();

        // Initial draw
        drawScene();
    }

    // Initialize the vertex buffers for the point object
    function initPoint() {
        pointVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexBuff);

        var vertices = new Float32Array([0.0, 0.0, 0.0]);
        vertices = vertices.map(function(val) { return val * vertexBuffScale; });
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        pointVertexBuff.itemSize = 3; // Three values per vertex
        pointVertexBuff.numItems = 1; // Single vertex
        pointVertexBuff.mode     = gl.POINTS;
    }

    // Initialize the vertex buffers for the line object
    function initLine() {
        lineVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBuff);

        var vertices = new Float32Array(
            [ 1.0, 0.0, 0.0
            ,-1.0, 0.0, 0.0 ]
        );
        vertices = vertices.map(function(val) { return val * vertexBuffScale; });
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        lineVertexBuff.itemSize = 3; // Three values per vertex
        lineVertexBuff.numItems = 2; // Two vertices
        lineVertexBuff.mode     = gl.LINES;
    }

    // Initialize the vertex buffers for the triangle object
    function initTri() {
        triVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triVertexBuff);

        var vertices = new Float32Array(
            [ 0.000, 1.000, 0.000
            ,-0.866,-0.500, 0.000
            , 0.866,-0.500, 0.000 ]
        );
        vertices = vertices.map(function(val) { return val * vertexBuffScale; });
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        triVertexBuff.itemSize = 3; // Three values per vertex
        triVertexBuff.numItems = 3; // Three vertices
        triVertexBuff.mode     = gl.TRIANGLES;
    }

    // Initialize the vertex buffers for the square object
    function initSquare() {
        squareVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuff);

        var vertices = new Float32Array(
            [-0.707,-0.707, 0.000
            , 0.707,-0.707, 0.000
            , 0.707, 0.707, 0.000
            ,-0.707, 0.707, 0.000 ]
        );
        vertices = vertices.map(function(val) { return val * vertexBuffScale; });
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        squareVertexBuff.itemSize = 3; // Three values per vertex
        squareVertexBuff.numItems = 4; // Four vertices
        squareVertexBuff.mode     = gl.TRIANGLE_FAN;
    }

    // Initialize the vertex buffers for the circle object
    function initCircle() {
        circleVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuff);

        var n = MAX_LENGTH - 2;
        var vertices = [0.0, 0.0, 0.0];
        for (var i = 0; i <= n; ++i) {
            vertices.push(
                Math.cos(2*i*Math.PI / n),
                Math.sin(2*i*Math.PI / n),
                0.0 
            );
        }
        vertices = vertices.map(function(val) { return val * vertexBuffScale; });
        vertices = new Float32Array(vertices);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        circleVertexBuff.itemSize = 3;          // Three values per vertex
        circleVertexBuff.numItems = MAX_LENGTH; // MAX_LENGTH vertices
        circleVertexBuff.mode     = gl.TRIANGLE_FAN;
    }

    // Initialize the buffers for the colors
    // red, green, blue, and purple
    function initColors() {
        var rVals = new Array(4 * MAX_LENGTH);
        var gVals = new Array(4 * MAX_LENGTH);
        var bVals = new Array(4 * MAX_LENGTH);
        var pVals = new Array(4 * MAX_LENGTH);
        for (var i = 0; i < MAX_LENGTH; ++i) {
            rVals[4*i + 0] = 1.0;
            rVals[4*i + 1] = 0.0;
            rVals[4*i + 2] = 0.0;
            rVals[4*i + 3] = 1.0;

            gVals[4*i + 0] = 0.0;
            gVals[4*i + 1] = 1.0;
            gVals[4*i + 2] = 0.0;
            gVals[4*i + 3] = 1.0;

            bVals[4*i + 0] = 0.0;
            bVals[4*i + 1] = 0.0;
            bVals[4*i + 2] = 1.0;
            bVals[4*i + 3] = 1.0;

            pVals[4*i + 0] = 1.0;
            pVals[4*i + 1] = 0.0;
            pVals[4*i + 2] = 1.0;
            pVals[4*i + 3] = 1.0;
        }
        rVals = new Float32Array(rVals);
        gVals = new Float32Array(gVals);
        bVals = new Float32Array(bVals);
        pVals = new Float32Array(pVals);

        rBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, rBuff);
        gl.bufferData(gl.ARRAY_BUFFER, rVals, gl.STATIC_DRAW);
        rBuff.itemSize = 4;

        gBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gBuff);
        gl.bufferData(gl.ARRAY_BUFFER, gVals, gl.STATIC_DRAW);
        gBuff.itemSize = 4;

        bBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bBuff);
        gl.bufferData(gl.ARRAY_BUFFER, bVals, gl.STATIC_DRAW);
        bBuff.itemSize = 4;

        pBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuff);
        gl.bufferData(gl.ARRAY_BUFFER, pVals, gl.STATIC_DRAW);
        pBuff.itemSize = 4;
    }

    // *** SELECTION METHODS ***
    function unselectCurrentShape() {
        currentIndex = null;
    }

    // Transforms NDC coordinates to local coordinates of
    // a shape using both the transformations applied to
    // the shape and the current global transformation
    function NDCToLocal(shape, x, y, globalTransform) {
        // Assuming transformations to the shape are
        // G(lobal) * T(ranslate) * R(otate) * S(cale)
        //
        // Compute T^(-1), R^(-1), S^(-1) manually (easy)
        // Have mat4 compute G^(-1)
        // Apply S^(-1) * R^(-1) * T^(-1) * G^(-1)
        //   to the NDC coordinates to get local coords

        var transform = mat4.create();
        mat4.scale(
            transform,
            transform,
            shape.scale.map(function (x) {
                return 1.0 / x;
            })
        );
        mat4.rotate(
            transform,
            transform,
            -1.0 * shape.rot,
            [0, 0, 1]
        );
        mat4.translate(
            transform,
            transform,
            shape.trans.map(function (x) {
                return -1.0 * x;
            })
        );
        var inverseMat = mat4.clone(globalTransform);
        mat4.invert(inverseMat, inverseMat);
        mat4.multiply(
            transform,
            transform,
            inverseMat
        );

        var vec = vec4.fromValues(x, y, 0, 1);
        vec4.transformMat4(vec, vec, transform);

        return { x: vec[0], y: vec[1] };
    }

    // Given viewport coordinates
    //   select the corresponding shape and return true
    //   or
    //   return false if coordinates correspond to no shape
    // Checks from most-recently-drawn to least-recently-drawn
    function selectCurrentShape(x, y) {
        // Convert x, y from viewport coordinates
        // to NDC coordinates
        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        var xNDC = -1 + 2*(x / width );
        var yNDC =  1 - 2*(y / height);

        var globalTransform = mat4.create();
        mat4.rotate(globalTransform, globalTransform, globalRot, [0, 0, 1]);
        mat4.scale( globalTransform, globalTransform, globalScale);

        for (var i = 0; i < shapes.length; ++i) {
            var shape = shapes[i];
            var localCoords = NDCToLocal(
                shape,
                xNDC,
                yNDC,
                globalTransform
            );
            var xLocal = localCoords.x;
            var yLocal = localCoords.y;

            var hit = false;
            switch (shape.type) {
                case "p": hit = collidePoint(shape, xLocal, yLocal);  break;
                case "h": hit = collideLine(shape, xLocal, yLocal);   break;
                case "t": hit = collideTri(shape, xLocal, yLocal);    break;
                case "q": hit = collideSquare(shape, xLocal, yLocal); break;
                case "o": hit = collideCircle(shape, xLocal, yLocal); break;
            }
            if (hit) {
                currentIndex = i;
                return true;
            }
        }
        return false;
    }

    // Check if (local) coordinates collide with point
    function collidePoint(shape, x, y) {
        const tolerance = 0.02; 
        return (x <  tolerance * vertexBuffScale)
            && (x > -tolerance * vertexBuffScale)
            && (y <  tolerance * vertexBuffScale)
            && (y > -tolerance * vertexBuffScale);
    }

    // Check if (local) coordinates collide with line
    function collideLine(shape, x, y) {
        const tolerance = 0.02; 
        return (x <  1.0 *       vertexBuffScale)
            && (x > -1.0 *       vertexBuffScale)
            && (y <  tolerance * vertexBuffScale)
            && (y > -tolerance * vertexBuffScale);
    }

    // Check if (local) coordinates collide with triangle
    function collideTri(shape, x, y) {
        return (y > -0.5           * vertexBuffScale)
            && (y <  1.732 * x + 1 * vertexBuffScale)
            && (y < -1.732 * x + 1 * vertexBuffScale);
    }

    // Check if (local) coordinates collide with square
    function collideSquare(shape, x, y) {
        return (x <  0.707 * vertexBuffScale)
            && (x > -0.707 * vertexBuffScale)
            && (y <  0.707 * vertexBuffScale)
            && (y > -0.707 * vertexBuffScale);
    }

    // Check if (local) coordinates collide with circle
    function collideCircle(shape, x, y) {
        return (x*x + y*y) < vertexBuffScale * vertexBuffScale;
    }

    // *** TRANSFORMATION METHODS
    function scaleUpCurr() {
        if (currentIndex != null) {
            var currentShape = shapes[currentIndex];
            currentShape.scale[0] *= scaleFactor;
            currentShape.scale[1] *= scaleFactor;
            currentShape.scale[2] *= scaleFactor;
        }
    }

    function scaleDownCurr() {
        if (currentIndex != null) {
            var currentShape = shapes[currentIndex];
            currentShape.scale[0] /= scaleFactor;
            currentShape.scale[1] /= scaleFactor;
            currentShape.scale[2] /= scaleFactor;
        }
    }

    function scaleUpGlobal() {
        globalScale[0] *= scaleFactor;
        globalScale[1] *= scaleFactor;
        globalScale[2] *= scaleFactor;
    }

    function scaleDownGlobal() {
        globalScale[0] /= scaleFactor;
        globalScale[1] /= scaleFactor;
        globalScale[2] /= scaleFactor;
    }

    function rotateCurr(rot) {
        if (currentIndex != null) {
            var currentShape = shapes[currentIndex];
            currentShape.rot += rot;
        }
    }

    function rotateGlobal(rot) {
        globalRot += rot;
    }

    function transCurr(x, y) {
        if (currentIndex != null) {
            var width  = gl.viewportWidth;
            var height = gl.viewportHeight;
            var currentShape = shapes[currentIndex];
            currentShape.trans[0] +=  2*(x / width );
            currentShape.trans[1] += -2*(y / height);
        }
    }

    function transGlobal(x, y) {
        // Note: implemented by translating
        // each object, to prevent having
        // to deal with translating global origin,
        // which would make global rotation/scaling
        // behave differently than desired

        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        xNDC =  2*(x / width );
        yNDC = -2*(y / height);
        shapes.forEach(function (shape) {
            // Translation passed to function
            // is w.r.t. being applied after
            // global scaling/rotation, since this
            // is what user sees.
            // Need to "pass" this translation
            // through the global scaling/rotation
            //
            // T*R*S -> R*S*(S^(-1)*R^(-1)*T*R*S)
            //              |-------------------|
            //                        ||
            //               desired translation

            var translate = mat4.create();
            mat4.scale(
                translate,
                translate,
                globalScale.map(function (x) { return 1.0 / x; })
            );
            mat4.rotate(
                translate,
                translate,
                -1.0 * globalRot,
                [0, 0, 1]
            )
            mat4.translate(translate, translate, [xNDC, yNDC, 0.0]);
            mat4.rotate(
                translate,
                translate,
                globalRot,
                [0, 0, 1]
            );
            mat4.scale(
                translate,
                translate,
                globalScale
            );

            // Couldn't get the getTranslation() method from glMatrix
            // working, so have to extract the translation components
            // of the matrix directly like this
            shape.trans[0] += translate[12];
            shape.trans[1] += translate[13];
        });
    }

    // Incorporate global transformation into
    // each of the shape's local transformations,
    // then reset global transformation to identity
    function bakeGlobals() {
        shapes.forEach(function (shape) {
            // Have to "pass" the global rotation
            // through the local translation
            // R*S*T -> (R*S*T*S^(-1)*R^(-1))*R*S
            //          |-------------------|
            //                    ||
            //           desired translation
            //
            // Rotation and scaling commute, so don't
            // have to worry about them

            var translate = mat4.create();
            mat4.rotate(
                translate,
                translate,
                globalRot,
                [0, 0, 1]
            );
            mat4.scale(
                translate,
                translate,
                globalScale
            );
            mat4.translate(translate, translate, shape.trans);
            mat4.scale(
                translate,
                translate,
                globalScale.map(function (x) { return 1.0 / x; })
            );
            mat4.rotate(
                translate,
                translate,
                -1.0 * globalRot,
                [0, 0, 1]
            )

            shape.rot += globalRot;
            shape.scale[0] *= globalScale[0];
            shape.scale[1] *= globalScale[1];
            shape.scale[2] *= globalScale[2];
            // Couldn't get the getTranslation() method from glMatrix
            // working, so have to extract the translation components
            // of the matrix directly like this
            shape.trans = translate.slice(12, 15);
        });

        // Reset global transformation to identity
        globalRot   = 0.0;
        globalScale = [1, 1, 1];
    }

    // Change the color of the current object
    function colorCurr(color) {
        if (currentIndex != null) {
            var currentShape = shapes[currentIndex];
            currentShape.color = color;
        }
    }

    // x, y passed in viewport coordinates
    function addShape(type, x, y, color) {
        // Convert x, y from viewport coordinates
        // to NDC coordinates
        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        var xNDC = -1 + 2*(x / width );
        var yNDC =  1 - 2*(y / height);

        // Switch on type and update shapes
        // Vertical line needs additional
        // processing to "model" as a rotated
        // horizontal line
        if (type != "v") {
            shapes.push(
                new Shape(
                    type,            // Type of shape
                    [xNDC, yNDC, 0], // Translation
                    0.00,            // Rotation
                    [1, 1, 1],       // Scale
                    color            // Color
                )
            );
        } else {
            shapes.push(
                new Shape(
                    "h",             // Type of shape
                                     //   "h" denotes line,
                                     //   rotation will make
                                     //   vertical later
                    [xNDC, yNDC, 0], // Translation
                    Math.PI / 2,     // Rotation
                    [1, 1, 1],       // Scale
                    color            // Color
                )
            );
        }

        // New shape is automatically set as selected shape
        currentIndex = shapes.length - 1;
    }

    // Draws a single shape
    function drawShape(shape, globalTransform) {
        // Bind vertices
        var vertexBuff;
        switch (shape.type) {
            case "p": vertexBuff = pointVertexBuff;  break;
            case "h": vertexBuff = lineVertexBuff;   break;
            case "t": vertexBuff = triVertexBuff;    break;
            case "q": vertexBuff = squareVertexBuff; break;
            case "o": vertexBuff = circleVertexBuff; break;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexPositionAttribute,
            vertexBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Bind colors
        var colorBuff;
        switch (shape.color) {
            case "r": colorBuff = rBuff; break;
            case "g": colorBuff = gBuff; break;
            case "b": colorBuff = bBuff; break;
            case "p": colorBuff = pBuff; break;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexColorAttribute,
            colorBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Bind transformation
        var transform = mat4.clone(globalTransform);
        mat4.translate(transform, transform, shape.trans);
        mat4.rotate   (transform, transform, shape.rot, [0, 0, 1]);
        mat4.scale    (transform, transform, shape.scale);
        gl.uniformMatrix4fv(
            shaderProgram.transformMatrix,
            false,
            transform
        );

        // Draw
        gl.drawArrays(vertexBuff.mode, 0, vertexBuff.numItems);
    }

    // Uses current information to draw scene
    function drawScene() {
        // Clear screen
        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        gl.viewport(0, 0, width, height);
        gl.clearColor(
            clrColor[0],
            clrColor[1],
            clrColor[2],
            clrColor[3]
        );
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw shapes
        var globalTransform = mat4.create();
        mat4.rotate(globalTransform, globalTransform, globalRot, [0, 0, 1]);
        mat4.scale( globalTransform, globalTransform, globalScale);
        shapes.forEach(function (shape) { drawShape(shape, globalTransform); });
        // Redraw current shape with purple color
        if (currentIndex != null) {
            var shape = shapes[currentIndex]
            var color = shape.color;
            shape.color = "p";
            drawShape(shape, globalTransform);
            shape.color = color;
        }
    }

    // Clear all graphics data
    function clear() {
        shapes      = [];
        globalRot   = 0.0;
        globalScale = [1, 1, 1];
        currentIndex = null;
        clrColor = [1, 1, 1, 1];
    }

    // Choose different background color
    function setBackground(r, g, b, alpha) {
        clrColor = [r, g, b, alpha];
    }

    return {
        init: init,

        selectCurrentShape: selectCurrentShape,
        unselectCurrentShape: unselectCurrentShape,

        scaleUpCurr: scaleUpCurr,
        scaleDownCurr: scaleDownCurr,
        scaleUpGlobal: scaleUpGlobal,
        scaleDownGlobal: scaleDownGlobal,
        rotateCurr: rotateCurr,
        rotateGlobal: rotateGlobal,
        transCurr: transCurr,
        transGlobal: transGlobal,
        bakeGlobals: bakeGlobals,
        colorCurr: colorCurr,

        addShape: addShape,
        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,
    };
}());
