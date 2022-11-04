import { useState } from "react";

import Tasks from './Tasks'
import Wallets from './Wallets'
import Settings from './Settings'
import GasWindow from './gasWindow';
import Stats from './Stats';
import Tools from './Tools';

const Maincontent = () => {
  const [currentOpen, setCurrentOpen] = useState(0);

  return (
    <div className="select-none">
      <div className="fixed bg-gray-800 w-56 h-screen">
        <div className="pt-10 flex flex-col h-full">
            <div className="m-auto text-white text-lg text-center select-none gap-5 flex flex-col">
                <div onClick={() => setCurrentOpen(0)} className="cursor-pointer">Tasks</div>
                <div onClick={() => setCurrentOpen(1)} className="cursor-pointer">Wallets</div>
                <div onClick={() => setCurrentOpen(2)} className="cursor-pointer">Stats</div>
                <div onClick={() => setCurrentOpen(3)} className="cursor-pointer">Tools</div>
                <div onClick={() => setCurrentOpen(4)} className="cursor-pointer">Settings</div>
            </div>
            <GasWindow/>
        </div>
      </div>
      <div className="bg-gray-600 h-screen">
        <div className="pt-10 pl-56 h-full">
          {currentOpen === 0 ? (<Tasks/>):(<></>)}
          {currentOpen === 1 ? (<Wallets/>):(<></>)}
          {currentOpen === 2 ? (<Stats/>):(<></>)}
          {currentOpen === 3 ? (<Tools/>):(<></>)}
          {currentOpen === 4 ? (<Settings/>):(<></>)}
        </div>
      </div>
    </div>
  );
}

export default Maincontent;