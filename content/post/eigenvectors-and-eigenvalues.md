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
    //
    let lambda = new MINTER.Reactive(0);
    let zero = new MINTER.Reactive([0, 0, 0]);
    let matrix = new MINTER.ReactiveArray([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    let final = new MINTER.FunctionOf(
        (matrix, lambda) => console.log("Final", matrix, lambda),
        matrix, lambda);
    let objects = [
        new MINTER.Arrows([
            MINTER.COLORS.red[4],
            MINTER.COLORS.green[4],
            MINTER.COLORS.blue[4],
        ], matrix, true)
    ];
    canvas.gui.add({ lambda: lambda.data }, "lambda", -5, 5, 0.1).name("λ").onChange(lambda.update);
    scene.add(...objects);
    canvas.run();
    return canvas.canvas;
{{</script>}}
