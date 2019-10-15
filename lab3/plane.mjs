import { Shape }
    from "./shape.mjs"
import { Node }
    from "./node.mjs"
import { makeCube, makeSphere, makeCylinder }
    from "./make_buffers.mjs"
import { graphics }
    from "./lab03.mjs"

function makePlaneScene(gl) {
    // Add necessary buffers
    graphics.addBuffers("cube", makeCube(gl, 1));
    graphics.addBuffers("sphere", makeSphere(gl, 1, 32, 32));
    graphics.addBuffers("cylinder", makeCylinder(gl, 1, 0.5, 1, 32, 2));

    // Create shapes for the scene
    var empty = new Shape(
        "none",
        [0, 0, 0],
        {angle: 0.0, axis: [0, 1, 0]},
        [0, 0, 0],
        "all"
    );

    var floor = new Shape(
        "cube",
        [0, 0, 0],
        {angle: 0.0, axis: [0, 0, 1]},
        [5, 0.1, 5],
        "all"
    );

    var sphere = new Shape(
        "sphere",
        [0, 0, 0],
        {angle: 0.0, axis: [0, 0, 1]},
        [1, 1, 1],
        "all"
    );

    // Create hierarchy for the scene
    var root = new Node(
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
    root.addChild(new Node(
            sphere,
            [0, 1, 0],
            {angle: 0.0, axis: [0, 1, 0]},
            [1, 1, 1]
        )
    );

    return root;
}

export { makePlaneScene };
