// Author - Caleb Lehman (lehman.346)
// Date   - TODO

var userHandler = (function() {
    // *** VARIABLES ***
    var mouseX;
    var mouseY;

    const deltaAngle = 0.05;

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

class Node {
    constructor(shape, trans, rot, scale) {
        this.shape    = shape;
        this.trans    = trans;
        this.rot      = rot;
        this.scale    = scale;
        this.parent   = null;
        this.children = []
        this.initial  = true;
    }
    addChild(child) {
        child.initial = this.children.length === 0;
        this.children.push(child);
        child.parent = this;
    }
}

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
    var cubeVertexBuff;
    var cubeColorBuffAll;
    var cubeIndexBuff;

    var sphereVertexBuff;
    var sphereColorBuffAll;
    var sphereIndexBuff;

    var cylVertexBuff;
    var cylColorBuffAll;
    var cylIndexBuff;


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

        // Initialize shape buffers
        initCube(1);
        initSphere(1, 32, 32);
        initCylinder(1, 0.5, 1, 32, 2);
        initScene();

        // Initial draw
        drawScene();
    }

    function initScene() {
        // Shapes
        var floor = new Shape(
            "cube",
            [0, 0, 0],
            {angle: 0.0, axis: [0, 0, 1]},
            [5, 0.1, 5],
            "all"
        );
        var cube = new Shape(
            "cube",
            [0, 0, 0],
            {angle: 0.0, axis: [0, 0, 1]},
            [0.5, 0.5, 0.5],
            "all"
        );
        var sphere = new Shape(
            "sphere",
            [0, 0, 0],
            {angle: 0.0, axis: [0, 0, 1]},
            [0.2, 0.2, 0.2],
            "all"
        );
        var empty = new Shape(
            "none",
            [0, 0, 0],
            {angle: 0.0, axis: [0, 1, 0]},
            [0, 0, 0],
            "all"
        );

        root = new Node(
            empty,
            [0, 0, 0],
            {angle: 0.0, axis: [0, 1, 0]},
            [1, 1, 1]
        );
        root.addChild(new Node(
                floor,
                [0, -.1, 0],
                {angle: 0.0, axis: [0, 1, 0]},
                [1, 1, 1]
            )
        );
        var child = new Node(
            cube,
            [0, 2, 0],
            {angle: 0.0, axis: [0, 1, 0]},
            [1, 1, 1]
        );
        child.addChild(new Node(
                sphere,
                [1, 0, 0],
                {angle: 0.0, axis: [0, 1, 0]},
                [1, 1, 1]
            )
        );
        child.addChild(new Node(
                sphere,
                [0, 0, 1],
                {angle: 0.0, axis: [0, 1, 0]},
                [1, 1, 1]
            )
        );
        child.addChild(new Node(
                sphere,
                [-1, 0, 0],
                {angle: 0.0, axis: [0, 1, 0]},
                [1, 1, 1]
            )
        );
        child.addChild(new Node(
                sphere,
                [0, 0, -1],
                {angle: 0.0, axis: [0, 1, 0]},
                [1, 1, 1]
            )
        );
        root.addChild(child);
    }

    function initCylinder(botRadius, topRadius, height, vSlices, hSlices) {
        // Init vertices
        var vertices = [0, -height / 2.0, 0];
        for (var hSlice = 0; hSlice < hSlices; ++hSlice) {
            var prop = hSlice / (hSlices - 1);
            var y = -height / 2.0 + height * prop;
            var r = botRadius * (1 - prop) + topRadius * prop;
            for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
                var x = r * Math.cos(2 * Math.PI * vSlice / vSlices);
                var z = r * Math.sin(2 * Math.PI * vSlice / vSlices);
                vertices.push(x, y, z);
            }
        }
        vertices.push(0, height / 2.0, 0);
        vertices = new Float32Array(vertices);
        cylVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cylVertexBuff);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        cylVertexBuff.itemSize = 3;
        cylVertexBuff.numItems = 2 + vSlices * hSlices;

        // Init colors
        var colors = [
            [ 1, 0, 0, 1 ],
            [ 0, 1, 0, 1 ],
            [ 0, 0, 1, 1 ]
        ];
        var colorsAll = [];
        for (var i = 0; i < 2 + vSlices * hSlices; ++i) {
            colorsAll.push(...colors[i % 3]);
        }
        colorsAll = new Float32Array(colorsAll);
        cylColorBuffAll = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cylColorBuffAll);
        gl.bufferData(gl.ARRAY_BUFFER, colorsAll, gl.STATIC_DRAW);
        cylColorBuffAll.itemSize = 4;
        cylColorBuffAll.numItems = 2 + vSlices * hSlices;

        // Init indices
        function indexer(h, v) {
            return 1 + h * vSlices + v % vSlices;
        }
        var indices = [];
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            indices.push(0, indexer(0, vSlice + 1), indexer(0, vSlice));
        }
        for (var hSlice = 0; hSlice < hSlices - 1; ++hSlice) {
            for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
                indices.push(
                    indexer(hSlice    , vSlice    ),
                    indexer(hSlice + 1, vSlice + 1),
                    indexer(hSlice + 1, vSlice    )
                );
                indices.push(
                    indexer(hSlice    , vSlice    ),
                    indexer(hSlice    , vSlice + 1),
                    indexer(hSlice + 1, vSlice + 1)
                );
            }
        }
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            indices.push(
                indexer(hSlices - 1, vSlice    ),
                indexer(hSlices - 1, vSlice + 1),
                indexer(hSlices    , 0         )
            );
        }
        indices = new Uint16Array(indices);
        cylIndexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylIndexBuff);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            indices,
            gl.STATIC_DRAW
        );
        cylIndexBuff.itemSize = 1;
        cylIndexBuff.numItems = 2*3*vSlices + 6*(hSlices-1)*vSlices;
    }

    function initSphere(scale, vSlices, hSlices) {
        // Init vertices
        var vertices = [0, -1, 0];
        for (var hSlice = 0; hSlice < hSlices; ++hSlice) {
            var y = -1 + 2 * (hSlice + 1) / (hSlices + 1);
            var r = Math.sqrt(1 - y*y);
            for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
                var x = r * Math.cos(2 * Math.PI * vSlice / vSlices);
                var z = r * Math.sin(2 * Math.PI * vSlice / vSlices);
                vertices.push(x, y, z);
            }
        }
        vertices.push(0, 1, 0);
        vertices = new Float32Array(
            vertices.map(function(v) { return v * scale; })
        );
        sphereVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuff);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        sphereVertexBuff.itemSize = 3;
        sphereVertexBuff.numItems = 2 + vSlices * hSlices;
        
        // Init colors
        var colors = [
            [ 1, 0, 0, 1 ],
            [ 0, 1, 0, 1 ],
            [ 0, 0, 1, 1 ]
        ];
        var colorsAll = [];
        for (var i = 0; i < 2 + vSlices * hSlices; ++i) {
            colorsAll.push(...colors[i % 3]);
        }
        colorsAll = new Float32Array(colorsAll);
        sphereColorBuffAll = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffAll);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            colorsAll,
            gl.STATIC_DRAW
        );
        sphereColorBuffAll.itemSize = 4;
        sphereColorBuffAll.numItems = 2 + vSlices * hSlices;

        // Init indices
        function indexer(h, v) {
            return 1 + h * vSlices + v % vSlices;
        }
        var indices = [];
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            indices.push(0, indexer(0, vSlice + 1), indexer(0, vSlice));
        }
        for (var hSlice = 0; hSlice < hSlices - 1; ++hSlice) {
            for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
                indices.push(
                    indexer(hSlice    , vSlice    ),
                    indexer(hSlice + 1, vSlice + 1),
                    indexer(hSlice + 1, vSlice    )
                );
                indices.push(
                    indexer(hSlice    , vSlice    ),
                    indexer(hSlice    , vSlice + 1),
                    indexer(hSlice + 1, vSlice + 1)
                );
            }
        }
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            indices.push(
                indexer(hSlices - 1, vSlice    ),
                indexer(hSlices - 1, vSlice + 1),
                indexer(hSlices    , 0         )
            );
        }
        sphereIndexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuff);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW
        );
        sphereIndexBuff.itemSize = 1;
        sphereIndexBuff.numItems = 2*3*vSlices + 6*(hSlices-1)*vSlices;
    }

    function initCube(scale) {
        // Init vertices
        var vertices = new Float32Array(
            [ 1,  1,  1
            , 1,  1, -1
            , 1, -1,  1
            , 1, -1, -1
            ,-1,  1,  1
            ,-1,  1, -1
            ,-1, -1,  1
            ,-1, -1, -1 ]
        );
        vertices = vertices.map(function(v) { return v * scale; });
        cubeVertexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuff);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        cubeVertexBuff.itemSize = 3;
        cubeVertexBuff.numItems = 8;

        // Init colors
        var colorsAll = new Float32Array(
            [ 1, 0, 0, 1
            , 0, 1, 0, 1
            , 0, 0, 1, 1
            , 1, 0, 0, 1
            , 0, 1, 0, 1
            , 0, 0, 1, 1
            , 1, 0, 0, 1
            , 0, 1, 0, 1 ]
        );
        cubeColorBuffAll = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffAll);
        gl.bufferData(gl.ARRAY_BUFFER, colorsAll, gl.STATIC_DRAW);
        cubeColorBuffAll.itemSize = 4;
        cubeColorBuffAll.numItems = 8;

        // Init indices
        var indices = new Uint16Array(
            [ 0, 1, 4
            , 1, 5, 4
            , 3, 1, 2
            , 1, 0, 2
            , 5, 1, 3
            , 3, 7, 5
            , 4, 5, 7
            , 7, 6, 4
            , 6, 2, 4
            , 2, 0, 4
            , 2, 6, 3
            , 6, 7, 3 ]
        );
        cubeIndexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        cubeIndexBuff.itemSize = 1;
        cubeIndexBuff.numItems = 36;
    }

    // Draws a single shape
    function drawShape(shape, pvMatrix, mMatrix) {
        // Bind vertices
        var vertexBuff;
        var indexBuff;
        switch (shape.type) {
            case "cube":
                vertexBuff = cubeVertexBuff;
                indexBuff  = cubeIndexBuff;
                break;
            case "sphere":
                vertexBuff = sphereVertexBuff;
                indexBuff  = sphereIndexBuff;
                break;
            case "cylinder":
                vertexBuff = cylVertexBuff;
                indexBuff  = cylIndexBuff;
                break;
            default:
                // Unrecognized shape
                return;
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
        switch (shape.type) {
            case "cube":
                switch (shape.color) {
                    case "all": colorBuff = cubeColorBuffAll; break;
                }
                break;
            case "sphere":
                switch (shape.color) {
                    case "all": colorBuff = sphereColorBuffAll; break;
                }
                break;
            case "cylinder":
                switch (shape.color) {
                    case "all": colorBuff = cylColorBuffAll; break;
                }
                break;
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

        drawScene: drawScene,

        clear: clear,

        setBackground: setBackground,

        pitch: pitch,
        yaw: yaw,
        roll: roll,
    };
}());
