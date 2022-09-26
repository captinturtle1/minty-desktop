import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import './App.css';
import { FaWind } from 'react-icons/fa';


const Home = () => {
  return (
    <div className="w-screen h-screen bg-blue-100 flex">
      <div className="m-auto flex flex-col gap-10">
        <div className="m-auto flex">
          <div className="text-white text-6xl pt-2"><FaWind/></div>
          <div className="text-7xl font-bold text-sky-400 select-none">Minty</div>
        </div>
        <div className="flex">
          <div className="bg-slate-900 text-white font-semibold m-auto px-4 py-1 rounded-full hover:bg-slate-800 cursor-pointer transition-all select-none">Start</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
