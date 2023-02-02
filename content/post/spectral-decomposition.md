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
    let a = new MINTER.ReactiveArray([1, 4, 3], [-1, -3, 4], [-2, 3, -1]);
    a.update();
    let matrix = new MINTER.ReactiveArray([1, 2, 0], [5, 1, -2], [4, 3, 1]);
    matrix.update();
    let final = new MINTER.FunctionOfArray(
        (matrix, a) => math.multiply(matrix, a),
        matrix, a);
    final.update();
    let animation = new MINTER.Animation(matrix.reactives[0], final.reactives[0], MINTER.lerpArray, 1, true);
    animation.update();
    scene.add(
        new MINTER.Arrows(zero, matrix, [
            { color: MINTER.COLORS.red[4] },
            { color: MINTER.COLORS.green[4] },
            { color: MINTER.COLORS.blue[4] },
         ], true),
        new MINTER.Arrow(zero.reactives[0], animation,
            { color: MINTER.COLORS.red[4] }
        , false),
    );
    canvas.animate(animation);
    canvas.run();
    return canvas.canvas;
{{</script>}}
