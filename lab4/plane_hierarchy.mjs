import { Node }
    from "./node.mjs"
import { Shape }
    from "./shape.mjs"
import { makeCube, makeSphere, makeCylinder, makeFloor, makeWheel, makeLight }
    from "./plane_buffers.mjs"
import { graphics }
    from "./lab04.mjs"

var propellerShape;
var legShape;
var axelShape;
var cockpitShape;
var wheelShape;

const headLen = 0.75;
const headTop = 0.5;
const headBot = 1.0;

const bodyLen = 2.5;
const bodyTop = 0.25;
const bodyBot = 1.0;

const wingLen = 3;
const wingOff = 1;
const finLen  = 2.5;
const propLen = 2.5;

const cpitOff = 0.75;

const legOff  = 0.5;
const legLen  = 1.2;

var shapes = new Object();
function makeShapes(gl) {
    shapes["null"] = new Shape(
        "none",
        [0, 0, 0],
        {angle: 0.0, axis: [0, 1, 0]},
        [0, 0, 0]
    );

    shapes["head"] = new Shape("head", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    graphics.addBuffers("head", makeCylinder(gl, headBot, headTop, headLen, 64, 2));
    shapes["body"] = new Shape("body", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    graphics.addBuffers("body", makeCylinder(gl, bodyBot, bodyTop, bodyLen, 64, 2));

    graphics.addBuffers("cube", makeCube(gl, 1));
    shapes["wing"] = new Shape("cube", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [wingLen / 2, 0.05, 0.5]);
    shapes["fin"] = new Shape("cube", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [finLen / 2, 0.05, 0.3]);
    shapes["prop"] = new Shape("cube", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [propLen / 2, 0.15, 0.05]);
    shapes["leg"] = new Shape("cube", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [0.05, legLen / 2, 0.15]);

    graphics.addBuffers("floor", makeFloor(gl, 1));
    shapes["floor"] = new Shape("floor", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [5, 0.01, 5]);

    graphics.addBuffers("sphere", makeSphere(gl, 1, 64, 64));
    shapes["cockpit"] = new Shape("sphere", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [0.375, 0.5, 0.75]);
    shapes["rotor"] = new Shape("sphere", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [0.25, 0.25, 0.25]);

    graphics.addBuffers("light", makeLight(gl, 1, 64, 64));
    shapes["light"] = new Shape("light", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    graphics.addBuffers("wheel", makeWheel(gl, 1, 64, 64));
    shapes["wheel"] = new Shape("wheel", [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [0.15, 0.25, 0.25]);

    graphics.addBuffers("axel", makeCylinder(gl, 0.1, 0.1, 1, 64, 2));
    shapes["axel"] = new Shape("axel", [0, 0, 0], {angle: 1.57, axis: [0, 0, 1]}, [1, 1, 1]);
}

function makePlaneScene(gl) {
    // Add necessary buffers
    makeShapes(gl);

    // Create hierarchy for the scene
    var root = new Node(shapes["null"], [0, 1.5, 0], {angle: 0.2, axis: [1, 0, 0]}, [1, 1, 1]);
    var head = new Node(shapes["head"], [0, 0, -headLen/2], {angle: -1.57, axis: [1, 0, 0]}, [1, 1, 1]);
    var body = new Node(shapes["body"], [0, 0, +bodyLen/2], {angle: +1.57, axis: [1, 0, 0]}, [1, 1, 1]);
    var wing1 = new Node(shapes["wing"], [+wingLen/2, 0, wingOff], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var wing2 = new Node(shapes["wing"], [-wingLen/2, 0, wingOff], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var cockpit = new Node(shapes["cockpit"], [0, 0.5, cpitOff], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    var propRoot = new Node(shapes["null"], [0, 0, -headLen], {angle: 0.0, axis: [0, 0, 1]}, [1, 1, 1]);
    var rotor = new Node(shapes["rotor"], [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var prop = new Node(shapes["prop"], [0, 0, -0.1], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    var finRoot = new Node(shapes["null"], [0, 0, bodyLen-0.3], {angle: 0.0, axis: [1, 0, 0]}, [1, 1, 1]);
    var fin = new Node(shapes["fin"], [0, 0, 0.3], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    var legRoot = new Node(shapes["null"], [0, 0, legOff], {angle: 0.0, axis: [1, 0, 0]}, [1, 1, 1]);
    var leg1 = new Node(shapes["leg"], [-0.5, -legLen/2, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var leg2 = new Node(shapes["leg"], [+0.5, -legLen/2, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    var wheelRoot = new Node(shapes["null"], [0, -legLen+0.05, 0], {angle: 0.0, axis: [1, 0, 0]}, [1, 1, 1]);
    var wheel1 = new Node(shapes["wheel"], [-(0.5+0.1), 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var wheel2 = new Node(shapes["wheel"], [+(0.5+0.1), 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var axel = new Node(shapes["axel"], [0, 0, 0], {angle: 0.0, axis: [1, 0, 0]}, [1, 1, 1]);

    var floor = new Node(shapes["floor"], [0, 0, 0], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);
    var light = new Node(shapes["light"], [-5, 5, -2], {angle: 0.0, axis: [0, 1, 0]}, [1, 1, 1]);

    root.addChild(head);
    root.addChild(body);
    root.addChild(wing1);
    root.addChild(wing2);
    root.addChild(cockpit);

    root.addChild(propRoot);
    propRoot.addChild(rotor);
    propRoot.addChild(prop);

    root.addChild(finRoot);
    finRoot.addChild(fin);

    root.addChild(legRoot);
    legRoot.addChild(leg1);
    legRoot.addChild(leg2);

    legRoot.addChild(wheelRoot);
    wheelRoot.addChild(wheel1);
    wheelRoot.addChild(wheel2);
    wheelRoot.addChild(axel);

    return {
        rootNode: root,
        propNode: propRoot,
        finNode:  finRoot,
        legNode:  legRoot,
        floorNode: floor,
        wheelNode: wheelRoot,
        lightNode: light,
    }
}

export { makePlaneScene };
