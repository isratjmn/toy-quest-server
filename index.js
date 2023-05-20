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

		// BlogPage
		app.get("/blogs", async (req, res) => {
			const cursor = blogCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});
		
		// Insert
		app.post("/addtoy", async (req, res) => {
			const body = req.body;
			console.log(body);
			const result = await addToyCollection.insertOne(body);
			res.send(result);
		});

		// ViewDetails Page
		app.get("/viewdetails/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const options = {
				projection: {
					_id: 0,
					toyPhoto: 1,
					toyName: 1,
					sellerName: 1,
					sellerEmail: 1,
					toyCategory: 1,
					toyRating: 1,
					toyPrice: 1,
					quantity: 1,
					description: 1,
				},
			};
			const result = await addToyCollection.findOne(query, options);
			res.send(result);
		});

		// Update
		app.put("/updatedtoy/:id", async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			console.log(id, body);
			const filter = { _id: new ObjectId(id) };

			const toy = {
				$set: {
					toyPrice: body.toyPrice,
					quantity: body.quantity,
					description: body.description,
				},
			};
			const result = await addToyCollection.updateOne(filter, toy);
			res.send(result);
		});

		// Delete
		app.delete("/toydelete/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await addToyCollection.deleteOne(query);
			res.send(result);
		});

		// Category
		app.get("/allcategory/:category", async (req, res) => {
			console.log(req.params.category);
			const toys = await addToyCollection
				.find({ toyCategory: req.params.category })
				.toArray();
			res.send(toys);
		});

		// AllToys
		app.get("/alltoys", async (req, res) => {
			const search = req.query.search;
			console.log(search);
			// const query = { toyName: { $regex: search, $options: "i" } };
			const result = await addToyCollection.find().limit(20).toArray();
			res.send(result);
		});

		/* app.get("/mytoys/:email/", async (req, res) => {
			const query = { sellerEmail: req.params.email };
			const sort = req.query.sort;

			const options = {
				// Decendiing Sort
				sort: { toyPrice: sort === "asc" ? 1 : -1 },
				collation: { locale: "en_US", numericOrdering: true },
			};
			try {
				const result = await addToyCollection
					.find(query)
					.sort(options.sort)
					.collation(options.collation)
					.toArray();

				res.send(result);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal Server Error");
			}
		}); */

		// MyToys
		app.get("/mytoys/:email", async (req, res) => {
			const query = { sellerEmail: req.params.email };
			const sort = req.query.sort;

			const options = {
				sort: { toyPrice: sort === "asc" ? 1 : -1 },
				collation: { locale: "en_US", numericOrdering: true },
			};

			try {
				const result = await addToyCollection
					.find(query)
					.sort(options.sort)
					.collation(options.collation)
					.toArray();

				res.send(result);
			} catch (error) {
				console.error(error);
				res.status(500).send("Internal Server Error");
			}
		});

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
