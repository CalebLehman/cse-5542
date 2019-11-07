// Author - Caleb Lehman (lehman.346)
// Date   - 11/7/2019

import { Shape }
    from "./shape.mjs"
import { makePlaneScene }
    from "./plane_hierarchy.mjs"

var userHandler = (function() {
    // *** VARIABLES ***
    var mouseX;
    var mouseY;

    const deltaAngle = 0.04;
    const deltaMove  = 0.08;

    const propAngle = 0.15;
    const finAngle  = 0.15;
    const legAngle  = 0.10;
    const wheelAngle = 0.15;

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
            case 67: // "c"
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

            case 87: // "w"
                if (event.shiftKey) {
                    graphics.moveLight([0,0,-deltaMove]);
                } else {
                    graphics.moveRoot([0,0,-deltaMove]);
                }
                break;
            case 83: // "s"
                if (event.shiftKey) {
                    graphics.moveLight([0,0,+deltaMove]);
                } else {
                    graphics.moveRoot([0,0,+deltaMove]);
                }
                break;
            case 65: // "a"
                if (event.shiftKey) {
                    graphics.moveLight([-deltaMove,0,0]);
                } else {
                    graphics.moveRoot([-deltaMove,0,0]);
                }
                break;
            case 68: // "d"
                if (event.shiftKey) {
                    graphics.moveLight([+deltaMove,0,0]);
                } else {
                    graphics.moveRoot([+deltaMove,0,0]);
                }
                break;
            case 69: // "e"
                if (event.shiftKey) {
                    graphics.moveLight([0,+deltaMove,0]);
                } else {
                    graphics.moveRoot([0,+deltaMove,0]);
                }
                break;
            case 81: // "q"
                if (event.shiftKey) {
                    graphics.moveLight([0,-deltaMove,0]);
                } else {
                    graphics.moveRoot([0,-deltaMove,0]);
                }
                break;

            case 72: // "h"
                if (event.shiftKey) {
                    graphics.rotateProp(+propAngle);
                } else {
                    graphics.rotateProp(-propAngle);
                }
                break;
            case 74: // "j"
                if (event.shiftKey) {
                    graphics.rotateFin(+finAngle);
                } else {
                    graphics.rotateFin(-finAngle);
                }
                break;
            case 75: // "k"
                if (event.shiftKey) {
                    graphics.rotateLegs(+legAngle);
                } else {
                    graphics.rotateLegs(-legAngle);
                }
                break;
            case 76: // "l"
                if (event.shiftKey) {
                    graphics.rotateWheels(+wheelAngle);
                } else {
                    graphics.rotateWheels(-wheelAngle);
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
        init: init,
    };
}());

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Initial camera parameters
    const cameraPosition = [-9, 5, -2];
    const cameraCOI      = [0, 1, 1];
    const cameraUp       = [0, 1, 0];
    var   tiltMatrix     = mat4.create();

    // Light parameters
    var light;
    const lightAmbient  = [.5, .5, .5];
    const lightDiffuse  = [.5, .5, .5];
    const lightSpecular = [1, 1, 1];

    // Current list of shapes to draw
    var modelPlane;
    var root;
    var propRoot;
    var finRoot;
    const finBound  = 0.4;
    var legRoot;
    const legBound  = 0.36;
    var floor;
    var wheelRoot;
    var clrColor;

    // Buffers for each shape type
    var vertexBuffs = new Object();
    var ambBuffs    = new Object();
    var diffBuffs   = new Object();
    var specBuffs   = new Object();
    var nBuffs      = new Object();
    var indexBuffs  = new Object();
    var normalBuffs = new Object();

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
        // Uniforms
        shaderProgram = setup_shaders.initShaders(gl);
        shaderProgram.lightPos =
            gl.getUniformLocation(shaderProgram, "lightPos");
        shaderProgram.lightAmbient =
            gl.getUniformLocation(shaderProgram, "lightAmbient");
        shaderProgram.lightDiffuse =
            gl.getUniformLocation(shaderProgram, "lightDiffuse");
        shaderProgram.lightSpecular =
            gl.getUniformLocation(shaderProgram, "lightSpecular");
        shaderProgram.pvmMatrix =
            gl.getUniformLocation(shaderProgram, "pvmMatrix");
        shaderProgram.vmMatrix =
            gl.getUniformLocation(shaderProgram, "vmMatrix");
        shaderProgram.vMatrix =
            gl.getUniformLocation(shaderProgram, "vMatrix");
        shaderProgram.normalMatrix =
            gl.getUniformLocation(shaderProgram, "normalMatrix");

        // Attributes
        shaderProgram.position =
            gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(
            shaderProgram.position
        );
        shaderProgram.normal =
            gl.getAttribLocation(shaderProgram, "normal");
        gl.enableVertexAttribArray(
            shaderProgram.normal
        );
        shaderProgram.kA =
            gl.getAttribLocation(shaderProgram, "kA");
        gl.enableVertexAttribArray(
            shaderProgram.kA
        );
        shaderProgram.kD =
            gl.getAttribLocation(shaderProgram, "kD");
        gl.enableVertexAttribArray(
            shaderProgram.kD
        );
        shaderProgram.kS =
            gl.getAttribLocation(shaderProgram, "kS");
        gl.enableVertexAttribArray(
            shaderProgram.kS
        );
        shaderProgram.n =
            gl.getAttribLocation(shaderProgram, "n");
        gl.enableVertexAttribArray(
            shaderProgram.n
        );

        gl.enable(gl.DEPTH_TEST);

        initScene();

        // Initial draw
        drawScene();
    }

    function initScene() {
        var roots = makePlaneScene(gl);
        root = roots.rootNode;
        propRoot = roots.propNode;
        finRoot = roots.finNode;
        legRoot = roots.legNode;
        floor = roots.floorNode;
        wheelRoot = roots.wheelNode;
        light = roots.lightNode;
        modelPlane = roots.modelNode;
    }

    function addBuffers(type, buffs) {
        vertexBuffs[type] = buffs.vertexBuff;
        ambBuffs   [type] = buffs.ambBuff;
        diffBuffs  [type] = buffs.diffBuff;
        specBuffs  [type] = buffs.specBuff;
        nBuffs     [type] = buffs.nBuff;
        indexBuffs [type] = buffs.indexBuff;
        normalBuffs[type] = buffs.normalBuff;
    }

    // Draws a single shape
    function drawShape(shape, pMatrix, vMatrix, mMatrixBase) {
        if (shape.type === "none") return;

        // Get buffers
        var vertexBuff = vertexBuffs[shape.type];
        var indexBuff  = indexBuffs [shape.type];
        var ambBuff    = ambBuffs   [shape.type];
        var diffBuff   = diffBuffs  [shape.type];
        var specBuff   = specBuffs  [shape.type];
        var nBuff      = nBuffs     [shape.type];
        var normalBuff = normalBuffs[shape.type];

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
        gl.vertexAttribPointer(
            shaderProgram.position,
            vertexBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
        gl.vertexAttribPointer(
            shaderProgram.normal,
            normalBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, ambBuff);
        gl.vertexAttribPointer(
            shaderProgram.kA,
            ambBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, diffBuff);
        gl.vertexAttribPointer(
            shaderProgram.kD,
            diffBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, specBuff);
        gl.vertexAttribPointer(
            shaderProgram.kS,
            specBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuff);
        gl.vertexAttribPointer(
            shaderProgram.n,
            nBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Bind element arrays
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);

        // Bind transformation
        var mMatrix = mat4.clone(mMatrixBase);
        mat4.translate(mMatrix, mMatrix, shape.trans);
        mat4.rotate(   mMatrix, mMatrix, shape.rot.angle, shape.rot.axis);
        mat4.scale(    mMatrix, mMatrix, shape.scale);

        var vmMatrix = mat4.create();
        mat4.multiply(vmMatrix, vMatrix, mMatrix);

        var normalMatrix = mat4.clone(vmMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        mat4.invert(normalMatrix, normalMatrix);

        var pvmMatrix = mat4.create();
        mat4.multiply(pvmMatrix, pMatrix, vmMatrix);

        gl.uniformMatrix4fv(
            shaderProgram.pvmMatrix,
            false,
            pvmMatrix
        );
        gl.uniformMatrix4fv(
            shaderProgram.vmMatrix,
            false,
            vmMatrix
        );
        gl.uniformMatrix4fv(
            shaderProgram.vMatrix,
            false,
            vMatrix
        );
        gl.uniformMatrix4fv(
            shaderProgram.normalMatrix,
            false,
            normalMatrix
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

        // Set light away direction
        gl.uniform3fv(shaderProgram.lightPos, light.trans);
        gl.uniform3fv(shaderProgram.lightAmbient, lightAmbient);
        gl.uniform3fv(shaderProgram.lightDiffuse, lightDiffuse);
        gl.uniform3fv(shaderProgram.lightSpecular, lightSpecular);

        // Generate perpective-view matrix
        var pMatrix = mat4.create();
        mat4.perspective(pMatrix, 1.0, width / height, 0.1, 100);

        var vMatrix = mat4.create();
        mat4.lookAt(vMatrix, cameraPosition, cameraCOI, cameraUp);
        mat4.multiply(vMatrix, tiltMatrix, vMatrix);

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
            drawShape(node.shape, pMatrix, vMatrix, mMatrix);

            if (node.children.length === 0) {
                // pop mMatrix
                mMatrix = matrices.pop();
            }

            // push children
            stack.push(...node.children);
        }

        drawShape(floor.shape, pMatrix, vMatrix, mat4.create());
        var lightMatrix = mat4.create();
        mat4.translate(lightMatrix, lightMatrix, light.trans);
        mat4.scale(lightMatrix, lightMatrix, light.scale);
        drawShape(light.shape, pMatrix, vMatrix, lightMatrix);

        if (vertexBuffs[modelPlane.shape.type]) {
            var modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, modelPlane.trans);
            mat4.rotate(modelMatrix, modelMatrix, modelPlane.rot.angle, modelPlane.rot.axis);
            mat4.scale(modelMatrix, modelMatrix, modelPlane.scale);
            drawShape(modelPlane.shape, pMatrix, vMatrix, modelMatrix);
        }
    }

    // Clear all graphics data
    function clear() {
        clrColor = [0.7, 0.8, 1, 1];
        tiltMatrix = mat4.create();
        if (root) {
            root.trans = [-2, 1.5, 3.5];
            propRoot.rot.angle = 0.0;
            finRoot.rot.angle = 0.0;
        }
        if (light) {
            light.trans = [-3, 5, 2];
        }
    }

    // Choose different background color
    function setBackground(r, g, b, alpha) {
        clrColor = [r, g, b, alpha];
    }

    function pitch(angle) {
        var rotation = mat4.create();
        mat4.rotate(rotation, rotation, angle, [1, 0, 0]);
        mat4.multiply(tiltMatrix, rotation, tiltMatrix);
    }

    function yaw(angle) {
        var rotation = mat4.create();
        mat4.rotate(rotation, rotation, angle, [0, 1, 0]);
        mat4.multiply(tiltMatrix, rotation, tiltMatrix);
    }

    function roll(angle) {
        var rotation = mat4.create();
        mat4.rotate(rotation, rotation, angle, [0, 0, 1]);
        mat4.multiply(tiltMatrix, rotation, tiltMatrix);
    }

    function moveRoot(dist) {
        root.trans[0] += dist[0];
        root.trans[1] += dist[1];
        root.trans[2] += dist[2];
    }

    function moveLight(dist) {
        light.trans[0] += dist[0];
        light.trans[1] += dist[1];
        light.trans[2] += dist[2];
    }

    function rotateRoot(angle) {
        root.rot.angle += angle;
    }

    function rotateProp(angle) {
        propRoot.rot.angle += angle;
    }

    function rotateFin(angle) {
        finRoot.rot.angle += angle;
        if (finRoot.rot.angle > +finBound) {
            finRoot.rot.angle = +finBound;
        }
        if (finRoot.rot.angle < -finBound) {
            finRoot.rot.angle = -finBound;
        }
    }

    function rotateLegs(angle) {
        legRoot.rot.angle += angle;
        if (legRoot.rot.angle > +legBound) {
            legRoot.rot.angle = +legBound;
        }
        if (legRoot.rot.angle < -legBound) {
            legRoot.rot.angle = -legBound;
        }
    }

    function rotateWheels(angle) {
        wheelRoot.rot.angle += angle;
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
        moveLight: moveLight,
        moveRoot: moveRoot,
        rotateRoot: rotateRoot,
        rotateProp: rotateProp,
        rotateFin: rotateFin,
        rotateLegs: rotateLegs,
        rotateWheels: rotateWheels,
    };
}());

export { graphics, userHandler };
