import React from "react";
import "../style/loader.css";

const Loader = () => {
  return (
    <div class="loader">
      <div class="loader__balls">
        <div class="loader__balls__group">
          <div class="ball item1"></div>
          <div class="ball item1"></div>
          <div class="ball item1"></div>
        </div>
        <div class="loader__balls__group">
          <div class="ball item2"></div>
          <div class="ball item2"></div>
          <div class="ball item2"></div>
        </div>
        <div class="loader__balls__group">
          <div class="ball item3"></div>
          <div class="ball item3"></div>
          <div class="ball item3"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
