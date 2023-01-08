import * as THREE from "https://unpkg.com/three/build/three.module.js"
import { DragControls } from "https://unpkg.com/three/examples/jsm/controls/DragControls.js"; 
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'https://unpkg.com/three/examples/jsm/libs/lil-gui.module.min.js'

const PT = 0.1;

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
        this.run = () => {
            if (this.scene) {
                requestAnimationFrame(this.run);
                this.renderer.render(this.scene, this.scene.update());
            }
        }
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

const GEOMETRY = {
    cone: () => new THREE.ConeGeometry(2 * PT, 4 * PT, 16),
    tube: (v1, v2) => new THREE.TubeGeometry(
        new THREE.LineCurve(v1, v2),
        1, 1 * PT, 8
    ),
}

export class Vector extends THREE.Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y, z);
        this.updates = [];
    }

    then(...updates) {
        this.updates.push(...updates);
        return this;
    }

    update = () => {
        this.updates.forEach(update => update());
    }
}

export class Arrow extends THREE.Group {
    constructor(color, ...points) {
        super();
        this.color = color;
        this.vectors = points.map(p => p.vector.then(this.update)); 
        this.nodes = points.map(p => {
            let node = null;
            if (p.geometry) {
                node = new THREE.Mesh(
                    GEOMETRY[p.geometry](),
                    new THREE.MeshLambertMaterial({ color })
                );
                node.position.copy(p.vector);
                if (p.draggable) node.drag = () => {
                    p.vector.copy(node.position);
                    p.vector.update();
                };
            }
            return node;
        });
        this.edge = new THREE.Mesh(
            GEOMETRY["tube"](...this.vectors),
            new THREE.MeshLambertMaterial({ color })
        );
        this.add(this.edge, ...this.nodes.filter(node => node));
        this.update();
    }

    update = () => {
        this.edge.geometry = GEOMETRY["tube"](...this.vectors);
        this.nodes.forEach((node, i) => {
            if (node) {
                node.position.copy(this.vectors[i]);
                node.lookAt(this.vectors[i > 0 ? i - 1 : 0]);
                node.rotateX(-Math.PI / 2);
            }
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