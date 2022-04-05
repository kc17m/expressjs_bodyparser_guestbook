const express = require("express")
const bodyParser = require("body-parser")
const { body, validationResult } = require("express-validator")
const fs = require("fs")

const PORT = 9010
const app = express()
app.set("view engine", "ejs")

let users = [
    {
        name: "Testuser",
        username: "username",
        email: "test@gmain.com",
        comment: "test comment"
    }
]

fs.readFile("./data.json", 'utf8', (err, data) => {
    if (err) {
        console.log("Error in readFile error.json");
        return
    }
    else {
        users = JSON.parse(data);
    }
})

app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, _, next) => {
    console.log("new request", req.method, req.url)
    next()
})


app.get("/", (_, res) => {
    res.render("home", { users })
})

app.post("/",
    body("name")
        .isLength({ min: 1, max: 40 })
        .withMessage("name must be at least 1 char and max 40 chars long"),
    body("username")
        .isLength({ min: 1, max: 40 })
        .withMessage("username must be at least 1 char and max 40 chars long"),
    body("email").isEmail()
        .withMessage("valid email format required"),
    body("comment").isLength({ min: 1, max: 190 })
        .withMessage("message required, max length: 190 chars"),
    (req, res) => {
        console.log(users)
        const newUser = req.body
        console.log(newUser)
        const errors = validationResult(req)
        const isValidUser = errors.isEmpty()
        if (!isValidUser) {
            const validationErrors = errors.array()
            res.render("invalidInput", { description: "sorry, your input was invalid - please give it another try", validationErrors })
            return
        }

        const userExistsAlready = users.find(user => user.username === newUser.username)
        if (userExistsAlready) {
            res.render("invalidInput", { description: "Hey, it seems you are already registered for this guestbook", validationErrors: [] })
            return
        }

        users.push(newUser)
        res.redirect("/")
        console.log(users)

        let userJson = JSON.stringify(users)
        console.log(userJson)

        fs.writeFile("data.json", userJson, err => {
            if (err) throw err;
            console.log("new data added to json")
        })
    })


app.use((req, res) => {
    console.log(req.method, req.url, "route was not found ...")
    res.end()
})



app.listen(PORT, () => console.log("server listening on Port", PORT))