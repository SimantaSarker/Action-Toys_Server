const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// ----middleware--
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sk94onm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const ToyCollection = client.db("toyDB").collection("Toys");

    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toy" };
    // const result = await ToyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toysSearchByToyName/:text", async (req, res) => {
      const search = req.params.text;
      const result = await ToyCollection.find({
        name: { $regex: search, $options: "i" },
      }).toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await ToyCollection.insertOne(toy);
      res.send(result);
    });

    // app.get("sortToys", async (req, res) => {
    //   const sortValue = req.query;
    //   if (sortValue == "asc") {
    //     const result = await ToyCollection.find();
    //   }
    // });

    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedValue = req.body;

      const toy = {
        $set: {
          quantity: updatedValue.quantity,
          price: updatedValue.price,
          details: updatedValue.details,
        },
      };
      const result = await ToyCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToyCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const result=await ToyCollection.find({}).limit(20).toArray();
      res.send(result);
    });

    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await ToyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/sorts/:id", async (req, res) => {
      const sortValue = req.params.id;
      const body = req.body;
      let query = {};
      if (sortValue == "1") {
        query = { email: body.email };

        const result = await ToyCollection.find(query)
          .sort({ price: -1 }).collation({locale:"en_US",numericOrdering:true}).toArray();
        res.send(result);
      }
      if (sortValue == "-1") {
        query = { email: body.email };
        const result = await ToyCollection.find(query) .sort({ price: 1 }).collation({locale:"en_US",numericOrdering:true}).toArray();
        res.send(result);
      }
    });


   app.get("/categories/:text",async(req,res)=>{
    const tabValue=req.params.text;
    const result=await ToyCollection.find({subCategory:tabValue}).toArray();
    res.send(result)
   })

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {

  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server connected successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
