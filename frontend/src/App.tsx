import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";
import ErrorPage from "./components/errorpage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="*" element={<ErrorPage message="Page not found" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
