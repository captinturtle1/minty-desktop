import { FaWind } from 'react-icons/fa';

const Nav = () => {
    return (
      <div className="z-[100] titlebar fixed w-screen h-10 bg-blue-100 flex">
        <div className="my-auto flex flex-col gap-10 ml-5">
          <div className="flex">
            <div className="text-white text-lg pt-2"><FaWind/></div>
            <div className="text-xl font-bold text-sky-400 select-none">Minty</div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Nav;