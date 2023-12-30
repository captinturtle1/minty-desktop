import { useState, useEffect } from 'react';
import { createAndStoreTask, importAndStoreTaskFromFile, removeTask, getTasks, sendWebhook, sendDevWebhook, getWallets, startTask, cancelTask } from './functionalStuff/taskManager';
import { FaTrash, FaStop, FaBan } from 'react-icons/fa';

let tasksKeepRunning:boolean[] = [];

const Tasks = ({taskStatuses, setTaskStatuses, txInfo, setTxInfo}) => {
  const [tasks, setTasks] = useState<any>([]);
  const [wallets, setWallets] = useState<any>([]);

  const [walletsSelected, setWalletsSelected] = useState<any>([]);

  const [tasksSelected, setTasksSelected] = useState<number[]>([]);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [newTaskContract, setNewTaskContract] = useState<string>();
  const [newTaskCost, setNewTaskCost] = useState<number>();
  const [newTaskHex, setNewTaskHex] = useState<string>();

  const [newTaskGasMode, setNewTaskGasMode] = useState<string>("Auto");
  const [newTaskLimitMode, setNewTaskLimitMode] = useState<string>("Auto");

  const [newTaskSetGas, setNewTaskSetGas] = useState<number>(0);
  const [newTaskSetPrio, setNewTaskSetPrio] = useState<number>(0);
  const [newTaskSetLimit, setNewTaskSetLimit] = useState<number>(0);

  const [forceGweiAmount, setForceGweiAmount] = useState(0);

  

  useEffect(() => {
    getData().then((response:any) => {
      console.log(response);
    });
  }, []);

  const getData = async () => new Promise(async (resolve, reject) => {
    getTasks().then((taskResponse:any) => {
      setTasks([...JSON.parse(taskResponse).tasks]);
      getWallets().then((walletResponse:any) => {
        setWallets([...JSON.parse(walletResponse).wallets]);
        resolve("data retrieved");
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });

    
  });

  const truncateAddress = (address) => {
    let firstSix = address.slice(0, 6);
    let lastFour = address.slice(address.length - 4, address.length);
    return `${firstSix}...${lastFour}`;
  }

  const truncateHexData = (hexData) => {
    let first = hexData.slice(0, 10);
    return `${first}`;
  }

  const selectAddress = (index) => {
    let walletSelectedArray:string[] = walletsSelected;
    if (walletSelectedArray.includes(index) == true) {
      walletSelectedArray.splice(walletSelectedArray.indexOf(index), 1);
    } else {
      walletSelectedArray.push(index);
    }
    setWalletsSelected([...walletSelectedArray]);
    console.log("selceted: ", walletsSelected);
  };

  const selectTask = (taskIndex) => {
    let tasksSelectedArray:number[] = tasksSelected;
    if (tasksSelectedArray.includes(taskIndex) == true) {
      tasksSelectedArray.splice(tasksSelectedArray.indexOf(taskIndex), 1);
    } else {
      tasksSelectedArray.push(taskIndex);
    }
    setTasksSelected([...tasksSelectedArray]);
    console.log(tasksSelected);
  };

  const handleRemoveTask = (e, index) => {
    e.stopPropagation();
    setTasksSelected([...[]]);
    let indexes:number[] = [];
    indexes[0] = index;
    removeTask(indexes).then((response:any) => {
      setTasks([...JSON.parse(response).tasks]);
      let newStatusArray:any = taskStatuses;
      let newTxInfoArray:any = txInfo;
      newStatusArray.splice(index, 1);
      newTxInfoArray.splice(index, 1);
      tasksKeepRunning.splice(index, 1);
      setTaskStatuses([...newStatusArray]);
      setTxInfo([...newTxInfoArray]);
    });
  }

  const handleBatchRemoveTask = () => {
    setTasksSelected([...[]]);
    removeTask(tasksSelected).then((response:any) => {
      setTasks([...JSON.parse(response).tasks]);
      let newStatusArray:any = taskStatuses;
      let newTxInfoArray:any = txInfo;
      for (let i = 0; i < tasksSelected.length; i++) {
        newStatusArray.splice(tasksSelected[i], 1);
        newTxInfoArray.splice(tasksSelected[i], 1);
        tasksKeepRunning.splice(tasksSelected[i], 1);
      }
      setTaskStatuses([...newStatusArray]);
      setTxInfo([...newTxInfoArray]);
    });
  }

  const handleRemoveAllTasks = () => {
    setTasksSelected([...[]]);
    let allTasksArray:number[] = [];
    for (let i = 0; i < tasks.length; i++) {
      allTasksArray.push(i);
    }
    removeTask(allTasksArray).then((response:any) => {
      setTasks([...JSON.parse(response).tasks]);
      let newStatusArray:any = [];
      setTaskStatuses([...[newStatusArray]]);
    });
  }

  function saveFile() {
    let element = document.createElement("a");
    let tasksObject:any = {"tasks": []};
    tasksObject.tasks = tasks;
    let file = new Blob([JSON.stringify(tasksObject)], {type: "application/json"});
    element.href = URL.createObjectURL(file);
    element.download = "mintyTaskExports.json";
    element.click();
  }

  const handleFileInput = (e) => {
    if (e.target != null) {
      let file = (e.target as any).files[0];
      let reader:any = new FileReader();

      reader.addEventListener("load", () => {
        try {
          let data = JSON.parse(reader.result);
          importAndStoreTaskFromFile(data).then((response:any) => {
            setTasks([...JSON.parse(response).tasks]);
            let newStatusArray:any = taskStatuses;
            let newTxInfoArray:any = [];
            for (let i = 0; i < walletsSelected.length; i++) {
              newStatusArray.push("Idle");
              newTxInfoArray.push(0);
              tasksKeepRunning.push(true);
            }
            setTaskStatuses([...newStatusArray]);
            setTxInfo([...newTxInfoArray]);
          });
          setImportOpen(false);
        } catch (err) {
          console.log(err);
        }
      }, false);
      
      if (file.type == "application/json") {
        reader.readAsText(file);
      }
    }
  };

  const createAndSendTaskObject = () => {
    let createdTasksArray:any = [];
    for (let i = 0; i < walletsSelected.length; i++) {
      let newTask = {
        "contract": newTaskContract,
        "cost": newTaskCost,
        "hex": newTaskHex,
        "gasMode": newTaskGasMode,
        "limitMode": newTaskLimitMode,
        "userSetGas": newTaskSetGas,
        "userSetPrio": newTaskSetPrio,
        "userSetLimit": newTaskSetLimit,
        "wallet": wallets[walletsSelected[i]].address,
        "pk": wallets[walletsSelected[i]].privateKey
      };
      createdTasksArray.push(newTask);
    }
    setWalletsSelected([...[]]);
    createAndStoreTask(createdTasksArray).then((response:any) => {
      setTasks([...JSON.parse(response).tasks]);
      let newStatusArray:any = taskStatuses;
      let newTxInfoArray:any = txInfo;
      for (let i = 0; i < walletsSelected.length; i++) {
        newStatusArray.push("Idle");
        newTxInfoArray.push(0);
        tasksKeepRunning.push(true);
      }
      setTaskStatuses([...newStatusArray]);
      setTxInfo([...newTxInfoArray]);
    });
  }

  const onClickStopPropagation = (e) => {
    e.stopPropagation();
  }

  const handleSetContract = event => {
    setNewTaskContract(event.target.value);
  };

  const handleSetValue = event => {
    setNewTaskCost(event.target.value);
  };

  const handleSetHex= event => {
    setNewTaskHex(event.target.value);
  };

  const handleSetNewTaskGasMode = event => {
    setNewTaskGasMode(event.target.value);
  };

  const handleSetNewTaskLimitMode = event => {
    setNewTaskLimitMode(event.target.value);
  };

  const handleSetNewTaskSetGas = event => {
    setNewTaskSetGas(event.target.value);
  };

  const handleSetNewTaskSetPrio = event => {
    setNewTaskSetPrio(event.target.value);
  };

  const handleSetNewTaskSetLimit = event => {
    setNewTaskSetLimit(event.target.value);
  };

  const handleForceGwei = event => {
    setForceGweiAmount(event.target.value);
  };

  const handleStartTasks = () => {
    let newStatusArray:any = taskStatuses;
    let newTxInfoArray:any = txInfo;

    for (let i = 0; i < tasks.length; i++) {
      tasksKeepRunning[i] = true;
      const sendTask = () => {
        newStatusArray[i] = "Starting";
        newTxInfoArray[i] = 1;
        setTaskStatuses([...newStatusArray]);
        setTxInfo([...newTxInfoArray]);

        console.log(tasksKeepRunning);
        if (tasksKeepRunning[i]) {
          startTask(tasks[i]).then((receipt:any) => {
            console.log(receipt);
            sendWebhook(`sent https://goerli.etherscan.io/tx/${receipt.hash}`);
            sendDevWebhook(`sent https://goerli.etherscan.io/tx/${receipt.hash} at <t:${Math.floor(Date.now() / 1000)}>`);

            newStatusArray[i] = "Pending";
			    	setTaskStatuses([...newStatusArray]);

            newTxInfoArray[i] = receipt;
            setTxInfo([...newTxInfoArray]);

            receipt.wait(1).then(response => {
              console.log(response);
              sendWebhook(`confirmed https://goerli.etherscan.io/tx/${response.transactionHash}`);
              sendDevWebhook(`confirmed https://goerli.etherscan.io/tx/${response.transactionHash} at <t:${Math.floor(Date.now() / 1000)}>`);

              newStatusArray[i] = "Confirmed";
			    		setTaskStatuses([...newStatusArray]);

              newTxInfoArray[i] = response;
              setTxInfo([...newTxInfoArray]);

            }).catch(err => {
              console.log(err);
            })
          }).catch(err => {
            newStatusArray[i] = "Tx will fail";
			    	setTaskStatuses([...newStatusArray]);
            console.log(err);
            setTimeout(() => {
              sendTask();
            }, 5000)
          });
        } else {
          newStatusArray[i] = "Stopped";
			    setTaskStatuses([...newStatusArray]);

          newTxInfoArray[i] = 0;
          setTxInfo([...newTxInfoArray]);
        }
      }
      sendTask();
    }
  }

  const handleStopTask = (e, index) => {
    e.stopPropagation();
    let newStatusArray:any = taskStatuses;
    let newTxInfoArray:any = txInfo;

    newStatusArray[index] = "Stopping";
    newTxInfoArray[index] = 3;
    tasksKeepRunning[index] = false;

    setTaskStatuses([...newStatusArray]);
    setTxInfo([...newTxInfoArray]);
  }

  const handleStopAllTasks = () => {
    let newStatusArray:any = taskStatuses;
    let newTxInfoArray:any = txInfo;
    for (let i = 0; i < tasks.length; i++) {
      newStatusArray[i] = "Stopping";
      newTxInfoArray[i] = 3;
      tasksKeepRunning[i] = false;
    }
    setTaskStatuses([...newStatusArray]);
    setTxInfo([...newTxInfoArray]);
  }

  const handleCancelTask = (e, index) => {
    e.stopPropagation();
    console.log("attempting cancel");
    tasksKeepRunning[index] = false;
    if (typeof(txInfo[index] == Object)) {
      if (txInfo[index].confirmations == 0) {
        console.log("parameters met");
        let newStatusArray:any = taskStatuses;
        let newTxInfoArray:any = txInfo;
        cancelTask(tasks[index], txInfo[index]).then((receipt:any) => {
          console.log(receipt);
          sendWebhook(`cancel tx https://goerli.etherscan.io/tx/${receipt.hash}`);

          newStatusArray[index] = "Canceling";
			    setTaskStatuses([...newStatusArray]);

          newTxInfoArray[index] = receipt;
          setTxInfo([...newTxInfoArray]);

          receipt.wait(1).then(response => {
            console.log(response);
            sendWebhook(`cancel confirmed https://goerli.etherscan.io/tx/${response.transactionHash}`);

            newStatusArray[index] = "Canceled";
			    	setTaskStatuses([...newStatusArray]);

            newTxInfoArray[index] = response;
            setTxInfo([...newTxInfoArray]);

          }).catch(err => {
            console.log(err);
          })
        }).catch(err => {
          console.log(err);
        })
      }
    }
  }

  const handleCancelAllTasks = () => {
    for (let i = 0; i < tasks.length; i++) {

    }
  }

  
  
  

  const tasksList = tasks.map((taskObject, index: number) =>
    <div onClick={() => selectTask(index)} key={index} className={tasksSelected.includes(index) ? "flex p-2 bg-gray-400 bg-opacity-50 rounded-lg my-1 mx-2 transition-all" : "flex p-2 bg-gray-500 bg-opacity-50 rounded-lg my-1 mx-2 transition-all"}>
      <div className="grid grid-cols-5 flex-grow gap-5 text-sm">
        <div>{truncateAddress(taskObject.contract)}</div>
        <div>{taskObject.cost}</div>
        <div>{truncateHexData(taskObject.hex)}</div>
        <div>{truncateAddress(taskObject.wallet)}</div>
        <div>{taskStatuses[index]}</div>
      </div>
      <FaStop onClick={(e) => handleStopTask(e, index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
      <FaBan onClick={(e) => handleCancelTask(e, index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
      <FaTrash onClick={(e) => handleRemoveTask(e, index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
    </div>
  );

  return (
    <div className="text-white px-8 pt-8 h-full flex flex-col">
      <div className="text-3xl font-semibold">Tasks</div>
      <div className="flex gap-5 mt-2 h-10">
        <div onClick={handleStartTasks} className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[120px] flex">
          <div className="m-auto">Start Tasks</div>
        </div>
        <div onClick={handleStopAllTasks} className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[120px] flex">
          <div className="m-auto">Stop Tasks</div>
        </div>
        <div onClick={handleCancelAllTasks} className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[120px] flex">
          <div className="m-auto">Cancel Tasks</div>
        </div>
        <div className="flex-grow"/>
        <div className="my-auto">force gwei</div>
          <form className="flex text-[0.75rem]">
            <input
              value={forceGweiAmount}
              type='number'
              onChange={handleForceGwei}
              placeholder="gwei"
              className="w-10 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
            />
          </form>
        <div className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 p-2 transition-all cursor-pointer rounded-xl w-[80px] flex">
            <div className="m-auto">Set</div>
        </div>
      </div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
      <div className="flex px-2 rounded-lg ml-2 mr-[115px]">
        <div className="grid grid-cols-5 flex-grow gap-5 text-sm">
          <div>contract</div>
          <div>cost</div>
          <div>function hex</div>
          <div>wallet</div>
          <div>status</div>
        </div>
      </div>
      <div className="overflow-y-scroll flex-grow">
        {tasksList}
      </div>
      <div className="flex gap-6 my-5"> 
        <div onClick={() => {setImportOpen(true)}} className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl">Import</div> 
        <div onClick={saveFile} className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl">Export</div>
        <div className="grow">
          <div onClick={() => setCreateOpen(true)} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl">Create</div>
        </div>
        <div onClick={() => handleBatchRemoveTask()} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-10 text-center transition-all cursor-pointer rounded-xl flex"><FaTrash className="m-auto"/></div>
        <div onClick={() => setDeleteAllOpen(true)} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl">Clear Tasks</div>
      </div>
      <div onClick={() => setCreateOpen(false)} className={createOpen ? "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-100 visible" : "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-0 invisible"}>
        <div onClick={(e) => onClickStopPropagation(e)} className="bg-slate-900 px-16 py-8 rounded-lg m-auto relative flex flex-col gap-3 h-[500px] w-[900px]">
          <div className="font-bold m-auto">Create Tasks</div>
          <div className="flex gap-5">
            <div className="flex flex-col gap-5">
              <div>
                <div>Contract</div>
                <form className="flex gap-3 text-[0.75rem]">
                  <input
                    value={newTaskContract}
                    type="text"
                    onChange={handleSetContract}
                    placeholder="contract address"
                    className="w-64 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                  />
                </form>
              </div>
              <div>
              <div>Cost</div>
              <form className="flex gap-3 text-[0.75rem]">
                <input
                  value={newTaskCost}
                  type="number"
                  onChange={handleSetValue}
                  placeholder="price per tx"
                  className="w-64 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                />
              </form>
              </div>
              <div>
                <div>Function Hex</div>
                <form className="flex gap-3 text-[0.75rem]">
                  <input
                    value={newTaskHex}
                    type="text"
                    onChange={handleSetHex}
                    placeholder="contract function hex"
                    className="w-64 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                  />
                </form>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div>Gas Mode</div>
                <form className="flex gap-3 text-[0.75rem]">
                  <select
                    value={newTaskGasMode}
                    onChange={handleSetNewTaskGasMode}
                    placeholder="Mode"
                    className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                  >
                    <option className="bg-neutral-800 text-[0.75rem]">Auto</option>
                    <option className="bg-neutral-800 text-[0.75rem]">Manual</option>
                  </select>
                </form>
              </div>
              <div>
                <div>Gas Limit Mode</div>
                <form className="flex gap-3 text-[0.75rem]">
                  <select
                    value={newTaskLimitMode}
                    onChange={handleSetNewTaskLimitMode}
                    placeholder="Mode"
                    className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                  >
                    <option className="bg-neutral-800 text-[0.75rem]">Auto</option>
                    <option className="bg-neutral-800 text-[0.75rem]">Manual</option>
                  </select>
                </form>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {newTaskGasMode == "Manual" ? (
                <>
                  <div>
                    <div>Gwei</div>
                    <form className="flex gap-3 text-[0.75rem]">
                      <input
                        value={newTaskSetGas}
                        type="number"
                        onChange={handleSetNewTaskSetGas}
                        placeholder="gwei"
                        className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                      />
                    </form>
                  </div>
                  <div>
                    <div>Priority</div>
                    <form className="flex gap-3 text-[0.75rem]">
                      <input
                        value={newTaskSetPrio}
                        type="number"
                        onChange={handleSetNewTaskSetPrio}
                        placeholder="prio"
                        className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                      />
                    </form>
                  </div>
                </>
              ):(<></>)}
              {newTaskLimitMode == "Manual" ? (
                <>
                  <div>
                    <div>Gas Limit</div>
                    <form className="flex gap-3 text-[0.75rem]">
                      <input
                        value={newTaskSetLimit}
                        type="Number"
                        onChange={handleSetNewTaskSetLimit}
                        placeholder="gas limit"
                        className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
                      />
                    </form>
                  </div>
                </>
              ):(<></>)}
            </div>
            <div className="flex flex-col gap-2 h-80 overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-2 px-2 bg-gray-600 bg-opacity-20 rounded-lg transition-all font-bold">
                <div>name</div>
                <div>address</div>
              </div>
              {wallets.map((addressObject:any, index:number) =>
                <div key={addressObject.address} onClick={() => selectAddress(index)} className={walletsSelected.includes(index) ? 
                  "grid grid-cols-2 p-2 bg-gray-300 bg-opacity-50 rounded-lg transition-all text-sm w-60"
                  :
                  "grid grid-cols-2 p-2 bg-gray-500 bg-opacity-50 rounded-lg transition-all text-sm w-60"}
                >
                  <div>{addressObject.name}</div>
                  <div>{truncateAddress(addressObject.address)}</div>
                </div>
              )}
            </div>
          </div>
          <div onClick={() => {createAndSendTaskObject(), setCreateOpen(false)}} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl m-auto">Create</div>
        </div>
      </div>
      <div onClick={() => setDeleteAllOpen(false)} className={deleteAllOpen ? "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-100 visible" : "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-0 invisible"}>
        <div onClick={(e) => onClickStopPropagation(e)} className="bg-slate-900 px-16 py-8 rounded-lg m-auto relative">
          <div>Are you sure?</div>
          <div onClick={() => {handleRemoveAllTasks(), setDeleteAllOpen(false)}} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl mt-5">Delete All</div>
        </div>
      </div>
      <div onClick={() => setImportOpen(false)} className={importOpen ? "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-100 visible" : "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-0 invisible"}>
        <div onClick={(e) => onClickStopPropagation(e)} className="bg-slate-900 px-16 py-8 rounded-lg m-auto relative flex flex-col">
          <div className="flex">
            <form className="pl-16">
              <input
                type="file"
                accept="application/json"
                onChange={handleFileInput}
                className="file:bg-orange-500 file:hover:bg-orange-400 file:active:bg-orange-600 file:py-2 file:w-24 file:text-center file:transition-all file:cursor-pointer file:rounded-xl file:text-white file:border-0"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
  
export default Tasks;