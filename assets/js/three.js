let pt = 0.1;

window.Grid = class {
    constructor(width, height, createScene) {
        this.canvas = document.createElement("div");
        this.canvas.style.width = width;
        this.canvas.style.height = height;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.canvas.appendChild(this.renderer.domElement);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        this.light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);

        this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        this.draggables = [];
        this.drag = new THREE.DragControls(this.draggables, this.camera, this.renderer.domElement);
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

        this.grid = new THREE.GridHelper(10, 10, COLORS.gray, COLORS.dark_gray);

        this.animate = () => {
            requestAnimationFrame(this.animate);
            this.orbit.update();
            this.renderer.render(this.scene, this.camera);
        }
        
        createScene(this);

        this.scene.add(this.light, this.grid);
        this.animate();
    }

    add(...objects) {
        objects.forEach(object => {
            this.scene.add(object);
            if (object.draggables) this.draggables.push(...object.draggables);    
        });
    }
}

window.Arrow = class extends THREE.Group {
    constructor(v0, v1, color, draggable) {
        super();
        this.v0 = new THREE.Vector3().fromArray(v0);
        this.v1 = new THREE.Vector3().fromArray(v1);
        this.color = color;
        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(2 * pt, 4 * pt, 16),
            new THREE.MeshLambertMaterial({ color })
        );
        this.tail = new THREE.Mesh(
            this.getTube(),
            new THREE.MeshLambertMaterial({ color })
        );
        if (draggable) {
            this.draggables = [this.head];
            this.head.drag = () => {
                this.v1.copy(this.head.position);
                this.refresh();
            };
        }
        this.add(this.head, this.tail);
        this.refresh();
    }

    getTube() {
        return new THREE.TubeGeometry(
            new THREE.LineCurve(this.v0, this.v1),
            1, 1 * pt, 8
        );
    }

    refresh() {
        this.tail.geometry = this.getTube();
        this.head.position.copy(this.v1);
        this.head.lookAt(this.v0);
        this.head.rotateX(-Math.PI / 2);
    }
}

window.COLORS = {
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