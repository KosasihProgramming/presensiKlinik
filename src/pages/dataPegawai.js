import React, { Component } from "react";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { urlAPI } from "../config/global";
import Swal from "sweetalert2";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import Select from "react-select";
import "../style/jadwal.css";
import "../style/button.css";
import "../style/detail.css";
import { Link } from "react-router-dom";
class DataPegawai extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      barcode: "",
      barcodeEdit: "",
      nama: "",

      dataPegawai: [],
      dataBarcode: [],
      namaPegawai: "",
      barcodeTerpilih: {},
      pegawaiTerpilih: {},
      dataJadwal: [],
      isUpdate: false,
      idJadwal: "",
      bulanTahun: dayjs("2024-02-23T10:50"),
    };
  }

  componentDidMount = () => {
    this.getPegawai();
  };
  getPegawai = () => {
    axios
      .get(urlAPI + "/pegawai/data/")
      .then((response) => {
        console.log(response);

        const jumlahPegawai = response.data.length;

        this.setState({
          dataPegawai: response.data,
          barcode: parseInt(response.data[jumlahPegawai - 1].id) + 1,
          isShow: true,
        });
        console.log(response.data, "datavpegawai");
      })
      .catch((error) => {
        console.error("Error fetching data Dokter", error);
      });
  };
  handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    this.setState({ bulan: value }, () => {
      // Callback to ensure state is updated before calling getRegistrasi
      // const tanggal1 = this.state.tanggalAkhir;
      // const formattedDate = tanggal1.format("YYYY-MM-DD");
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { nama, barcode, kelamin } = this.state;

    // Cek kelengkapan form
    if (!kelamin || !nama || !barcode) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }

    const postData = {
      id: barcode,
      nama: nama,
      jk: kelamin.value,
      barcode: "0" + barcode,
    };

    axios
      .post(urlAPI + "/pegawai/add-pegawai/", postData)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
        this.setState({
          barcode: "",
          barcodeEdit: "",
          nama: "",
          kelamin: {},
        });
        this.getPegawai();
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  handleDelete = (id) => {
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
          .delete(`${urlAPI}/pegawai/delete-pegawai/${id}`)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Data berhasil dihapus",
            });
            this.getPegawai();
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    });
  };

  handleUpdateClick = (item) => {
    const kelaminOptions = [
      { value: "Pria", label: "Pria" },
      { value: "Wanita", label: "Wanita" },
    ];
    const jKelamin = kelaminOptions.filter((a) => a.value == item.jk);
    this.setState({ isUpdate: true });

    this.setState({
      barcodeEdit: item.id,
      nama: item.nama,
      kelamin: jKelamin[0],
      barcode: item.id,
    });
  };

  handleUpdate = (e) => {
    e.preventDefault();
    const { barcodeEdit, nama, kelamin } = this.state;

    const postData = {
      barcode: barcodeEdit,
      nama: nama,
      jk: kelamin.value,
    };

    axios
      .post(urlAPI + "/pegawai/update-pegawai/", postData)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
        this.getPegawai();
        this.setState({
          isUpdate: false,
          barcode: "",
          barcodeEdit: "",
          nama: "",
          kelamin: {},
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };
  formatID(id) {
    return `1${id.toString().padStart(3, "0")}`;
  }
  render() {
    console.log("data Pegawai List", this.state.dataPegawai);
    const dataList = this.state.dataPegawai.map((data) => []);
    const columns = [
      {
        name: "Barcode",

        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataPegawai[tableMeta.rowIndex];
            return (
              <td>
                <div style={{ width: "100%" }} className="droplink">
                  {data.id}
                </div>
              </td>
            );
          },
        },
      },
      {
        name: "Nama Pegawai",

        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataPegawai[tableMeta.rowIndex];
            return (
              <td>
                <div style={{ width: "100%" }} className="droplink">
                  {data.nama}
                </div>
              </td>
            );
          },
        },
      },
      {
        name: "Jenis Kelamin",

        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataPegawai[tableMeta.rowIndex];
            return (
              <td>
                <div style={{ width: "100%" }} className="droplink">
                  {data.jk}
                </div>
              </td>
            );
          },
        },
      },

      {
        name: "Aksi",
        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataPegawai[tableMeta.rowIndex];
            return (
              <div className="flex flex-row justify-center gap-2">
                <button
                  className="rounded-lg bg-yellow-400 px-4 py-2 font-bold cursor-pointer hover:bg-yellow-500"
                  onClick={() => this.handleUpdateClick(data)}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white cursor-pointer hover:bg-red-700"
                  onClick={() => this.handleDelete(data.id)}
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
      rowsPerPage: 5,
      rowsPerPageOption: [5, 10],
    };

    const kelaminOptions = [
      { value: "Pria", label: "Pria" },
      { value: "Wanita", label: "Wanita" },
    ];
    return (
      <div className="container mx-auto mt-2">
        <div className="rounded-lg bg-white shadow-lg my-5">
          <div className="flex flex-col p-10">
            <h4 className="text-black font-bold text-xl mt-5">
              Form Input Data Pegawai
            </h4>
            <br />
            <hr />
            <br />

            {this.state.isUpdate ? (
              <>
                <div className="form-input">
                  <Row className="form-row ">
                    <div className="  w-[50%] flex flex-col justify-center items-start gap-4 mr-6">
                      <Form.Label className="label-text">
                        Nama Pegawai :
                      </Form.Label>
                      <input
                        type="text"
                        placeholder="Nama Shift"
                        className="mt-1 p-2 border border-teal-600 rounded-md w-full focus:outline-none focus:ring focus:border-blue-500"
                        value={this.state.nama}
                        onChange={(e) =>
                          this.setState({ nama: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="  w-[20%] flex flex-col justify-center items-start gap-4">
                      <Form.Label className="label-text">Barcode :</Form.Label>

                      <div
                        className="w-full border-teal-600 border rounded-md p-2"
                        value={this.state.barcodeEdit}
                      >
                        {this.state.barcodeEdit}
                      </div>
                    </div>
                    <div className="  w-[30%]  flex ml-6 flex-col justify-center items-start gap-4">
                      <Form.Label className="label-text">
                        Jenis Kelamin :
                      </Form.Label>
                      <div className="w-[100%]">
                        <Select
                          onChange={(selectedOption) =>
                            this.setState({ kelamin: selectedOption })
                          }
                          inputId="input"
                          className="w-full border border-teal-600 rounded-md"
                          value={this.state.kelamin}
                          placeholder="Pilih Jenis Kelamin..."
                          options={kelaminOptions}
                          isSearchable={true}
                        />
                      </div>
                    </div>
                  </Row>
                  <button
                    type="submit"
                    style={{ marginTop: "2rem" }}
                    className="btn-input btn-15 custom-btn"
                    onClick={this.handleUpdate}
                  >
                    Update
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-input">
                  <Row className="form-row ">
                    <div className="  w-[50%] flex flex-col justify-center items-start gap-4 mr-6">
                      <Form.Label className="label-text">
                        Nama Pegawai :
                      </Form.Label>
                      <input
                        type="text"
                        placeholder="Nama Shift"
                        className="mt-1 p-2 border border-teal-600 rounded-md w-full focus:outline-none focus:ring focus:border-blue-500"
                        value={this.state.nama}
                        onChange={(e) =>
                          this.setState({ nama: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="  w-[20%] flex flex-col justify-center items-start gap-4">
                      <Form.Label className="label-text">Barcode :</Form.Label>

                      <div
                        className="w-full border-teal-600 border rounded-md p-2"
                        value={this.state.barcode}
                      >
                        {this.state.barcode}
                      </div>
                    </div>
                    <div className="  w-[30%]  flex ml-6 flex-col justify-center items-start gap-4">
                      <Form.Label className="label-text">
                        Jenis Kelamin :
                      </Form.Label>
                      <div className="w-[100%]">
                        <Select
                          onChange={(selectedOption) =>
                            this.setState({ kelamin: selectedOption })
                          }
                          inputId="input"
                          className="w-full border border-teal-600 rounded-md"
                          value={this.state.kelamin}
                          placeholder="Pilih Jenis Kelamin..."
                          options={kelaminOptions}
                          isSearchable={true}
                        />
                      </div>
                    </div>
                  </Row>
                  <button
                    type="submit"
                    style={{ marginTop: "2rem" }}
                    className="btn-input btn-15 custom-btn"
                    onClick={this.handleSubmit}
                  >
                    Simpan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className="rounded-lg bg-white shadow-lg"
          style={{ padding: "1rem 0" }}
        >
          <div
            className="flex flex-col p-10"
            style={{
              border: "1px solid #0d9488",
              margin: "2rem",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
          >
            {this.state.isShow == true && (
              <>
                <MUIDataTable
                  title={"Data Shift"}
                  data={dataList}
                  columns={columns}
                  options={options}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DataPegawai;
