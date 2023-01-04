window.Canvas = class {
    constructor(width, height, createScene) {
        this.canvas = document.createElement("div");
        this.canvas.style.width = width;
        this.canvas.style.height = height;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.canvas.appendChild(this.renderer.domElement);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 50;

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

        this.animate = () => {
            requestAnimationFrame(this.animate);
            this.orbit.update();
            this.renderer.render(this.scene, this.camera);
        }
        
        createScene(this);

        this.scene.add(this.light);
        this.animate();
    }

    add(object) {
        this.scene.add(object);
        if (object.draggables) this.draggables.push(...object.draggables);
    }
}

window.Arrow = class extends THREE.Group {
    constructor(v0, v1, color, draggable) {
        super();
        this.v0 = new THREE.Vector3().fromArray(v0);
        this.v1 = new THREE.Vector3().fromArray(v1);
        this.color = color;
        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(2, 4, 16),
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
            1, 1, 8
        );
    }

    refresh() {
        this.tail.geometry = this.getTube();
        this.head.position.copy(this.v1);
        this.head.lookAt(this.v0);
        this.head.rotateX(-Math.PI / 2);
    }
}
