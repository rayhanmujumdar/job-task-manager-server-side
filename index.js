const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config()
var jwt = require('jsonwebtoken');

//middle ware
app.use(cors())
app.use(express.json())

// heroku deploy link
//https://boiling-lake-25232.herokuapp.com/ 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.olmvk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

// jwt verify
const verify = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) {
        return res.send({message: 'Unauthorized',status: 401})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.send({message: 'Forbidden',status: 403})
        }
        req.decoded = decoded
        next()
    })
}
const run = async () => {
    try {
        await client.connect()
        const taskCollection = client.db('myTask').collection('task')
        // post task data
        app.post('/task', verify, async (req, res) => {
            const taskData = req.body
            const email = req.body.email
            const decoded = req.decoded.email
            if (decoded === email) {
                const result = await taskCollection.insertOne(taskData)
                res.send(result)
            } else {
                res.send({
                    message: 'Unauthorized',
                    status: 401
                })
            }
        })
        // get the task data api
        app.get('/task', async (req, res) => {
            const query = req.query
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })
        // update task data
        app.put('/task/:id', verify, async (req, res) => {
            const id = req.params.id
            const filter = {
                _id: ObjectId(id)
            }
            const body = req.body.complete
            const email = req.body.email
            const decoded = req.decoded.email
            console.log(email, decoded)
            if (decoded === email) {
                const options = {
                    upsert: true
                }
                const updateDoc = {
                    $set: {
                        completed: body
                    }
                }
                const result = await taskCollection.updateOne(filter, updateDoc, options)
                res.send(result)
            } else {
                res.send({
                    message: 'Unauthorized',
                    status: 401
                })
            }

        })

        // delete task
        app.delete('/task/:id', verify, async (req, res) => {
            const id = req.params
            const decoded = req.decoded.email
            const email = req.body.email
            if (decoded === email) {
                const filter = {
                    _id: ObjectId(id)
                }
                const result = await taskCollection.deleteOne(filter)
                res.send(result)
            } else{
                res.send({message: 'Unauthorized',status: 401})
            }
        })
        // jwt add to secure api
        app.post('/login', (req, res) => {
            const email = req.body.email
            const token = jwt.sign({
                email
            }, process.env.JWT_SECRET, {
                expiresIn: '1d'
            })
            res.send({
                token
            })
        })
    } finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('this my task manager')
})

app.listen(port, () => {
    console.log("this my port is " + port)
})