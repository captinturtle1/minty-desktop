import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import './App.css';

import Menus from './components/Menus'
import Nav from './components/nav'



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Nav/>
            <Menus/>
          </>
        } />
      </Routes>
    </Router>
  );
}
