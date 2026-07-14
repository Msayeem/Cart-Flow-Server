import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Document } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const client = new MongoClient(process.env.MONGO_URI);



app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

async function connectToMongoDB() {
  try {
    await client.connect();
    const db = client.db("cart-flow");
   const productsCollection = db.collection("products");
   const cartCollection = db.collection("cart");



app.post('/products', async(req: Request, res: Response)=>{
       const product=req.body;
      const result=await productsCollection.insertOne(product);
      res.json(result);
});


app.get('/products', async (req: Request, res: Response) => {
  try {
    const { search, productType, sort } = req.query;

    const query: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      query.productName = { $regex: search, $options: 'i' }; // case-insensitive partial match
    }

    if (productType && typeof productType === 'string') {
      query.productType = productType;
    }

    let cursor = productsCollection.find(query);

    if (sort === 'asc') {
      cursor = cursor.sort({ productType: 1 });
    } else if (sort === 'desc') {
      cursor = cursor.sort({ productType: -1 });
    }

    const result = await cursor.toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});



app.get('/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const result = await productsCollection.findOne({ _id: new ObjectId(id) });
  res.json(result);
});


app.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid cart item id' });
    }

    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});


app.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const updateData = req.body;

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});


app.post('/cart', async(req: Request, res: Response)=>{
       const product=req.body;
      const result=await cartCollection.insertOne(product);
      res.json(result);
});


app.get('/cart/:buyerId', async (req: Request, res: Response) => {
  const { buyerId } = req.params;

  if (!buyerId) {
    return res.status(400).json({ error: 'buyerId is required' });
  }

  const result = await cartCollection.find({ buyerId }).toArray();
  res.json(result);
});


app.delete('/cart/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid cart item id' });
    }

    const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});


app.get('/products/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await productsCollection.find({ userId }).toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});





    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});