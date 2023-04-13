
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser")

// Import the mongoose module
const mongoose = require("mongoose");

// Set up default mongoose connection
const mongoDB = "mongodb://127.0.0.1/swimmers";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create webserver
const app = express();

// parse application x-form
app.use(bodyParser.urlencoded({ extended: false }))

// parse application json
app.use(bodyParser.json())

const swimmersRouter = require("./routers/swimmersRouter");

// Create route /
app.use("/swimmers/", swimmersRouter);


// Start webserver on port 8000
app.listen(8000, () => {
    console.log("Express Started");
})