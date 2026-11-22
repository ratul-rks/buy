import { Router } from "express";
import { getChatbotResponse } from "../controllers/chatbotController.mjs";
// Optional: Add userAuth middleware if you want to track chat history per user
// import userAuth from "../middleware/userAuth.js";

const router = Router();

const routeValue = "/api/chatbot/";

// Public chatbot route (can be made user-specific with userAuth middleware)
router.post(`${routeValue}message`, getChatbotResponse);

export default router;

