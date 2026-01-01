import express from "express"

const route = express.Router();

route.get("/", (req, res) => {
    res.json({
        "message": "Server started",
        "status": 200
    })
})

export default route;

