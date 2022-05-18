const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const {
    MongoClient,
    ServerApiVersion
} = require('mongodb');
require('dotenv').config()

//middle ware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.olmvk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

const run = async () => {
    try{
        await client.connect()
        const taskCollection = client.db('myTask').collection('task')
        // post task data
        app.post('/task',async (req,res) => {
            const taskData = req.body
            const result = await taskCollection.insertOne(taskData)
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/',(req,res) => {
    res.send('this my task manager')
})

app.listen(port,() => {
    console.log("this my port is " + port)
})
