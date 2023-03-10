---
title: "Eigenvectors and Eigenvalues"
date: 2023-01-13T15:45:24Z
series: ["Single Value Decomposition"]
series_weight: 1
imports: ["import * as MINTER from '/js/minter.js'", "import * as THREE from 'three'"]
---

An **eigenvector**, $v$, for matrix $A$ is a vector that when *transformed* by $A$, stays on the *same line* as the vector, or in other words, is a scalar multiple of the vector.
This scalar is called the **eigenvalue**, $\lambda$, of $v$.
So $Av=\lambda v$ holds for all eigenvectors $v$ with eigenvalue $\lambda$.

Since $Iv=v$, we have $Av=\lambda Iv$, so $(A-\lambda I)v=0$.
So the set of eigenvectors, called the **eigenspace**, for a given $\lambda$ is $\\{v\in F^n\mid (A-\lambda I)v=0\\}=\ker(A-\lambda I)$.

Suppose that $v\neq 0$, then $Iv\neq 0$. 
So $(A-\lambda I)Iv=0$ is true *if and only if* $\det(A-\lambda I)=0$.
This determinant is called the **characteristic polynomial**, $c_A$, of $A$.
Therefore, the roots of $c_A$ are the eigenvalues of $A$.

{{<script>}}
    let canvas = new MINTER.Canvas(400, 400);
    let scene = new MINTER.Grid(canvas);
    //
    let lambda = new MINTER.Reactive([0]);
    let zero = new MINTER.ReactiveArray([0, 0, 0], [0, 0, 0], [0, 0, 0]);
    let matrix = new MINTER.ReactiveArray([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    let final = new MINTER.FunctionOfArray(
        (matrix, lambda) => math.subtract(
            matrix,
            math.multiply(lambda[0], math.identity(3))).toArray(),
        matrix, lambda);
    let eigens = new MINTER.FunctionOfArray(
        (matrix) => {
            matrix = math.matrixFromColumns(...matrix);
            let eigens;
            try {
                eigens = math.eigs(matrix);
            } catch (e) {
                return [];
            }
            let vectors = math.transpose(eigens.vectors);
            vectors = vectors
            .filter(vector => vector.find(e => typeof(e) != "number") === undefined)
            .map(vector => vector[1] < 0 ? math.multiply(-1, vector) : vector)
            .map(vector => math.divide(vector, math.norm(vector)));
            return vectors;
        },
        matrix);
    let adjEigens = new MINTER.FunctionOfArray(
        (eigens, final) => {
            return (eigens && eigens.length > 0) ? math.multiply(eigens, final) : eigens;
        },
        eigens, final);
    let objects = [
        new MINTER.Arrows(zero, matrix, [
            { color: MINTER.COLORS.red[4] },
            { color: MINTER.COLORS.green[4] },
            { color: MINTER.COLORS.blue[4] },
        ], true),
        new MINTER.Arrows(zero, eigens, [{
            color: MINTER.COLORS.light_gray,
            opacity: 0.5,
            transparent: true,
        }], false),
        new MINTER.Arrows(zero, adjEigens, [{
            color: MINTER.COLORS.light_gray
        }], false),
    ];
    canvas.gui.add({ lambda: lambda.data()[0] }, "lambda", -5, 5, 0.1).name("??").onChange((_lambda) => {
        lambda.data()[0] = _lambda;
        lambda.update();
    });
    scene.add(...objects);
    canvas.run();
    return canvas.canvas;
{{</script>}}
