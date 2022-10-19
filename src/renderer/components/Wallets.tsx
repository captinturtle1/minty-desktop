import { createAndStoreWallet } from './walletManager';
import wallets from '../../../wallets.json'

const Wallets = () => {
  return (
    <div className="text-white p-10">
      <div className="flex gap-6">
        <div className="text-3xl font-semibold flex-grow">Wallets</div>
        <div onClick={createAndStoreWallet} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl select-none">Create</div>
        <div className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl select-none">Delete</div>
      </div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full"/>
    </div>
  );
}
  
export default Wallets;