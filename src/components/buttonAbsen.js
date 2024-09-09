import React from "react";

function ButtonAbsen(props) {

  const  handleSubmit =()=>{
    props.history.push('/a')
  }
  return (
    <div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        onClick={this.handleSubmit}
        disabled={this.state.isProses}
      >
        Hadir
      </button>
    </div>
  );
}

export default ButtonAbsen;
