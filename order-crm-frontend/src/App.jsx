import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import OrderDetails from "./pages/OrderDetails";
import CreateOrder from "./pages/CreateOrder";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/create" element={<CreateOrder />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;