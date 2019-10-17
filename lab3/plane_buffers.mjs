function makeFloor(gl, size) {
    var buffs = makeCube(gl, size);
    var colors = new Float32Array(
        [ 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1

        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1

        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1

        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1

        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1

        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1
        , 0.7, 0.7, 0.7, 1 ]
    );
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    colorBuff.itemSize = 4;
    colorBuff.numItems = colors.length / colorBuff.itemSize;
    buffs.colorBuff = colorBuff;
    return buffs;
}

function makeCube(gl, size) {
    // Init vertices
    var vertices = new Float32Array(
        [ 1,  1,  1
        , 1,  1, -1
        , 1, -1,  1
        , 1, -1, -1

        ,-1,  1,  1
        ,-1,  1, -1
        ,-1, -1,  1
        ,-1, -1, -1

        , 1,  1,  1
        , 1,  1, -1
        ,-1,  1,  1
        ,-1,  1, -1

        , 1, -1,  1
        , 1, -1, -1
        ,-1, -1,  1
        ,-1, -1, -1

        , 1,  1,  1
        , 1, -1,  1
        ,-1,  1,  1
        ,-1, -1,  1

        , 1,  1, -1
        , 1, -1, -1
        ,-1,  1, -1
        ,-1, -1, -1 ]
    );
    vertices = vertices.map(function(v) { return v * size; });
    var vertexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertexBuff.itemSize = 3;
    vertexBuff.numItems = vertices.length / vertexBuff.itemSize;

    // Init colors
    var colors = new Float32Array(
        [ 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1

        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1

        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1

        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1

        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1

        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1
        , 1, 0, 0, 1 ]
    );
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    colorBuff.itemSize = 4;
    colorBuff.numItems = colors.length / colorBuff.itemSize;

    // Init indices
    var indices = new Uint16Array(
        [ 0, 2, 1
        , 2, 3, 1

        , 4, 6, 5
        , 6, 7, 5

        , 8,10, 9
        ,10,11, 9

        ,12,14,13
        ,14,15,13

        ,16,18,17
        ,18,19,17

        ,20,22,21
        ,22,23,21 ]
    );
    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    indexBuff.itemSize = 1;
    indexBuff.numItems = indices.length / indexBuff.itemSize;

    // Init normals
    var normals = new Float32Array(
        [ 1,  0,  0
        , 1,  0,  0
        , 1,  0,  0
        , 1,  0,  0

        ,-1,  0,  0
        ,-1,  0,  0
        ,-1,  0,  0
        ,-1,  0,  0

        , 0,  1,  0
        , 0,  1,  0
        , 0,  1,  0
        , 0,  1,  0

        , 0, -1,  0
        , 0, -1,  0
        , 0, -1,  0
        , 0, -1,  0

        , 0,  0,  1
        , 0,  0,  1
        , 0,  0,  1
        , 0,  0,  1

        , 0,  0, -1
        , 0,  0, -1
        , 0,  0, -1
        , 0,  0, -1 ]
    );
    var normalBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    normalBuff.itemSize = 3;
    normalBuff.numItems = vertices.length / normalBuff.itemSize;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

function makeWheel(gl, radius, vSlices, hSlices) {
    var buffs = makeSphere(gl, radius, vSlices, hSlices);
    
    var availColors = [
        [1, 0, 0, 1],
        [0, 1, 0, 1],
        [0, 0, 1, 1]
    ];

    var colors = [];
    for (var i = 0; i < buffs.colorBuff.numItems; ++i) {
        colors.push(...availColors[Math.floor(i/2)%3]);
    }
    colors = new Float32Array(colors);
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        colors,
        gl.STATIC_DRAW
    );
    colorBuff.itemSize = 4;
    colorBuff.numItems = colors.length / colorBuff.itemSize;
    buffs.colorBuff = colorBuff;

    return buffs;
}

function makeSphere(gl, radius, vSlices, hSlices) {
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
        vertices.map(function(v) { return v * radius; })
    );
    var vertexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertexBuff.itemSize = 3;
    vertexBuff.numItems = vertices.length / vertexBuff.itemSize;
    
    // Init colors
    var colors = [];
    for (var i = 0; i < 2 + vSlices * hSlices; ++i) {
        colors.push(0, 0, 1, 1);
    }
    colors = new Float32Array(colors);
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        colors,
        gl.STATIC_DRAW
    );
    colorBuff.itemSize = 4;
    colorBuff.numItems = colors.length / colorBuff.itemSize;

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
    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );
    indexBuff.itemSize = 1;
    indexBuff.numItems = indices.length / indexBuff.itemSize;

    // Init normals
    var normals = [0, -1, 0];
    for (var hSlice = 0; hSlice < hSlices; ++hSlice) {
        var y = -1 + 2 * (hSlice + 1) / (hSlices + 1);
        var r = Math.sqrt(1 - y*y);
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            var x = r * Math.cos(2 * Math.PI * vSlice / vSlices);
            var z = r * Math.sin(2 * Math.PI * vSlice / vSlices);
            normals.push(x, y, z);
        }
    }
    normals.push(0, 1, 0);
    normals = new Float32Array(vertices);
    var normalBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    normalBuff.itemSize = 3;
    normalBuff.numItems = normals.length / normalBuff.itemSize;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

function makeCylinder(gl, bRadius, tRadius, height, vSlices, hSlices) {
    // Init vertices
    var vertices = [0, -height / 2.0, 0];
    for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
        var y = -height / 2.0;
        var x = bRadius * Math.cos(2 * Math.PI * vSlice / vSlices);
        var z = bRadius * Math.sin(2 * Math.PI * vSlice / vSlices);
        vertices.push(x, y, z);
    }
    for (var hSlice = 0; hSlice < hSlices; ++hSlice) {
        var prop = hSlice / (hSlices - 1);
        var y = -height / 2.0 + height * prop;
        var r = bRadius * (1 - prop) + tRadius * prop;
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            var x = r * Math.cos(2 * Math.PI * vSlice / vSlices);
            var z = r * Math.sin(2 * Math.PI * vSlice / vSlices);
            vertices.push(x, y, z);
        }
    }
    for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
        var y = height / 2.0;
        var x = tRadius * Math.cos(2 * Math.PI * vSlice / vSlices);
        var z = tRadius * Math.sin(2 * Math.PI * vSlice / vSlices);
        vertices.push(x, y, z);
    }
    vertices.push(0, height / 2.0, 0);
    vertices = new Float32Array(vertices);
    var vertexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertexBuff.itemSize = 3;
    vertexBuff.numItems = vertices.length / vertexBuff.itemSize;

    // Init colors
    var colors = [];
    for (var i = 0; i < vertices.length; ++i) {
        colors.push(0, 1, 0, 1);
    }
    colors = new Float32Array(colors);
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    colorBuff.itemSize = 4;
    colorBuff.numItems = colors.length / colorBuff.itemSize;

    // Init indices
    var indices = [];
    for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
        indices.push(0, 1 + (vSlice + 1) % vSlices, 1 + vSlice);
    }
    function indexer(h, v) {
        return 1 + vSlices + h * vSlices + v % vSlices;
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
            indexer(hSlices    , vSlice    ),
            indexer(hSlices    , vSlice + 1),
            indexer(hSlices + 1, 0         )
        );
    }
    indices = new Uint16Array(indices);
    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        indices,
        gl.STATIC_DRAW
    );
    indexBuff.itemSize = 1;
    indexBuff.numItems = indices.length / indexBuff.itemSize;

    // Init normals
    var normals = [0, -1, 0];
    for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
        normals.push(0, -1, 0);
    }
    for (var hSlice = 0; hSlice < hSlices; ++hSlice) {
        for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
            normals.push(
                Math.cos(2 * Math.PI * vSlice / vSlices),
                ((bRadius - tRadius) / 2) / height,
                Math.sin(2 * Math.PI * vSlice / vSlices)
            );
        }
    }
    for (var vSlice = 0; vSlice < vSlices; ++vSlice) {
        normals.push(0, 1, 0);
    }
    normals.push(0, 1, 0);
    normals = new Float32Array(normals);
    var normalBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    normalBuff.itemSize = 3;
    normalBuff.numItems = normals.length / normalBuff.itemSize;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

export { makeCube, makeSphere, makeCylinder, makeFloor, makeWheel };
