import { useState } from "react";
import { FiCopy, FiCheck, FiChevronDown, FiChevronRight } from "react-icons/fi";
import Title from "../components/ui/title";
import Container from "../components/Container";

const ApiDocumentation = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    auth: true,
    products: true,
    users: true,
    cart: false,
    addresses: false,
    orders: false,
    categories: false,
    brands: false,
    dashboard: false,
    contact: false,
    payment: false,
    checkout: false,
    chatbot: false,
  });

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CodeBlock = ({ code, id }) => (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        title="Copy to clipboard"
      >
        {copiedId === id ? (
          <FiCheck className="text-green-400" />
        ) : (
          <FiCopy />
        )}
      </button>
    </div>
  );

  const EndpointCard = ({ method, path, description, auth, requestBody, response, queryParams, id }) => {
    const methodColors = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      DELETE: "bg-red-500",
      PATCH: "bg-purple-500",
    };

    const fullUrl = `${baseUrl}${path}`;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded text-white text-sm font-semibold ${methodColors[method]}`}
            >
              {method}
            </span>
            <code className="text-lg font-mono text-gray-800">{path}</code>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{description}</p>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold text-gray-700">Full URL:</span>
            <div className="mt-1">
              <CodeBlock code={fullUrl} id={`url-${id}`} />
            </div>
          </div>

          {auth && (
            <div>
              <span className="text-sm font-semibold text-gray-700">Authentication:</span>
              <p className="text-sm text-gray-600 mt-1">
                {auth === "admin" && "🔒 Admin authentication required (Bearer token)"}
                {auth === "user" && "🔒 User authentication required (Bearer token)"}
                {auth === "optional" && "🔓 Authentication optional"}
                {auth === "none" && "🔓 Public endpoint (no authentication required)"}
              </p>
            </div>
          )}

          {queryParams && (
            <div>
              <span className="text-sm font-semibold text-gray-700">Query Parameters:</span>
              <CodeBlock code={queryParams} id={`query-${id}`} />
            </div>
          )}

          {requestBody && (
            <div>
              <span className="text-sm font-semibold text-gray-700">Request Body:</span>
              <CodeBlock code={requestBody} id={`request-${id}`} />
            </div>
          )}

          {response && (
            <div>
              <span className="text-sm font-semibold text-gray-700">Response Example:</span>
              <CodeBlock code={response} id={`response-${id}`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, description, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all"
    >
      <div className="text-left">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <FiChevronDown className="text-gray-600" />
      ) : (
        <FiChevronRight className="text-gray-600" />
      )}
    </button>
  );

  return (
    <Container className="py-8">
      <Title title="API Documentation" />
      
      <div className="mt-6 mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Base URL</h2>
        <p className="text-blue-800">
          All API endpoints are relative to: <code className="bg-blue-100 px-2 py-1 rounded">{baseUrl}</code>
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Note: For authenticated requests, include the Bearer token in the Authorization header:
          <code className="bg-blue-100 px-2 py-1 rounded ml-2">
            Authorization: Bearer YOUR_TOKEN
          </code>
        </p>
      </div>

      <div className="space-y-6">
        {/* Authentication Endpoints */}
        <div>
          <SectionHeader
            title="Authentication"
            description="User and admin authentication endpoints"
            sectionKey="auth"
          />
          {expandedSections.auth && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="auth-1"
                method="POST"
                path="/api/user/register"
                description="Register a new user account"
                auth="none"
                requestBody={`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}`}
                response={`{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
              />

              <EndpointCard
                id="auth-2"
                method="POST"
                path="/api/user/login"
                description="User login"
                auth="none"
                requestBody={`{
  "email": "john@example.com",
  "password": "password123"
}`}
                response={`{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
              />

              <EndpointCard
                id="auth-3"
                method="POST"
                path="/api/user/admin"
                description="Admin login"
                auth="none"
                requestBody={`{
  "email": "admin@example.com",
  "password": "admin123"
}`}
                response={`{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}`}
              />
            </div>
          )}
        </div>

        {/* Products Endpoints */}
        <div>
          <SectionHeader
            title="Products"
            description="Product management endpoints"
            sectionKey="products"
          />
          {expandedSections.products && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="prod-1"
                method="GET"
                path="/api/product/list"
                description="Get list of all products with filtering and pagination"
                auth="optional"
                queryParams={`Query Parameters:
?_search=laptop          // Search by name/description
&category=electronics    // Filter by category
&brand=apple            // Filter by brand
&_type=featured         // Filter by type
&offer=true             // Filter by offer
&onSale=true            // Filter by sale
&isAvailable=true       // Filter by availability
&_page=1                // Page number
&_perPage=25            // Items per page`}
                response={`{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "price": 999,
      "discountedPercentage": 10,
      "category": "Electronics",
      "brand": "Apple",
      "stock": 50,
      "images": ["url1", "url2"],
      "description": "Latest iPhone model",
      "isAvailable": true
    }
  ],
  "total": 100,
  "currentPage": 1,
  "totalPages": 4
}`}
              />

              <EndpointCard
                id="prod-2"
                method="GET"
                path="/api/product/single"
                description="Get single product by ID"
                auth="none"
                queryParams={`Query Parameters:
?_id=product_id`}
                response={`{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "price": 999,
    "discountedPercentage": 10,
    "category": "Electronics",
    "description": "Latest iPhone model",
    "stock": 50,
    "images": ["url1", "url2"],
    "isAvailable": true
  }
}`}
              />

              <EndpointCard
                id="prod-3"
                method="POST"
                path="/api/product/add"
                description="Add a new product (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
name: "iPhone 15 Pro"
price: 999
discountedPercentage: 10
category: "Electronics"
brand: "Apple"
description: "Latest iPhone model"
stock: 50
badge: true
isAvailable: true
offer: false
tags: ["smartphone", "apple", "mobile"]
_type: "featured"
image1: File
image2: File (optional)
image3: File (optional)
image4: File (optional)`}
                response={`{
  "success": true,
  "message": "iPhone 15 Pro added and save to DB successfully"
}`}
              />

              <EndpointCard
                id="prod-4"
                method="PUT"
                path="/api/product/update/:id"
                description="Update a product (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
// Same fields as add product
// Only include fields you want to update`}
                response={`{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product object */ }
}`}
              />

              <EndpointCard
                id="prod-5"
                method="POST"
                path="/api/product/remove"
                description="Delete a product (Admin only)"
                auth="admin"
                requestBody={`{
  "_id": "product_id"
}`}
                response={`{
  "success": true,
  "message": "Product removed successfully"
}`}
              />

              <EndpointCard
                id="prod-6"
                method="POST"
                path="/api/product/update-stock"
                description="Update product stock quantity"
                auth="optional"
                requestBody={`{
  "productId": "product_id",
  "quantity": 10
}`}
                response={`{
  "success": true,
  "message": "Stock updated successfully",
  "product": {
    "_id": "product_id",
    "stock": 40,
    "soldQuantity": 10,
    "isAvailable": true
  }
}`}
              />

              <EndpointCard
                id="prod-7"
                method="GET"
                path="/api/products"
                description="Public endpoint to get all products"
                auth="none"
                queryParams={`Same query parameters as /api/product/list`}
                response={`Same response format as /api/product/list`}
              />
            </div>
          )}
        </div>

        {/* Users Endpoints */}
        <div>
          <SectionHeader
            title="Users"
            description="User management endpoints"
            sectionKey="users"
          />
          {expandedSections.users && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="user-1"
                method="GET"
                path="/api/user/users"
                description="Get all users (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`}
              />

              <EndpointCard
                id="user-2"
                method="GET"
                path="/api/user/profile"
                description="Get current user profile"
                auth="user"
                response={`{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "avatar_url",
    "addresses": []
  }
}`}
              />

              <EndpointCard
                id="user-3"
                method="PUT"
                path="/api/user/profile"
                description="Update current user profile"
                auth="user"
                requestBody={`{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "email": "newemail@example.com"
}`}
                response={`{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}`}
              />

              <EndpointCard
                id="user-4"
                method="PUT"
                path="/api/user/update/:id"
                description="Update user by ID (Admin only)"
                auth="admin"
                requestBody={`{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin"
}`}
                response={`{
  "success": true,
  "message": "User updated successfully",
  "user": { /* updated user object */ }
}`}
              />

              <EndpointCard
                id="user-5"
                method="POST"
                path="/api/user/remove"
                description="Delete a user (Admin only)"
                auth="admin"
                requestBody={`{
  "_id": "user_id"
}`}
                response={`{
  "success": true,
  "message": "User removed successfully"
}`}
              />

              <EndpointCard
                id="user-6"
                method="POST"
                path="/api/user/create-admin"
                description="Create a new admin user (Admin only)"
                auth="admin"
                requestBody={`{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}`}
                response={`{
  "success": true,
  "message": "Admin created successfully",
  "user": { /* admin user object */ }
}`}
              />
            </div>
          )}
        </div>

        {/* Cart Endpoints */}
        <div>
          <SectionHeader
            title="Shopping Cart"
            description="User cart management endpoints"
            sectionKey="cart"
          />
          {expandedSections.cart && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="cart-1"
                method="GET"
                path="/api/user/cart"
                description="Get current user's cart"
                auth="user"
                response={`{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": "product_id",
        "name": "iPhone 15 Pro",
        "price": 999,
        "quantity": 2,
        "image": "product_image_url"
      }
    ],
    "total": 1998
  }
}`}
              />

              <EndpointCard
                id="cart-2"
                method="POST"
                path="/api/user/cart/add"
                description="Add item to cart"
                auth="user"
                requestBody={`{
  "productId": "product_id",
  "quantity": 1
}`}
                response={`{
  "success": true,
  "message": "Item added to cart",
  "cart": { /* updated cart object */ }
}`}
              />

              <EndpointCard
                id="cart-3"
                method="PUT"
                path="/api/user/cart/update"
                description="Update cart item quantity"
                auth="user"
                requestBody={`{
  "productId": "product_id",
  "quantity": 3
}`}
                response={`{
  "success": true,
  "message": "Cart updated successfully",
  "cart": { /* updated cart object */ }
}`}
              />

              <EndpointCard
                id="cart-4"
                method="DELETE"
                path="/api/user/cart/clear"
                description="Clear entire cart"
                auth="user"
                response={`{
  "success": true,
  "message": "Cart cleared successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Address Endpoints */}
        <div>
          <SectionHeader
            title="User Addresses"
            description="Address management endpoints"
            sectionKey="addresses"
          />
          {expandedSections.addresses && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="addr-1"
                method="GET"
                path="/api/user/addresses"
                description="Get user addresses"
                auth="user"
                response={`{
  "success": true,
  "addresses": [
    {
      "_id": "address_id",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "isDefault": true
    }
  ]
}`}
              />

              <EndpointCard
                id="addr-2"
                method="POST"
                path="/api/user/addresses"
                description="Add new address"
                auth="user"
                requestBody={`{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}`}
                response={`{
  "success": true,
  "message": "Address added successfully",
  "address": { /* address object */ }
}`}
              />

              <EndpointCard
                id="addr-3"
                method="PUT"
                path="/api/user/addresses/:addressId"
                description="Update address"
                auth="user"
                requestBody={`{
  "street": "456 New St",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "country": "USA"
}`}
                response={`{
  "success": true,
  "message": "Address updated successfully",
  "address": { /* updated address object */ }
}`}
              />

              <EndpointCard
                id="addr-4"
                method="DELETE"
                path="/api/user/addresses/:addressId"
                description="Delete address"
                auth="user"
                response={`{
  "success": true,
  "message": "Address deleted successfully"
}`}
              />

              <EndpointCard
                id="addr-5"
                method="PUT"
                path="/api/user/addresses/:addressId/default"
                description="Set address as default"
                auth="user"
                response={`{
  "success": true,
  "message": "Default address updated successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Orders Endpoints */}
        <div>
          <SectionHeader
            title="Orders"
            description="Order management endpoints"
            sectionKey="orders"
          />
          {expandedSections.orders && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="order-1"
                method="POST"
                path="/api/order/create"
                description="Create a new order"
                auth="user"
                requestBody={`{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 999
    }
  ],
  "shippingAddress": "address_id",
  "paymentMethod": "stripe",
  "totalAmount": 1998
}`}
                response={`{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "order_id",
    "userId": "user_id",
    "items": [],
    "totalAmount": 1998,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`}
              />

              <EndpointCard
                id="order-2"
                method="GET"
                path="/api/order/my-orders"
                description="Get current user's orders"
                auth="user"
                response={`{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "items": [],
      "totalAmount": 1998,
      "status": "processing",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`}
              />

              <EndpointCard
                id="order-3"
                method="GET"
                path="/api/order/user/:orderId"
                description="Get single order by ID (User)"
                auth="user"
                response={`{
  "success": true,
  "order": {
    "_id": "order_id",
    "items": [],
    "totalAmount": 1998,
    "status": "shipped",
    "shippingAddress": {},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`}
              />

              <EndpointCard
                id="order-4"
                method="GET"
                path="/api/order/list"
                description="Get all orders (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "userId": "user_id",
      "items": [],
      "totalAmount": 1998,
      "status": "pending"
    }
  ],
  "total": 100
}`}
              />

              <EndpointCard
                id="order-5"
                method="GET"
                path="/api/order/admin/user/:userId"
                description="Get orders for specific user (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "orders": [ /* user orders */ ]
}`}
              />

              <EndpointCard
                id="order-6"
                method="GET"
                path="/api/order/stats"
                description="Get order statistics (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "stats": {
    "totalOrders": 100,
    "pendingOrders": 10,
    "processingOrders": 20,
    "shippedOrders": 50,
    "deliveredOrders": 15,
    "cancelledOrders": 5,
    "totalRevenue": 50000
  }
}`}
              />

              <EndpointCard
                id="order-7"
                method="POST"
                path="/api/order/update-status"
                description="Update order status (Admin only)"
                auth="admin"
                requestBody={`{
  "orderId": "order_id",
  "status": "shipped"
}`}
                response={`{
  "success": true,
  "message": "Order status updated successfully",
  "order": { /* updated order object */ }
}`}
              />

              <EndpointCard
                id="order-8"
                method="POST"
                path="/api/order/delete"
                description="Delete an order (Admin only)"
                auth="admin"
                requestBody={`{
  "_id": "order_id"
}`}
                response={`{
  "success": true,
  "message": "Order deleted successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Categories Endpoints */}
        <div>
          <SectionHeader
            title="Categories"
            description="Category management endpoints"
            sectionKey="categories"
          />
          {expandedSections.categories && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="cat-1"
                method="GET"
                path="/api/category"
                description="Get all categories"
                auth="none"
                response={`{
  "success": true,
  "categories": [
    {
      "_id": "category_id",
      "title": "Electronics",
      "image": "category_image_url"
    }
  ]
}`}
              />

              <EndpointCard
                id="cat-2"
                method="GET"
                path="/api/category/:id"
                description="Get single category by ID"
                auth="none"
                response={`{
  "success": true,
  "category": {
    "_id": "category_id",
    "title": "Electronics",
    "image": "category_image_url"
  }
}`}
              />

              <EndpointCard
                id="cat-3"
                method="POST"
                path="/api/category"
                description="Create new category (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
title: "Electronics"
image: File`}
                response={`{
  "success": true,
  "message": "Category created successfully",
  "category": { /* category object */ }
}`}
              />

              <EndpointCard
                id="cat-4"
                method="PUT"
                path="/api/category/:id"
                description="Update category (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
title: "Updated Category"
image: File (optional)`}
                response={`{
  "success": true,
  "message": "Category updated successfully",
  "category": { /* updated category object */ }
}`}
              />

              <EndpointCard
                id="cat-5"
                method="DELETE"
                path="/api/category/:id"
                description="Delete category (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "message": "Category deleted successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Brands Endpoints */}
        <div>
          <SectionHeader
            title="Brands"
            description="Brand management endpoints"
            sectionKey="brands"
          />
          {expandedSections.brands && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="brand-1"
                method="GET"
                path="/api/brand"
                description="Get all brands"
                auth="none"
                response={`{
  "success": true,
  "brands": [
    {
      "_id": "brand_id",
      "title": "Apple",
      "image": "brand_image_url"
    }
  ]
}`}
              />

              <EndpointCard
                id="brand-2"
                method="GET"
                path="/api/brand/:id"
                description="Get single brand by ID"
                auth="none"
                response={`{
  "success": true,
  "brand": {
    "_id": "brand_id",
    "title": "Apple",
    "image": "brand_image_url"
  }
}`}
              />

              <EndpointCard
                id="brand-3"
                method="POST"
                path="/api/brand"
                description="Create new brand (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
title: "Apple"
image: File`}
                response={`{
  "success": true,
  "message": "Brand created successfully",
  "brand": { /* brand object */ }
}`}
              />

              <EndpointCard
                id="brand-4"
                method="PUT"
                path="/api/brand/:id"
                description="Update brand (Admin only)"
                auth="admin"
                requestBody={`FormData (multipart/form-data):
title: "Updated Brand"
image: File (optional)`}
                response={`{
  "success": true,
  "message": "Brand updated successfully",
  "brand": { /* updated brand object */ }
}`}
              />

              <EndpointCard
                id="brand-5"
                method="DELETE"
                path="/api/brand/:id"
                description="Delete brand (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "message": "Brand deleted successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Dashboard Endpoints */}
        <div>
          <SectionHeader
            title="Dashboard"
            description="Admin dashboard statistics and analytics"
            sectionKey="dashboard"
          />
          {expandedSections.dashboard && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="dash-1"
                method="GET"
                path="/api/dashboard/stats"
                description="Get dashboard statistics (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "stats": {
    "totalProducts": 100,
    "totalOrders": 500,
    "totalUsers": 1000,
    "totalRevenue": 50000,
    "recentOrders": [],
    "topProducts": []
  }
}`}
              />

              <EndpointCard
                id="dash-2"
                method="GET"
                path="/api/dashboard/analytics"
                description="Get dashboard analytics (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "analytics": {
    "salesOverTime": [],
    "topCategories": [],
    "userGrowth": []
  }
}`}
              />

              <EndpointCard
                id="dash-3"
                method="GET"
                path="/api/dashboard/quick-stats"
                description="Get quick statistics (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "quickStats": {
    "todayOrders": 10,
    "todayRevenue": 5000,
    "monthlyOrders": 200,
    "monthlyRevenue": 40000
  }
}`}
              />
            </div>
          )}
        </div>

        {/* Contact Endpoints */}
        <div>
          <SectionHeader
            title="Contact"
            description="Contact form and inquiry management"
            sectionKey="contact"
          />
          {expandedSections.contact && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="contact-1"
                method="POST"
                path="/api/contact"
                description="Submit contact form"
                auth="user"
                requestBody={`{
  "subject": "Inquiry about product",
  "message": "I have a question about...",
  "category": "general"
}`}
                response={`{
  "success": true,
  "message": "Contact submitted successfully",
  "contact": {
    "_id": "contact_id",
    "userId": "user_id",
    "subject": "Inquiry about product",
    "status": "pending"
  }
}`}
              />

              <EndpointCard
                id="contact-2"
                method="GET"
                path="/api/contact/my-contacts"
                description="Get user's contact submissions"
                auth="user"
                response={`{
  "success": true,
  "contacts": [
    {
      "_id": "contact_id",
      "subject": "Inquiry about product",
      "message": "...",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`}
              />

              <EndpointCard
                id="contact-3"
                method="GET"
                path="/api/contact/admin/all"
                description="Get all contact submissions (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "contacts": [ /* all contact submissions */ ]
}`}
              />

              <EndpointCard
                id="contact-4"
                method="GET"
                path="/api/contact/admin/:id"
                description="Get contact by ID (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "contact": { /* contact object */ }
}`}
              />

              <EndpointCard
                id="contact-5"
                method="PUT"
                path="/api/contact/admin/:id/status"
                description="Update contact status (Admin only)"
                auth="admin"
                requestBody={`{
  "status": "resolved"
}`}
                response={`{
  "success": true,
  "message": "Contact status updated successfully",
  "contact": { /* updated contact object */ }
}`}
              />

              <EndpointCard
                id="contact-6"
                method="DELETE"
                path="/api/contact/admin/:id"
                description="Delete contact (Admin only)"
                auth="admin"
                response={`{
  "success": true,
  "message": "Contact deleted successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Payment Endpoints */}
        <div>
          <SectionHeader
            title="Payment"
            description="Stripe payment processing endpoints"
            sectionKey="payment"
          />
          {expandedSections.payment && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="pay-1"
                method="POST"
                path="/api/payment/stripe/create-payment-intent"
                description="Create Stripe payment intent"
                auth="user"
                requestBody={`{
  "amount": 1998,
  "currency": "usd",
  "orderId": "order_id"
}`}
                response={`{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}`}
              />

              <EndpointCard
                id="pay-2"
                method="POST"
                path="/api/payment/stripe/confirm-payment"
                description="Confirm payment"
                auth="user"
                requestBody={`{
  "paymentIntentId": "pi_xxx",
  "orderId": "order_id"
}`}
                response={`{
  "success": true,
  "message": "Payment confirmed successfully",
  "order": { /* order object */ }
}`}
              />

              <EndpointCard
                id="pay-3"
                method="POST"
                path="/api/payment/stripe/webhook"
                description="Stripe webhook endpoint (no auth required)"
                auth="none"
                requestBody={`Raw webhook payload from Stripe`}
                response={`Webhook processed`}
              />
            </div>
          )}
        </div>

        {/* Checkout Endpoints */}
        <div>
          <SectionHeader
            title="Checkout"
            description="Checkout processing endpoints"
            sectionKey="checkout"
          />
          {expandedSections.checkout && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="checkout-1"
                method="POST"
                path="/api/checkout"
                description="Process checkout and update product stock"
                auth="optional"
                requestBody={`{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ]
}`}
                response={`{
  "success": true,
  "message": "Checkout processed successfully"
}`}
              />
            </div>
          )}
        </div>

        {/* Chatbot Endpoints */}
        <div>
          <SectionHeader
            title="Chatbot"
            description="AI chatbot endpoints"
            sectionKey="chatbot"
          />
          {expandedSections.chatbot && (
            <div className="mt-4 space-y-4">
              <EndpointCard
                id="chatbot-1"
                method="POST"
                path="/api/chatbot/message"
                description="Send message to chatbot and get response"
                auth="none"
                requestBody={`{
  "message": "Tell me about iPhone",
  "userId": "user_id" // optional
}`}
                response={`{
  "success": true,
  "message": "Product information...",
  "type": "product",
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "price": 999,
    "discountedPrice": 899.1,
    "description": "...",
    "stock": 50
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ApiDocumentation;
