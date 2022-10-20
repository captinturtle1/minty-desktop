import { useState } from 'react';
import { createAndStoreWallet, removeWallet, removeAllWallets, getBalance } from './walletManager';
import { FaTrash, FaKey } from 'react-icons/fa';
import wallets from '../../../wallets.json'

const WalletsComponent = () => {
  let walletsComponentArray: any = []
    let walletsArray: any = wallets.wallets
    for (let i = 0; i < walletsArray.length; i++) {
      const [walletBalance, setWalletBalance] = useState('');

      async function getToken() {
        setWalletBalance(await getBalance(walletsArray[i].address));
      }
      getToken();

      walletsComponentArray.push(
        <div className="flex p-2 bg-gray-500 bg-opacity-50 rounded-lg my-1 mx-2">
          <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
            <div className="select-none grid col-span-2">{walletsArray[i].name}</div>
            <div onClick={() => {navigator.clipboard.writeText(walletsArray[i].address)}} className="select-none text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all col-span-8">{walletsArray[i].address}</div>
            <div className="col-span-2 select-none">{walletBalance}</div>
          </div>
          <FaKey onClick={() => {navigator.clipboard.writeText(walletsArray[i].privateKey)}} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
          <FaTrash onClick={() => removeWallet(i)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
        </div>
      )
    }

  return(walletsComponentArray);
}

const Wallets = () => {
  const [createWalletName, setCreateWalletName] = useState('');
  const [createWalletAmount, setCreateWalletAmount] = useState(1);

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

  return (
    <div className="text-white p-8">
      <div className="flex gap-6">
        <div className="text-3xl font-semibold flex-grow select-none">Wallets</div>
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
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
        <div className="flex px-2 m-2 flex-grow gap-5 text-sm">
          <div className="select-none">name</div>
          <div className="select-none ml-[50px]">address</div>
          <div className="select-none ml-[343px]">balance</div>
        </div>
      <div className="overflow-y-scroll h-[70vh]">
        <WalletsComponent/>
      </div>
    </div>
  );
}
  
export default Wallets;