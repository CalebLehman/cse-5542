// Author - Caleb Lehman (lehman.346)
// Date   - TODO

var userHandler = (function() {
    // *** VARIABLES ***
    var mouseX;
    var mouseY;

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
        switch (event.keyCode) {
            // Command keys
            // TODO

            // Misc. keys
            case 68: // "d"
                graphics.drawScene();
                break;
        }
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

        updateMouse(event);
    }

    function userMouseUp(event) {
        document.removeEventListener(
            "mouseup",
            userMouseUp,
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
    constructor(type, trans, rot, scale) {
        this.type  = type;
        this.trans = trans;
        this.rot   = rot;
        this.scale = scale;
    }
}

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Current list of shapes to draw
    var shapes;
    var currentIndex;
    var clrColor;

    const scaleFactor = 1.5; // Factor scaling operations use


    // Buffers for each shape type
    // TODO
    const vertexBuffScale = 0.2;
    var triVertexBuff;
    var squareVertexBuff;
    var circleVertexBuff;

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
        // TODO
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
        shaderProgram.pvmMatrix =
            gl.getUniformLocation(shaderProgram, "pvmMatrix");
        gl.enable(gl.DEPTH_TEST);

        // Initialize shape buffers
        // TODO init colors here as well
        initPoint();
        initLine();
        initTri();
        initSquare();
        initCircle();

        // Initial draw
        drawScene();
    }

    // Initialize the vertex buffers for the square object
    // TODO
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
    // TODO
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

    // *** SELECTION METHODS ***
    function unselectCurrentShape() {
        currentIndex = null;
    }

    // Given viewport coordinates
    //   select the corresponding shape and return true
    //   or
    //   return false if coordinates correspond to no shape
    // Checks from most-recently-drawn to least-recently-drawn
    // TODO
    function selectCurrentShape(x, y) {
        // Convert x, y from viewport coordinates
        // to NDC coordinates
        var width  = gl.viewportWidth;
        var height = gl.viewportHeight;
        var xNDC = -1 + 2*(x / width );
        var yNDC =  1 - 2*(y / height);

        for (var i = shapes.length - 1; i >= 0; --i) {
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
        const tolerance = 0.05;
        return (x <  tolerance * vertexBuffScale)
            && (x > -tolerance * vertexBuffScale)
            && (y <  tolerance * vertexBuffScale)
            && (y > -tolerance * vertexBuffScale);
    }

    // Check if (local) coordinates collide with line
    function collideLine(shape, x, y) {
        const tolerance = 0.05;
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

    // Draws a single shape
    function drawShape(shape) {
        // Bind vertices
        var vertexBuff;
        switch (shape.type) {
            // TODO
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
            // TODO
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
        // TODO
        var pvmMatrix = mat4.create();
        // TODO build pvmMatrix
        gl.uniformMatrix4fv(
            shaderProgram.pvmMatrix,
            false,
            pvmMatrix
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
        shapes.forEach(drawShape);
    }

    // Clear all graphics data
    function clear() {
        shapes      = [];
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

        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,
    };
}());
