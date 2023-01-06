---
title: "Eigenvectors and Eigenvalues"
date: 2023-01-01T15:45:24Z
series: ["Single Value Decomposition"]
series_weight: 1
imports: ["import * as MINTER from '/js/minter.js'"]
---

{{<script>}}
    let canvas = new MINTER.Grid(300, 300, (canvas) => {
        let x_arr = new MINTER.Arrow([0, 0, 0], [1, 0, 0], MINTER.COLORS.red[3], true);
        let y_arr = new MINTER.Arrow([0, 0, 0], [0, 1, 0], MINTER.COLORS.green[3], true);
        let z_arr = new MINTER.Arrow([0, 0, 0], [0, 0, 1], MINTER.COLORS.blue[3], true);
        canvas.add(x_arr, y_arr, z_arr);
    });
    return canvas.canvas;
{{</script>}}
