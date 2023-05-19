const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e0s6hkf.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const toysCollection = client.db('toyDB').collection('toys');

    // add toys
    app.post('/addToy', async(req, res) =>{
        const toy = req.body;
        const result = await toysCollection.insertOne(toy)
        res.send(result)
    })

    // get some toys for specific user
    app.get('/allToys', async(req, res) =>{
        let query = {}
        if(req.query?.email){
            query = {email : req.query.email}
        }
        const result = await toysCollection.find(query).toArray()
        res.send(result)
    })

    // get all toys
    app.get('/allToys', async(req, res)=>{
        const result = await toysCollection.find().limit(20).toArray()
        res.send(result)
    })

    // get a specific toy
    app.get('/allToys/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query)
        res.send(result)
    })

    // update a toy
    app.put('/updateToy/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)}
        const options = { upsert: true };
        const updatedToys = req.body;
        const Toy = {
            $set: {
              price: updatedToys.price,
              quantity: updatedToys.quantity,
              description: updatedToys.description
            },
          };
        const result = await toysCollection.updateOne(filter, Toy, options)
        res.send(result)
    })

    // delete my toy
    app.delete('/allToys/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.deleteOne(query)
        res.send(result)
    })

    


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('car toy server is running')
})

app.listen(port, () =>{
    console.log(`car server is running on port ${port}`);
})
