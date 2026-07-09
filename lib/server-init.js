import { MongoClient } from "mongodb";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";

const REQUIRED_ENV_VARS = [
  "MONGO_URL",
  "DB_NAME",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "GEMINI_API_KEY"
];

// Validates required environment variables and throws if any are missing
export function validateEnv() {
  const missing = [];
  for (const name of REQUIRED_ENV_VARS) {
    if (!process.env[name] || process.env[name].trim() === "") {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    const errorMsg = `CRITICAL ENVIRONMENT ERROR: Missing required environment variable(s): ${missing.join(", ")}. Please configure them in your settings/secrets or .env file before starting the application.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// 1. MongoDB Initialization
let mongoClient = null;
let db = null;

export async function getDb() {
  validateEnv();
  
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URL);
  }
  
  if (!db) {
    try {
      await mongoClient.connect();
      db = mongoClient.db(process.env.DB_NAME);
    } catch (err) {
      const dbError = `Failed to connect to MongoDB: ${err.message}`;
      console.error(dbError);
      throw new Error(dbError);
    }
  }
  return db;
}

// 2. Razorpay Server Initialization
let razorpayInstance = null;

export function getRazorpay() {
  validateEnv();
  
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// 3. Gemini Initialization
let geminiClient = null;

export function getGemini() {
  validateEnv();
  
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClient;
}
