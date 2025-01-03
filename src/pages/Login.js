import React, { Component } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { urlAPI } from "../config/global";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: "",
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${urlAPI}/login/check`, {
        username: this.state.username, // Updated field name
        password: this.state.password, // Updated field name
      });
      console.log(response.data);
      if (response.data.status === "success") {
        sessionStorage.setItem(
          "user",
          JSON.stringify(response.data.user.username)
        );
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Selamat, Anda Berhasil Masuk",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = `/`;
        });
      } else {
        this.setState({ error: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Error:", err);
      this.setState({ error: "Failed to connect to server" });
    }
  };

  render() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={this.handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={this.state.username}
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Sign in
              </button>
            </div>
          </form>
          {this.state.error && (
            <p className="text-red-500 text-center">{this.state.error}</p>
          )}
        </div>
      </div>
    );
  }
}

export default Login;
