---
title: "Spectral Decomposition"
date: 2023-01-01T15:54:39Z
draft: true
series: ["Single Value Decomposition"]
series_weight: 2
imports: ["import * as MINTER from '/js/minter.js'", "import * as THREE from 'three'"]
---

{{<script>}}
    let canvas = new MINTER.Canvas(400, 400);
    let scene = new MINTER.Grid(canvas);
    let zero = new MINTER.ReactiveArray([0, 0, 0], [0, 0, 0], [0, 0, 0]);
    let a = new MINTER.ReactiveArray([0.3, 0.6, 0.8], [-0.2, -0.6, 0.2], [-0.7, -0.3, 0.5]);
    a.update();
    let matrix = new MINTER.ReactiveArray([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    matrix.update();
    let final = new MINTER.FunctionOfArray(
        (matrix, a) => math.multiply(matrix, a),
        matrix, a);
    final.update();
    let animation = new MINTER.AnimationArray(1, matrix, final, MINTER.matrix, MINTER.linear, true);
    animation.update();
    scene.add(
        new MINTER.Arrows(zero, matrix, [
            { color: MINTER.COLORS.red[4] },
            { color: MINTER.COLORS.green[4] },
            { color: MINTER.COLORS.blue[4] },
         ], true),
        new MINTER.Arrows(zero, animation, [
            { color: MINTER.COLORS.red[0] },
            { color: MINTER.COLORS.green[0] },
            { color: MINTER.COLORS.blue[0] },
        ], false),
    );
    canvas.animate(animation);
    canvas.run();
    return canvas.canvas;
{{</script>}}
