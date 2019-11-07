function plasticBuffers(gl, numVertices, color) {
    // Create color arrays
    var ambient  = [];
    var diffuse  = [];
    var specular = [];
    var n        = [];
    for (var i = 0; i < numVertices; ++i) {
        ambient.push(...color);
        diffuse.push(...color);
        specular.push(1, 1, 1, 1);
        n.push(100);
    }
    ambient  = new Float32Array(ambient);
    diffuse  = new Float32Array(diffuse);
    specular = new Float32Array(specular);
    n        = new Float32Array(n);

    // Create buffers and send
    var ambBuff  = gl.createBuffer();
    var diffBuff = gl.createBuffer();
    var specBuff = gl.createBuffer();
    var nBuff    = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ambBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        ambient,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, diffBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        diffuse,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, specBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        specular,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        n,
        gl.STATIC_DRAW
    );
    ambBuff.itemSize = 4;
    ambBuff.numItems = ambient.length / ambBuff.itemSize;
    diffBuff.itemSize = 4;
    diffBuff.numItems = diffuse.length / diffBuff.itemSize;
    specBuff.itemSize = 4;
    specBuff.numItems = specular.length / specBuff.itemSize;
    nBuff.itemSize = 1;
    nBuff.numItems = n.length / nBuff.itemSize;

    return {
        ambBuff : ambBuff,
        diffBuff: diffBuff,
        specBuff: specBuff,
        nBuff   : nBuff,
    }
}

function makeFloor(gl, size, color) {
    var buffs = makeCube(gl, size, color);
    var plasticBuffs = plasticBuffers(gl, buffs.ambBuff.numItems, color);

    buffs.ambBuff  = plasticBuffs.ambBuff;
    buffs.diffBuff = plasticBuffs.diffBuff;
    buffs.specBuff = plasticBuffs.specBuff;
    buffs.nBuff    = plasticBuffs.nBuff;
    return buffs;
}

function makeCube(gl, size, color) {
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
    var plasticBuffs = plasticBuffers(gl, vertexBuff.numItems, color);

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
        ambBuff   : plasticBuffs.ambBuff,
        diffBuff  : plasticBuffs.diffBuff,
        specBuff  : plasticBuffs.specBuff,
        nBuff     : plasticBuffs.nBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

function makeWheel(gl, radius, vSlices, hSlices) {
    var buffs = makeSphere(gl, radius, vSlices, hSlices, [0, 0, 0, 0]);
    
    var availColors = [
        [1, 0, 0, 1],
        [0, 1, 0, 1],
        [0, 0, 1, 1]
    ];

    var ambient = [];
    var diffuse = [];
    for (var i = 0; i < buffs.ambBuff.numItems; ++i) {
        ambient.push(...availColors[Math.floor(i/2)%3]);
        diffuse.push(...availColors[Math.floor(i/2)%3]);
    }
    ambient = new Float32Array(ambient);
    diffuse = new Float32Array(diffuse);
    var ambBuff  = gl.createBuffer();
    var diffBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ambBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        ambient,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, diffBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        diffuse,
        gl.STATIC_DRAW
    );
    ambBuff.itemSize = 4;
    ambBuff.numItems = ambient.length / ambBuff.itemSize;
    diffBuff.itemSize = 4;
    diffBuff.numItems = diffuse.length / diffBuff.itemSize;

    buffs.ambBuff  = ambBuff;
    buffs.diffBuff = diffBuff;

    return buffs;
}

function makeLight(gl, radius, vSlices, hSlices) {
    var buffs = makeSphere(gl, radius, vSlices, hSlices, [0, 0, 0, 0]);
    
    var ambient  = [];
    var diffuse  = [];
    var specular = [];
    for (var i = 0; i < buffs.ambBuff.numItems; ++i) {
        var c = 1.7 + 1.2*Math.random();;
        ambient.push(c, c, c, 1);
        diffuse.push(0, 0, 0, 1);
        specular.push(0, 0, 0, 1);
    }
    ambient  = new Float32Array(ambient);
    diffuse  = new Float32Array(diffuse);
    specular = new Float32Array(specular);
    var ambBuff  = gl.createBuffer();
    var diffBuff = gl.createBuffer();
    var specBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ambBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        ambient,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, diffBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        diffuse,
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, specBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        specular,
        gl.STATIC_DRAW
    );
    ambBuff.itemSize = 4;
    ambBuff.numItems = ambient.length / ambBuff.itemSize;
    diffBuff.itemSize = 4;
    diffBuff.numItems = diffuse.length / diffBuff.itemSize;
    specBuff.itemSize = 4;
    specBuff.numItems = specular.length / specular.itemSize;

    buffs.ambBuff  = ambBuff;
    buffs.diffBuff = diffBuff;
    buffs.specBuff = specBuff;

    return buffs;
}

function makeSphere(gl, radius, vSlices, hSlices, color) {
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
    var plasticBuffs = plasticBuffers(gl, vertexBuff.numItems, color);

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
        ambBuff   : plasticBuffs.ambBuff,
        diffBuff  : plasticBuffs.diffBuff,
        specBuff  : plasticBuffs.specBuff,
        nBuff     : plasticBuffs.nBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

function makeCylinder(gl, bRadius, tRadius, height, vSlices, hSlices, color) {
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
    var plasticBuffs = plasticBuffers(gl, vertexBuff.numItems, color);

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
        ambBuff   : plasticBuffs.ambBuff,
        diffBuff  : plasticBuffs.diffBuff,
        specBuff  : plasticBuffs.specBuff,
        nBuff     : plasticBuffs.nBuff,
        indexBuff : indexBuff,
        normalBuff: normalBuff,
    }
}

export { makeCube, makeSphere, makeCylinder, makeFloor, makeWheel, makeLight, plasticBuffers };
