// Author - Caleb Lehman (lehman.346)
// Date   - TODO

import { makeCube, makeSphere, makeCylinder }
    from "./make_buffers.mjs"
import { Node }
    from "./node.mjs"
import { Shape }
    from "./shape.mjs"
import { makePlaneScene }
    from "./plane.mjs"

var userHandler = (function() {
    // *** VARIABLES ***
    var mouseX;
    var mouseY;

    const deltaAngle = 0.02;

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

            case 68: // "c"
                graphics.clear();
                break;
            case 80: // "p"
                if (event.shiftKey) {
                    graphics.pitch(+deltaAngle);
                } else {
                    graphics.pitch(-deltaAngle);
                }
                break;
            case 89: // "y"
                if (event.shiftKey) {
                    graphics.yaw(+deltaAngle);
                } else {
                    graphics.yaw(-deltaAngle);
                }
                break;
            case 82: // "r"
                if (event.shiftKey) {
                    graphics.roll(+deltaAngle);
                } else {
                    graphics.roll(-deltaAngle);
                }
                break;
        }
        graphics.drawScene();
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

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Initial camera parameters
    const cameraPosition = [2, 2, 5];
    const cameraCOI      = [0, 0, 0];
    const cameraUp       = [0, 1, 0];
    var   cameraPitch    = 0.0;
    var   cameraYaw      = 0.0;
    var   cameraRoll     = 0.0;

    // Current list of shapes to draw
    var root;
    var clrColor;

    // Buffers for each shape type
    var vertexBuffs = new Object();
    var colorBuffs  = new Object();
    var indexBuffs  = new Object();

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
        // Transformation matrix uniform
        shaderProgram.pvmMatrix =
            gl.getUniformLocation(shaderProgram, "pvmMatrix");
        gl.enable(gl.DEPTH_TEST);

        initScene();

        // Initial draw
        drawScene();
    }

    function initScene() {
        root = makePlaneScene(gl);
    }

    function addBuffers(type, buffs) {
        vertexBuffs[type] = buffs.vertexBuff;
        colorBuffs [type] = buffs.colorBuff;
        indexBuffs [type] = buffs.indexBuff;
    }

    // Draws a single shape
    function drawShape(shape, pvMatrix, mMatrix) {
        if (shape.type === "none") return;

        // Get buffers
        var vertexBuff = vertexBuffs[shape.type];
        var indexBuff  = indexBuffs [shape.type];
        var colorBuff  = colorBuffs [shape.type];

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexPositionAttribute,
            vertexBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexColorAttribute,
            colorBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Bind element arrays
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);

        // Bind transformation
        var pvmMatrix = mat4.create();
        mat4.multiply(pvmMatrix, pvMatrix, mMatrix);
        mat4.translate(pvmMatrix, pvmMatrix, shape.trans);
        mat4.rotate(   pvmMatrix, pvmMatrix, shape.rot.angle, shape.rot.axis);
        mat4.scale(    pvmMatrix, pvmMatrix, shape.scale);

        gl.uniformMatrix4fv(
            shaderProgram.pvmMatrix,
            false,
            pvmMatrix
        );

        // Draw
        gl.drawElements(
            gl.TRIANGLES,
            indexBuff.numItems,
            gl.UNSIGNED_SHORT,
            0
        );
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

        // Generate perpective-view matrix
        var pMatrix = mat4.create();
        mat4.perspective(pMatrix, 1.0, width / height, 0.1, 100);

        var tiltMatrix = mat4.create();
        mat4.rotate(tiltMatrix, tiltMatrix, cameraPitch, [1, 0, 0]);
        mat4.rotate(tiltMatrix, tiltMatrix, cameraYaw,   [0, 1, 0]);
        mat4.rotate(tiltMatrix, tiltMatrix, cameraRoll,  [0, 0, 1]);

        var vMatrix = mat4.create();
        mat4.lookAt(vMatrix, cameraPosition, cameraCOI, cameraUp);

        var pvMatrix = mat4.create();
        mat4.multiply(pvMatrix, pMatrix, tiltMatrix);
        mat4.multiply(pvMatrix, pvMatrix, vMatrix);

        // Walk hierarchy tree
        // while updating model matrix
        var mMatrix = mat4.create();

        var stack    = [root];
        var matrices = [mat4.clone(mMatrix)];
        while (stack.length > 0) {
            var node = stack.pop();
            if (!node.initial) {
                // push clone of mMatrix
                matrices.push(mat4.clone(mMatrix));
            }
            // update mMatrix
            mat4.translate(mMatrix, mMatrix, node.trans);
            mat4.rotate   (mMatrix, mMatrix, node.rot.angle, node.rot.axis);
            mat4.scale    (mMatrix, mMatrix, node.scale);
            // draw node
            drawShape(node.shape, pvMatrix, mMatrix);

            if (node.children.length === 0) {
                // pop mMatrix
                mMatrix = matrices.pop();
            }

            // push children
            stack.push(...node.children);
        }
    }

    // Clear all graphics data
    function clear() {
        clrColor = [1, 1, 1, 1];
    }

    // Choose different background color
    function setBackground(r, g, b, alpha) {
        clrColor = [r, g, b, alpha];
    }

    function pitch(angle) {
        cameraPitch += angle;
    }

    function yaw(angle) {
        cameraYaw += angle;
    }

    function roll(angle) {
        cameraRoll += angle;
    }

    return {
        init: init,

        addBuffers: addBuffers,
        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,

        pitch: pitch,
        yaw: yaw,
        roll: roll,
    };
}());

graphics.init();
userHandler.init();

export { graphics };
