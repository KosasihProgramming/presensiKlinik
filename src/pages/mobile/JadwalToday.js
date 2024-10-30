import React, { Component } from "react";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { urlAPI } from "../../config/global";
import Swal from "sweetalert2";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import Select from "react-select";
import "../../style/jadwal.css";
import "../../style/button.css";
import "../../style/detail.css";
import { Link } from "react-router-dom";
class TodayJadwalMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tanggalDateAwal: dayjs("2024-02-23T10:50"),
      tanggalAwal: "",
      tanggalAwal1: "",
      tanggalDateAkhir: dayjs("2024-02-23T10:50"),
      tanggalAkhir1: "",
      tanggalAkhir: "",
      barcode: "",
      bulan: "",
      tahun: "",
      bulan1: "",
      tahun1: "",
      bulanFilter: "",
      tahunFilter: "",
      dataPegawai: [],
      dataBarcode: [],
      namaPegawai: "",
      barcodeTerpilih: {},
      currentPage: 1,
      pegawaiTerpilih: {},
      dataJadwal: [],
      isUpdate: false,
      idJadwal: "",
      searchQuery: "",
      selectedBulan: null,
      dataJadwal: [],
      bulanTahun: dayjs("2024-02-23T10:50"),
    };
  }

  componentDidMount = () => {
    this.formatTanggal();
  };
  formatTanggal = () => {
    const today = dayjs().locale("id");
    const formattedDate = today.format("YYYY/MM/DD");
    // const day = today.format("YYYY-MM-DDTHH:mm:ss");
    // const formattedDate2 = today.format("YYYY/MM/DD");
    // const jam = today.format("HH:mm");
    const tahun = today.format("YYYY");
    const bulan = today.format("MMMM");
    console.log(today);
    this.setState({
      bulanFilter: bulan,
      tahunFilter: tahun,
      tanggalAwal: formattedDate,
      tanggalDateAwal: today,
      tanggalAkhir: formattedDate,
      tanggalDateAkhir: today,
    });
  };
  getJadwal = () => {
    const postData = {
      tanggal: this.state.tanggalAwal,
      jabatan: this.state.jabatan.value,
    };
    console.log(postData);

    axios
      .post(urlAPI + "/jadwal/jadwal-today/", postData)
      .then((response) => {
        // Adding tanggal property to each data item

        this.setState({ dataJadwal: response.data });
        console.log("Data", response.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  handleSelect = (selectedOption) => {
    // Update state with selected option dynamically based on dropdown name

    this.setState({ jabatan: selectedOption });
  };

  formatStringTanggal = (tanggal) => {
    // Mengubah format input dari YYYY/MM/DD menjadi YYYY-MM-DD agar dikenali oleh objek Date
    const [year, month, day] = tanggal.split("/");
    const formattedInput = `${year}-${month}-${day}`;

    // Mengonversi menjadi format yang diinginkan
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = new Date(formattedInput).toLocaleDateString(
      "id-ID",
      options
    );

    console.log(formattedDate);
    return formattedDate;
  };

  render() {
    const itemsPerPage = 5; // Jumlah kartu per halaman
    const totalPages = Math.ceil(this.state.dataJadwal.length / itemsPerPage);

    // Filter data berdasarkan halaman aktif
    const currentData = this.state.dataJadwal.slice(
      (this.state.currentPage - 1) * itemsPerPage,
      this.state.currentPage * itemsPerPage
    );

    // Fungsi untuk berpindah ke halaman berikutnya
    const nextPage = () => {
      if (this.state.currentPage < totalPages) {
        this.setState({ currentPage: this.state.currentPage + 1 });
      }
    };

    // Fungsi untuk berpindah ke halaman sebelumnya
    const prevPage = () => {
      if (this.state.currentPage > 1) {
        this.setState({ currentPage: this.state.currentPage - 1 });
      }
    };

    const jabatanOption = [
      { value: "Perawat Umum", label: "Perawat Umum" },
      { value: "Perawat Gigi", label: "Perawat Gigi" },
      { value: "Dokter Umum", label: "Dokter Umum" },
      { value: "Dokter Gigi", label: "Dokter Gigi" },
      { value: "Analis", label: "Analis" },
      { value: "Farmasi", label: "Farmasi" },
      { value: "GTS", label: "GTS" },
      { value: "CS", label: "Cleaning Service" },
    ];

    return (
      <div className="container mx-auto mt-2  ">
        <div className="rounded-lg bg-white w-full">
          <div className="flex flex-col p-2 items-center justify-center">
            <h4 className="text-black font-bold text-xl ">
              Jadwal Pegawai Klinik
            </h4>
          </div>
        </div>

        <div
          className="rounded-lg bg-white shadow-lg"
          style={{ padding: "1rem 0" }}
        >
          <div className="w-full flex flex-col justify-start gap-4 items-center px-4 mt-5">
            <div className="w-full rounded-md  border border-teal-600 shadow-md cursor-pointer z-[9999]">
              <Select
                onChange={(selectedOption) => this.handleSelect(selectedOption)}
                name="barcodeTerpilih"
                inputId="input"
                placeholder="Pilih Pegawai..."
                options={jabatanOption}
                isSearchable={true}
              />
            </div>
            <div className=" w-[100%] flex justify-center items-center mt-4">
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                className=""
                adapterLocale="en-gb"
              >
                <DatePicker
                  name="tanggalAwal"
                  locale="id"
                  label="Tanggal"
                  value={this.state.tanggalDateAwal}
                  onChange={(selectedDate) =>
                    this.handleDateChange("tanggalDateAwal", selectedDate)
                  }
                  inputFormat="DD/MM/YYYY"
                />
              </LocalizationProvider>
            </div>
            <button
              className="btn-input btn-15 custom-btn"
              onClick={this.getJadwal}
            >
              Cari
            </button>
          </div>
          <div className="w-full p-4 flex items-center justify-center">
            <div className="w-full p-4 flex justify-start gap-4 items-center flex-col border border-teal-500 rounded-lg">
              {currentData.map((data) => (
                <div className="w-full p-2 rounded-sm shadow-md bg-white flex flex-col justify-center items-start gap-2">
                  <div className="font-medium text-lg">{data.nama}</div>
                  <div className="font-normal text-sm">
                    {data.nama_shift} | {data.bulan} {data.tahun}
                  </div>
                </div>
              ))}

              {/* Tombol navigasi halaman */}
              <div className="flex justify-between items-center w-full mt-4">
                <button
                  className="p-2 bg-teal-500 text-white rounded-md disabled:opacity-50"
                  onClick={prevPage}
                  disabled={this.state.currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {this.state.currentPage} of {totalPages}
                </span>
                <button
                  className="p-2 bg-teal-500 text-white rounded-md disabled:opacity-50"
                  onClick={nextPage}
                  disabled={this.state.currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TodayJadwalMobile;
