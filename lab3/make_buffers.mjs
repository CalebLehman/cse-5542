function makeCube(gl, side) {
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
    vertices = vertices.map(function(v) { return v * side; });
    var vertexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertexBuff.itemSize = 3;
    vertexBuff.numItems = 8;

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
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, colorsAll, gl.STATIC_DRAW);
    colorBuff.itemSize = 4;
    colorBuff.numItems = 8;

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
    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    indexBuff.itemSize = 1;
    indexBuff.numItems = 36;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff
    }
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
    vertexBuff.numItems = 2 + vSlices * hSlices;
    
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
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        colorsAll,
        gl.STATIC_DRAW
    );
    colorBuff.itemSize = 4;
    colorBuff.numItems = 2 + vSlices * hSlices;

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
    indexBuff.numItems = 2*3*vSlices + 6*(hSlices-1)*vSlices;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff
    }
}

function makeCylinder(gl, bRadius, tRadius, height, vSlices, hSlices) {
    // Init vertices
    var vertices = [0, -height / 2.0, 0];
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
    vertices.push(0, height / 2.0, 0);
    vertices = new Float32Array(vertices);
    var vertexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertexBuff.itemSize = 3;
    vertexBuff.numItems = 2 + vSlices * hSlices;

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
    var colorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, colorsAll, gl.STATIC_DRAW);
    colorBuff.itemSize = 4;
    colorBuff.numItems = 2 + vSlices * hSlices;

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
    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        indices,
        gl.STATIC_DRAW
    );
    indexBuff.itemSize = 1;
    indexBuff.numItems = 2*3*vSlices + 6*(hSlices-1)*vSlices;

    return {
        vertexBuff: vertexBuff,
        colorBuff : colorBuff,
        indexBuff : indexBuff
    }
}

export { makeCube, makeSphere, makeCylinder };
