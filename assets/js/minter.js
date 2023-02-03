import * as THREE from "https://cdn.jsdelivr.net/npm/three/build/three.module.js"
import { DragControls } from "https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/DragControls.js"; 
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/lil-gui.module.min.js'

const PT = 0.1;

function range(n) {
    return [...Array(n).keys()];
}

function copy(v, vector) {
    range(3).forEach(i => v[i] = vector.getComponent(i));
}

export class Canvas {
    constructor(width, height) {
        this.canvas = document.createElement("div");
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.style.position = "relative";
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.canvas.appendChild(this.renderer.domElement);
        this.gui = new GUI( { container: this.canvas } );
        this.gui.domElement.style.top = 0;
        this.gui.domElement.style.right = 0;
        this.gui.domElement.style.position = "absolute";
        this.width = width;
        this.height = height;
        this.scene = null;
        this.animations = [];
        this.time = Date.now();
        this.run = () => {
            if (this.scene) {
                requestAnimationFrame(this.run);
                let now = Date.now();
                let delta = (now - this.time) / 1000;
                this.time = now;
                this.animations.forEach(animation => animation.next(delta));
                this.renderer.render(this.scene, this.scene.update());
            }
        }
    }

    animate(...animations) {
        this.animations.push(...animations);    
    }
}

class Scene extends THREE.Scene {
    constructor(canvas) {
        super();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.camera.position.z = 5;
        this.light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this.orbit = new OrbitControls(this.camera, canvas.renderer.domElement);
        this.draggables = [];
        this.drag = new DragControls(this.draggables, this.camera, canvas.renderer.domElement);
        this.drag.addEventListener('drag', (event) => {
            event.object.drag();
        });
        this.drag.addEventListener('dragstart', (event) => {
            this.orbit.enabled = false;
            event.object.material.emissive.set(0xaaaaaa);
        });
        this.drag.addEventListener('dragend', (event) => {
            this.orbit.enabled = true;
            event.object.material.emissive.set(0x000000);
        });
        this.drag.addEventListener('hoveron', (event) => {
            event.object.material.emissive.set(0x404040);
        });
        this.drag.addEventListener('hoveroff', (event) => {
            event.object.material.emissive.set(0x000000);
        });
        this.add(this.light);
        canvas.scene = this;
    }

    addDraggables(...objects) {
        objects.forEach(object => {
            if (object.drag) this.draggables.push(object);
            if (object.children) this.addDraggables(...object.children);
        });
    }

    add(...objects) {
        this.addDraggables(...objects);
        super.add(...objects);
    }

    update() {
        this.orbit.update();
        return this.camera;
    }
}

export class Grid extends Scene {
    constructor(dom) {
        super(dom);
        this.grid = new THREE.GridHelper(10, 10, COLORS.gray, COLORS.dark_gray);
        this.add(this.grid);
    }
}

export class Reactive {
    constructor(data) {
        this._data = data;
        this.func = typeof(this._data) == "function";
        this.data = () => this.func ? this.__data: this._data;
        this.updates = [];
    }

    then(...updates) {
        this.updates.push(...updates);
        return this;
    }

    update = () => {
        if (this.func) this.__data = this._data();
        if (this.data()) {
            let i = 0;
            let update;
            while (update = this.updates[i]) {
                update();
                i++;
            }
        }
    }
}

export class ReactiveArray extends Reactive {
    constructor(...data) {
        super(() => this.reactives.map(reactive => reactive.data()));
        this.reactives = data.map(element => new Reactive(element).then(this.update));
    }
}

export class FunctionOf extends Reactive {
    constructor(func, ...params) {
        super(() => func(...params.map(param => param.data())));
        params.forEach(param => param.then(this.update));
    }
}

export class FunctionOfArray extends FunctionOf {
    constructor(func, ...params) {
        super(func, ...params);
        this.reactives = [];
        this.then(() => {
            let data = this.data();
            for (let i = this.reactives.length; i < data.length; i++)
                this.reactives[i] = new FunctionOf(array => array[i], this);
        });
    }
}

const GEOMETRY = {
    cone: () => new THREE.ConeGeometry(2 * PT, 4 * PT, 16),
    tube: (v1, v2) => new THREE.TubeGeometry(
        new THREE.LineCurve(
            // TODO: Reuse vectors
            new THREE.Vector3().fromArray(v1),
            new THREE.Vector3().fromArray(v2)),
        1, 1 * PT, 8
    )
}

export class Mesh extends THREE.Object3D {
    constructor(material, update, geometry, ...params) {
        super();
        this.update = update;
        this.geometry = geometry;
        this.params = params.map(p => p.then(this.update));

        this.mesh = new THREE.Mesh(
            this.getGeometry(),
            new THREE.MeshLambertMaterial(material)
        );

        this.add(this.mesh);
    }

    withPosition(position, draggable=false) {
        this._position = position.then(this.update);
        if (draggable) {
            this.mesh.drag = () => {
                copy(this._position.data(), this.mesh.position);
                this._position.update();
            };
        }
        return this;
    }

    getGeometry = () => {
        return GEOMETRY[this.geometry](...this.params.map(param => param.data()));
    }
}

export class Cube extends THREE.Group {
    constructor(position, material, draggable) {
        super();
        this.cube = new Mesh(material, () => {
            this.cube.mesh.position.fromArray(this.cube._position.data());
        }, "cone").withPosition(position, draggable);
        this.cube.update();
        this.add(this.cube);
    }
}

export class Arrow extends THREE.Group {
    constructor(a, b, material, draggable) {
        super();
        this.tube = new Mesh(material, () => {
            this.tube.mesh.geometry = this.tube.getGeometry();
        }, "tube", a, b);
        this.head = new Mesh(material, () => {
            this.head.mesh.position.fromArray(this.head._position.data());
            this.head.mesh.lookAt(new THREE.Vector3().fromArray(a.data()));
            this.head.mesh.rotateX(-Math.PI / 2);
        }, "cone").withPosition(b, draggable);
        this.head.update();
        a.then(this.head.update);
        this.add(this.tube, this.head);
    }
}

export class Group extends THREE.Group {
    constructor(...params) { // param.reactives.length changes
        super();
        this.params = params.map(param => param.then(this.update));
    }

    update = () => {
        let n = Math.min(...this.params.map(param => {
            let i = param.reactives.map(reactive => reactive.data()).indexOf(undefined);
            return (i == -1) ? param.reactives.length : i;
        }));
        for (let i = 0; i < n; i++) {
            let child = this.children[i];
            if (child) child.visible = true;
            else
                this.add(this.new(i, ...this.params.map(param => param.reactives[i])));
        }
        for (let i = n; i < this.children.length; i++)
            this.children[i].visible = false;
    }
}

export class Arrows extends Group {
    constructor(as, bs, materials, draggable) {
        super(as, bs);
        this.materials = materials;
        this.draggable = draggable;
        this.update();
    }

    new(i, a, b) {
        return new Arrow(a, b, this.materials[i % this.materials.length], this.draggable);
    }
}

export let array = (before, after, t) => 
    range(before.length).map(i => before[i] * (1 - t) + after[i] * t);

export let matrix = (before, after, t) => 
    math.add(math.multiply(1 - t, before), math.multiply(t, after));

export let linear = t => t[0];
export let ease = t => (1 - math.cos(t[0] * math.PI)) / 2;

export class Animation extends FunctionOf {
    constructor(loop=false, interpolation=linear, ...animaitons) {
        let t = new Reactive([0]);
        let time = animaitons.reduce((acc, animaiton) => acc + (animaiton.time ?? 0), 0);
        let intervals = animaitons.map((acc => animaiton => acc += (animaiton.time ?? 0) / time)(0));
        let states = animaitons.map(animaiton => animaiton.state);
        super((t, ...states) => {
            let i = intervals.findIndex(interval => t[0] <= interval);
            return animaitons[i].transition(states[i], states[i+1], interpolation(t));
        }, t, ...states);
        this.t = t;
        this.time = time;
        this.loop = loop;
        this.running = true;
    }

    next(delta) {
        if (this.running) {
            this.t.data()[0] += delta / this.time;
            if (this.t.data()[0] > 1) {
                this.t.data()[0] = (this.loop) ? 0 : 1
                this.running = this.loop;
            }
            this.t.update();
        }
    }
}

export class AnimationArray extends Animation {
    constructor(loop=false, interpolation=linear, ...animaitons) {
        super(loop, interpolation, ...animaitons);
        this.reactives = [];
        this.then(() => {
            let data = this.data();
            for (let i = this.reactives.length; i < data.length; i++)
                this.reactives[i] = new FunctionOf(array => array[i], this);
        });
    }
}

export const COLORS = {
    red: [0xF7A1A3,
        0xFF8080,
        0xFC6255,
        0xE65A4C,
        0xCF5044],
    blue: [0xC7E9F1,
        0x9CDCEB,
        0x58C4DD,
        0x29ABCA,
        0x1C758A],
    green: [0xC9E2AE,
        0xA6CF8C,
        0x83C167,
        0x77B05D,
        0x699C52],
    yellow: [0xFFF1B6,
        0xFFEA94,
        0xFFFF00,
        0xF4D345,
        0xE8C11C],
    teal: [0xACEAD7,
        0x76DDC0,
        0x5CD0B3,
        0x55C1A7,
        0x49A88F],
    purple: [0xCAA3E8,
        0xB189C6,
        0x9A72AC,
        0x715582,
        0x644172],
    maroon: [0xECABC1,
        0xEC92AB,
        0xC55F73,
        0xA24D61,
        0x94424F],
    pink: 0xD147BD,
    orange: 0xFF862F,
    gray_brown: 0x736357,
    dark_gray: 0x444444,
    gray: 0x888888,
    light_gray: 0xBBBBBB,
    black: 0x000000,
    white: 0xFFFFFF,
    light_brown: 0xCD853F,
    dark_brown: 0x8B4513,
    dark_blue: 0x236B8E,
}