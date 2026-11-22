import notificationModel from "../models/notificationModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Create a notification
export const createNotification = async (type, title, message, metadata = {}) => {
  try {
    const notification = new notificationModel({
      type,
      title,
      message,
      metadata,
      orderId: metadata.orderId || null,
      productId: metadata.productId || null,
      userId: metadata.userId || null,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.log("Create Notification Error:", error);
    return null;
  }
};

// Get all notifications (Admin)
export const getAllNotifications = async (req, res) => {
  try {
    console.log("Get notifications request received");
    const { page = 1, limit = 50, type, isRead } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (type) {
      filter.type = type;
    }
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }
    
    console.log("Filter:", filter);

    const total = await notificationModel.countDocuments(filter);
    const notifications = await notificationModel
      .find(filter)
      .populate({
        path: "orderId",
        select: "amount status",
        strictPopulate: false,
      })
      .populate({
        path: "productId",
        select: "name stock",
        strictPopulate: false,
      })
      .populate({
        path: "userId",
        select: "name email",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get unread count
    const unreadCount = await notificationModel.countDocuments({
      isRead: false,
    });

    console.log(`Returning ${notifications.length} notifications`);
    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log("Get All Notifications Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.countDocuments({ isRead: false });
    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.log("Get Unread Count Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification = await notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("Mark As Read Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany({ isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("Mark All As Read Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification = await notificationModel.findByIdAndDelete(
      notificationId
    );

    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log("Delete Notification Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    const result = await notificationModel.deleteMany({ isRead: true });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.log("Delete All Read Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


