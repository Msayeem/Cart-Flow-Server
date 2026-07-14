import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Document } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const client = new MongoClient(process.env.MONGO_URI);

// --- Serverless-safe cached connection ---
// On Vercel, module-level state can persist across invocations *within the same
// warm container*, but a fresh cold start re-runs this file. Caching the promise
// (not just the client) avoids opening a duplicate connection if multiple
// requests hit a cold container concurrently before the first connect() resolves.
let dbConnectionPromise: Promise<{
  productsCollection: Collection<Document>;
  cartCollection: Collection<Document>;
}> | null = null;

function getDb() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = client.connect().then(() => {
      const db = client.db("cart-flow");
      return {
        productsCollection: db.collection("products"),
        cartCollection: db.collection("cart"),
      };
    });
  }
  return dbConnectionPromise;
}

// Middleware: ensure DB is connected before any route handler runs
app.use(async (req, res, next) => {
  try {
    await getDb();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/products", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const product = req.body;
    const result = await productsCollection.insertOne(product);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.get("/products", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const { search, productType, sort } = req.query;

    const query: Record<string, unknown> = {};

    if (search && typeof search === "string") {
      query.productName = { $regex: search, $options: "i" };
    }

    if (productType && typeof productType === "string") {
      query.productType = productType;
    }

    let cursor = productsCollection.find(query);

    if (sort === "asc") {
      cursor = cursor.sort({ productType: 1 });
    } else if (sort === "desc") {
      cursor = cursor.sort({ productType: -1 });
    }

    const result = await cursor.toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// NOTE: this route must stay ABOVE /products/:id, otherwise "/products/user/x"
// gets matched by /products/:id first (with "user" treated as the id).
app.get("/products/user/:userId", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const { userId } = req.params;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    const result = await productsCollection.find({ userId }).toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const id = req.params.id;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const result = await productsCollection.findOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const { id } = req.params;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.patch("/products/:id", async (req: Request, res: Response) => {
  try {
    const { productsCollection } = await getDb();
    const { id } = req.params;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const updateData = req.body;

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.post("/cart", async (req: Request, res: Response) => {
  try {
    const { cartCollection } = await getDb();
    const product = req.body;
    const result = await cartCollection.insertOne(product);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

app.get("/cart/:buyerId", async (req: Request, res: Response) => {
  try {
    const { cartCollection } = await getDb();
    const { buyerId } = req.params;

    if (!buyerId) {
      return res.status(400).json({ error: "buyerId is required" });
    }

    const result = await cartCollection.find({ buyerId }).toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.delete("/cart/:id", async (req: Request, res: Response) => {
  try {
    const { cartCollection } = await getDb();
    const { id } = req.params;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid cart item id" });
    }

    const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cart item" });
  }
});

// Local dev: run a normal listener.
// On Vercel, this file is imported and the default export below is used instead —
// app.listen is simply never called in that environment.
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export default app;