import React, { Component } from "react";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { urlAPI } from "../config/global";
import Swal from "sweetalert2";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataShift: [],
      idShift: "",
      namaShift: "",
      jamMasuk: "",
      jamPulang: "",
      nominal: "",
      garansiFee: "",
      isEdit: false,
    };
  }

  componentDidMount = () => {
    this.getAllDataShift();
  };

  getAllDataShift = () => {
    axios
      .get(urlAPI + "/shift", {
        referrerPolicy: "unsafe-url",
      })
      .then((response) => {
        this.setState({ dataShift: response.data });
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  handleSave = (e) => {
    e.preventDefault();
    const { namaShift, jamMasuk, jamPulang, nominal, garansiFee } = this.state;

    // Cek kelengkapan form
    if (!namaShift || !jamMasuk || !jamPulang || !nominal) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }

    const postData = {
      nama_shift: namaShift,
      jam_masuk: jamMasuk,
      jam_pulang: jamPulang,
      nominal: nominal,
      garansi_fee: garansiFee,
    };

    // Cek data yang ada sebagai perbandingan
    const shiftExists = this.state.dataShift.some(
      (shift) => shift.nama_shift === namaShift
    );
    if (shiftExists) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Nama shift sudah ada, nama shift tidak boleh sama",
      });
      return;
    }

    axios
      .post(urlAPI + "/shift", postData)
      .then((response) => {
        this.getAllDataShift();
        this.setState({
          namaShift: "",
          jamMasuk: "",
          jamPulang: "",
          nominal: "",
          garansiFee: "",
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  handleEdit = (shift) => {
    const { id_shift, nama_shift, jam_masuk, jam_pulang, nominal, garansiFee } =
      shift;

    this.setState({
      idShift: id_shift,
      namaShift: nama_shift,
      jamMasuk: jam_masuk,
      jamPulang: jam_pulang,
      nominal: nominal,
      garansi_fee: garansiFee,
      isEdit: true,
    });
  };

  handleUpdate = (e) => {
    e.preventDefault();

    const { idShift, namaShift, jamMasuk, jamPulang, nominal, garansiFee } =
      this.state;

    const patchData = {
      nama_shift: namaShift,
      jam_masuk: jamMasuk,
      jam_pulang: jamPulang,
      nominal: nominal,
      garansi_fee: garansiFee,
    };

    axios
      .patch(urlAPI + `/shift/${idShift}`, patchData)
      .then((response) => {
        this.getAllDataShift();
        console.log("berhasil update");
        this.setState({
          namaShift: "",
          jamMasuk: "",
          jamPulang: "",
          nominal: "",
          garansiFee: "",
          isEdit: false,
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil diperbarui",
        });
      })
      .catch((error) => {
        console.log("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal memperbarui data",
        });
      });
  };

  handleDelete = (id_shift) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data tidak akan kembali setelah dihapus",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(urlAPI + `/shift/${id_shift}`)
          .then((response) => {
            this.getAllDataShift();
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Data berhasil dihapus!",
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Kesalahan",
              text: "Data tidak bisa dihapus!",
            });
          });
      }
    });
  };

  render() {
    const datas = this.state.dataShift.map((data) => [
      // data.id_shift,
      data.nama_shift,
      data.jam_masuk,
      data.jam_pulang,
      data.nominal,
      // .toLocaleString("id-ID", {
      //   style: "currency",
      //   currency: "IDR",
      // }),
      data.garansi_fee,
      // .toLocaleString("id-ID", {
      //   style: "currency",
      //   currency: "IDR",
      // }),
    ]);

    const columns = [
      "Nama Shift",
      "Jam Masuk",
      "Jam Pulang",
      "Nominal",
      "Garansi Fee",
      {
        name: "Aksi",
        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataShift[tableMeta.rowIndex];
            return (
              <div className="flex flex-row justify-center gap-2">
                <button
                  className="rounded-lg bg-yellow-400 px-4 py-2 font-bold cursor-pointer hover:bg-yellow-500"
                  onClick={() => this.handleEdit(data)}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white cursor-pointer hover:bg-red-700"
                  onClick={() => this.handleDelete(data.id_shift)}
                >
                  Hapus
                </button>
              </div>
            );
          },
        },
      },
    ];

    const options = {
      selectableRows: false,
      elevation: 0,
      rowsPerPage: 10,
      rowsPerPageOption: [5, 10],
    };

    console.log(datas);
    return (
      <div className="container mx-auto my-16">
        <div className="rounded-lg bg-white shadow-lg my-5">
          <div className="flex flex-col p-10">
            <h4 className="text-black font-bold text-xl mt-5">
              Form Input Shift
            </h4>
            <br />
            <hr />
            <br />
            <div className="flex mx-auto">
              <form action="">
                <div className="grid grid-cols-5 gap-4">
                  {/* <input
                    type="number"
                    className="hidden"
                    value={this.state.idShift}
                    readOnly
                  /> */}
                  <input
                    type="text"
                    placeholder="Nama Shift"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                    value={this.state.namaShift}
                    onChange={(e) =>
                      this.setState({ namaShift: e.target.value })
                    }
                    required
                  />
                  <input
                    type="time"
                    placeholder="Jam Masuk"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                    value={this.state.jamMasuk}
                    onChange={(e) =>
                      this.setState({ jamMasuk: e.target.value })
                    }
                    required
                  />
                  <input
                    type="time"
                    placeholder="Jam Pulang"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                    value={this.state.jamPulang}
                    onChange={(e) =>
                      this.setState({ jamPulang: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Nominal"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                    value={this.state.nominal}
                    onChange={(e) => this.setState({ nominal: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Garansi Fee"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                    value={this.state.garansiFee}
                    onChange={(e) =>
                      this.setState({ garansiFee: e.target.value })
                    }
                    required
                  />
                  {this.state.isEdit ? (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:bg-teal-600"
                      onClick={this.handleUpdate}
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:bg-teal-600"
                      onClick={this.handleSave}
                    >
                      Simpan
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-lg">
          <div className="flex flex-col p-10">
            <MUIDataTable
              title={"Data Shift"}
              data={datas}
              columns={columns}
              options={options}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
