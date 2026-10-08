
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
  <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">

      {/* Back */}
      <Link
        to="/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        ← Back to Orders
      </Link>


      {/* Page Header */}
      <div className="mb-7">
        <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
          Shopify CRM
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Create Order
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new order and add products for your customer.
        </p>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit}>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">

            {/* Customer Information */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Customer Information
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Enter the customer's contact details.
                </p>
              </div>


              <div className="grid gap-5 p-5 md:grid-cols-2">

                {/* First Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    placeholder="John"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                  />
                </div>


                {/* Last Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    placeholder="Doe"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                  />
                </div>


                {/* Email */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="customer@example.com"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
                  />
                </div>


                {/* Paid */}
                <div className="md:col-span-2">

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750">

                    <input
                      type="checkbox"
                      name="paid"
                      checked={form.paid}
                      onChange={handleFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Mark order as paid
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mark this order as paid when it is created.
                      </p>
                    </div>

                  </label>

                </div>

              </div>

            </div>


            {/* Order Items */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">

                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Order Items
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Select products and specify quantities.
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>

              </div>


              <div className="p-5">

                {/* Loading Products */}
                {loading && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">

                    <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Loading products...
                    </p>

                  </div>
                )}


                {/* Product Loading Error */}
                {!loading && error && products.length === 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">

                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {error}
                    </p>

                  </div>
                )}


                {/* Items */}
                {!loading && products.length > 0 && (
                  <div className="space-y-4">

                    {items.map((item, index) => (

                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600"
                      >

                        <div className="grid gap-4 md:grid-cols-12 md:items-end">

                          {/* Product */}
                          <div className="md:col-span-6">

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />

                          </div>


                          {/* Item Total */}
                          <div className="md:col-span-3">

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Item Total
                            </label>

                            <div className="flex h-11 items-center rounded-lg bg-white px-3.5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                              ₹
                              {(
                                getProductPrice(item.variantId) *
                                Number(item.quantity || 0)
                              ).toFixed(2)}
                            </div>

                          </div>


                          {/* Remove */}
                          <div className="md:col-span-1">

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="flex h-11 w-full items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/30"
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
                      className="inline-flex items-center rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    >
                      + Add Another Product
                    </button>

                  </div>
                )}

              </div>

            </div>


            {/* Error */}
            {error && products.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

          </div>


          {/* RIGHT SIDE - ORDER SUMMARY */}
          <div className="lg:col-span-1">

            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">

                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Review your order before creating it.
                </p>

              </div>


              <div className="p-5">

                {/* Items Summary */}
                <div className="space-y-3">

                  {items.map((item, index) => {

                    const product = products.find(
                      (p) => String(p.variantId) === String(item.variantId)
                    );

                    const itemTotal =
                      getProductPrice(item.variantId) *
                      Number(item.quantity || 0);

                    return (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 text-sm"
                      >

                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                            {product?.name || "Product not selected"}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity || 0}
                          </p>
                        </div>

                        <p className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          ₹{itemTotal.toFixed(2)}
                        </p>

                      </div>
                    );
                  })}

                </div>


                {/* Divider */}
                <div className="my-5 border-t border-gray-200 dark:border-gray-700" />


                {/* Total */}
                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order Total
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      All products included
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{total.toFixed(2)}
                  </p>

                </div>


                {/* Payment Status */}
                <div className="mt-5 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Payment
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        form.paid
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                      }`}
                    >
                      {form.paid ? "Paid" : "Pending"}
                    </span>

                  </div>

                </div>


                {/* Create Button */}
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
                >
                  {saving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Order...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </button>


                <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  Review the customer and products before submitting.
                </p>

              </div>

            </div>

          </div>

        </div>

      </form>

    </div>
  </div>
);


}

export default CreateOrder;
