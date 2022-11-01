import { useState, useEffect } from "react";

const gasWindow = () => {
    const [gwei, setGwei] = useState('0');
    //const [priority, setPriority] = useState(0);

    setInterval(function() {
        fetch("https://mainnet.infura.io/v3/ccd0f54c729d4e58a9b7b34cb3984555", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"jsonrpc":"2.0","method":"eth_gasPrice","params": [],"id":1}) // body data type must match "Content-Type" 
        })
        .then(response => response.json())
        .then(async response => {
            let gasGwei = parseInt(response.result) / 1000000000;
            let cutDOwn = gasGwei.toPrecision(5);
            setGwei(cutDOwn);
        })
        .catch(console.log);
    }, 5000);

    

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