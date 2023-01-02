window.Canvas = class {
    constructor(width, height, createScene) {
        this.canvas = document.createElement("div");
        this.canvas.style.width = width;
        this.canvas.style.height = height;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.canvas.appendChild(this.renderer.domElement);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

        this.animate = () => {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
        }
        
        createScene(this);
        
        this.animate();
    }
}

window.Arrow = class {
    constructor(color) {
        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(10, 20, 16),
            new THREE.MeshLambertMaterial({ color })
        );
    }
}
