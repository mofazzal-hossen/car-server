import express from 'express'
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import cors from "cors";

// 🔴 VERY BAD (backend এ frontend import করা যাবে না)


const uri = process.env.DB_URI;

const app = express()
const port = process.env.PORT || 5000
app.use(cors());

// 🟡 Missing middleware (IMPORTANT)
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const db = client.db("CarRent")
        const carrentCollection = db.collection("carrent")



        //  SEARCH + FILTER API
        app.get("/AddCar", async (req, res) => {

            const search = req.query.search;

            let filter = {};

            if (search) {
                filter = {
                    $or: [
                        { carName: { $regex: search, $options: "i" } },
                        { brand: { $regex: search, $options: "i" } },
                    ],
                };
            }

            const result = await carrentCollection.find(filter).toArray();

            res.send(result);
        });




        // const BookingCollection = db.collection("booking")
        //get api

        app.get('/AddCar', async (req, res) => {
            const response = await carrentCollection.find().toArray();
            res.json(response);
        })


        //post api
        app.post('/AddCar', async (req, res) => {
            const carData = req.body
            console.log(carData)
            const result = await carrentCollection.insertOne(carData)
            res.json(result)
        })

        //single id for api 


        app.get('/AddCar/:id', async (req, res) => {
            const { id } = req.params
            const result = await carrentCollection.findOne({ _id: new ObjectId(id) })
            res.json(result)
        })



        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connected!");
    } finally {

        // 🔴 BIG MISTAKE: this will kill your DB connection
        // await client.close();
    }
}

run().catch(console.dir);

// 🟢 OK
app.get('/', (req, res) => {
    res.send('i am ready for server lets goooo')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})