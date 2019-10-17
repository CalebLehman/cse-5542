// Author - Caleb Lehman (lehman.346)
// Date   - 10/17/2019

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
    var animLoops = [];

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

    function initAnim() {
        // Propeller
        animLoops.push(setInterval(
            function() {
                graphics.rotateProp(propAngle);
                graphics.drawScene();
            },
            20
        ));

        // Movement
        graphics.setRoot([0, 1.5, 10]);
        graphics.setRotRoot(0.2);
        graphics.rotateFin(-0.2);
        var vertSpeed = 0;
        var rotSpeed = 0;
        var camSpeed = 0;
        animLoops.push(setInterval(
            function() {
                graphics.moveRoot([0, 0, -deltaMove]);

                graphics.moveRoot([0, vertSpeed, 0]);
                vertSpeed += 0.0002;

                graphics.rotRoot(rotSpeed);
                rotSpeed += 0.00002;

                graphics.pitch(-camSpeed);
                graphics.yaw(-camSpeed*1.3);
                camSpeed += 0.00002;

                graphics.drawScene();
            },
            20
        ));
        animLoops.push(setInterval(
            function() {
                graphics.setRoot([0, 1.5, 10]);
                graphics.setRotRoot(0.2);

                vertSpeed = 0;
                rotSpeed = 0;

                graphics.setPitch(0);
                graphics.setYaw(0);
                camSpeed = 0;

                graphics.drawScene();
            },
            4000,
        ));
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
                graphics.moveRoot([0,0,-deltaMove]);
                break;
            case 83: // "s"
                graphics.moveRoot([0,0,+deltaMove]);
                break;
            case 65: // "a"
                graphics.moveRoot([-deltaMove,0,0]);
                break;
            case 68: // "d"
                graphics.moveRoot([+deltaMove,0,0]);
                break;
            case 69: // "e"
                graphics.moveRoot([0,+deltaMove,0]);
                break;
            case 81: // "q"
                graphics.moveRoot([0,-deltaMove,0]);
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
        initAnim: initAnim
    };
}());

var graphics = (function() {
    // *** VARIABLES ***
    var gl;
    var shaderProgram;

    // Initial camera parameters
    const cameraPosition = [-5, 3, -2];
    const cameraCOI      = [0, 1, 1];
    const cameraUp       = [0, 1, 0];
    var   cameraPitch    = 0.0;
    var   cameraYaw      = 0.0;
    var   cameraRoll     = 0.0;

    // Current list of shapes to draw
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
    var colorBuffs  = new Object();
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
        shaderProgram = setup_shaders.initShaders(gl);
        // Vertex position attribute
        shaderProgram.vertexPositionAttribute =
            gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(
            shaderProgram.vertexPositionAttribute
        );
        // Vertex normal attribute
        shaderProgram.vertexNormalAttribute =
            gl.getAttribLocation(shaderProgram, "normal");
        gl.enableVertexAttribArray(
            shaderProgram.vertexNormalAttribute
        );
        // Vertex color attribute
        shaderProgram.vertexColorAttribute =
            gl.getAttribLocation(shaderProgram, "color");
        gl.enableVertexAttribArray(
            shaderProgram.vertexColorAttribute
        );
        // Transformation matrices uniforms
        shaderProgram.pvmMatrix =
            gl.getUniformLocation(shaderProgram, "pvmMatrix");
        shaderProgram.mMatrix =
            gl.getUniformLocation(shaderProgram, "mMatrix");
        // Light away direction uniform
        shaderProgram.lightAway =
            gl.getUniformLocation(shaderProgram, "lightAway");

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
    }

    function addBuffers(type, buffs) {
        vertexBuffs[type] = buffs.vertexBuff;
        colorBuffs [type] = buffs.colorBuff;
        indexBuffs [type] = buffs.indexBuff;
        normalBuffs[type] = buffs.normalBuff;
    }

    // Draws a single shape
    function drawShape(shape, pvMatrix, mMatrix) {
        if (shape.type === "none") return;

        // Get buffers
        var vertexBuff = vertexBuffs[shape.type];
        var indexBuff  = indexBuffs [shape.type];
        var colorBuff  = colorBuffs [shape.type];
        var normalBuff = normalBuffs[shape.type];

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexPositionAttribute,
            vertexBuff.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
        gl.vertexAttribPointer(
            shaderProgram.vertexNormalAttribute,
            normalBuff.itemSize,
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
        var mMatrix = mat4.clone(mMatrix);
        mat4.translate(mMatrix, mMatrix, shape.trans);
        mat4.rotate(   mMatrix, mMatrix, shape.rot.angle, shape.rot.axis);
        mat4.scale(    mMatrix, mMatrix, shape.scale);

        var pvmMatrix = mat4.create();
        mat4.multiply(pvmMatrix, pvMatrix, mMatrix);

        gl.uniformMatrix4fv(
            shaderProgram.pvmMatrix,
            false,
            pvmMatrix
        );
        gl.uniformMatrix4fv(
            shaderProgram.mMatrix,
            false,
            mMatrix
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
        var lightAway = vec3.create();
        vec3.normalize(lightAway, vec3.fromValues(cameraPosition[0], cameraPosition[1], cameraPosition[2]));
        gl.uniform3fv(shaderProgram.lightAway, lightAway);

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

        drawShape(floor.shape, pvMatrix, mat4.create());
    }

    // Clear all graphics data
    function clear() {
        clrColor = [0.7, 0.8, 1, 1];
        cameraPitch = 0.0;
        cameraYaw   = 0.0;
        cameraRoll  = 0.0;
        if (root) {
            root.trans = [0, 1.5, 0];
            propRoot.rot.angle = 0.0;
            finRoot.rot.angle = 0.0;
        }
    }

    // Choose different background color
    function setBackground(r, g, b, alpha) {
        clrColor = [r, g, b, alpha];
    }

    function pitch(angle) {
        cameraPitch += angle;
    }

    function setPitch(angle) {
        cameraPitch = angle;
    }

    function yaw(angle) {
        cameraYaw += angle;
    }

    function setYaw(angle) {
        cameraYaw = angle;
    }

    function roll(angle) {
        cameraRoll += angle;
    }

    function moveRoot(dist) {
        root.trans[0] += dist[0];
        root.trans[1] += dist[1];
        root.trans[2] += dist[2];
    }

    function setRoot(pos) {
        root.trans = pos;
    }

    function rotRoot(angle) {
        root.rot.angle += angle;
    }

    function setRotRoot(angle) {
        root.rot.angle = angle;
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
        setPitch: setPitch,
        yaw: yaw,
        setYaw: setYaw,
        roll: roll,
        moveRoot: moveRoot,
        setRoot: setRoot,
        rotRoot: rotRoot,
        setRotRoot: setRotRoot,
        rotateProp: rotateProp,
        rotateFin: rotateFin,
        rotateLegs: rotateLegs,
        rotateWheels: rotateWheels,
    };
}());
