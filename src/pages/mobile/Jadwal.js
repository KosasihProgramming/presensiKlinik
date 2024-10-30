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
class JadwalKehadiranMobile extends Component {
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
      bulanTahun: dayjs("2024-02-23T10:50"),
    };
  }

  componentDidMount = () => {
    this.formatTanggal();
    this.getPegawai();
    this.getBarcode();
  };
  formatTanggal = () => {
    const today = dayjs().locale("id");
    const formattedDate = today.format("YYYY-MM-DD");
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

    this.getJadwal(tahun);
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

  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
  };

  handleBulanFilterChange = (selectedOption) => {
    this.setState({ selectedBulan: selectedOption });
  };

  getFilteredData = () => {
    const { dataJadwal, searchQuery, selectedBulan } = this.state;

    return dataJadwal.filter((data) => {
      const matchNama = data.nama
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchBulan =
        selectedBulan === null || data.bulan === selectedBulan.value;

      return matchNama && matchBulan;
    });
  };
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

  handleSubmit = (e) => {
    e.preventDefault();
    const { tanggalAwal, tanggalAkhir, bulan, tahun, barcode } = this.state;

    console.log(tanggalAwal);
    console.log(tanggalAkhir);
    console.log(bulan);

    // Cek kelengkapan form
    if (!tanggalAwal || !tanggalAkhir || !bulan || !tahun || !barcode) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }

    const postData = {
      tanggalAwal,
      tanggalAkhir,
      bulan,
      tahun,
      barcode,
    };

    const dataExists = this.state.dataJadwal.some((jadwal) => {
      // Membandingkan barcode, tanggal, dan bulan dengan data yang ada
      return (
        jadwal.barcode === barcode &&
        jadwal.bulan === bulan &&
        jadwal.tahun === tahun
      );
    });
    if (dataExists) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Periode Jadwal Sudah Ada , Silakan Buat periode Jadwal Lain",
      });
      return;
    } else {
      axios
        .post(urlAPI + "/jadwal/add/", postData)
        .then((response) => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil disimpan",
          });
          this.getJadwal(this.state.tahunFilter);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };

  getPegawai = () => {
    axios
      .get(urlAPI + "/pegawai/data/")
      .then((response) => {
        console.log(response);

        this.setState({
          dataPegawai: response.data,
        });

        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data Dokter", error);
      });
  };

  getBarcode = () => {
    axios
      .get(urlAPI + "/barcode/")
      .then((response) => {
        console.log(response);

        this.setState({
          dataBarcode: response.data,
        });

        console.log(response.data);
        console.log(this.state.dataJadwal[0].tahun, "jadwal");
      })
      .catch((error) => {
        console.error("Error fetching data Dokter", error);
      });
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };
  getJadwal = (tahun) => {
    const postData = {
      tahun,
    };
    console.log(this.state.dataJadwal);

    axios
      .post(urlAPI + "/jadwal/data/", postData)
      .then((response) => {
        // Adding tanggal property to each data item
        const newData = response.data.map((item) => ({
          ...item,
          tanggal:
            this.formatStringTanggal(this.formatDate(item.tanggal_awal)) +
            " sampai " +
            this.formatStringTanggal(this.formatDate(item.tanggal_akhir)),
        }));

        this.setState({ dataJadwal: newData });
        console.log("Data", newData);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  handleDelete = (idJadwal) => {
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
          .delete(`${urlAPI}/jadwal/delete/${idJadwal}`)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Data berhasil disimpan",
            });
            this.getJadwal(this.state.tahunFilter);
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    });
  };

  handleUpdateClick = (item) => {
    this.setState({ isUpdate: true });
    const barcode = this.state.dataBarcode.find(
      (data) => data.barcode === item.barcode
    );
    const pegawai = this.state.dataPegawai.find(
      (data) => data.id === barcode.id
    );
    const pegawaiDapat = { value: pegawai.id, label: pegawai.nama };
    if (pegawai) {
      this.setState({ pegawaiTerpilih: pegawaiDapat });
    }
    this.setState({ barcode: item.barcode });

    const tanggalAwal = this.convertDateFormat(item.tanggal_awal);
    const tanggalAkhir = this.convertDateFormat(item.tanggal_akhir);
    const bulanTahun = this.convertDateFormatBulan(item.bulan, item.tahun);
    const bulan = this.translateBulan(bulanTahun.format("MMMM"));
    const tahun = bulanTahun.format("YYYY");
    const tanggalAwal1 = tanggalAwal.format("YYYY/MM/DD");
    const tanggalakhir1 = tanggalAkhir.format("YYYY/MM/DD");

    this.setState({
      tanggalDateAwal: tanggalAwal,
      tanggalDateAkhir: tanggalAkhir,
      bulanTahun: bulanTahun,
      bulan: bulan,
      tahun: tahun,
      bulan1: bulan,
      tahun1: tahun,
      idJadwal: item.id,
      tanggalAwal1: tanggalAwal1,
      tanggalAkhir1: tanggalakhir1,
      tanggalAwal: tanggalAwal1,
      tanggalAkhir: tanggalakhir1,
    });
  };

  handleUpdate = (e) => {
    e.preventDefault();
    const {
      tanggalAwal,
      tanggalAkhir,

      bulan,
      tahun,

      barcode,
      idJadwal,
    } = this.state;

    console.log(tanggalAwal);
    console.log(tanggalAkhir);
    console.log(bulan);

    const postData = {
      tanggalAwal,
      tanggalAkhir,

      bulan,
      tahun,

      barcode,
      idJadwal,
    };

    axios
      .post(urlAPI + "/jadwal/edit/", postData)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
        this.getJadwal(this.state.tahunFilter);
        this.setState({ isUpdate: false });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  handleSelect = (name, selectedOption) => {
    // Update state with selected option dynamically based on dropdown name
    let kode = "";
    // Lakukan pencarian berdasarkan kd_dokter
    console.log(this.state.dataBarcode);
    const barcode = this.state.dataBarcode.find(
      (data) => data.id === selectedOption.value
    );
    if (selectedOption) {
      this.setState({ pegawaiTerpilih: selectedOption });
    }

    // Periksa apakah dokterTerpilih ditemukan
    if (barcode) {
      kode = barcode.barcode;
      // Lakukan pencarian berdasarkan kd_dokter
      this.setState({ barcode: kode });
    }
    console.log(`${name} Terpilih`, this.state[name]);
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
    const filteredData = this.getFilteredData();
    console.log(filteredData, "data filter");
    const dataList = filteredData.map((data) => []);

    const options = {
      selectableRows: false,
      elevation: 0,
      rowsPerPage: 5,
      rowsPerPageOption: [5, 10],
    };

    const barcodeOptions = this.state.dataPegawai.map((data) => ({
      value: data.id,
      label: data.nama, // Ganti dengan properti yang sesuai dari objek dokter
    }));
    const months = [
      { value: "Januari", label: "Januari" },
      { value: "Februari", label: "Februari" },
      { value: "Maret", label: "Maret" },
      { value: "April", label: "April" },
      { value: "Mei", label: "Mei" },
      { value: "Juni", label: "Juni" },
      { value: "Juli", label: "Juli" },
      { value: "Agustus", label: "Agustus" },
      { value: "September", label: "September" },
      { value: "Oktober", label: "Oktober" },
      { value: "November", label: "November" },
      { value: "Desember", label: "Desember" },
    ];

    const itemsPerPage = 5; // Jumlah kartu per halaman
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Filter data berdasarkan halaman aktif
    const currentData = filteredData.slice(
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
            <Link
              to={"/today-jadwal-mobile"}
              className="bg-teal-500 hover:bg-white hover:text-teal-600 duration-300 hover:scale-105 border hover:border-teal-500 text-white rounded-xl shadow-lg px-10 w-[15rem] py-3 flex justify-center items-center"
            >
              Cek Jadwal
            </Link>
            <div className="w-full rounded-md  border border-teal-600 shadow-md cursor-pointer">
              <Select
                onChange={(selectedOption) =>
                  this.handleBulanFilterChange(selectedOption)
                }
                name="barcodeTerpilih"
                inputId="input"
                placeholder="Pilih Bulan..."
                className="border-none"
                options={months}
                isSearchable={true}
                isClearable
              />
            </div>
            <input
              type="text"
              placeholder="Cari Nama Dokter"
              className="p-2 border rounded-md border-teal-600 w-full cursor-pointer shadow-md"
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>
          <div className="w-full p-4 flex items-center justify-center">
            <div className="w-full p-4 flex justify-start gap-4 items-center flex-col border border-teal-500 rounded-lg">
              {currentData.map((data) => (
                <Link
                  to={`/detail-jadwal-mobile/${data.uid}`}
                  className="w-full p-2 rounded-sm shadow-md bg-white flex flex-col justify-center items-start gap-2"
                >
                  <div className="font-medium text-lg">{data.nama}</div>
                  <div className="font-normal text-sm">
                    {data.bulan} {data.tahun}
                  </div>
                </Link>
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

export default JadwalKehadiranMobile;
