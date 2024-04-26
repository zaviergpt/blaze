
const fs = require("fs")

const http = require("http")
const cors = require("cors")
const express = require("express")

const QRCode = require("qrcode")

const { WebSocketServer } = require("ws")
const { v4: uuidv4 } = require("uuid")

const app = express()
const server = http.createServer(app)
const io = new WebSocketServer({ noServer: true })

const router = {
    media: express.Router(),
    accounts: express.Router()
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

router.accounts.post("/authorize", (request, response) => {
    if (request.headers["authorization"]) {
        found = null
        data = JSON.parse(atob(request.headers["authorization"]))
        if (data.token) {
            storage.accounts.forEach((account) => {
                if (account.session === data.token) {
                    found = account.session
                }
            })
        } else if (data.code) {
            code = JSON.parse(atob(data.code))
            storage.accounts.forEach((account) => {
                if (account.username === code.username) {
                    account.session = uuidv4()
                    found = account.session
                }
            })
        }
        response.json({ token: found })
    }
})

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/PWA/index.html")
})

io.on("authentication", (socket, request) => {
    socket.on("message", (data) => {
        packet = JSON.parse(data)
        console.log(packet)
    })
    QRCode.toString(request.headers["sec-websocket-key"], {
        errorCorrectionLevel: "H",
        type: "svg"
    }, (error, data) => {
        socket.send(JSON.stringify({
            type: "qrcode",
            data: data
        }))
    })
})

server.on("upgrade", (request, socket, head) => {
    io.handleUpgrade(request, socket, head, (socket, request) => {
        if (request.url.includes("?")) {

        } else {
            io.emit("authentication", socket, request)
        }
    })
})

server.listen(5000, () => {
    if (!fs.existsSync("./storage/accounts.json")) {
        if (!fs.existsSync("./storage")) {
            fs.mkdirSync("./storage")
        }
        fs.writeFileSync("./storage/accounts.json", JSON.stringify([
            { id: uuidv4().split("-")[0], username: "zcyx09", session: null }
        ]))
    }
    storage = {
        accounts: JSON.parse(fs.readFileSync("./storage/accounts.json")),
        cached: [],
        PWA: fs.readdirSync("./PWA").map((item) => ([btoa(item).slice(0, 10), __dirname + "/PWA/" + item]))
    }
})
