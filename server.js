const express = require("express")
const ejs = require("ejs")
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
// Move saltRounds to .env file later
const saltRounds = 10
const app = express()
const port = 3000 | process.env.PORT
var session = require('express-session')
var cookieParser = require('cookie-parser')



const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const auth = function (req, res, next) {
    console.log(req.session.user_id)
    if(req.session.user_id){
        req.auth = true
        return next()
    }
    else{
    res.send("You are not logged in, this page cant be accessed")
    }
}

app.set('view engine', 'ejs')
// app.use(express.json())

app.use(cookieParser())
app.use(session({
    secret: 'halla',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 5000 }
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// loads homepage
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/register', async(req, res) => {
    var email = req.body.email
    var password = req.body.password
    var retypedPassword = req.body.repassword

    const users = await prisma.user.findFirst({
        where: {
            email: email
        }
    })

    // TEST - REMOVE LATER
    console.log(users)

    if(users){return res.send("Account associated with this email address already exists")}

    if(password != retypedPassword){ return res.send("Password not the same")}

    // Hash Password before saving
    bcrypt.hash(password,saltRounds, (err, hash) => {
        const user = prisma.user.create({
            data: {
                email: email,
                password: hash
            },
        })
        .catch((err) => {
            console.log(err)
        }) 
    })

    return res.send("user Account created")
})

// process login details
app.post('/login', async(req, res) => {
    var email = req.body.email
    var password = req.body.password

    // TEST - REMOVE LATER
    console.log(email)
    console.log(password)

    const user = await prisma.user.findFirst({
        where: {
            email:email
        }
    })

    console.log(user)

    if(!user){ return res.send("Username or Password Inncorrect")}

    // compare hash with password
    bcrypt.compare(password, user.password, (err, result) => {
        if(result){
            req.session.user_id = user.id
            console.log(req.session.user_id)
            res.send("lol") 
        } 
        else 
        { 
            return res.send("Username or Password Inncorrect")
        }
    })
})

app.post('/createPost',auth, (req, res) => {
    const text = req.body.text


})
app.get("/home",auth, (req, res) => {
    res.render("home")
})

app.listen(port, () => { console.log(`Server Running on Port ${port}`)})