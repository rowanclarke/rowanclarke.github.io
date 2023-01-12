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
    let lambda = new MINTER.Reactive([0]);
    let zero = new MINTER.ReactiveArray([0, 0, 0], [0, 0, 0], [0, 0, 0]);
    let matrix = new MINTER.ReactiveArray([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    let final = new MINTER.FunctionOfArray(
        (matrix, lambda) => math.subtract(matrix, math.multiply(lambda[0], math.identity(3)))._data,
        matrix, lambda);
    let eigens = new MINTER.FunctionOfArray(
        matrix => {
            let eigs; 
            try {
                eigs = math.eigs(math.matrixFromColumns(...matrix)).vectors
                .filter(vector => vector.find(e => typeof(e) != "number") === undefined)
                .map(vector => vector[1] < 0 ? math.multiply(-1, vector) : vector)
                .map(vector => math.divide(vector, math.norm(vector)));
            } catch (e) {
                eigs = [];
            }
            return eigs;
        },
        matrix);
    let objects = [
        new MINTER.Arrows(zero, matrix, true),
        new MINTER.Arrows(matrix, final, false),
        new MINTER.Arrows(zero, final, false),
        new MINTER.Arrows(zero, eigens, false),
    ];
    canvas.gui.add({ lambda: lambda.data()[0] }, "lambda", -5, 5, 0.1).name("λ").onChange((_lambda) => {
        lambda.data()[0] = _lambda;
        lambda.update();
    });
    scene.add(...objects);
    canvas.run();
    return canvas.canvas;
{{</script>}}
