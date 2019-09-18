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
                'keydown',
                userKeyDown,
                false
            );
            document.addEventListener(
                'mousemove',
                updateMouse,
                false
            );
            document.addEventListener(
                'mousedown',
                userMouseDown,
                false
            );
        }

        // Reset all user data and associated graphics
        function clearUserData() {
            // Tell graphics object to clear itself
            graphics.clear();
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

                // Misc. keys
                case 68: // "d"
                    graphics.draw();
                    break;
                case 67: // "c"
                    clearUserData();
                    graphics.draw();
                    break;
            }

            document.getElementById("currShapeText").innerHTML =
                shapeString;
            document.getElementById("currColorText").innerHTML =
                colorString;
        }

        // Process a user mouse down input
        function userMouseDown(event) {
            updateMouse(event);
            if ((mouseX != null) && (mouseY != null)) {
                graphics.addShape(
                    currShape,
                    currColor,
                    mouseX,
                    mouseY
                );
                graphics.draw();
            }
        }


        // Update stored mouse coordinates to match NDC
        // coordinates of an event
        function updateMouse(event) {
            var canvas = document.getElementById("canvas")
            var canvasRect = canvas.getBoundingClientRect();
            mouseX = event.clientX - canvasRect.left;
            mouseY = event.clientY - canvasRect.top;

            mouseX_NDC = -1 + 2 * mouseX / canvas.width;
            mouseY_NDC = 1 - 2 * mouseY / canvas.height;

            if (((-1 <= mouseX_NDC) && (mouseX_NDC <= 1)) && ((-1 <= mouseY_NDC) && (mouseY_NDC <= 1))) {
                document.getElementById("mousePos").innerHTML = "(" + mouseX_NDC.toFixed(3) + ", " + mouseY_NDC.toFixed(3) + ")";
            } else {
                document.getElementById("mousePos").innerHTML = "Out of canvas";
                mouseX = null;
                mouseY = null;
            }
        }

    return {
        // *** PUBLIC ***
        init: init
    };
}());




var graphics = (function() {
        // *** PRIVATE ***
        var gl;
        var shaderProgram;
        var clrColor = [1.0, 1.0, 1.0, 1.0];

        // Data to track information about points
        var pointsVertexPositionBuffer;
        var pointsVertices = [];
        var pointsColors = [];

        // Data to track information about lines
        var linesVertexPositionBuffer;
        var linesVertices = [];
        var linesColors = [];
        var linesUnit = 30; // Some kind of base units for sizing lines

        // Data to track information about triangles (+ squares, + circles)
        var trisVertexPositionBuffer;
        var trisVertices = [];
        var trisColors = [];
        var trisUnit = 40; // Some kind of base units for sizing triangles
        var squaresUnit = 40; // Some kind of base units for sizing squares
        var circlesUnit = 30; // Some kind of base units for sizing circles

        // Pushes the appropriate color (4 float values) onto array
        function pushColor(array, color) {
            switch (color) {
                case "r":
                    // Red
                    array.push(1.0);
                    array.push(0.0);
                    array.push(0.0);
                    array.push(1.0);
                    break;
                case "g":
                    // Green
                    array.push(0.0);
                    array.push(1.0);
                    array.push(0.0);
                    array.push(1.0);
                    break;
                case "b":
                    // Blue
                    array.push(0.0);
                    array.push(0.0);
                    array.push(1.0);
                    array.push(1.0);
                    break;
            }
        }

        // Pushes appropriate NDC coordinates (3 float values) onto array
        function pushMouseCoords(array, x, y) {
            function mouse2NDC(x_val, y_val) {
                var canvas = document.getElementById("canvas")
                return {
                    x: -1 + 2 * x_val / canvas.width,
                    y: 1 - 2 * y_val / canvas.width
                };
            }

            point_NDC = mouse2NDC(x, y);
            array.push(point_NDC.x);
            array.push(point_NDC.y);
            array.push(0.0);
        }


        // Add point (with appropriate color and position) to graphics data
        function addPoint(color, x, y) {
            pushColor(pointsColors, color);
            pushMouseCoords(pointsVertices, x, y);
        }

        // Add horizontal line segment (with appropriate color and position) to graphics data
        function addHLine(color, x, y) {
            pushColor(linesColors, color);
            pushMouseCoords(linesVertices, x - linesUnit / 2, y);

            pushColor(linesColors, color);
            pushMouseCoords(linesVertices, x + linesUnit / 2, y);
        }

        // Add vertical line segment (with appropriate color and position) to graphics data
        function addVLine(color, x, y) {
            pushColor(linesColors, color);
            pushMouseCoords(linesVertices, x, y - linesUnit / 2);

            pushColor(linesColors, color);
            pushMouseCoords(linesVertices, x, y + linesUnit / 2);
        }

        // Add triangle (with appropriate color and position) to graphics data
        function addTri(color, x, y) {
            pushColor(trisColors, color);
            pushMouseCoords(trisVertices, x, y - trisUnit);

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x - trisUnit * 1.73 / 2,
                y + trisUnit / 2
            );

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x + trisUnit * 1.73 / 2,
                y + trisUnit / 2
            );
        }

        // Add square (with appropriate color and position) to graphics data
        function addSquare(color, x, y) {
            // Tri 1
            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x - squaresUnit / 2,
                y + squaresUnit / 2
            );

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x + squaresUnit / 2,
                y + squaresUnit / 2
            );

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x - squaresUnit / 2,
                y - squaresUnit / 2
            );

            // Tri 2
            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x + squaresUnit / 2,
                y + squaresUnit / 2
            );

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x + squaresUnit / 2,
                y - squaresUnit / 2
            );

            pushColor(trisColors, color);
            pushMouseCoords(
                trisVertices,
                x - squaresUnit / 2,
                y - squaresUnit / 2
            );
        }

        // Add circle (with appropriate color and position) to graphics data
        function addCircle(color, x, y) {
            var n = 32;
            for (var i = 0; i < n; i += 1) {
                pushColor(trisColors, color);
                pushMouseCoords(
                    trisVertices,
                    x + circlesUnit * Math.cos(2*i*Math.PI / n),
                    y - circlesUnit * Math.sin(2*i*Math.PI / n)
                );

                pushColor(trisColors, color);
                pushMouseCoords(
                    trisVertices,
                    x + circlesUnit * Math.cos(2*(i+1)*Math.PI / n),
                    y - circlesUnit * Math.sin(2*(i+1)*Math.PI / n)
                );

                pushColor(trisColors, color);
                pushMouseCoords(
                    trisVertices,
                    x,
                    y
                );
            }
        }

        // Adds shape (with appropriate color and position) to graphics data
        function addShape(shape, color, x, y) {
            switch (shape) {
                case "p":
                    addPoint(color, x, y);
                    break;
                case "h":
                    addHLine(color, x, y);
                    break;
                case "v":
                    addVLine(color, x, y);
                    break;
                case "t":
                    addTri(color, x, y);
                    break;
                case "q":
                    addSquare(color, x, y);
                    break;
                case "o":
                    addCircle(color, x, y);
                    break;
            }
        }

        // Use points/lines/triangles color and position
        // data to fill buffers
        function createBuffers() {
            // Points buffers
            pointsVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsVertices), gl.STATIC_DRAW);
            pointsVertexPositionBuffer.itemSize = 3;
            pointsVertexPositionBuffer.numItems = pointsVertices.length / 3;

            pointsVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsColors), gl.STATIC_DRAW);
            pointsVertexColorBuffer.itemSize = 4;
            pointsVertexColorBuffer.numItems = pointsColors.length / 4;


            // Lines buffers
            linesVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linesVertices), gl.STATIC_DRAW);
            linesVertexPositionBuffer.itemSize = 3;
            linesVertexPositionBuffer.numItems = linesVertices.length / 3;

            linesVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linesColors), gl.STATIC_DRAW);
            linesVertexColorBuffer.itemSize = 4;
            linesVertexColorBuffer.numItems = linesColors.length / 4;


            // Tris buffers
            trisVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, trisVertexPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trisVertices), gl.STATIC_DRAW);
            trisVertexPositionBuffer.itemSize = 3;
            trisVertexPositionBuffer.numItems = trisVertices.length / 3;

            trisVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, trisVertexColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trisColors), gl.STATIC_DRAW);
            trisVertexColorBuffer.itemSize = 4;
            trisVertexColorBuffer.numItems = trisColors.length / 4;
        }
            
        // Uses current information to draw scene
        function drawScene() {
            var width  = gl.viewportWidth;
            var height = gl.viewportHeight;

            // Clear
            gl.viewport(0, 0, width, height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Draw Points
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexPositionBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexPositionAttribute,
                pointsVertexPositionBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexColorBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexColorAttribute,
                pointsVertexColorBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.drawArrays(gl.POINTS, 0, pointsVertexPositionBuffer.numItems);

            // Draw Lines
            gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexPositionBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexPositionAttribute,
                linesVertexPositionBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexColorBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexColorAttribute,
                linesVertexColorBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.drawArrays(gl.LINES, 0, linesVertexPositionBuffer.numItems);

            // Draw Tris
            gl.bindBuffer(gl.ARRAY_BUFFER, trisVertexPositionBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexPositionAttribute,
                trisVertexPositionBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, trisVertexColorBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexColorAttribute,
                trisVertexColorBuffer.itemSize,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.drawArrays(gl.TRIANGLES, 0, trisVertexPositionBuffer.numItems);
        }

        // Initialize WebGL context and set up shaders
        function init() {
            // Set up context
            var canvas = document.getElementById("canvas");
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth  = canvas.width;
            gl.viewportHeight = canvas.height;

            // Set up shaders
            shaderProgram = setup_shaders.initShaders(gl);

            shaderProgram.vertexPositionAttribute =
                gl.getAttribLocation(shaderProgram, "position");
            gl.enableVertexAttribArray(
                shaderProgram.vertexPositionAttribute
            );

            shaderProgram.vertexColorAttribute =
                gl.getAttribLocation(shaderProgram, "color");
            gl.enableVertexAttribArray(
                shaderProgram.vertexColorAttribute
            );

            // Initial draw
            draw();
        }

        // Redraws the scene
        function draw() {
            gl.clearColor(
                clrColor[0],
                clrColor[1],
                clrColor[2],
                clrColor[3]
            );
            createBuffers();
            drawScene();
        }

        // Clear all graphics data
        function clear() {
            pointsVertices = [];
            pointsColors = [];

            linesVertices = [];
            linesColors = [];

            trisVertices = [];
            trisColors = [];
        }

        function setBackground(r, g, b, alpha) {
            clrColor = [r, g, b, alpha];
            draw();
        }

    return {
        // *** PUBLIC ***

        addShape: addShape,

        init: init,

        draw: draw,

        clear: clear,

        setBackground: setBackground,
    };
}());
