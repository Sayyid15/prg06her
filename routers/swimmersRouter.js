const express = require("express");
const router = express.Router();
const Swimmer = require("../models/swimmersModel");

function currentItems(total, start, limit) {
    let items = 0;

    items = Math.ceil(limit);

    if (!limit) {
        items = total
    }

    if (!start) {
        items = total
    }

    return items
}

function currentPage(total, start, limit) {

    let currentPage = Math.ceil(start / limit)


    if (!limit) {
        currentPage = 1
    }

    if (!start) {
        currentPage = 1
    }

    return currentPage

}

function lastPageItem(total, limit) {

    return Math.ceil((total - limit) + 1);

    // limit = 5
    // pages = 4

    // total = 18
    // result = 14
}


function numberOfPages(total, start, limit) {

    let totalPages = Math.ceil(total / limit);

    if (!limit || limit === 0) {
        totalPages = 1;
    }

    if (!start || start === 0) {
        totalPages = 1;
    }

    return totalPages
}

function nextPageItem(total, start, limit) {

    let nextPage = Math.ceil(start / limit) + 1

    if (!limit) {
        nextPage = 1
    }

    if (!start) {
        nextPage = 1
    }

    return nextPage
}

function previousPageItem(total, start, limit) {

    let previousPage = Math.ceil(start / limit) + 1

    if (!limit) {
        previousPage = 1
    }

    if (!start) {
        previousPage = 1
    }

    return previousPage
}

function giveURI(uriType, total, start, limit) {
    let uri = ""

    switch (uriType) {
        case "first":
            uri = `?start=1&limit=${limit}`
            break
        case "last":
            uri = `?start=${lastPageItem(total, limit)}&limit=${limit}`
            break
        case "next":
            uri = `?start=${start + limit}&limit=${limit}`
            break
        case "previous":
            uri = `?start=${start - limit}&limit=${limit}`
            break
    }

    if (!limit) {
        uri = ""
    }
    if (!start) {
        uri = ""
    }

    return uri
}


function lastPage(total, start, limit) {
    let lastPage = Math.ceil(total / limit)

    if (!start) {
        lastPage = 1
    }

    if (!limit) {
        lastPage = 1
    }

    return lastPage
}

// Create route / get
router.get("/", async (req, res) => {
    console.log("GET");

    const page = parseInt(req.query.page);
    const start = parseInt(req.query.start)

    // const start = parseInt(req.query.start);

    let limit = parseInt(req.query.limit);
    const totalItems = await Swimmer.count();

    const startIndex = (page - 1) * limit;

    if(req.header('Accept') !== "application/json"){
        res.status(415).send();
    }

    try {
        let swimmers = await Swimmer.find().limit(limit).skip(startIndex).exec();

        let swimmerCollection = {
            items: swimmers,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}swimmers/`
                },
                collection: {
                    href: `${process.env.BASE_URI}swimmers/`
                }
            },
            pagination: {
                currentPage: currentPage(totalItems, start, limit),
                currentItems: currentItems(totalItems, start, limit),
                totalPages: numberOfPages(totalItems, start, limit),
                totalItems: totalItems,

                _links: {
                    first: {
                        page: 1,
                        href: `${process.env.BASE_URI}swimmers/${giveURI("first", totalItems, start, limit)}`
                    },
                    last: {
                        page: lastPage(totalItems, start, limit),
                        href: `${process.env.BASE_URI}swimmers/${giveURI("last", totalItems, start, limit)}`
                    },

                    next: {
                        page: nextPageItem(totalItems, start, limit),
                        href: `${process.env.BASE_URI}swimmers/${giveURI("next", totalItems, start, limit)}`
                    },
                    previous: {
                        page: previousPageItem(totalItems, start, limit),
                        href: `${process.env.BASE_URI}swimmers/${giveURI("previous", totalItems, start, limit)}`
                    }

                }
            }
        }

        res.json(swimmerCollection);
    } catch {
        res.status(500).send()
    }
})

// create route detail get
router.get("/:_id", async (req, res) => {
    try {
        let swimmer = await Swimmer.findById(req.params._id)
        if (swimmer == null) {
            res.status(404).send();
        } else {
            res.json(swimmer)
        }
    }catch{
        res.status(415).send();
    }

})

//middleware for headers in post
router.post("/", async (req, res, next) => {
    console.log("Middleware to check content type for post")
    if(req.header("Content-Type") !== "application/json" && req.header("Content-Type") !== "application/x-www-form-urlencoded"){
        res.status(400).send();
    } else{
        next();
    }
})

//middleware against empty values post
router.post("/", async (req, res, next) => {
    console.log("Middleware to check for empty values for post")
    if(req.body.name && req.body.country && req.body.stroke){
        next();
    } else{
        res.status(400).send();
    }
})

// create route / post
router.post("/", async (req, res) => {
    console.log("POST");

    // Deze info moet uit request komen
    let swimmer = new Swimmer({
        name: req.body.name,
        country: req.body.country,
        stroke: req.body.stroke
    })

    try {
         await swimmer.save();

        res.status(201).send();
    } catch {
        res.status(500).send();
    }
})

//middleware for headers in put
router.put("/:_id", async (req, res, next) => {
    console.log("Middleware to check content type for post")
    if(req.header("Content-Type") !== "application/json" && req.header("Content-Type") !== "application/x-www-form-urlencoded"){
        res.status(400).send();
    } else{
        next();
    }
})

//middleware against empty values put
router.put("/:_id", async (req, res, next) => {
    console.log("PUT Middleware to check for empty values for post")
    if(req.body.name && req.body.country && req.body.stroke){
        next();
    } else{
        res.status(400).send();
    }
})

router.put("/:_id", async (req, res) => {

    let swimmer = await Swimmer.findOneAndUpdate(req.params,
        {
            name: req.body.name,
            country: req.body.country,
            stroke: req.body.stroke
        })

    try {
        swimmer.save();

        res.status(203).send();
    } catch {
        res.status(500).send();
    }
})

// Create route / delete
router.delete("/:_id", async (req, res) => {
    try {
        await Swimmer.findByIdAndDelete(req.params._id);

        res.status(204).send();

    } catch {
        res.status(404).send();
    }
})

// Create route / options
router.options("/", (req, res) => {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.send("");
})

// options for detail: OPTIONS /id
router.options("/:id", async (req, res) => {
    res.set({
        'Allow': 'GET, PUT, DELETE, OPTIONS'
    }).send()
})

module.exports = router;