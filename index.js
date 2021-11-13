const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

//connect mongodb
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppycm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("jute-hand-crafts");
        const productsCollection = database.collection("products");
        const reviewsCollection = database.collection("reviews");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users")
        console.log('db connected');

        //get products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result)
        })
        //post products
        app.post('/product', async (req, res) => {
            const data = req.body;
            console.log(data)
            const result = await productsCollection.insertOne(data)
            res.send(result)
        })
        //get reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result)
        })
        //add review
        app.post('/review', async (req, res) => {
            const data = req.body;
            console.log(data)
            const result = await reviewsCollection.insertOne(data)
            res.json(result)
        })
        //get single products
        app.get('/products/:id', async (req, res) => {
            const id = req.params;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result)
        })
        //post order
        app.post('/addtoCart', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await ordersCollection.insertOne(data);
            res.json(result);

        })
        //get orders
        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        })
        //get orders by email
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            console.log(email)
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        })
        //find admin
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role == "admin") {
                isAdmin = true;
            }
            console.log('admin', isAdmin)
            res.json({ admin: isAdmin })
        });
        //insert users
        app.post('/user', async (req, res) => {
            const data = req.body;
            const result = await usersCollection.insertOne(data);
            res.send(result);
        })
        //make admin
        app.put('/user/admin', async (req, res) => {
            const email = req.body.email;

            const filter = { email: email }
            const doc = { $set: { role: 'admin' } }
            console.log(doc)
            const result = await usersCollection.updateOne(filter, doc);
            res.json(result)
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    console.log('hello')
    res.send('hello there')
})
app.listen(port, () => {
    console.log('listening port', port);
})