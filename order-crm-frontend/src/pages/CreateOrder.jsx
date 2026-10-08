
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, getProducts } from "../services/orderApi";

function CreateOrder() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    paid: false,
  });

  const [items, setItems] = useState([
    {
      variantId: "",
      quantity: 1,
    },
  ]);

  // Load Shopify products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Handle customer information changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // Add a new item
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        variantId: "",
        quantity: 1,
      },
    ]);
  };

  // Remove an item
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Get product price
  const getProductPrice = (variantId) => {
    const product = products.find(
      (product) => product.variantId === variantId
    );

    return product ? Number(product.price) : 0;
  };

  // Calculate order total
  const total = items.reduce((sum, item) => {
    const price = getProductPrice(item.variantId);
    const quantity = Number(item.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const orderData = {
        ...form,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: Number(item.quantity),
        })),
      };

      const createdOrder = await createOrder(orderData);

      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create order"
      );
    } finally {
      setSaving(false);
    }
  };
return (
  <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-950">
    <div className="mx-auto max-w-5xl">

      {/* Back to Orders */}
      <Link
        to="/orders"
        className="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Orders
      </Link>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Order
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new order in Shopify
        </p>
      </div>

      {/* Order Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg bg-white p-6 shadow dark:bg-gray-900"
      >

        {/* Customer Information */}
        <div className="mb-8">

          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Customer Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                placeholder="Enter first name"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                placeholder="Enter last name"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="customer@example.com"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Paid */}
            <div className="flex items-center gap-2 md:col-span-2">

              <input
                type="checkbox"
                name="paid"
                checked={form.paid}
                onChange={handleFormChange}
                className="h-4 w-4"
              />

              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mark order as paid
              </label>

            </div>

          </div>
        </div>

        {/* Order Items */}
        <div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Order Items
          </h2>

          {/* Loading Products */}
          {loading && (
            <p className="text-gray-600 dark:text-gray-400">
              Loading products...
            </p>
          )}

          {/* Product Loading Error */}
          {!loading && error && products.length === 0 && (
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Items */}
          {!loading && products.length > 0 && (
            <div className="space-y-4">

              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                >

                  <div className="grid gap-4 md:grid-cols-12 md:items-end">

                    {/* Product */}
                    <div className="md:col-span-7">

                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Product
                      </label>

                      <select
                        value={item.variantId}
                        required
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "variantId",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">
                          Select a product
                        </option>

                        {products.map((product) => (
                          <option
                            key={product.variantId}
                            value={product.variantId}
                          >
                            {product.name} - ₹{product.price}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">

                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />

                    </div>

                    {/* Item Total */}
                    <div className="md:col-span-2">

                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total
                      </p>

                      <p className="py-2 font-semibold text-gray-900 dark:text-white">
                        ₹
                        {(
                          getProductPrice(item.variantId) *
                          Number(item.quantity || 0)
                        ).toFixed(2)}
                      </p>

                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1">

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              ))}

              {/* Add Item */}
              <button
                type="button"
                onClick={addItem}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                + Add Item
              </button>

            </div>
          )}

        </div>

        {/* Error */}
        {error && products.length > 0 && (
          <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Total */}
        <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">

          <div className="text-right">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order Total
            </p>

            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{total.toFixed(2)}
            </p>

          </div>

        </div>

        {/* Create Button */}
        <div className="mt-6 flex justify-end">

          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Order"}
          </button>

        </div>

      </form>

    </div>
  </div>
);
}

export default CreateOrder;
