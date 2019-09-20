// Author - Caleb Lehman (lehman.346)
// Date - TODO

var userHandler = (function() {
        var mouseX;
        var mouseY;
        var currColor = null;
        var currShape = null;

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
                document.getElementById("currShapeText").innerHTML;
            var colorString =
                document.getElementById("currColorText").innerHTML;
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
                // TODO
                case 83: // "s"
                    if (event.shiftKey) {
                        graphics.scaleUpCurr();
                    } else {
                        graphics.scaleDownCurr();
                    }
                    graphics.drawScene();
                    break;

                // Misc. keys
                case 68: // "d"
                    graphics.drawScene();
                    break;
                case 67: // "c"
                    clearUserData();
                    graphics.drawScene();
                    break;
            }

            document.getElementById("currShapeText").innerHTML =
                shapeString;
            document.getElementById("currColorText").innerHTML =
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
            if ((mouseX != null) && (mouseY != null)) {
                graphics.addShape(
                    currShape,
                    mouseX,
                    mouseY,
                    currColor
                );
                graphics.drawScene();
            }
        }

        function userMouseDrag(event) {
            if (mouseX != null) {
                var canvas = document.getElementById("canvas");
                deltaX = event.clientX - mouseX;
                graphics.rotateCurr(2 * Math.PI * deltaX / canvas.width);
                graphics.drawScene();
            }
            mouseX = event.clientX;
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

        // Reset all user data and associated graphics
        function clearUserData() {
            // Tell graphics object to clear itself
            graphics.clear();
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
    }
}

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Current list of shapes to draw
    var shapes = [];

    var globalRot   = 0.0;
    var globalScale = [1, 1, 1];
    const scaleFactor = 1.5;


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
    var clrColor = [1.0, 1.0, 1.0, 1.0];

    // *** INITIALIZATION ***
    // Initialize WebGL context and set up shaders
    function init() {
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
        }
        rVals = new Float32Array(rVals);
        gVals = new Float32Array(gVals);
        bVals = new Float32Array(bVals);

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
    }

    // *** OTHER METHODS ***
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
    }

    function scaleUpCurr() {
        var currentShape = shapes[shapes.length - 1];
        currentShape.scale[0] *= scaleFactor;
        currentShape.scale[1] *= scaleFactor;
        currentShape.scale[2] *= scaleFactor;
    }

    function scaleDownCurr() {
        var currentShape = shapes[shapes.length - 1];
        currentShape.scale[0] /= scaleFactor;
        currentShape.scale[1] /= scaleFactor;
        currentShape.scale[2] /= scaleFactor;
    }

    function rotateCurr(rot) {
        var currentShape = shapes[shapes.length - 1];
        currentShape.rot += rot;
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
        mat4.translate(transform, transform, shape.trans         );
        mat4.rotate(   transform, transform, shape.rot, [0, 0, 1]); // Local rotation
        mat4.scale(    transform, transform, shape.scale);          // Local scaling
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
    }

    // Clear all graphics data
    function clear() {
        shapes = [];
    }

    // Choose different background color
    function setBackground(r, g, b, alpha) {
        clrColor = [r, g, b, alpha];
    }

    return {
        init: init,

        addShape: addShape,

        scaleUpCurr: scaleUpCurr,
        scaleDownCurr: scaleDownCurr,
        rotateCurr: rotateCurr,

        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,
    };
}());
