import { useState, useEffect } from 'react';
import { createAndStoreWallet, removeWallet, removeAllWallets, getBalance, disperse, consolidate } from './walletManager';
import { FaTrash, FaKey } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BiRefresh } from 'react-icons/bi'
import wallets from '../../../wallets.json'



const Wallets = () => {
  const [createWalletName, setCreateWalletName] = useState('');
  const [createWalletAmount, setCreateWalletAmount] = useState(1);
  const [selectedMainAddress, setSelectedMainAddress] = useState<any>();
  const [selectedPk, setSelectedPk] = useState('');
  const [amountToDisperse, setAmountToDisperse] = useState(1);
  const [walletsSelected, setWalletsSelected] = useState<any>([]);
  const [walletsBalances, setWalletsBalances] = useState<any>([]);
  const [activeTransaction, setActiveTransaction] = useState(false);

  useEffect(() => {
    updateWalletBalances();
    setSelectedMainAddress(wallets.wallets[0].address);
    let result = wallets.wallets.map(a => a.address);
    let selectedIndex = result.findIndex((element) => element == wallets.wallets[0].address);
    let selectedPk = wallets.wallets[selectedIndex].privateKey;
    setSelectedPk(selectedPk);
  }, []);

  const updateWalletBalances = async () => {
    setActiveTransaction(true);
    setWalletsBalances(await getBalance(wallets.wallets));
    setActiveTransaction(false);
  }

  const disperseToWallets = async () => {
    setActiveTransaction(true);
    await disperse(walletsSelected, wallets.wallets, amountToDisperse, selectedPk);
    updateWalletBalances();
  }

  const consolidateWallets = async () => {
    setActiveTransaction(true);
    await consolidate(selectedMainAddress, walletsSelected, wallets.wallets);
    updateWalletBalances();
  }

  const handleWalletNameChange = event => {
    let limit = 12;
      setCreateWalletName(event.target.value.slice(0, limit));
  };

  const handleWalletAmountChange = event => {
    let limit = 100;
    if (event.target.value > limit) {
      setCreateWalletAmount(100);
    } else {
      setCreateWalletAmount(event.target.value);
    }
  };

  const handleDisperseAmountChange = event => {
    setAmountToDisperse(event.target.value);
  };

  const handleAddressMainSelection = event => {
    setSelectedMainAddress(event.target.value);
    let result = wallets.wallets.map(a => a.address);
    let selectedIndex = result.findIndex((element) => element == event.target.value);
    let selectedPk = wallets.wallets[selectedIndex].privateKey;
    setSelectedPk(selectedPk);
  };

  const walletsOptionsList = wallets.wallets.map((addressObject, index: any) =>
    <option key={index} className="bg-neutral-800 text-[0.75rem]">{addressObject.address}</option>
  );

  const selectAddress = (addressIndex) => {
    let walletSelectedArray: any = [];
    walletSelectedArray = walletsSelected;
    if (walletSelectedArray.includes(addressIndex) == true) {
      let selectedIndex = walletSelectedArray.findIndex((element) => element == addressIndex);
      walletSelectedArray.splice(selectedIndex, 1);
    } else {
      walletSelectedArray.push(addressIndex);
    }
    setWalletsSelected([...walletSelectedArray]);
    console.log(walletsSelected);
  };

  const handleAddressClipboard = (e, address) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
  }

  const handleKeyClipboard = (e, pk) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pk);
  }

  const handleRemoveWallet = (e, index) => {
    e.stopPropagation();
    setWalletsSelected([]);
    removeWallet(index);
  }

  const walletsList = wallets.wallets.map((addressObject, index: any) =>
    <div onClick={() => selectAddress(index)} key={index} className={walletsSelected.includes(index) ? "flex p-2 bg-gray-400 bg-opacity-50 rounded-lg my-1 mx-2 transition-all" : "flex p-2 bg-gray-500 bg-opacity-50 rounded-lg my-1 mx-2 transition-all"}>
      <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
        <div className="grid col-span-2">{addressObject.name}</div>
        <div className="flex col-span-8">
          <div onClick={(e) => handleAddressClipboard(e, addressObject.address)} className="text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all">
          {addressObject.address}
          </div>
        </div>
        <div className="col-span-2">{walletsBalances[index]}</div>
      </div>
      <FaKey onClick={(e) => handleKeyClipboard(e, addressObject.privateKey)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
      <FaTrash onClick={(e) => handleRemoveWallet(e, index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
    </div>
  );

  return (
    <div className="text-white px-8 pt-8 h-full flex flex-col">
      <div className="text-3xl font-semibold">Wallets</div>
      <div className="flex gap-5 mt-2 h-10">
        <form className="flex text-[0.75rem]">
          <input
            value={amountToDisperse}
            type='number'
            onChange={handleDisperseAmountChange}
            placeholder="Ξ"
            className="w-10 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
          />
        </form>
        <div className="my-auto flex-grow">
          Ξ{walletsSelected.length * amountToDisperse}
        </div>
        <form>
          <select
            value={selectedMainAddress}
            onChange={handleAddressMainSelection}
            className="pl-2 p-1 focus:outline-none rounded-lg w-80 h-full bg-neutral-800 text-[0.75rem]"
          >
            {walletsOptionsList}
          </select>
        </form>
        <div onClick={() => {activeTransaction ? null : disperseToWallets()}} className={!activeTransaction ? "bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[80px] flex" : "bg-cyan-500 p-2 transition-all rounded-xl w-[80px] flex"}>
          {!activeTransaction ? (
            <div className="m-auto">Disperse</div>
          ):(
            <AiOutlineLoading3Quarters className='animate-spin m-auto'/>
          )}
        </div>
        <div onClick={() => {activeTransaction ? null : consolidateWallets()}} className={!activeTransaction ? "bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[100px] flex" : "bg-cyan-500 p-2 transition-all rounded-xl w-[100px] flex"}>
          {!activeTransaction ? (
            <div className="m-auto">Consolidate</div>
          ):(
            <AiOutlineLoading3Quarters className='animate-spin m-auto'/>
          )}
        </div>
        <div onClick={() => {activeTransaction ? null : updateWalletBalances()}} className={!activeTransaction ? "bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[50px] flex" : "bg-cyan-500 p-2 transition-all rounded-xl w-[50px] flex"}>
          {!activeTransaction ? (
            <div className="m-auto text-2xl"><BiRefresh/></div>
          ):(
            <AiOutlineLoading3Quarters className='animate-spin m-auto'/>
          )}
        </div>
      </div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
      <div className="flex px-2 rounded-lg ml-2 mr-[83px]">
        <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
          <div className="grid col-span-2">name</div>
          <div className="flex col-span-8">address</div>
          <div className="col-span-2">balance</div>
        </div>
      </div>
      <div className="overflow-y-scroll flex-grow">
        {walletsList}
      </div>
      <div className="flex gap-6 my-5">  
        <div className="flex gap-2">
          <form className="flex pt-1 gap-3 text-[0.75rem]">
            <input
              value={createWalletName}
              type="text"
              onChange={handleWalletNameChange}
              placeholder="name"
              className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
            />
          </form>
          <form className="flex pt-1 gap-3 text-[0.75rem]">
            <input
              value={createWalletAmount}
              type='number'
              onChange={handleWalletAmountChange}
              placeholder="#"
              className="w-10 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
            />
          </form>
        </div>
        <div onClick={() => createAndStoreWallet(createWalletName, createWalletAmount)} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl">Create</div>
        <div onClick={removeAllWallets} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl">Delete All</div>
      </div>
    </div>
  );
}
  
export default Wallets;