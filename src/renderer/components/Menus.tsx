import { useState } from "react";

import Tasks from './Tasks'
import Wallets from './Wallets'
import Settings from './Settings'
import GasWindow from './gasWindow';
import Stats from './Stats';
import Tools from './Tools';

const Maincontent = () => {
  const [currentOpen, setCurrentOpen] = useState(0);

  const [walletsBalances, setWalletsBalances] = useState<any>([]);

  const [results, setResults] = useState<any>([]);

  const[taskStatuses, setTaskStatuses] = useState<any>([]);
  const[txInfo, setTxInfo] = useState<any>([]);

  return (
    <div className="select-none">
      <div className="fixed bg-gray-800 w-56 h-screen">
        <div className="pt-10 flex flex-col h-full">
            <div className="bg-blue-500 w-2 h-5 bottom-[10px] rounded-full" style={{position: "absolute", left: 60, top: (currentOpen * 48) + 245, transition: "all .2s"}}/>
            <div className="mx-auto mt-[200px] text-lg select-none gap-5 flex flex-col">
              <div onClick={() => setCurrentOpen(0)} className={currentOpen == 0 ? "cursor-pointer text-white transition-all" : "cursor-pointer text-gray-300 transition-all hover:text-gray-200"}>Tasks</div>
              <div onClick={() => setCurrentOpen(1)} className={currentOpen == 1 ? "cursor-pointer text-white transition-all" : "cursor-pointer text-gray-300 transition-all hover:text-gray-200"}>Wallets</div>
              <div onClick={() => setCurrentOpen(2)} className={currentOpen == 2 ? "cursor-pointer text-white transition-all" : "cursor-pointer text-gray-300 transition-all hover:text-gray-200"}>Stats</div>
              <div onClick={() => setCurrentOpen(3)} className={currentOpen == 3 ? "cursor-pointer text-white transition-all" : "cursor-pointer text-gray-300 transition-all hover:text-gray-200"}>Tools</div>
              <div onClick={() => setCurrentOpen(4)} className={currentOpen == 4 ? "cursor-pointer text-white transition-all" : "cursor-pointer text-gray-300 transition-all hover:text-gray-200"}>Settings</div>
            </div>
            <GasWindow/>
        </div>
      </div>
      <div className="bg-gray-600 h-screen">
        <div className="pt-10 pl-56 h-full">
          {currentOpen === 0 ? (<Tasks taskStatuses={taskStatuses} setTaskStatuses={setTaskStatuses} txInfo={txInfo} setTxInfo={setTxInfo}/>):(<></>)}
          {currentOpen === 1 ? (<Wallets walletsBalances={walletsBalances} setWalletsBalances={setWalletsBalances}/>):(<></>)}
          {currentOpen === 2 ? (<Stats results={results} setResults={setResults}/>):(<></>)}
          {currentOpen === 3 ? (<Tools/>):(<></>)}
          {currentOpen === 4 ? (<Settings/>):(<></>)}
        </div>
      </div>
    </div>
  );
}

export default Maincontent;