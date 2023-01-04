---
title: "Eigenvectors and Eigenvalues"
date: 2023-01-01T15:45:24Z
series: ["Single Value Decomposition"]
series_weight: 1
---

{{<script>}}
    let canvas = new Grid(300, 300, (canvas) => {
        let x_arr = new Arrow([0, 0, 0], [1, 0, 0], COLORS.red[3], true);
        let y_arr = new Arrow([0, 0, 0], [0, 1, 0], COLORS.green[3], true);
        let z_arr = new Arrow([0, 0, 0], [0, 0, 1], COLORS.blue[3], true);
        canvas.add(x_arr, y_arr, z_arr);
    });
    return canvas.canvas;
{{</script>}}
