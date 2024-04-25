
const fs = require("fs")

const http = require("http")
const cors = require("cors")
const express = require("express")

const { WebSocketServer } = require("ws")
const { v4: uuidv4 } = require("uuid")

const app = express()
const server = http.createServer(app)
const io = new WebSocketServer({ noServer: true })

const router = {
    media: express.Router(),
    accounts: express.Router()
}

let storage = {
    cached: [],
    PWA: fs.readdirSync("./PWA").map((item) => ([btoa(item).slice(0, 10), __dirname + "/PWA/" + item]))
}

app.use(cors())
app.use(express.json())

app.use("/media", router.media)
app.use("/accounts", router.accounts)

router.media.use("/:id", (request, response) => {
    if (request.method === "GET") {
        if (storage.PWA.filter((item) => (item[0] === request.params.id))) {
            response.sendFile(storage.PWA.filter((item) => (item[0] === request.params.id))[0][1])
        }
    } else if (request.method === "POST") {

    }
})

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/PWA/index.html")
})

server.on("upgrade", (request, socket, head) => {
    io.handleUpgrade(request, socket, head, (socket, request) => {
        console.log(request.url)
    })
})

server.listen(5000, () => {
    console.log(storage)
})