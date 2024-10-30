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
class TodayJadwal extends Component {
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
      pegawaiTerpilih: {},
      jabatan: {},
      dataJadwal: [],
      isUpdate: false,
      idJadwal: "",
      searchQuery: "",
      selectedBulan: null,
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

  translateBulan(monthName) {
    const englishMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const indonesianMonths = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    if (indonesianMonths.includes(monthName)) {
      const index = indonesianMonths.indexOf(monthName);
      if (index !== -1) {
        return englishMonths[index];
      } else {
        return "Bulan tidak valid";
      }
    }
    if (englishMonths.includes(monthName)) {
      const index = englishMonths.indexOf(monthName);
      if (index !== -1) {
        return indonesianMonths[index];
      } else {
        return "Bulan tidak valid";
      }
    }
  }

  convertDateFormatBulan(namaBulan, tahun) {
    const namaBul = this.translateBulan(namaBulan);
    // Validasi nama bulan
    const bulanIndex = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].indexOf(namaBul);
    if (bulanIndex === -1) {
      return "Nama bulan tidak valid";
    }

    const tahunDate = parseInt(tahun);
    // Validasi tahun
    if (!Number.isInteger(tahunDate) || tahun < 0) {
      return "Tahun tidak valid";
    }

    // Format tanggal sesuai nama bulan dan tahun
    const formattedTanggal = dayjs(`${tahun}-${bulanIndex + 1}-01`)
      .startOf("month")
      .format("YYYY-MM-DD[T]00:00");
    const day = dayjs(formattedTanggal);
    return day;
  }
  convertDateFormat(tanggal) {
    // Mengubah tanggal menjadi objek dayjs untuk memudahkan manipulasi
    const tanggalAwal = dayjs(tanggal); // Menetapkan waktu ke awal hari
    const formattedTanggal = tanggalAwal.format("YYYY-MM-DD[T]00:00"); // Memformat tanggal ke format yang diinginkan
    return tanggalAwal;
  }

  handleDateChange = (name, selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate);
    console.log(selectedDate);
    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }

    if (name == "tanggalDateAwal") {
      const formattedDate = dayjsDate.format("YYYY/MM/DD");

      this.setState({
        tanggalAwal: formattedDate,
        tanggalDateAwal: selectedDate,
      });
    } else if (name == "tanggalDateAkhir") {
      const formattedDate = dayjsDate.format("YYYY/MM/DD");
      this.setState({
        tanggalAkhir: formattedDate,
        tanggalDateAkhir: selectedDate,
      });
    } else {
      const tahun = dayjsDate.format("YYYY");
      const bulan = dayjsDate.format("MMMM");
      const namaBulan = this.translateBulan(bulan);
      this.setState({ tahun: tahun, bulan: namaBulan });
    }

    // Update the state with the formatted date
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

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
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
    console.log("jadwal", this.state.dataJadwal);
    const filteredData = this.state.dataJadwal.map((data) => []);

    const columns = [
      {
        name: "Tanggal",

        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataJadwal[tableMeta.rowIndex];
            return (
              <td>
                <div style={{ width: "100%" }} className="droplink">
                  {this.formatStringTanggal(data.tanggal)}
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
            const data = this.state.dataJadwal[tableMeta.rowIndex];
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
        name: "Shift",

        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataJadwal[tableMeta.rowIndex];
            return (
              <td>
                <div style={{ width: "100%" }} className="droplink">
                  {data.nama_shift}
                </div>
              </td>
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
      <div className="container mx-auto mt-2 ">
        <div className="rounded-lg bg-white shadow-lg my-5 w-full">
          <div className="flex flex-col p-10">
            <h4 className="text-black font-bold text-xl mt-5">
              Jadwal pegawai Hari Ini
            </h4>
            <br />
            <hr />
            <br />

            <div className="form-input mt-10">
              <Row className="flex justify-start  items-center">
                <Form.Group className=" flex justify-start gap-6 items-center">
                  <Form.Label className="label-text">Tanggal :</Form.Label>
                  <div className=" w-[20rem]">
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
                </Form.Group>
                <Form.Group className="form-field">
                  <Form.Label className="label-text">Jabatan :</Form.Label>
                  <div className="dropdown-container">
                    <Select
                      onChange={(selectedOption) =>
                        this.handleSelect(selectedOption)
                      }
                      name="barcodeTerpilih"
                      inputId="input"
                      placeholder="Pilih Pegawai..."
                      options={jabatanOption}
                      isSearchable={true}
                    />
                  </div>
                </Form.Group>
                <button
                  type="submit"
                  className="btn-input btn-15 custom-btn ml-14"
                  onClick={this.getJadwal}
                >
                  Cari
                </button>
              </Row>
            </div>
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
            <MUIDataTable
              title={"Data Jadwal"}
              data={filteredData}
              columns={columns}
              options={options}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TodayJadwal;
