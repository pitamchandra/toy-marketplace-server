const express = require('express');
const cors = require('cors')
var jwt = require('jsonwebtoken');
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

const verifyJWT = (req, res, next) =>{
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: 1, message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECREET, (err, decoded) =>{
    if(err){
      return res.status(401).send({error: true, message : "unauthorize access"})
    }
    req.decoded = decoded
    next()
  })

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    

    const toysCollection = client.db('toyDB').collection('toys');


  

    // const result = toysCollection.createIndex(indexKeys, indexOptions)

    // get toys by search
    // app.get('/addToys/:text' , async(req, res) =>{
    //     const searchText = req.params.text;
    //     console.log(searchText);
    //     const result = await toysCollection.find({
    //       $or: [
    //           { title : { $regex : searchText, $options : 'i'}},
    //           { category : { $regex : searchText, $options : 'i'}},
    //       ],
    //     }).toArray()
    //     res.send(result)
    // })

    // jwt web token
    app.post('/jwt', (req, res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECREET, {expiresIn : '1h'})
      res.send({token})

    })

    // add toys
    app.post('/addToy', async(req, res) =>{
        const toy = req.body;
        const result = await toysCollection.insertOne(toy)
        res.send(result)
    })

    // get some toys for specific user
    app.get('/myToys', verifyJWT, async(req, res) =>{
      const decoded = req.decoded
      if(decoded.email !== req.query.email){
        return res.status(403).send({error:1, message:'forbidden access'})
      }
      if(req.query?.email){
          let query = {}
          query = {email : req.query.email}
          const result = await toysCollection.find(query).sort({price : 1}).toArray()
          return res.send(result)
      }
    })

    // // get all toys
    app.get('/allToys', async(req, res)=>{
        const result = await toysCollection.find().toArray()
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


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
