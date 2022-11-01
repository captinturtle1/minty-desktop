import { useState, useEffect } from "react";
import { ethers } from 'ethers';

const gasWindow = () => {
    const [gwei, setGwei] = useState('0');

    const provider = new ethers.providers.InfuraProvider("mainnet", "ccd0f54c729d4e58a9b7b34cb3984555")
    
    useEffect(() => {
      getGas();
    }, []);

    setInterval(async function() {
      getGas();
    }, 60000);

    const getGas = async () => {
      let bigNumberGas = await provider.getGasPrice();
			let gas:any = ethers.utils.formatUnits(bigNumberGas, "gwei")
      let cutDownGas = gas.substring(0,7);
			console.log('gas:', gas);
      setGwei(cutDownGas);
    }

  return (
    <div className="absolute bottom-5 left-5 right-5 bg-slate-400 drop-shadow-lg rounded-xl grid grid-cols-2 gap-5 p-5 font-bold">
      <div>
        gwei:
      </div>
      <div>
        {gwei}
      </div>
    </div>
  );
}

export default gasWindow;