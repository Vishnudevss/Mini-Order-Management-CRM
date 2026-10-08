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
  <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Shopify CRM
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your Shopify orders.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total Orders
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {total}
          </p>
        </div>
      </div>


{/* Summary Cards */}
<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

  {/* Total Orders */}
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      Total Orders
    </p>

    <div className="mt-2 flex items-center justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {total}
      </p>

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <span className="text-lg">#</span>
      </div>
    </div>
  </div>


  {/* Fulfilled Orders */}
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      Fulfilled Orders
    </p>

    <div className="mt-2 flex items-center justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {orders.filter(
          (order) => order.fulfillmentStatus === "fulfilled"
        ).length}
      </p>

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <span className="text-lg">✓</span>
      </div>
    </div>
  </div>


  {/* Unfulfilled Orders */}
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      Unfulfilled Orders
    </p>

    <div className="mt-2 flex items-center justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {orders.filter(
          (order) =>
            !order.fulfillmentStatus ||
            order.fulfillmentStatus === "unfulfilled"
        ).length}
      </p>

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
        <span className="text-lg">!</span>
      </div>
    </div>
  </div>

</div>



      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">

        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filter Orders
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Search and filter orders by their current status.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search order number or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800"
            />
          </div>

          {/* Payment Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 lg:w-56"
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
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 lg:w-56"
          >
            <option value="">All fulfillment statuses</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="partial">Partially fulfilled</option>
            <option value="unfulfilled">Unfulfilled</option>
          </select>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loading orders...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Orders */}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <span className="text-xl text-gray-400">
                  —
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              {/* Table Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Order List
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Recent Shopify orders
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {orders.length} orders
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                    <tr>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Order
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Customer
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Email
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Payment
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Fulfillment
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Amount
                      </th>

                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="group transition-colors hover:bg-blue-50/40 dark:hover:bg-gray-800/60"
                      >

                        {/* Order */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <Link
                            to={`/orders/${order.id}`}
                            className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                              {(order.customerName || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {order.customerName || "-"}
                            </span>

                          </div>
                        </td>

                        {/* Email */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {order.customerEmail || "-"}
                        </td>

                        {/* Payment */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              order.status === "paid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                                : order.status === "refunded"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {order.status || "unknown"}
                          </span>
                        </td>

                        {/* Fulfillment */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              order.fulfillmentStatus === "fulfilled"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : order.fulfillmentStatus === "partial"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {order.fulfillmentStatus || "unfulfilled"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {order.currency} {order.totalAmount}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            order.orderDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {orders.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {total}
                  </span>{" "}
                  orders
                </p>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => setPage((prev) => prev - 1)}
                    disabled={page === 1}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    ← Previous
                  </button>

                  <div className="rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    {page}
                  </div>

                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page === totalPages}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Next →
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