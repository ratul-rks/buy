// Chatbot controller - handles chatbot interactions with product search 
import productModel from "../models/productModel.js";

// Helper function to extract product name from user message
const extractProductQuery = (message) => {
  const productKeywords = [
    "tell me about",
    "what is",
    "show me",
    "price of",
    "how much is",
    "details of",
    "information about",
    "tell me",
    "show",
    "price",
    "details",
    "info",
  ];

  // Remove common words and product keywords
  let query = message.toLowerCase();
  productKeywords.forEach((keyword) => {
    query = query.replace(keyword, "").trim();
  });

  // Remove question words
  query = query
    .replace(/\b(about|for|the|a|an|is|are|does|do|can|could|would|will)\b/gi, "")
    .trim();

  return query;
};

// Helper function to calculate discounted price
const calculatePrice = (price, discountPercentage) => {
  const discount = (price * discountPercentage) / 100;
  return (price - discount).toFixed(2);
};

// Helper function to format product information
const formatProductInfo = (product) => {
  const discountedPrice = calculatePrice(
    product.price,
    product.discountedPercentage
  );
  const savings = (product.price - discountedPrice).toFixed(2);

  let info = ` **${product.name}**\n\n`;
  info += `  **Today's Price:**\n`;
  info += `   Original: $${product.price.toFixed(2)}\n`;
  info += `   Discount: ${product.discountedPercentage}% off\n`;
  info += `   **Final Price: $${discountedPrice}** (Save $${savings})\n\n`;
  
  info += `  **Product Details:**\n`;
  info += `   • Description: ${product.description}\n`;
  if (product.brand) {
    info += `   • Brand: ${product.brand}\n`;
  }
  if (product.category) {
    info += `   • Category: ${product.category}\n`;
  }
  info += `   • Stock: ${product.stock > 0 ? `${product.stock} available` : "Out of stock"}\n`;
  info += `   • Status: ${product.isAvailable ? "✅ Available" : "❌ Unavailable"}\n`;
  
  if (product.tags && product.tags.length > 0) {
    info += `   • Tags: ${product.tags.join(", ")}\n`;
  }
  
  if (product.offer) {
    info += `   • 🎉 Special Offer Available!\n`;
  }

  return info;
};

export const getChatbotResponse = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.toLowerCase().trim();
    let botResponse = "";
    let productData = null;
    let responseType = "text";

    // Check if user is asking about a specific product
    const productQuery = extractProductQuery(message);
    
    // Try to find products matching the query
    if (productQuery && productQuery.length > 2) {
      try {
        const searchRegex = new RegExp(productQuery, "i");
        const products = await productModel
          .find({
            $and: [
              { isAvailable: true },
              {
                $or: [
                  { name: searchRegex },
                  { description: searchRegex },
                  { category: searchRegex },
                  { brand: searchRegex },
                  { tags: { $in: [searchRegex] } },
                ],
              },
            ],
          })
          .limit(5)
          .sort({ createdAt: -1 });

        if (products.length > 0) {
          // If multiple products found, show the first one with details
          if (products.length === 1) {
            productData = products[0];
            botResponse = formatProductInfo(products[0]);
            responseType = "product";
          } else {
            // Multiple products found - list them
            botResponse = `I found ${products.length} products matching "${productQuery}":\n\n`;
            products.forEach((product, index) => {
              const discountedPrice = calculatePrice(
                product.price,
                product.discountedPercentage
              );
              botResponse += `${index + 1}. **${product.name}** - $${discountedPrice} (${product.discountedPercentage}% off)\n`;
              botResponse += `   ${product.description.substring(0, 100)}...\n\n`;
            });
            botResponse += `Would you like more details about any specific product? Just ask me "tell me about [product name]" or "price of [product name]".`;
            responseType = "product_list";
          }
        }
      } catch (error) {
        console.error("Product search error:", error);
      }
    }

    // If no product was found, use general chatbot responses
    if (!productData && !botResponse) {
      // Greetings
      if (
        userMessage.includes("hello") ||
        userMessage.includes("hi") ||
        userMessage.includes("hey") ||
        userMessage.includes("greetings")
      ) {
        botResponse =
          "Hello! 👋 Welcome to our store! I'm here to help you with:\n\n" +
          "• Product information and prices\n" +
          "• Order tracking\n" +
          "• Shipping information\n" +
          "• Returns and refunds\n" +
          "• Payment methods\n" +
          "• General shopping assistance\n\n" +
          "Just ask me about any product by name, or ask me anything else!";
      }
      // Products (general)
      else if (
        userMessage.includes("product") ||
        userMessage.includes("item") ||
        userMessage.includes("shop")
      ) {
        botResponse =
          "We have a wide variety of products available! You can:\n\n" +
          "• Browse all products in the Shop section\n" +
          "• Search for specific products using the search bar\n" +
          "• Ask me about any product by name - I'll tell you the price and details!\n\n" +
          "Just ask me something like: 'Tell me about iPhone' or 'What's the price of headphones?'";
      }
      // Orders
      else if (
        userMessage.includes("order") ||
        userMessage.includes("purchase") ||
        userMessage.includes("track")
      ) {
        botResponse =
          "📦 **Order Information:**\n\n" +
          "• You can view all your orders in the Orders section of your account\n" +
          "• Each order has a unique order number for tracking\n" +
          "• Order status updates are sent via email\n" +
          "• If you need help with a specific order, please provide your order number\n\n" +
          "Need to track an order? Visit the Orders page in your account!";
      }
      // Shipping
      else if (
        userMessage.includes("shipping") ||
        userMessage.includes("delivery") ||
        userMessage.includes("ship") ||
        userMessage.includes("when will") ||
        userMessage.includes("how long")
      ) {
        botResponse =
          "🚚 **Shipping Information:**\n\n" +
          "• **Standard Shipping:** 3-5 business days - Free on orders over $50\n" +
          "• **Express Shipping:** 1-2 business days - $9.99\n" +
          "• **Overnight Shipping:** Next business day - $19.99\n\n" +
          "Shipping times are calculated from the day your order is confirmed. " +
          "You'll receive a tracking number once your order ships!";
      }
      // Returns
      else if (
        userMessage.includes("return") ||
        userMessage.includes("refund") ||
        userMessage.includes("exchange")
      ) {
        botResponse =
          "↩️ **Returns & Refunds:**\n\n" +
          "• **Return Policy:** 30-day return window for unused items in original packaging\n" +
          "• **Refund Processing:** 5-10 business days after we receive your return\n" +
          "• **How to Return:** Visit your Orders page and click 'Return' on the item\n" +
          "• **Free Returns:** We provide a prepaid return label for all returns\n\n" +
          "Items must be in original condition with tags attached. Electronics must include all accessories.";
      }
      // Payment
      else if (
        userMessage.includes("payment") ||
        userMessage.includes("pay") ||
        userMessage.includes("checkout") ||
        userMessage.includes("card") ||
        userMessage.includes("payment method")
      ) {
        botResponse =
          "💳 **Payment Methods:**\n\n" +
          "We accept the following payment methods:\n" +
          "• Credit/Debit Cards (Visa, Mastercard, American Express)\n" +
          "• PayPal\n" +
          "• Apple Pay\n" +
          "• Google Pay\n" +
          "• Stripe (Secure payment processing)\n\n" +
          "All payments are processed securely and encrypted. " +
          "We never store your full payment information on our servers.";
      }
      // Cart
      else if (
        userMessage.includes("cart") ||
        userMessage.includes("basket") ||
        userMessage.includes("bag")
      ) {
        botResponse =
          "🛒 **Shopping Cart:**\n\n" +
          "• View your cart by clicking the cart icon in the header\n" +
          "• Items in your cart are saved until you checkout or remove them\n" +
          "• You can update quantities or remove items anytime\n" +
          "• Save items for later by moving them to your wishlist\n\n" +
          "Ready to checkout? Click 'Proceed to Checkout' in your cart!";
      }
      // Price (general)
      else if (
        userMessage.includes("price") ||
        userMessage.includes("cost") ||
        userMessage.includes("how much")
      ) {
        botResponse =
          "💰 To get the price of a specific product, just ask me! For example:\n\n" +
          "• 'What's the price of iPhone?'\n" +
          "• 'How much does the headphones cost?'\n" +
          "• 'Tell me the price of laptop'\n\n" +
          "I'll show you the current price, discounts, and all product details!";
      }
      // Discount/Sale
      else if (
        userMessage.includes("discount") ||
        userMessage.includes("sale") ||
        userMessage.includes("offer") ||
        userMessage.includes("promo")
      ) {
        botResponse =
          "🎉 **Special Offers & Discounts:**\n\n" +
          "• We regularly offer discounts on various products\n" +
          "• Check the 'Offers' page for current promotions\n" +
          "• Many products have discounted prices - I can show you the details!\n" +
          "• Sign up for our newsletter to receive exclusive discount codes\n\n" +
          "Ask me about any specific product to see its current price and discounts!";
      }
      // Stock/Availability
      else if (
        userMessage.includes("stock") ||
        userMessage.includes("available") ||
        userMessage.includes("in stock") ||
        userMessage.includes("out of stock")
      ) {
        botResponse =
          "📦 **Product Availability:**\n\n" +
          "• Product availability is shown on each product page\n" +
          "• I can check stock availability for any product - just ask!\n" +
          "• Out of stock items can be added to your wishlist for notifications\n" +
          "• Popular items restock frequently\n\n" +
          "Want to check if a specific product is available? Just ask me!";
      }
      // Help
      else if (userMessage.includes("help") || userMessage.includes("support")) {
        botResponse =
          "🤝 **How I Can Help You:**\n\n" +
          "I can assist you with:\n" +
          "✅ Product information and current prices\n" +
          "✅ Order tracking and status\n" +
          "✅ Shipping options and delivery times\n" +
          "✅ Returns, refunds, and exchanges\n" +
          "✅ Payment methods and checkout\n" +
          "✅ Product availability and stock\n" +
          "✅ General shopping questions\n\n" +
          "Just ask me anything, and I'll do my best to help!";
      }
      // Contact
      else if (
        userMessage.includes("contact") ||
        userMessage.includes("email") ||
        userMessage.includes("phone") ||
        userMessage.includes("customer service")
      ) {
        botResponse =
          "📞 **Contact Us:**\n\n" +
          "• **Email:** support@orebi.com\n" +
          "• **Live Chat:** Available 24/7 (this chat!)\n" +
          "• **Contact Page:** Visit the Contact page on our website\n" +
          "• **Response Time:** We typically respond within 24 hours\n\n" +
          "For urgent matters, please use our live chat or call our customer service hotline!";
      }
      // Categories
      else if (
        userMessage.includes("category") ||
        userMessage.includes("categories") ||
        userMessage.includes("type of product")
      ) {
        botResponse =
          "🏷️ **Product Categories:**\n\n" +
          "We offer products across various categories including:\n" +
          "• Electronics\n" +
          "• Fashion & Clothing\n" +
          "• Home & Kitchen\n" +
          "• Sports & Outdoors\n" +
          "• Books & Media\n" +
          "• And many more!\n\n" +
          "Browse our Shop section to see all categories, or ask me about products in a specific category!";
      }
      // Default response
      else {
        botResponse =
          `I'm here to help! 🤔 I didn't quite understand: "${message}"\n\n` +
          `**Here's what I can help with:**\n` +
          `• Product information and prices - just ask "tell me about [product name]" or "price of [product name]"\n` +
          `• Orders, shipping, returns, and payments\n` +
          `• General shopping assistance\n\n` +
          `Try asking me something like:\n` +
          `• "What products do you have?"\n` +
          `• "Tell me about iPhone"\n` +
          `• "What's the price of headphones?"\n` +
          `• "Shipping information"\n\n` +
          `Or visit our FAQ page for more detailed answers!`;
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: botResponse,
      timestamp: new Date(),
      type: responseType,
    };

    // Include product data if available
    if (productData) {
      response.product = {
        _id: productData._id,
        name: productData.name,
        price: productData.price,
        discountedPercentage: productData.discountedPercentage,
        discountedPrice: parseFloat(
          calculatePrice(productData.price, productData.discountedPercentage)
        ),
        description: productData.description,
        brand: productData.brand,
        category: productData.category,
        stock: productData.stock,
        isAvailable: productData.isAvailable,
        images: productData.images,
        tags: productData.tags,
        offer: productData.offer,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing chatbot request",
      error: error.message,
    });
  }
};

