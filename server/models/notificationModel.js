import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["order", "low_stock", "user_registration"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
    // For order notifications
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
    // For low stock notifications
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    // For user registration notifications
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;


