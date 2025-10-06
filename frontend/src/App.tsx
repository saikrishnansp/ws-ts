import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Navbar from './components/Navbar';

function App() {

  return (
    <>
      <Router> 
        <Routes> 
          <Route path="/" element={<Chat />} />
          <Route path="/navbar" element={<Navbar />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
