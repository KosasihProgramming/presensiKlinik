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
import withRouter from "../../withRouter";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import Slide from "@mui/material/Slide";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ContactPageSharp } from "@mui/icons-material";
import { differenceInDays, eachDayOfInterval } from "date-fns";
import { Link } from "react-router-dom";

class DetailJadwalMobile extends Component {
  constructor(props) {
    super(props);
    const { idJadwal } = this.props.params;
    this.state = {
      tanggalDate: dayjs(),
      tanggalDateAwal: dayjs(),
      tanggalDateAkhir: dayjs(),
      tanggal: "",
      barcode: "",
      bulan: "",
      tahun: "",
      idDetail: "",
      bulanFilter: "",
      currentPage: 1,
      tahunFilter: "",
      dataShift: [],
      namaPegawai: "",
      shiftTerpilih: {},
      judul: [],
      dataJadwal: [],
      isInputJadwalOtomatis: false,
      isUpdate: false,
      isInput: false,
      idJadwal: "",
      uidJadwal: idJadwal,
      dataDetail: [],
      jamMasuk: "",
      jamKeluar: "",
      idShift: "",
      totalJadwal: 0,
      jumlahHadir: 0,
      persenHadir: 0,
      tanggalAwal: "",
      tanggalAkhir: "",
      tanggalAwalOtomatis: "",
      tanggalAkhirOtomatis: "",
      tableDetail: true,
      kalenderDetail: false,
      height: "0px",
      dataExport: [],
      dataExportDetail: [],
      startDate: "",
      endDate: "",
      kalender: [],
      dataExportKalender: [],
      dataListkalender: [],
    };
    this.containerRef = React.createRef();
  }

  componentDidMount = () => {
    this.formatTanggal();
    this.getJadwal();
    this.getShift();
    this.getDetailJadwal();
  };

  getDatesBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysBetween = differenceInDays(end, start) + 1;
    const datesArray = eachDayOfInterval({ start: start, end: end });

    const formattedDates = datesArray.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Menambahkan angka 0 di depan untuk bulan dengan satu digit
      const day = String(date.getDate()).padStart(2, "0"); // Menambahkan angka 0 di depan untuk hari dengan satu digit
      return `${year}/${month}/${day}`;
    });

    this.setState({ kalender: formattedDates });
    console.log(formattedDates);
    return formattedDates;
  };
  handleTab = () => {
    this.setState({ tableDetail: true, kalenderDetail: false });
  };
  handleTab2 = () => {
    this.setState({ tableDetail: false, kalenderDetail: true });
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
      tanggal: formattedDate,
      tanggalDate: today,
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
  convertDateFormat(tanggal) {
    // Mengubah tanggal menjadi objek dayjs untuk memudahkan manipulasi
    const tanggalAwal = dayjs(tanggal).locale("id"); // Menetapkan waktu ke awal hari
    const formattedTanggal = tanggalAwal.format("YYYY-MM-DD[T]00:00"); // Memformat tanggal ke format yang diinginkan
    return tanggalAwal;
  }
  convertDateFormatString(tanggal) {
    // Mengubah tanggal menjadi objek dayjs untuk memudahkan manipulasi
    const tanggalAwal = dayjs(tanggal).locale("id"); // Menetapkan waktu ke awal hari
    const formattedTanggal = tanggalAwal.format("DD/MM/YYYY"); // Memformat tanggal ke format yang diinginkan
    return formattedTanggal;
  }

  handleDateChange = (name, selectedDate) => {
    // Convert selectedDate to Dayjs object if it's not already
    const dayjsDate = dayjs(selectedDate);
    console.log(selectedDate);
    // Ensure dayjsDate is a valid Dayjs object
    if (!dayjsDate.isValid()) {
      return; // Handle invalid date selection appropriately
    }
    const formattedDate = dayjsDate.format("YYYY/MM/DD");

    if (name == "tanggalDateAwal") {
      this.setState({
        tanggalAwalOtomatis: formattedDate,
        tanggalDateAwal: selectedDate,
      });
    } else if (name == "tanggalDateAkhir") {
      this.setState({
        tanggalAkhirOtomatis: formattedDate,
        tanggalDateAkhir: selectedDate,
      });
    } else {
      this.setState({
        tanggal: formattedDate,
        tanggalDate: selectedDate,
      });
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
    const { idShift, idJadwal, tanggal } = this.state;
    console.log(idJadwal);
    console.log(idShift);
    console.log(tanggal);
    // Cek kelengkapan form
    if (!tanggal || !idShift || !idJadwal) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }

    const postData = {
      idShift,
      idJadwal,
      tanggal,
    };

    const dataExists = this.state.dataDetail.some((jadwal) => {
      // Membandingkan barcode, tanggal, dan bulan dengan data yang ada
      return jadwal.id_shift === idShift && jadwal.tanggal === tanggal;
    });
    if (dataExists) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Jadwal Sudah Ada , Silakan Buat Jadwal Lain",
      });
      return;
    } else {
      axios
        .post(urlAPI + "/detail-jadwal/add/", postData)
        .then((response) => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil disimpan",
          });
          this.setState({ isInput: false });
          this.getDetailJadwal(this.state.idJadwal);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };

  handleSubmitOtomatis = (e) => {
    e.preventDefault();
    const { idShift, idJadwal, tanggalAwalOtomatis, tanggalAkhirOtomatis } =
      this.state;

    console.log(idJadwal);
    console.log(idShift);
    console.log(tanggalAwalOtomatis);
    console.log(tanggalAkhirOtomatis);

    const rentangTanggal = this.getDatesBetween(
      tanggalAwalOtomatis,
      tanggalAkhirOtomatis
    );

    console.log("rentang", rentangTanggal);

    // Cek kelengkapan form
    if (!idShift || !idJadwal || rentangTanggal.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }

    const dataDetail = this.state.dataDetail;

    rentangTanggal.forEach((tanggal) => {
      const postData = {
        idShift,
        idJadwal,
        tanggal,
      };

      console.log(postData);
      const dataExists = dataDetail.some((jadwal) => {
        // Membandingkan idShift dan tanggal dengan data yang ada
        return jadwal.id_shift === idShift && jadwal.tanggal === tanggal;
      });

      if (dataExists) {
        Swal.fire({
          icon: "error",
          title: "Kesalahan",
          text: `Jadwal untuk tanggal ${tanggal} sudah ada, silakan buat jadwal lain`,
        });
      } else {
        axios
          .post(urlAPI + "/detail-jadwal/add/", postData)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: `Data untuk tanggal ${tanggal} berhasil disimpan`,
            });
            this.getDetailJadwal(this.state.idJadwal);
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    });
  };

  getShift = () => {
    axios
      .get(urlAPI + "/shift/")
      .then((response) => {
        console.log(response);

        this.setState({
          dataShift: response.data,
        });

        console.log(response.data);
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
  getDetailJadwal = () => {
    const idJadwal = this.state.idJadwal;
    const postData = {
      idJadwal,
    };
    // alert("jalan");
    axios
      .post(urlAPI + "/detail-jadwal/", postData)
      .then((response) => {
        const jumlahHadir = response.data.filter(
          (item) => item.isHadir === 1
        ).length;
        let persen = 0;

        const jumlahJadwal = response.data.length;
        persen = (jumlahHadir / jumlahJadwal) * 100;
        this.setState({
          totalJadwal: jumlahJadwal,
          jumlahHadir: jumlahHadir,
          persenHadir: persen || 0,
        });
        const newData = response.data.map((item) => ({
          ...item,
          hadir: item.isHadir == 0 ? "Tidak" : "Ya", // Menggunakan operator ternary
        }));
        const data = newData.map((item) => [
          item.tanggal,
          item.nama,
          item.nama_shift,
          item.jam_masuk,
          item.jam_pulang,
          item.hadir,
          item.nominal_hadir,
        ]);

        const dataExportDetail = newData.map((item) => [
          item.tanggal,
          item.nama_shift,
        ]);
        console.log(data, "jaja");
        const propertyNames = [
          "Tanggal",
          "Nama Dokter",
          "Shift",
          "Jam",
          "",
          "Hadir",
          "Nominal",
        ];

        const propertyNames2 = ["", "", "", "Jam Masuk", "Jam Pulang", "", ""];
        const newArray = [];
        for (const obj of data) {
          const rowValues = Object.values(obj);
          newArray.push(rowValues);
        }
        newArray.unshift(propertyNames2);
        console.log(newData, "poro");
        this.setState({
          dataDetail: newData,
          judul: propertyNames,
          dataExport: newArray,
          dataExportDetail: dataExportDetail,
        });
        this.getDataKalender(newData);
      })

      .catch((error) => {
        console.log("Error:", error);
      });
  };

  handleExport = () => {
    const columnHeaders = this.state.judul;

    const csvString = [
      columnHeaders.join(","),
      ...this.state.dataExport.map((row) => {
        const rowValues = Object.values(row).map((value) => `"${value}"`);
        return rowValues.join(",");
      }),
    ].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dataKehadiran.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  handleExportKalender = () => {
    const columnHeaders = ["Tanggal", "Shift"];

    const csvString = [
      columnHeaders.join(","),
      ...this.state.dataExportKalender.map((row) => {
        const rowValues = Object.values(row).map((value) => `${value}`);
        return rowValues.join(",");
      }),
    ].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dataKehadiranKalender.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  getJadwal = () => {
    const idJadwal = this.state.uidJadwal;
    const postData = {
      idJadwal,
    };

    console.log("data", postData);
    axios
      .post(urlAPI + "/jadwal/data/detail/", postData)
      .then((response) => {
        const tanggalAwal = this.convertDateFormatString(
          response.data[0].tanggal_awal
        );
        const tanggalAkhir = this.convertDateFormatString(
          response.data[0].tanggal_akhir
        );
        const end = response.data[0].tanggal_akhir.replace(/\//g, "-");
        const start = response.data[0].tanggal_awal.replace(/\//g, "-");
        this.setState({
          datajadwal: response.data[0],
          namaPegawai: response.data[0].nama,
          bulan: response.data[0].bulan,
          tahun: response.data[0].tahun,
          tanggalAwal: tanggalAwal,
          tanggalAkhir: tanggalAkhir,
          idJadwal: response.data[0].id,
        });
        this.getDetailJadwal();
        this.getDatesBetween(start, end);
        console.log("datajadwal", response.data[0]);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };
  handleDelete = (idDetail) => {
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
          .delete(urlAPI + `/detail-jadwal/delete/${idDetail}`)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Data berhasil di Hapus",
            });
            this.getJadwal();
            this.getDetailJadwal();
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    });
  };

  handleUpdateClick = (item) => {
    this.setState({ isUpdate: true, isInput: false });
    const shift = this.state.dataShift.find(
      (data) => data.id_shift === item.id_shift
    );

    const shiftDapat = { value: shift.id_shift, label: shift.nama_shift };
    if (shift) {
      this.setState({ shiftTerpilih: shiftDapat });
    }
    this.setState({
      jamKeluar: item.jam_pulang,
      jamMasuk: item.jam_masuk,
      idDetail: item.detail_jadwal_id,
    });

    const tanggalAwal = this.convertDateFormat(item.tanggal);
    const tanggal = tanggalAwal.format("YYYY/MM/DD");
    this.setState({
      tanggalDate: tanggalAwal,
      tanggal: tanggal,
    });
  };

  handleUpdate = (e) => {
    e.preventDefault();
    const { tanggal, idJadwal, idShift, idDetail } = this.state;

    const postData = {
      tanggal,
      idJadwal,
      idShift,
      idDetail,
    };

    axios
      .post(urlAPI + "/detail-jadwal/edit/", postData)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
        this.getDetailJadwal();
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
    const shift = this.state.dataShift.find(
      (data) => data.id_shift === selectedOption.value
    );
    if (selectedOption) {
      this.setState({ shiftTerpilih: selectedOption });
    }

    // Periksa apakah dokterTerpilih ditemukan
    if (shift) {
      kode = shift.id_shift;
      // Lakukan pencarian berdasarkan kd_dokter
      this.setState({
        idShift: kode,
        jamKeluar: shift.jam_pulang,
        jamMasuk: shift.jam_masuk,
      });
    }
    console.log(`${name} Terpilih`, this.state[name]);
  };
  handleInput = () => {
    this.setState({ isInputJadwalOtomatis: false });
    if (this.state.isInput == true) {
      this.setState({ isInput: false });
    } else {
      this.setState({ isInput: true });
    }
  };

  handleInputOtomatis = () => {
    this.setState({ isInputJadwalOtomatis: true });
    if (this.state.isInput == true) {
      this.setState({ isInput: false });
    } else {
      this.setState({ isInput: true });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isInput !== this.state.isInput) {
      if (!this.state.isInput) {
        setTimeout(() => {
          this.setState({ height: "0px" });
        }, 5000);
      }
    }
  }

  getDataKalender = (dataK) => {
    const arrayObjek = dataK;

    console.log(arrayObjek, "hahayukk");
    // Membuat objek untuk menyimpan hasil gabungan
    const hasilGabungan = {};

    // Mengiterasi array objek
    arrayObjek.forEach((objek) => {
      // Mengecek apakah objek.id sudah ada dalam hasilGabungan
      if (hasilGabungan[objek.tanggal]) {
        // Jika sudah ada, tambahkan nilai baru ke dalam array nilai
        hasilGabungan[objek.tanggal].nama_shift.push({
          nama: objek.nama_shift,
        });
      } else {
        // Jika belum ada, buat objek baru dengan array nama_shift yang berisi nama_shift pertama
        hasilGabungan[objek.tanggal] = {
          tanggal: objek.tanggal,
          nama_shift: [{ nama: objek.nama_shift }],
        };
      }
    });

    // Mengubah objek hasilGabungan menjadi array
    const kalenderTabel = Object.values(hasilGabungan);

    let tanggalKehadiran = [];
    kalenderTabel.forEach((item) => {
      // Cek apakah tanggal dalam objek kehadiran ada di dalam array kalender
      if (this.state.kalender.includes(item.tanggal)) {
        // Jika ada, tambahkan objek kehadiran ke variabel tanggalKehadiran
        let shifts = item.nama_shift.map((shift) => {
          return { nama: shift };
        });
        tanggalKehadiran.push({ tanggal: item.tanggal, nama_shift: shifts });
      } else {
        // Jika tidak ada, tambahkan objek libur ke variabel tanggalKehadiran
        tanggalKehadiran.push({
          tanggal: item.tanggal,
          nama_shift: [{ nama: { nama: "Libur" } }],
        });
      }
    });

    // Iterasi setiap tanggal dalam kalender
    this.state.kalender.forEach((tanggal) => {
      // Cek apakah tanggal dalam kalender tidak ada dalam variabel kehadiran
      if (!kalenderTabel.some((item) => item.tanggal === tanggal)) {
        // Jika tidak ada, tambahkan objek libur ke variabel tanggalKehadiran
        tanggalKehadiran.push({
          tanggal: tanggal,
          nama_shift: [{ nama: { nama: "Libur" } }],
        });
      }
    });

    // Urutkan tanggalKehadiran berdasarkan tanggal
    const data = tanggalKehadiran.sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );

    console.log(data, "datahay");
    this.setState({ dataListkalender: data });
    // Mengonversi objek nama_shift yang lebih dari satu menjadi objek terpisah
    let hasilAkhir = [];
    data.forEach((item) => {
      if (Array.isArray(item.nama_shift)) {
        item.nama_shift.forEach((shift) => {
          hasilAkhir.push({
            tanggal: item.tanggal,
            nama_shift: shift.nama.nama,
          });
        });
      } else {
        hasilAkhir.push({
          tanggal: item.tanggal,
          nama_shift: item.nama_shift.nama.nama,
        });
      }
    });

    // Mengurutkan kembali hasilAkhir berdasarkan tanggal
    hasilAkhir.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    this.setState({ dataExportKalender: hasilAkhir, dataListkalender: data });
    console.log("akhir", hasilAkhir);
  };
  formatStringTanggal = (tanggal) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = new Date(tanggal).toLocaleDateString(
      "id-ID",
      options
    );
    console.log(formattedDate);
    return formattedDate;
  };
  render() {
    // const tanggalNew = new Date(data.tanggal);
    // const tanggalTarget = tanggalNew.toLocaleDateString().split("T")[0];
    const dataDetail = this.state.dataDetail
      .slice()
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
      .map((data) => [
        this.formatStringTanggal(data.tanggal),
        data.nama_shift,
        data.jam_masuk,
        data.jam_pulang,
        data.hadir,
        data.nominal_hadir,
      ]);

    const columns = [
      "Tanggal",
      "Shift",
      "Jam Masuk",
      "jam Pulang",
      "Hadir",
      "Nominal Hadir",
      {
        name: "Aksi",
        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const data = this.state.dataDetail[tableMeta.rowIndex];
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
                  onClick={() => this.handleDelete(data.detail_jadwal_id)}
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

    const shiftOptions = this.state.dataShift.map((data) => ({
      value: data.id_shift,
      label: data.nama_shift, // Ganti dengan properti yang sesuai dari objek dokter
    }));

    const itemsPerPage = 5; // Jumlah kartu per halaman
    const totalPages = Math.ceil(dataDetail.length / itemsPerPage);

    // Filter data berdasarkan halaman aktif
    const currentData = this.state.dataDetail.slice(
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

    console.log(currentData, "data Jadwal");
    return (
      <div className="container mx-auto">
        <div className="w-full bg-teal-500 p-4 flex flex-col justify-center items-center gap-2">
          <h4 className=" font-medium text-white text-xl ">
            Jadwal Bulan {this.state.bulan} Tahun {this.state.tahun}
          </h4>
          <h4 className=" font-medium text-white text-xl ">
            {this.state.namaPegawai}
          </h4>
        </div>
        <div className="bg-white flex w-full justify-center items-center p-2 rounded-md">
          <button
            type="submit"
            className="btn-input btn-15 custom-btn"
            onClick={() => {
              this.setState({ isInput: !this.state.isInput });
            }}
          >
            Tambah Jadwal
          </button>
        </div>
        <div
          className={`${
            this.state.isInput ? "h-[29rem]" : "h-0"
          } duration-300 rounded-lg bg-white shadow-lg my-5`}
        >
          <div
            className={`${
              this.state.isInput ? "flex" : "hidden"
            } flex-col items-center p-4 duration-500`}
            style={{ backgroundColor: "white" }}
          >
            <h6 className="text-lg font-medium mb-6">Input Detail Jadwal</h6>
            <div className="flex flex-col justify-start items-center w-full">
              <div className="flex w-full flex-col justify-start items-center gap-6">
                <Form.Group className="w-full flex justify-between items-center ">
                  <Form.Label className="label-text">Shift :</Form.Label>
                  <div className="w-[60%] z-[99]">
                    <Select
                      onChange={(selectedOption) =>
                        this.handleSelect("barcodeTerpilih", selectedOption)
                      }
                      name="barcodeTerpilih"
                      inputId="input"
                      placeholder="Pilih Pegawai..."
                      options={shiftOptions}
                      isSearchable={true}
                    />
                  </div>
                </Form.Group>
                <Form.Group className="w-full flex justify-between items-center ">
                  <Form.Label className="label-text">Jam Masuk :</Form.Label>

                  <div
                    type="text"
                    className="w-[60%] border border-slate-400 bg-white p-4 rounded-md"
                    value={this.state.jamMasuk}
                  >
                    {this.state.jamMasuk}
                  </div>
                </Form.Group>
                <Form.Group className="w-full flex justify-between items-center ">
                  <Form.Label className="label-text">Jam Keluar :</Form.Label>

                  <div
                    type="text"
                    placeholder="Nama"
                    className="w-[60%] border border-slate-400 bg-white p-4 rounded-md"
                    value={this.state.jamKeluar}
                  >
                    {this.state.jamKeluar}
                  </div>
                </Form.Group>

                <Form.Group className="w-full flex justify-between items-center ">
                  <Form.Label className="label-text">Tanggal :</Form.Label>
                  <div className="w-[60%] border border-slate-400 bg-white p-4 rounded-md">
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      className="w-[60%] border border-slate-400 bg-white p-4 rounded-md"
                      adapterLocale="en-gb"
                    >
                      <DatePicker
                        name="tanggalAwal"
                        locale="id"
                        // style={{ zIndex: "999" }}
                        label="Tanggal Awal"
                        value={this.state.tanggalDate}
                        onChange={(selectedDate) =>
                          this.handleDateChange("tanggalDate", selectedDate)
                        }
                        inputFormat="DD/MM/YYYY"
                      />
                    </LocalizationProvider>
                  </div>
                </Form.Group>
              </div>
              <button
                type="submit"
                style={{ marginTop: "2rem" }}
                className="btn-input btn-15 custom-btn"
                onClick={this.handleSubmit}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>

        {this.state.isUpdate && (
          <>
            <div className="rounded-lg bg-white shadow-lg my-5">
              <div className="flex flex-col p-10">
                <h6 className="title-2">Update Detail Jadwal</h6>
                <div className="form-input">
                  <Row
                    className="form-row"
                    style={{ justifyContent: "flex-start", gap: "2rem" }}
                  >
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">Shift :</Form.Label>
                      <div className="dropdown-container">
                        <Select
                          onChange={(selectedOption) =>
                            this.handleSelect("barcodeTerpilih", selectedOption)
                          }
                          name="barcodeTerpilih"
                          value={this.state.shiftTerpilih}
                          inputId="input"
                          placeholder="Pilih Pegawai..."
                          options={shiftOptions}
                          isSearchable={true}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">
                        Jam Masuk :
                      </Form.Label>

                      <div
                        type="text"
                        style={{ width: "10rem" }}
                        placeholder="Nama"
                        className="nama-field"
                        value={this.state.jamMasuk}
                      >
                        {this.state.jamMasuk}
                      </div>
                    </Form.Group>
                    '
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">
                        Jam Keluar :
                      </Form.Label>

                      <div
                        type="text"
                        placeholder="Nama"
                        style={{ width: "10rem" }}
                        className="nama-field"
                        value={this.state.jamKeluar}
                      >
                        {this.state.jamKeluar}
                      </div>
                    </Form.Group>
                    '
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">Tanggal :</Form.Label>
                      <div className="datepicker">
                        <LocalizationProvider
                          dateAdapter={AdapterDayjs}
                          className="datepicker"
                          adapterLocale="en-gb"
                        >
                          <DatePicker
                            name="tanggalDate"
                            locale="id"
                            style={{ zIndex: "999999" }}
                            label="Tanggal"
                            value={this.state.tanggalDate}
                            onChange={(selectedDate) =>
                              this.handleDateChange("tanggalDate", selectedDate)
                            }
                            inputFormat="DD/MM/YYYY"
                          />
                        </LocalizationProvider>
                      </div>
                    </Form.Group>
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
              </div>
            </div>
          </>
        )}

        <div
          className="rounded-lg bg-white shadow-lg mt-4"
          style={{ paddingBottom: "1rem" }}
        >
          <div className="w-full p-4 flex items-center justify-center">
            <div className="w-full p-4 flex justify-start gap-4 items-center flex-col border border-teal-500 rounded-lg">
              {currentData.map((data) => (
                <Link
                  to={`/detail-jadwal-mobile/${data.uid}`}
                  className="w-full p-2 py-4 rounded-sm shadow-md bg-white flex flex-col justify-center items-start relative gap-4"
                >
                  <div
                    onClick={() => this.handleDelete(data.detail_jadwal_id)}
                    className="absolute right-2 top-2 text-xs flex text-red-600 font-medium bg-red-50 rounded-md justify-center items-center p-2"
                  >
                    Hapus
                  </div>
                  <div className="font-medium text-base">{data.nama_shift}</div>
                  <div className="font-normal text-sm">
                    {this.formatStringTanggal(data.tanggal)} / {data.jam_masuk}{" "}
                    - {data.jam_pulang}
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

export default withRouter(DetailJadwalMobile);
