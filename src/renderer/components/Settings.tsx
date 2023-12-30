import { useState, useEffect} from 'react';
import { ethers } from 'ethers';

async function getSettings() {
	return await window.electron.ipcRenderer.getSettings();
}

async function setSettings(data) {
	return await window.electron.ipcRenderer.setSettings(data);
}

const Settings = () => {
  const [rpc, setRpc] = useState<string>("");
  const [webhook, setWebhook] = useState<string>("");
  const [theme, setTheme] = useState<string>("");

  const [rpcTest, setRpcTest] = useState<any>();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    getSettings().then((response:any) => {
      let responseParsed = JSON.parse(response);
      setRpc(responseParsed.rpc);
      setWebhook(responseParsed.webhook);
      setTheme(responseParsed.theme);
      console.log(responseParsed);
    });
  }

  const setData = () => {
    let settingsObject: any = 
    {
      "rpc": rpc,
      "webhook": webhook,
      "theme": theme,
    };
    setSettings(settingsObject);
  }

  const handleNewRpc = event => {
    setRpc(event.target.value);
  }

  const handleNewWebhook = event => {
    setWebhook(event.target.value);
  }

  const handleSetSimpleTheme = event => {
    setTheme(event.target.value);
  }

  const testRpc = async () => {
    try {
      console.log("Test RPC: ", rpc);
      let provider = ethers.providers.getDefaultProvider(rpc);
      console.log(await provider.getNetwork());
      setRpcTest(true);
    } catch (err) {
      console.log(err);
      setRpcTest(false);
    }
  }

  const testWebhook = () => {
    fetch(
      webhook, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            username: "Minty",
            avatar_url: "https://i.kym-cdn.com/entries/icons/original/000/037/848/cover2.jpg",
            content: "Minty test!"
          }
        )
      }
    );
    console.log("Test Webhook");
  }

  return (
    <div className="text-white px-8 pt-8 h-full flex flex-col">
      <div className="text-3xl font-semibold">Settings</div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
      <div className="grid gap-8">
        <div className="flex gap-5">
          <div className="w-32">RPC:</div>
          <form className="flex gap-3 text-[0.75rem]">
            <input
              value={rpc}
              type="text"
              onChange={handleNewRpc}
              placeholder="set rpc"
              className="w-96 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800 text-sm"
            />
          </form>
          <div onClick={testRpc} className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 w-16 p-1 text-center text-sm transition-all cursor-pointer rounded-xl">Test</div>
          {rpcTest !== undefined ? (
            <div className={rpcTest ? "bg-green-500 w-16 p-1 text-center text-sm transition-all rounded-xl" : "bg-red-500 w-16 p-1 text-center text-sm transition-all rounded-xl"}>{rpcTest ? (<>Good</>):(<>Bad</>)}</div>
          ):(<></>)}
        </div>
        <div className="flex gap-5">
          <div className="w-32">Webhook:</div>
          <form className="flex gap-3 text-[0.75rem]">
            <input
              value={webhook}
              type="text"
              onChange={handleNewWebhook}
              placeholder="set webhook"
              className="w-96 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800 text-sm"
            />
          </form>
          <div onClick={testWebhook} className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 w-16 p-1 text-center text-sm transition-all cursor-pointer rounded-xl">Test</div>
        </div>
        <div className="flex gap-5">
          <div className="w-32">Theme:</div>
          <form>
            <select
              value={theme}
              onChange={handleSetSimpleTheme}
              className="w-96 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800 text-sm"
            >
              <option className="bg-neutral-800 text-[0.75rem]">simple</option>
              <option className="bg-neutral-800 text-[0.75rem]">cool</option>
            </select>
          </form>
        </div>
        <div onClick={setData} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl m-auto">Set</div>
      </div>
    </div>
  );
}
  
export default Settings;