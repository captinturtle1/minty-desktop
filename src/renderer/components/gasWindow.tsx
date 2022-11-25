import { useState, useEffect } from "react";
import { ethers } from 'ethers';

async function getSettings() {
	return await window.electron.ipcRenderer.getSettings();
}

const gasWindow = () => {
    const [gasPrice, setGasPrice] = useState("");
    const [lastBaseFeePerGas, setLastBaseFeePerGas] = useState("");
    const [maxFeePerGas, setMaxFeePerGas] = useState("");
    const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState("");
    
    useEffect(() => {
      getData().then(rpc => {
        getGas(rpc);
        setInterval(async function() {
          getGas(rpc);
        }, 10000);
      }).catch(console.log);
    }, []);

    const getData = async () => {
      return new Promise(async (resolve, reject) => {
        getSettings().then((response:any) => {
          let responseParsed = JSON.parse(response);
          resolve(responseParsed.rpc);
        }).catch(err => {
          reject(err);
        });
      });
    }

    const getGas = async (rpc) => {
      try {
        let provider = ethers.providers.getDefaultProvider(rpc);
        let feeDataObject:any = await provider.getFeeData();
        console.log(ethers.utils.formatUnits(feeDataObject.gasPrice.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.lastBaseFeePerGas.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.maxFeePerGas.toString(), "gwei"), ethers.utils.formatUnits(feeDataObject.maxPriorityFeePerGas.toString(), "gwei"));
        setGasPrice(ethers.utils.formatUnits(feeDataObject.gasPrice.toString(), "gwei").substring(0,5))
        setLastBaseFeePerGas(ethers.utils.formatUnits(feeDataObject.lastBaseFeePerGas.toString(), "gwei").substring(0,5))
        setMaxFeePerGas(ethers.utils.formatUnits(feeDataObject.maxFeePerGas.toString(), "gwei").substring(0,5))
        setMaxPriorityFeePerGas(ethers.utils.formatUnits(feeDataObject.maxPriorityFeePerGas.toString(), "gwei").substring(0,5));
			  //let gas:any = ethers.utils.formatUnits(bigNumberGas, "gwei")
        //let cutDownGas = gas.substring(0,7);
      } catch (err) {
        console.log(err);
      }
    }

  return (
    <div className="absolute bottom-5 left-5 right-5 bg-slate-700 text-slate-300 text-sm drop-shadow-lg rounded-xl grid grid-cols-2 gap-1 p-5">
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