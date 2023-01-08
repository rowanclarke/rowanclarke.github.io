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
    let indices = [0, 1, 2];
    let vectors = {
        zero: new MINTER.Vector(),
        matrix: indices.map(i =>
            new MINTER.Vector().setComponent(i, 1).then(
                () => vectors.end[i].update()
            )
        ),
        end: indices.map(i =>
            new MINTER.Vector().then(
                () => {
                    vectors.end[i].set(0, 0, 0).setComponent(i, -controls.lambda).add(vectors.matrix[i]);
                }
            )
        ),
    };
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
        matrix: indices.map(i =>
            new MINTER.Arrow(colors.weak[i],
                { vector: vectors.zero },
                {
                    vector: vectors.matrix[i],
                    geometry: "cone",
                    draggable: true,
                }
            )
        ),
        offset: indices.map(i =>
            new MINTER.Arrow(colors.weak[i],
                { vector: vectors.matrix[i] },
                { vector: vectors.end[i], geometry: "cone" },
            )
        ),
        final: indices.map(i => 
            new MINTER.Arrow(colors.strong[i], 
                { vector: vectors.zero },
                { vector: vectors.end[i], geometry: "cone" },
            )
        )
    };
    canvas.gui.add(controls, "lambda", -5, 5, 0.1).name("λ").onChange(() => {
        vectors.end.forEach(end => end.update());
    });
    scene.add(...arrows.matrix, ...arrows.offset, ...arrows.final);
    canvas.run();
    return canvas.canvas;
{{</script>}}
