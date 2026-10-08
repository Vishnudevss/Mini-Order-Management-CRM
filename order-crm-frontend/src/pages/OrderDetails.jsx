import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

if (loading) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loading order...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait while we fetch the order details.
          </p>

        </div>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <div className="rounded-xl border border-red-200 bg-white p-10 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-900">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <span className="text-xl text-red-600 dark:text-red-400">
              !
            </span>
          </div>

          <h2 className="font-semibold text-gray-900 dark:text-white">
            Unable to load order
          </h2>

          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>

          <Link
            to="/orders"
            className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            ← Back to Orders
          </Link>

        </div>

      </div>
    </div>
  );
}

if (!order) {
  return null;
}

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


      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Order Details
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {order.orderNumber}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View customer information, order status and purchased items.
          </p>
        </div>


        {/* Status */}
        <div className="flex flex-wrap gap-2">

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              order.status === "paid"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : order.status === "pending"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                : order.status === "refunded"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Payment: {order.status}
          </span>


          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              order.fulfillmentStatus === "fulfilled"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : order.fulfillmentStatus === "partial"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {order.fulfillmentStatus || "unfulfilled"}
          </span>

        </div>

      </div>


      {/* Information Cards */}
      <div className="mb-6 grid gap-5 lg:grid-cols-2">

        {/* Customer */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Customer
            </h2>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Customer information
            </p>
          </div>


          <div className="space-y-5 p-5">

            {/* Name */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                {(order.customerName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Name
                </p>

                <p className="font-medium text-gray-900 dark:text-white">
                  {order.customerName || "-"}
                </p>
              </div>

            </div>


            {/* Email */}
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Email
              </p>

              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {order.customerEmail || "-"}
              </p>
            </div>

          </div>

        </div>


        {/* Order Information */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Order Information
            </h2>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Payment and fulfillment details
            </p>
          </div>


          <div className="grid grid-cols-2 gap-5 p-5">

            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Payment Status
              </p>

              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {order.status}
              </p>
            </div>


            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Fulfillment
              </p>

              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {order.fulfillmentStatus || "unfulfilled"}
              </p>
            </div>


            <div className="col-span-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Order Date
              </p>

              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(order.orderDate).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Order Items */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Order Items
            </h2>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Products included in this order
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {order.items?.length || 0} items
          </span>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">

              <tr>

                <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Product
                </th>

                <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  SKU
                </th>

                <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Quantity
                </th>

                <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Price
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

              {order.items?.map((item) => (

                <tr
                  key={item.id}
                  className="transition-colors hover:bg-blue-50/40 dark:hover:bg-gray-800/60"
                >

                  {/* Product */}
                  <td className="px-5 py-4">

                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>

                  </td>


                  {/* SKU */}
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {item.sku || "-"}
                  </td>


                  {/* Quantity */}
                  <td className="px-5 py-4">

                    <span className="inline-flex min-w-8 justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.quantity}
                    </span>

                  </td>


                  {/* Price */}
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {order.currency} {item.price}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* Total */}
        <div className="border-t border-gray-200 bg-gray-50/70 px-5 py-5 dark:border-gray-800 dark:bg-gray-800/30">

          <div className="flex items-center justify-between sm:justify-end sm:gap-10">

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order Total
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                Including all items
              </p>
            </div>

            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.currency} {order.totalAmount}
            </p>

          </div>

        </div>

      </div>

    </div>
  </div>
);


}

export default OrderDetails;