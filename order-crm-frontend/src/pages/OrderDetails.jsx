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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-5xl rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-5xl rounded-lg bg-white p-8 text-center shadow">
          <p className="text-red-600">{error}</p>

          <Link
            to="/orders"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }
return (
  <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-950">
    <div className="mx-auto max-w-5xl rounded-lg">

      {/* Loading */}
      {loading && (
        <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            Loading order...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
          <p className="text-red-600 dark:text-red-400">
            {error}
          </p>

          <Link
            to="/orders"
            className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Orders
          </Link>
        </div>
      )}

      {/* Order */}
      {!loading && !error && order && (
        <>
          {/* Back */}
          <Link
            to="/orders"
            className="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to Orders
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order {order.orderNumber}
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Order details and items
            </p>
          </div>

          {/* Order Information */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">

            {/* Customer */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Customer
              </h2>

              <div className="space-y-3 text-sm">

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Name
                  </p>

                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.customerName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Email
                  </p>

                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.customerEmail || "-"}
                  </p>
                </div>

              </div>
            </div>

            {/* Order Info */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Information
              </h2>

              <div className="space-y-3 text-sm">

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Payment Status
                  </p>

                  <p className="font-medium capitalize text-gray-900 dark:text-white">
                    {order.status}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Fulfillment Status
                  </p>

                  <p className="font-medium capitalize text-gray-900 dark:text-white">
                    {order.fulfillmentStatus || "unfulfilled"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Order Date
                  </p>

                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Order Items */}
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">

            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Items
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <tr>

                    <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Product
                    </th>

                    <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      SKU
                    </th>

                    <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Quantity
                    </th>

                    <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {order.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 last:border-b-0 dark:border-gray-700"
                    >

                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </td>

                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {item.sku || "-"}
                      </td>

                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {item.quantity}
                      </td>

                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {order.currency} {item.price}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end border-t border-gray-200 p-6 dark:border-gray-700">

              <div className="text-right">

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>

                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {order.currency} {order.totalAmount}
                </p>

              </div>

            </div>

          </div>
        </>
      )}

    </div>
  </div>
);
}

export default OrderDetails;