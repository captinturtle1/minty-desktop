import { ethers } from "ethers";

const Wallets = () => {
    return (
      <div className="text-white p-10">
        <div className="text-3xl font-semibold">Wallets</div>
        <div className="flex gap-5 mt-5">
            <div className="bg-green-300 p-3 w-20 text-center hover:bg-green-400 transition-all cursor-pointer rounded-xl">Create</div>
            <div className="bg-red-300 p-3 w-20 text-center hover:bg-red-400 transition-all cursor-pointer rounded-xl">Delete</div>
        </div>
      </div>
    );
  }
  
  export default Wallets;