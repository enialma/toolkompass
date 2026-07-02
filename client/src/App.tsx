import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Dashboard />
    </Router>
  );
}
