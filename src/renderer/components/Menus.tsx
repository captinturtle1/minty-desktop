import { useState } from "react";

import Tasks from './Tasks'
import Wallets from './Wallets'
import Settings from './Settings'
import GasWindow from './gasWindow';

const Maincontent = () => {
  const [currentOpen, setCurrentOpen] = useState(0);

  return (
    <div className="select-none">
      <div className="fixed bg-gray-800 w-56 h-screen">
        <div className="pt-10 flex flex-col h-full">
            <div className="m-auto text-white font-bold text-xl text-center select-none">
                <div onClick={() => setCurrentOpen(0)} className="my-10 cursor-pointer">Tasks</div>
                <div onClick={() => setCurrentOpen(1)} className="my-10 cursor-pointer">Wallets</div>
                <div onClick={() => setCurrentOpen(2)} className="my-10 cursor-pointer">Settings</div>
            </div>
            <GasWindow/>
        </div>
      </div>
      <div className="bg-gray-600 h-screen">
        <div className="pt-10 pl-56 h-full">
          {currentOpen === 0 ? (<Tasks/>):(<></>)}
          {currentOpen === 1 ? (<Wallets/>):(<></>)}
          {currentOpen === 2 ? (<Settings/>):(<></>)}
        </div>
      </div>
    </div>
  );
}

export default Maincontent;