const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umvg5wn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const taskCollection = client.db('taskManagementDB').collection('allTask')

        // add task from client side
        app.post('/addedtask', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task)
            res.send(result)
        })

        // get task from database and send it to the client
        app.get('/alltask', async (req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })
        // get individual task by id
        app.get('/task/:id', async (req, res) => {
            const id = new ObjectId(req.params.id)
            const query = { _id: id }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        // update status from client side
        app.patch('/statusUpdate/:id', async (req, res) => {
            const id = new ObjectId(req.params.id)
            const query = { _id: id }
            const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    status: 'completed'
                },
            };
            const result = await taskCollection.updateOne(query, updatedStatus, options);
            res.send(result)
        })
        // update task
        app.put('/updatedTask/:id', async (req, res) => {
            const id = new ObjectId(req.params.id)
            const query = { _id: id }
            const updatedTask = req.body
            const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    ...updatedTask
                },
            };
            const result = await taskCollection.updateOne(query, updatedStatus, options);
            res.send(result)
        })
        

        // delete task from client side
        app.delete('/deletedTask/:id', async (req, res) => {
            const id = new ObjectId(req.params.id)
            const query = { _id: id }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })







        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('task management server is running')
})

app.listen(port, () => {
    console.log(`task management server is listening on port ${port}`)
})