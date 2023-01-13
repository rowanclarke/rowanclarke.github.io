import renderMathInElement from "https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.mjs";
renderMathInElement(document.body, {
    delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
    ]
});