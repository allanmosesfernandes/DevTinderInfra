const express = require('express');

const app = express();

app.get('/:wildcard', (req, res) => {
    const value = req.params.wildcard;
    res.json({ value })
})

app.listen(3000);
