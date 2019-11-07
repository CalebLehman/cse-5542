import { plasticBuffers }
    from "./plane_buffers.mjs"
import { graphics }
    from "./lab04.mjs"

function loadModelBuffs(gl, filename, modelName) {
    var request = new XMLHttpRequest();
    request.open("GET", filename);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            var vertices = []
            var normals  = []
            var linearizedVertices = []
            var linearizedNormals  = []
            var lines = request.responseText.split('\n');
            for (var i = 0; i < lines.length; ++i) {
                var fields = lines[i].split(/[ ,]+/);
                processFields(
                    vertices,
                    normals,
                    linearizedVertices,
                    linearizedNormals,
                    fields
                );
            }
            var linearizedIndices = []
            for (var i = 0; i < linearizedVertices.length; ++i) {
                linearizedIndices.push(i);
            }

            var vertexBuff = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linearizedVertices), gl.STATIC_DRAW);
            vertexBuff.itemSize = 3;
            vertexBuff.numItems = linearizedVertices.length / vertexBuff.itemSize;
            var normalBuff = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linearizedNormals), gl.STATIC_DRAW);
            normalBuff.itemSize = 3;
            normalBuff.numItems = linearizedNormals.length / normalBuff.itemSize;
            var indexBuff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linearizedIndices), gl.STATIC_DRAW);
            indexBuff.itemSize = 1;
            indexBuff.numItems = linearizedIndices.length / indexBuff.itemSize;

            var buffs = new Object();
            buffs.vertexBuff = vertexBuff;
            buffs.indexBuff  = indexBuff;
            buffs.normalBuff = normalBuff;

            var plasticBuffs = plasticBuffers(gl, vertexBuff.numItems, [1, 0, 0, 1]);
            buffs.ambBuff  = plasticBuffs.ambBuff;
            buffs.diffBuff = plasticBuffs.diffBuff;
            buffs.specBuff = plasticBuffs.specBuff;
            buffs.nBuff    = plasticBuffs.nBuff;
            graphics.addBuffers(modelName, buffs);
            graphics.drawScene();
        }
    };
    request.send();
}

function processFields(vertices, normals, linearizedVertices, linearizedNormals, fields) {
    if (fields.length == 0) return;

    if (fields[0] == "v") {
        vertices.push(
            parseFloat(fields[1]),
            parseFloat(fields[2]),
            parseFloat(fields[3])
        );
    }
    if (fields[0] == "vn") {
        normals.push(
            parseFloat(fields[1]),
            parseFloat(fields[2]),
            parseFloat(fields[3])
        );
    }
    if (fields[0] == "f") {
        for (var i = 0; i < 3; ++i) {
            var indices = fields[i+1].split('/');

            var vIndex = parseInt(indices[0]) - 1;
            linearizedVertices.push(
                vertices[3*vIndex],
                vertices[3*vIndex + 1],
                vertices[3*vIndex + 2]
            );

            var nIndex = parseInt(indices[2]) - 1;
            linearizedNormals.push(
                normals[3*nIndex],
                normals[3*nIndex + 1],
                normals[3*nIndex + 2]
            );
        }
    }
}

export { loadModelBuffs };
