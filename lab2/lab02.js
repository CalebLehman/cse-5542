// Author - Caleb Lehman (lehman.346)
// Date - TODO

var userHandler = (function() {
        var mouseX;
        var mouseY;
        var currColor = null;
        var currShape = null;
        var globalToggle = false;

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
                    break;
                case 66: // "b"
                    colorString = "Blue";
                    currColor = "b";
                    break;
                case 71: // "g"
                    colorString = "Green";
                    currColor = "g";
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

        // Update stored mouse coordinates to match NDC
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

            if (!globalToggle) {
                if (   (mouseX    != null)
                    && (mouseY    != null)
                    && (currShape != null)
                    && (currColor != null)
                ) {
                    var hit = graphics.selectCurrentShape(mouseX, mouseY);
                    if (!hit) {
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
        }

        function userMouseDrag(event) {
            var canvas = document.getElementById("canvas");
            var canvasRect = canvas.getBoundingClientRect();
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
            mouseX = event.clientX - canvasRect.left;
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


class Shape {
    constructor(type, trans, rot, scale, color) {
        this.type  = type;
        this.trans = trans;
        this.rot   = rot;
        this.scale = scale;
        this.color = color;
        this.mat   = mat4.create();
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
        squareVertexBuff.numItems = 4; // Three vertices
        squareVertexBuff.mode     = gl.TRIANGLE_FAN;
    }

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

    // TODO name
    // x, y passed in Canvas coordinates
    function addShape(type, x, y, color) {
        // Convert x, y from canvas / pixel coordinates
        // to NDC coordinates
        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        var xNDC = -1 + 2*(x / width );
        var yNDC =  1 - 2*(y / height);

        // Switch on type and update shapes
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
                                     //   rotation makes vertical
                    [xNDC, yNDC, 0], // Translation
                    Math.PI / 2,     // Rotation
                    [1, 1, 1],       // Scale
                    color            // Color
                )
            );
        }

        currentIndex = shapes.length - 1;
    }

    function unselectCurrentShape() {
        currentIndex = null;
    }

    function NDCToLocal(shape, x, y, globalTransform) {
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
        mat4.multiply(
            inverseMat,
            inverseMat,
            shape.mat
        );
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

    function selectCurrentShape(x, y) {
        // Convert x, y from canvas / pixel coordinates
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

    function collidePoint(shape, x, y) {
        const tolerance = 0.02; 
        return (x <  tolerance * vertexBuffScale)
            && (x > -tolerance * vertexBuffScale)
            && (y <  tolerance * vertexBuffScale)
            && (y > -tolerance * vertexBuffScale);
    }

    function collideLine(shape, x, y) {
        const tolerance = 0.02; 
        return (x <  1.0 *       vertexBuffScale)
            && (x > -1.0 *       vertexBuffScale)
            && (y <  tolerance * vertexBuffScale)
            && (y > -tolerance * vertexBuffScale);
    }

    function collideTri(shape, x, y) {
        return (y > -0.5           * vertexBuffScale)
            && (y <  1.732 * x + 1 * vertexBuffScale)
            && (y < -1.732 * x + 1 * vertexBuffScale);
    }

    function collideSquare(shape, x, y) {
        return (x <  0.707 * vertexBuffScale)
            && (x > -0.707 * vertexBuffScale)
            && (y <  0.707 * vertexBuffScale)
            && (y > -0.707 * vertexBuffScale);
    }

    function collideCircle(shape, x, y) {
        return (x*x + y*y) < vertexBuffScale * vertexBuffScale;
    }

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

    function bakeGlobals() {
        var globalTransform = mat4.create();
        mat4.rotate(globalTransform, globalTransform, globalRot, [0, 0, 1]);
        mat4.scale( globalTransform, globalTransform, globalScale);
        shapes.forEach(function (shape) {
            mat4.multiply(shape.mat, globalTransform, shape.mat);
        });
        globalRot   = 0.0;
        globalScale = [1, 1, 1];
    }

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
        mat4.multiply (transform, transform, shape.mat);
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

        addShape: addShape,
        selectCurrentShape: selectCurrentShape,
        unselectCurrentShape: unselectCurrentShape,

        scaleUpCurr: scaleUpCurr,
        scaleDownCurr: scaleDownCurr,
        scaleUpGlobal: scaleUpGlobal,
        scaleDownGlobal: scaleDownGlobal,
        rotateCurr: rotateCurr,
        rotateGlobal: rotateGlobal,
        bakeGlobals: bakeGlobals,

        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,
    };
}());
