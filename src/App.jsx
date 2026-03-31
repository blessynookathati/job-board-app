import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Bookmarks from "./pages/Bookmarks";

export default function App() {
  return (
    <BrowserRouter>
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
  <h1 className="text-xl font-bold flex items-center gap-2">
    💼 Job Board
  </h1>

  <div className="flex gap-6 text-gray-600 font-medium">
    <Link to="/" className="hover:text-blue-600">Home</Link>
    <Link to="/tracker" className="hover:text-blue-600">Bookmarks</Link>
  </div>
</div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracker" element={<Bookmarks />} />
      </Routes>
    </BrowserRouter>
  );
}