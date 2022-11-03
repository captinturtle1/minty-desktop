import { useState, useEffect } from "react";
import { ethers } from 'ethers';

const gasWindow = () => {
    const [gasPrice, setGasPrice] = useState("");
    const [lastBaseFeePerGas, setLastBaseFeePerGas] = useState("");
    const [maxFeePerGas, setMaxFeePerGas] = useState("");
    const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState("");

    const provider = new ethers.providers.InfuraProvider("goerli", "ccd0f54c729d4e58a9b7b34cb3984555")
    
    useEffect(() => {
      getGas();
      setInterval(async function() {
        getGas();
      }, 60000);
    }, []);

    const getGas = async () => {
      let feeDataObject:any = await provider.getFeeData();
      console.log(ethers.utils.formatUnits(feeDataObject.gasPrice.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.lastBaseFeePerGas.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.maxFeePerGas.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.maxPriorityFeePerGas.toString(), "gwei"));
      setGasPrice(ethers.utils.formatUnits(feeDataObject.gasPrice.toString(), "gwei").substring(0,5))
      setLastBaseFeePerGas(ethers.utils.formatUnits(feeDataObject.lastBaseFeePerGas.toString(), "gwei").substring(0,5))
      setMaxFeePerGas(ethers.utils.formatUnits(feeDataObject.maxFeePerGas.toString(), "gwei").substring(0,5))
      setMaxPriorityFeePerGas(ethers.utils.formatUnits(feeDataObject.maxPriorityFeePerGas.toString(), "gwei").substring(0,5));
			//let gas:any = ethers.utils.formatUnits(bigNumberGas, "gwei")
      //let cutDownGas = gas.substring(0,7);
      
    }

  return (
    <div className="absolute bottom-5 left-5 right-5 bg-slate-400 drop-shadow-lg rounded-xl grid grid-cols-2 gap-1 p-5 font-bold text-sm">
      <div>
        gasPrice:
      </div>
      <div>
        {gasPrice}
      </div>
      <div>
        lastBase:
      </div>
      <div>
        {lastBaseFeePerGas}
      </div>
      <div>
        maxFee:
      </div>
      <div>
        {maxFeePerGas}
      </div>
      <div>
        maxPrio:
      </div>
      <div>
        {maxPriorityFeePerGas}
      </div>
    </div>
  );
}

export default gasWindow;