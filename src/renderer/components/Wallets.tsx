import { useState, useEffect } from 'react';
import { createAndStoreWallet, removeWallet, removeAllWallets, getBalance } from './walletManager';
import { FaTrash, FaKey } from 'react-icons/fa';
import wallets from '../../../wallets.json'



const Wallets = () => {
  const [createWalletName, setCreateWalletName] = useState('');
  const [createWalletAmount, setCreateWalletAmount] = useState(1);
  const [selectedMainAddress, setSelectedMainAddress] = useState(1);
  const [amountToDisperse, setAmountToDisperse] = useState(1);
  const [walletsSelected, setWalletsSelected] = useState<any>([]);
  const [walletsBalances, setWalletsBalances] = useState([]);

  useEffect(() => {
    async function getToken() {
      setWalletsBalances(await getBalance(wallets.wallets));
    }
    getToken();
  }, []);

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
  };

  const walletsOptionsList = wallets.wallets.map((addressObject) =>
    <option className="bg-neutral-800 text-[0.75rem]">{addressObject.address}</option>
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

  const walletsList = wallets.wallets.map((addressObject, index: any) =>
    <div onClick={() => selectAddress(index)} key={index} className={walletsSelected.includes(index) ? "flex p-2 bg-gray-400 bg-opacity-50 rounded-lg my-1 mx-2 transition-all" : "flex p-2 bg-gray-500 bg-opacity-50 rounded-lg my-1 mx-2 transition-all"}>
      <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
        <div className="select-none grid col-span-2">{addressObject.name}</div>
        <div onClick={() => {navigator.clipboard.writeText(addressObject.address)}} className="flex col-span-8">
          <div className="select-none text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all">
          {addressObject.address}
          </div>
        </div>
        <div className="col-span-2 select-none">{walletsBalances[index]}</div>
      </div>
      <FaKey onClick={() => {navigator.clipboard.writeText(addressObject.privateKey)}} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
      <FaTrash onClick={() => removeWallet(index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
    </div>
  );

  return (
    <div className="text-white p-8">
      <div className="text-3xl font-semibold select-none">Wallets</div>
      <div className="flex gap-5 mt-2">
        <form className="flex text-[0.75rem]">
          <input
            value={amountToDisperse}
            type='number'
            onChange={handleDisperseAmountChange}
            placeholder="Ξ"
            className="w-10 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
          />
        </form>
        <div className="m-auto flex-grow">Total: Ξ{walletsSelected.length && amountToDisperse != 0 ? (
          <>{walletsSelected.length * amountToDisperse}</>
        ):(
          <>0</>
        )}
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
        <div className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl select-none">Disperse</div>
        <div className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl select-none">Consolidate</div>
      </div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
        <div className="flex px-2 m-2 flex-grow gap-5 text-sm">
          <div className="select-none">name</div>
          <div className="select-none ml-[50px]">address</div>
          <div className="select-none ml-[343px]">balance</div>
        </div>
      <div className="overflow-y-scroll h-[58vh]">
        {walletsList}
      </div>
      {walletsSelected.length}
      <div className="flex gap-6 mt-2">  
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
        <div onClick={() => createAndStoreWallet(createWalletName, createWalletAmount)} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl select-none">Create</div>
        <div onClick={removeAllWallets} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl select-none">Delete All</div>
      </div>
    </div>
  );
}
  
export default Wallets;