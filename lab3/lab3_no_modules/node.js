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
