import { useState, useEffect } from 'react';

const Tools = () => {
  const [eip1559Gwei, setEip1559Gwei] = useState<number>();
  const [eip1559Prio, setEip1559Prio] = useState<number>();
  const [eip1559Limit, setEip1559Limit] = useState<number>();
  const [legacyGwei, setLegacyGwei] = useState<number>();
  const [legacyLimit, setLegacyLimit] = useState<number>();

  //const [legacyTable, setLegacyTable] = useState();
  const [legacyOutput, setLegacyOutput] = useState<number>();
  
  //const [eip1559Table, seteip1559Table] = useState();
  const [eip1559OutputMin, seteip1559OutputMin] = useState<any>();
  const [eip1559OutputMax, seteip1559OutputMax] = useState<any>();

  const handleEip1559GweiChange = event => {
    let numberInput = parseFloat(event.target.value);
    if (numberInput >= 0) {
      setEip1559Gwei(numberInput);
      calculateeip1559(numberInput, eip1559Prio, eip1559Limit);
    }
  };

  const handleEip1559PrioChange = event => {
    let numberInput = parseFloat(event.target.value);
    if (numberInput >= 0) {
      setEip1559Prio(numberInput);
      calculateeip1559(eip1559Gwei, numberInput, eip1559Limit);
    }
  };

  const handleEip1559LimitChange = event => {
    let numberInput = parseFloat(event.target.value);
    if (numberInput >= 0) {
      setEip1559Limit(numberInput);
      calculateeip1559(eip1559Gwei, eip1559Prio, numberInput);
    }
  };

  const handleLegacyGweiChange = event => {
    let numberInput = parseFloat(event.target.value);
    if (numberInput >= 0) {
      setLegacyGwei(numberInput);
      calculateLegacy(numberInput, legacyLimit);
    }
    
  };

  const handleLegacyLimitChange = event => {
    let numberInput = parseFloat(event.target.value);
    if (numberInput >= 0) {
      setLegacyLimit(numberInput);
      calculateLegacy(legacyGwei, numberInput);
    }
  };

  const calculateeip1559 = (gwei, prio, limit) => {
    if (gwei != undefined && prio != undefined && limit != undefined) {
      console.log('all defined');
      if (gwei > 0 && prio > 0 && prio <= gwei && limit >= 21000) {
        console.log('all greater than 0');
        console.log(gwei, prio, limit);
        let minCost = prio * limit / 1000000000;
        let maxCost = gwei * limit / 1000000000;
        seteip1559OutputMin(minCost);
        seteip1559OutputMax(maxCost);
      }
    }
  };

  const calculateLegacy = (gwei, limit) => {
    if (gwei != undefined && limit != undefined) {
      console.log('all defined');
      if (gwei > 0 && limit >= 21000) {
        console.log('all greater than 0');
        console.log(gwei, limit);
        let cost = gwei * limit / 1000000000;
        setLegacyOutput(cost);
      }
    }
  };

  return (
    <div className="text-white px-8 pt-8 h-full flex flex-col">
      <div className="text-3xl font-semibold">Tools</div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
      <div className="flex gap-16">
        <div>
          <div className="text-xl font-semibold my-3">Calculate eip1559</div>
          <div className="flex gap-3">
            <form className="flex text-[0.75rem]">
              <input
                type='number'
                onChange={handleEip1559GweiChange}
                placeholder="Gwei"
                className="w-16 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex text-[0.75rem]">
              <input
                type='number'
                onChange={handleEip1559PrioChange}
                placeholder="Priority"
                className="w-16 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex text-[0.75rem]">
              <input
                type='number'
                onChange={handleEip1559LimitChange}
                placeholder="Gas Limit"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
          </div>
          <div className="text-xl font-semibold my-3">Output:</div>
          <div className="flex flex-col">
            <div>max: {eip1559OutputMax}</div>
            <div>min: {eip1559OutputMin}</div>
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold my-3">Calculate legacy</div>
          <div className="flex gap-3">
            <form className="flex text-[0.75rem]">
              <input
                type='number'
                onChange={handleLegacyGweiChange}
                placeholder="Gwei"
                className="w-16 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex text-[0.75rem]">
              <input
                type='number'
                onChange={handleLegacyLimitChange}
                placeholder="Gas Limit"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
          </div>
          <div className="text-xl font-semibold my-3">Output:</div>
          <div className="flex flex-col">
            <div>cost: {legacyOutput}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
  export default Tools;