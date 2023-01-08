---
title: "Eigenvectors and Eigenvalues"
date: 2023-01-01T15:45:24Z
series: ["Single Value Decomposition"]
series_weight: 1
imports: ["import * as MINTER from '/js/minter.js'", "import * as THREE from 'three'"]
---

{{<script>}}
    let canvas = new MINTER.Canvas(400, 400);
    let scene = new MINTER.Grid(canvas);
    let controls = {
        lambda: 0,
    };
    let vectors = {
        zero: new THREE.Vector3(0, 0, 0),
        matrix: [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1),
        ],
        offset: [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0),
        ]
    }
    let colors = {
        weak: [
            MINTER.COLORS.red[0],
            MINTER.COLORS.green[0],
            MINTER.COLORS.blue[0],
        ],
        strong: [
            MINTER.COLORS.red[4],
            MINTER.COLORS.green[4],
            MINTER.COLORS.blue[4],
        ]
    };
    let arrows = {
        matrix: vectors.matrix.map((vector, i) =>
            new MINTER.Arrow(colors.weak[i], null,
                { vector: vectors.zero },
                {
                    vector: vectors.matrix[i],
                    geometry: "cone",
                    drag: () => {
                        arrows.offset[i].refresh();
                        arrows.final[i].refresh();
                    }
                }
            )
        ),
        offset: vectors.offset.map((vector, i) => {
            let end = new THREE.Vector3();
            let update = () => end.subVectors(vectors.matrix[i], vector);
            return new MINTER.Arrow(colors.weak[i], update,
                { vector: vectors.matrix[i] },
                { vector: end, geometry: "cone" },
            );
        }),
        final: vectors.matrix.map((vector, i) => {
            let end = new THREE.Vector3();
            let update = () => end.subVectors(vector, vectors.offset[i]);
            return new MINTER.Arrow(colors.strong[i], update,
                { vector: vectors.zero },
                { vector: end, geometry: "cone" },
            );
        })
    };
    canvas.gui.add(controls, "lambda", -5, 5, 0.1).name("λ").onChange((lambda) => {
        vectors.offset.forEach((vector, i) => {
            vector.setComponent(i, lambda);
        });
        arrows.offset.forEach((arrow, i) => {
            arrow.refresh();
            arrows.final[i].refresh();
        });
    });
    scene.add(...arrows.matrix, ...arrows.offset, ...arrows.final);
    canvas.run();
    return canvas.canvas;
{{</script>}}
