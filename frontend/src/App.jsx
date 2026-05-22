import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Generate from "./pages/Generate";
import MyGenerations from "./pages/MyGenerations";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

import { Toaster } from "sonner";

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors />

      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/generate/:id" element={<Generate />} />
        <Route path="/my-generations" element={<MyGenerations />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
