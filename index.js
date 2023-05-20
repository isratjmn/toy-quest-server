const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocimcqo.mongodb.net/?retryWrites=true&w=majority`;

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
		await client.connect();

		const blogCollection = client.db("toyQuest").collection("blogs");
		const addToyCollection = client.db("toyQuest").collection("addtoy");

		app.get("/blogs", async (req, res) => {
			const cursor = blogCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.post("/addtoy", async (req, res) => {
			const body = req.body;
			console.log(body);
			const result = await addToyCollection.insertOne(body);
			res.send(result);
		});

		app.get("/viewdetails/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const options = {
                projection: { _id: 0, toyPhoto: 1, toyName: 1, sellerName: 1, sellerEmail: 1, toyCategory: 1, toyRating: 1, toyPrice: 1, quantity: 1, description: 1  },
            };
			const result = await addToyCollection.findOne(query, options);
			res.send(result);
		});

		app.put("/updatedtoy/:id", async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			console.log(body);
			const filter = { _id: new ObjectId(id) };

			const toy = {
				$set: {
					// ...updatedToy,
					toyPrice: body.toyPrice,
					quantity: body.quantity,
					toyDetails: body.toyDetails,
				},
			};
			const result = await addToyCollection.updateOne(filter, toy);
			res.send(result);
		});

		app.delete("/toydelete/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await addToyCollection.deleteOne(query);
			res.send(result);
		})

		app.get("/allcategory/:category", async (req, res) => {
			console.log(req.params.category);
			const toys = await addToyCollection
				.find({ toyCategory: req.params.category })
				.toArray();
			res.send(toys);
		});

		app.get("/alltoys", async (req, res) => {
			const result = await addToyCollection.find({}).limit(20).toArray();
			res.send(result);
		});
		

		app.get("/mytoys/:email", async (req, res) => {
			console.log(req.params.email);
			const result = await addToyCollection
				.find({ sellerEmail: req.params.email })
				.toArray();
			res.send(result);
		});

		
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Toy Quest is Running");
});

app.listen(port, () => {
	console.log(`Toy Server is Running on the port: ${port}`);
});
