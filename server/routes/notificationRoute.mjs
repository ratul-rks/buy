import { Router } from "express";
import {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from "../controllers/notificationController.mjs";
import adminAuth from "../middleware/adminAuth.js";

const router = Router();

const routeValue = "/api/notification";

// Test route to verify the route is loaded
router.get(`${routeValue}/test`, (req, res) => {
  res.json({ success: true, message: "Notification route is working!" });
});

// Get all notifications (Admin only)
router.get(`${routeValue}`, adminAuth, getAllNotifications);

// Get unread count
router.get(`${routeValue}/unread-count`, adminAuth, getUnreadCount);

// Mark notification as read
router.put(`${routeValue}/mark-read`, adminAuth, markAsRead);

// Mark all notifications as read
router.put(`${routeValue}/mark-all-read`, adminAuth, markAllAsRead);

// Delete notification
router.delete(`${routeValue}`, adminAuth, deleteNotification);

// Delete all read notifications
router.delete(`${routeValue}/read`, adminAuth, deleteAllRead);

export default router;

