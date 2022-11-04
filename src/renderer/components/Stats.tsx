import { useState } from 'react';
import { check_profit } from './profitCheck';
import data from '../../../data.json'

const Stats = () => {
  const [contract, setContract] = useState<string>();
  const [results, setResults] = useState<any>([]);

  const handleLegacyGweiChange = event => {
    setContract(event.target.value);
  };

  const submitCheckProfit = async () => {
    let arrayOfAddresses:string[] = [];
    for (let i = 0; i < data.wallets.length; i++) {
      arrayOfAddresses.push(data.wallets[i].address);
    }
    
    let result:any = await check_profit(contract, arrayOfAddresses);
    const dataArray = Object.values(result);
    console.log(dataArray);
    setResults([...dataArray]);
  }

    return (
      <div className="text-white px-8 pt-8 h-full flex flex-col">
        <div className="text-3xl font-semibold">Stats</div>
        <div className="flex gap-5 mt-2">
          <form className="flex text-[0.75rem]">
            <input
              onChange={handleLegacyGweiChange}
              placeholder="contract"
              className="w-80 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
            />
          </form>
          <div onClick={submitCheckProfit} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl">Calculate</div>
        </div>
        <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
        <div className="grid grid-cols-3 gap-5 mt-12">
          {results.length > 0 ? (
            <>
              <div><div>Total minted</div>{results[6]}</div>
              <div><div>Mint cost</div>{results[1]}</div>
              <div><div>Mint fee</div>{results[2]}</div>
              <div><div>Total secondary</div>{results[7]}</div>
              <div><div>Secondary cost</div>{results[3]}</div>
              <div><div>Secondary fee</div>{results[4]}</div>
              <div><div>Amount sold</div>{results[5]}</div>
              <div><div>ETH from sales</div>{results[0]}</div>
              <div><div>Realized</div>{results[11]}</div>
              <div><div>Holding</div>{results[8]}</div>
              <div><div>Floor</div>{results[9]}</div>
              <div><div>Unrealized</div>{results[10]}</div>
            </>
          ):(
            <></>
          )}
        </div>
      </div>
    );
  }
  
  export default Stats;