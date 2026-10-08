import { useEffect, useState } from "react";
import api from "../services/api";
import {Link} from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = async (showLoading = false) => {
    try {
      // Only show loading screen during the initial/manual fetch.
      // Background polling happens silently.
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/orders", {
        params: {
          search: search || undefined,
          status: status || undefined,
          fulfillmentStatus: fulfillmentStatus || undefined,
          page,
          limit: 10,
        },
      });

      setOrders(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      setError("Failed to load orders");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders(true);

    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    // Stop polling when component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, [search, status, fulfillmentStatus, page]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your Shopify orders
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-900 sm:flex-row">

          {/* Search */}
          <input
            type="text"
            placeholder="Search orders or customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 sm:flex-1"
          />

          {/* Payment Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All payment statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="authorized">Authorized</option>
            <option value="refunded">Refunded</option>
            <option value="voided">Voided</option>
          </select>

          {/* Fulfillment Status */}
          <select
            value={fulfillmentStatus}
            onChange={(e) => {
              setFulfillmentStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All fulfillment statuses</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="partial">Partially fulfilled</option>
            <option value="unfulfilled">Unfulfilled</option>
          </select>
        </div>

        {/* Initial Loading */}
        {loading && (
          <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Loading orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">
                  No orders found.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">

                    <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <tr>
                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Order
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Customer
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Payment Status
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Fulfillment
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Amount
                        </th>

                        <th className="whitespace-nowrap p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                         <td className="whitespace-nowrap p-4 font-medium">
  <Link
    to={`/orders/${order.id}`}
    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
  >
    {order.orderNumber}
  </Link>
</td>
                          <td className="whitespace-nowrap p-4 text-gray-700 dark:text-gray-300">
                            {order.customerName || "-"}
                          </td>

                          <td className="whitespace-nowrap p-4 text-gray-600 dark:text-gray-400">
                            {order.customerEmail || "-"}
                          </td>

                          <td className="whitespace-nowrap p-4 dark:text-gray-300">
                            <span className="capitalize">
                              {order.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap p-4 dark:text-gray-300">
                            <span className="capitalize">
                              {order.fulfillmentStatus || "unfulfilled"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap p-4 text-gray-700 dark:text-gray-300">
                            {order.currency} {order.totalAmount}
                          </td>

                          <td className="whitespace-nowrap p-4 text-gray-600 dark:text-gray-400">
                            {new Date(
                              order.orderDate
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-4 border-t bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total orders:{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {total}
                    </span>
                  </p>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">

                    <button
                      onClick={() => setPage((prev) => prev - 1)}
                      disabled={page === 1}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>

                    <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
                      Page{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {page}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {totalPages}
                      </span>
                    </span>

                    <button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={page === totalPages}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Next
                    </button>

                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default Orders;