const express = require('express'),
    app = express(),
    path = require('path'),
    log = console.log,
    PORT = process.env.PORT || 8080;

    app.use(express.static(path.resolve(__dirname + './build')));

    app.get('*', (req,res)=>{
        res.sendFile(path.resolve((__dirname + './build/index.html')));
    })

    app.listen(PORT, ()=> log(We are live on port ${PORT}))