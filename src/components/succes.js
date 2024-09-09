import { Component } from "react";

import animationData from "../style/animationSuccess.json";
import Lottie from "react-lottie";

class SendedForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  componentDidMount = () => {};

  render() {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
    };
    return (
      <div className="w-full h-[100vh] flex justify-center items-start bg-slate-100 overflow-hidden pb-16">
        <div className=" flex relative h-full w-full justify-start items-center flex-col overflow-y-scroll bg-slate-100">
          <div className="background-form w-full rounded-b-xl h-[15rem] p-4 flex flex-col items-center justify-start gap-6">
            <div className="glass-effect-form w-full h-full p-4 top-0 flex flex-col items-center justify-start gap-6 absolute"></div>

            <div className=" flex justify-center flex-col gap-4 items-center  rounded-xl p-4  w-full z-[99]">
              <img
                className="w-[5rem] h-[5rem] flex justify-center items-center rounded-lg object-cover"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlWVsdsDTYT4AMpwEGauuoX7Kr7Pyia3ENAA&s"
              />
              <h1 className="text-xl font-semibold text-black">
                KOSASIH GROUP
              </h1>
            </div>
          </div>
          <div className="w-[95%] gap-4 top-[25%] h-[20rem] shadow-xl pb-10 bg-white px-2 pt-4 flex rounded-xl justify-start flex-col items-center border border- absolute">
            <Lottie options={defaultOptions} height={150} width={150} />
            <h3 className="text-base font-medium text-center">
              Pengajuan Izin Berhasil Dikirimkan
            </h3>
          </div>
        </div>
      </div>
    );
  }
}

export default SendedForm;
