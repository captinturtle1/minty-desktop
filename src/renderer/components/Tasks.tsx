import { useState, useEffect } from 'react';
import { createAndStoreTask, importAndStoreTaskFromFile, removeTask, removeAllTasks, getTasks } from './functionalStuff/taskManager';
import { FaTrash } from 'react-icons/fa';

let tasks:any = [];

const getData = async () => {
  let taskData:any = await getTasks();
  console.log(tasks);
  tasks = JSON.parse(taskData).tasks;
  console.log(tasks);
}
getData();

const Wallets = () => {
  const [tasksSelected, setTasksSelected] = useState<number[]>([]);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [newTaskContract, setNewTaskContract] = useState<string>();
  const [newTaskValue, setNewTaskValue] = useState<number>();
  const [newTaskFunction, setNewTaskFunction] = useState<string>();
  const [newTaskArgs, setNewTaskArgs] = useState<string[]>([]);

  const [newTaskGasMode, setNewTaskGasMode] = useState<number>();
  const [newTaskLimitMode, setNewTaskLimitMode] = useState<number>();
  const [newTaskSetGas, setNewTaskSetGas] = useState<number>();
  const [newTaskSetLimit, setNewTaskSetLimit] = useState<number>();

  const [newTaskMode, setNewTaskMode] = useState<number>();

  useEffect(() => {

  }, []);

  const onClickStopPropagation = (e) => {
    e.stopPropagation();
  }

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

  const handleSetContract = event => {
    setNewTaskContract(event.target.value);
  };

  const handleSetValue = event => {
    setNewTaskValue(event.target.value);
  };

  const handleSetFunction = event => {
    setNewTaskFunction(event.target.value);
  };

  const handleSetArgs = event => {
    setNewTaskArgs(event.target.value);
  };

  const handleRemoveTask = (e, index) => {
    e.stopPropagation();
    setTasksSelected([...[]]);
    let indexs:number[] = [];
    indexs[0] = index;
    removeTask(indexs);
  }

  const handleBatchRemoveTask = () => {
    setTasksSelected([...[]]);
    removeTask(tasksSelected);
  }

  function saveFile() {
    let element = document.createElement("a");
    let file = new Blob([JSON.stringify(taskData)], {type: "application/json"});
    element.href = URL.createObjectURL(file);
    element.download = "mintyExports.json";
    element.click();
  }

  const handleFileInput = (e) => {
    if (e.target != null) {
      let file = (e.target as any).files[0];
      let reader:any = new FileReader();

      reader.addEventListener("load", () => {
        try {
          let data = JSON.parse(reader.result);
          importAndStoreTaskFromFile(data);
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

  

  const tasksList = tasks.map((taskObject, index: number) =>
    <div onClick={() => selectTask(index)} key={index} className={tasksSelected.includes(index) ? "flex p-2 bg-gray-400 bg-opacity-50 rounded-lg my-1 mx-2 transition-all" : "flex p-2 bg-gray-500 bg-opacity-50 rounded-lg my-1 mx-2 transition-all"}>
      <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
        <div className="grid col-span-2">{taskObject.name}</div>
        <div className="flex col-span-8">
          <div className="text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all">
            {taskObject.address}
          </div>
        </div>
        <div className="col-span-2">0</div>
      </div>
      <FaTrash onClick={(e) => handleRemoveTask(e, index)} className="mx-2 m-auto text-white hover:text-gray-200 active:text-gray-300 cursor-pointer transition-all"/>
    </div>
  );

  return (
    <div className="text-white px-8 pt-8 h-full flex flex-col">
      <div className="text-3xl font-semibold">Tasks</div>
      <div className="h-1 w-full bg-gray-500 mt-3 rounded-full mb-5"/>
      <div className="flex px-2 rounded-lg ml-2 mr-[83px]">
        <div className="grid grid-cols-12 flex-grow gap-5 text-sm">
          <div className="grid col-span-2">name</div>
          <div className="flex col-span-8">address</div>
          <div className="col-span-2">balance</div>
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
        <div onClick={(e) => onClickStopPropagation(e)} className="bg-slate-900 px-16 py-8 rounded-lg m-auto relative flex flex-col gap-3">
          <div className="font-bold m-auto">Create Wallets</div>
          <div className="flex gap-2">
            <form className="flex gap-3 text-[0.75rem]">
              <input
                value={newTaskContract}
                type="text"
                onChange={handleSetContract}
                placeholder="Contract"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex gap-3 text-[0.75rem]">
              <input
                value={newTaskValue}
                type="text"
                onChange={handleSetValue}
                placeholder="Price"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex gap-3 text-[0.75rem]">
              <input
                value={newTaskFunction}
                type="text"
                onChange={handleSetFunction}
                placeholder="Function"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
            <form className="flex gap-3 text-[0.75rem]">
              <input
                value={newTaskArgs}
                type="text"
                onChange={handleSetArgs}
                placeholder="Args"
                className="w-24 pl-2 p-1 focus:outline-none rounded-lg bg-neutral-800"
              />
            </form>
          </div>
          <div onClick={() => {createAndStoreTask(newTaskContract, newTaskValue), setCreateOpen(false)}} className="bg-green-500 hover:bg-green-400 active:bg-green-600 py-2 w-20 text-center transition-all cursor-pointer rounded-xl m-auto">Create</div>
        </div>
      </div>
      <div onClick={() => setDeleteAllOpen(false)} className={deleteAllOpen ? "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-100 visible" : "absolute left-0 top-0 w-screen h-screen bg-zinc-900 bg-opacity-50 backdrop-blur-sm flex transition-all opacity-0 invisible"}>
        <div onClick={(e) => onClickStopPropagation(e)} className="bg-slate-900 px-16 py-8 rounded-lg m-auto relative">
          <div>Are you sure?</div>
          <div onClick={() => {removeAllTasks(), setDeleteAllOpen(false)}} className="bg-red-500 hover:bg-red-400 active:bg-red-600 py-2 w-24 text-center transition-all cursor-pointer rounded-xl mt-5">Delete All</div>
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
  
export default Wallets;