import axios from "axios";
import { Component } from "react";
import { urlAPI } from "../config/global";
import { differenceInDays, eachDayOfInterval, formatDate } from "date-fns";
import MUIDataTable from "mui-datatables";
import Swal from "sweetalert2";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import "../style/jadwal.css";
import LoadingAnimation from "../components/Loading";
import { FaArrowRight } from "react-icons/fa6";
import ReactDOMServer from "react-dom/server";
import ModalInfo from "../components/ModalInfo";
import { HiOutlineSelector } from "react-icons/hi";

class RekapGajiPeriodePerawat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: new Date().getFullYear(),
      selectedMonth: "",
      dataInsentif: 0,
      dataNominal: [],
      bulan: "",
      judulKolom: [],
      dataExport: [],
      isCetak: false,
      isDapat: false,
      dataShift: [],
      dataPeriode: [],
      loading: false,
      infoData: [],
      dataBahan: [],
      nameInfo: "",
      showModal: false,
      hasilPencarian: [],
      isDokterGigi: false,
      dataDokterGigi: [],
      dataDokterPenggantiShift: [],
      isFilterDokterPengganti: true,
      dataGajiAkhirExport: [],
    };
  }

  handleYearChange = (e) => {
    this.setState({ selectedYear: parseInt(e.target.value) });
  };

  handleMonthChange = (select) => {
    this.setState({ selectedMonth: select.value, bulan: select.label });
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
      return { tanggal: `${year}-${month}-${day}` };
    });

    return formattedDates;
  };

  cekData = () => {
    console.log(this.state.dataShift, "shift");
    const dataShift = this.state.dataShift;
    const dataTotalGaji = this.state.dataPeriode;
    if (dataShift.length > 0 && dataTotalGaji.length == 0) {
      Swal.fire({
        title: "Perhatian",
        text: "Apakah Anda Ingin Memperbarui Data",
        showDenyButton: true,
        confirmButtonText: "Ya",
        denyButtonText: "Tidak",
        customClass: {
          actions: "my-actions",
          cancelButton: "order-1 right-gap",
          confirmButton: "order-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.setState({ loading: true });
          this.hapusShiftData();
        } else if (result.isDenied) {
        }
      });
    } else if (dataShift.length > 0 && dataTotalGaji.length > 0) {
      Swal.fire({
        title: "Perhatian",
        text: "Apakah Anda Ingin Memperbarui Data",
        showDenyButton: true,
        confirmButtonText: "Ya",
        denyButtonText: "Tidak",
        customClass: {
          actions: "my-actions",
          cancelButton: "order-1 right-gap",
          confirmButton: "order-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.setState({ loading: true });
          this.hapusSemuaData();
        } else if (result.isDenied) {
        }
      });
    } else if (dataShift.length == 0 && dataTotalGaji.length > 0) {
      Swal.fire({
        title: "Perhatian",
        text: "Apakah Anda Ingin Memperbarui Data",
        showDenyButton: true,
        confirmButtonText: "Ya",
        denyButtonText: "Tidak",
        customClass: {
          actions: "my-actions",
          cancelButton: "order-1 right-gap",
          confirmButton: "order-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.setState({ loading: true });
          this.hapusGajiData();
        } else if (result.isDenied) {
        }
      });
    } else {
      // this.getDataInsentif();
    }
  };

  cekDataInsentif = () => {
    let tahunAwal = this.state.selectedYear;
    const bulan = this.state.bulan;
    let data = [];

    const newData = {
      bulan: this.state.bulan,
      tahun: tahunAwal,
    };
    axios
      .post(urlAPI + "/insentif-perawat-gigi/cek/data/", newData)
      .then((response) => {
        this.setState({ dataShift: response.data });
        this.cekDataTotalGaji();
      })
      .catch((error) => {
        console.log("Error pada tanggal", ":", error);
      });
    console.log(data, "shifthh");
  };

  cekDataTotalGaji = () => {
    let tahunAwal = this.state.selectedYear;
    const bulan = this.state.bulan;
    let data = [];

    const newData = {
      bulan: this.state.bulan,
      tahun: tahunAwal,
    };
    axios
      .post(urlAPI + "/periode-perawat-gigi/cek/data/", newData) //select data semua berdasarkan bulan, tahun
      .then((response) => {
        this.setState({ dataPeriode: response.data }, () => {
          this.cekData();
        });
        // console.log("Sebelum Export: ", this.state.dataGajiAkhirExport);
        const newDataBaru = this.state.dataGajiAkhirExport.reduce(
          (acc, item) => {
            acc.push(
              {
                nama_perawat: item.nama_perawat,
                variabel: "NOMINAL SHIFT",
                jumlah: item.total_data_nominal,
                total: item.total_nominal,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "INSENTIF PERAWAT GIGI",
                jumlah: "",
                total: item.total_insentif,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "POTONGAN TELAT",
                jumlah: "",
                total: item.total_denda_telat,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "TOTAL GAJI YANG DITERIMA",
                jumlah: "",
                total: item.total_data_gaji_akhir,
              }
            );
            return acc;
          },
          []
        );

        // console.log(newDataBaru, "data baru");

        const data = newDataBaru.map((item) => [
          item.nama_dokter,
          item.variabel,
          item.jumlah === "" ? "" : item.jumlah,
          item.total,
        ]);

        const newArray = [];
        for (const obj of data) {
          const rowValues = Object.values(obj);
          newArray.push(rowValues);
        }

        const transformedArray = newArray.map((item) => {
          const [nama_dokter, variabel, jumlah, total] = item;

          // Jika nama dokter sama dengan elemen sebelumnya, ubah nama dokter menjadi string kosong
          return [
            nama_dokter === newArray[newArray.indexOf(item) - 1]?.[0]
              ? ""
              : nama_dokter,
            variabel,
            jumlah,
            total,
          ];
        });

        const propertyNames = ["Nama Perawat", "Variabel", "Jumlah", "Total"];

        this.setState({
          judulKolom: propertyNames,
          dataExport: transformedArray,
        });
        this.setState({
          isCetak: true,
          loading: false,
        });
        console.log(response.data, "cek");
      })
      .catch((error) => {
        console.log("Error pada tanggal", ":", error);
      });
  };

  handleExport = (e) => {
    e.preventDefault();
    const columnHeaders = this.state.judulKolom;

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
    link.setAttribute("download", "DATA-PENGGAJIAN-PERAWAT-GIGI.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(this.state.dataPeriode, "Ynag mau di export");
  };

  hapusShiftData = () => {
    this.hapusDataInsentif();
    this.getDataInsentif();
  };
  hapusGajiData = () => {
    this.hapusDataTotalGaji();
    this.getDataInsentif();
  };
  hapusSemuaData = () => {
    this.hapusDataInsentif();
    this.hapusDataTotalGaji();
    this.getDataInsentif();
  };
  hapusDataInsentif = () => {
    let tahunAwal = this.state.selectedYear;
    const newData = {
      bulan: this.state.bulan,
      tahun: tahunAwal,
    };
    axios
      .post(urlAPI + "/insentif-perawat-gigi/hapus/data/", newData)
      .then((response) => {
        console.log(response.data, "Insentif");
      })
      .catch((error) => {
        console.log("Error pada tanggal", ":", error);
      });
  };
  hapusDataTotalGaji = () => {
    let tahunAwal = this.state.selectedYear;
    const newData = {
      bulan: this.state.bulan,
      tahun: tahunAwal,
    };
    axios
      .post(urlAPI + "/periode-perawat-gigi/delete/data", newData)
      .then((response) => {
        console.log(response.data, "");
      })
      .catch((error) => {
        console.log("Error pada tanggal", ":", error);
      });
  };
  handleSearch = (e) => {
    e.preventDefault();
    this.setState({
      isFilterDokterPengganti: true,
    });
    this.cekDataInsentif();
  };

  getDataInsentif = () => {
    const bulan = this.state.selectedMonth;
    let tahunAwal = this.state.selectedYear;
    let bulanAwal = parseInt(bulan) - 1;
    let tahunAkhir = this.state.selectedYear;

    if (bulanAwal <= 9 && bulanAwal >= 1) {
      bulanAwal = bulanAwal.toString().padStart(bulanAwal, "0");
    } else if (bulanAwal <= 0) {
      bulanAwal = "12";
      tahunAwal = parseInt(tahunAkhir) - 1;
    } else {
      bulanAwal = bulanAwal.toString();
    }
    const tanggalAwal = `${tahunAwal}-${bulanAwal}-23`;
    const tanggalAkhir = `${tahunAkhir}-${bulan}-22`;

    const tanggalBanyak = this.getDatesBetween(tanggalAwal, tanggalAkhir);

    let newDataNominal = [];

    const postData = {
      tanggalRange: tanggalBanyak,
      bulan: this.state.bulan,
      tahun: tahunAwal,
    };
    let isDapat = false;

    axios
      .post(urlAPI + "/insentif-perawat-gigi/nominal", postData)
      .then((response) => {
        if (response.data.length > 0) {
          isDapat = true;
          newDataNominal = newDataNominal.concat(response.data);
          console.log(newDataNominal, "new Data nominal");

          const dataBaru = this.hitungTotalNilai(newDataNominal);
          console.log(dataBaru, "data baru");

          const dataGajiAkhir = dataBaru.map((item) => {
            // const pajak = (((item.total_gaji_periode * 50) / 100) * 5) / 100;
            // const gajiAkhir = item.total_gaji_periode - pajak;
            // item.pajak = pajak;
            // item.gaji_akhir = gajiAkhir;

            return item;
          });
          console.log(dataGajiAkhir, "ada pajak");
          this.setState({ dataGajiAkhirExport: dataGajiAkhir });
          // function insert
          axios
            .post(`${urlAPI}/periode-perawat-gigi/add/data`, dataGajiAkhir)
            .then((response) => {
              console.log(response.data, "insert data gaji");
            })
            .catch((error) => {
              console.log("Error:", error);
            });

          const newDataBaru = dataBaru.reduce((acc, item) => {
            acc.push(
              {
                nama_perawat: item.nama_perawat,
                variabel: "NOMINAL SHIFT",
                jumlah: item.total_data_nominal,
                total: item.total_nominal,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "INSENTIF PERAWAT GIGI",
                jumlah: "",
                total: item.total_insentif,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "POTONGAN TELAT",
                jumlah: "",
                total: item.total_denda_telat,
              },
              {
                nama_perawat: item.nama_perawat,
                variabel: "TOTAL GAJI YANG DITERIMA",
                jumlah: "",
                total: item.total_data_gaji_akhir,
              }
            );
            return acc;
          }, []);

          // console.log(newDataBaru, "data baru");

          const data = newDataBaru.map((item) => [
            item.nama_perawat,
            item.variabel,
            item.jumlah === "" ? "" : item.jumlah,
            item.total,
          ]);

          const newArray = [];
          for (const obj of data) {
            const rowValues = Object.values(obj);
            newArray.push(rowValues);
          }

          const transformedArray = newArray.map((item) => {
            const [nama_dokter, variabel, jumlah, total] = item;

            // Jika nama dokter sama dengan elemen sebelumnya, ubah nama dokter menjadi string kosong
            return [
              nama_dokter === newArray[newArray.indexOf(item) - 1]?.[0]
                ? ""
                : nama_dokter,
              variabel,
              jumlah,
              total,
            ];
          });

          console.log(transformedArray, "Tabel Export");

          const propertyNames = ["Nama Perawat", "Variabel", "Jumlah", "Total"];

          this.setState({
            judulKolom: propertyNames,
            dataExport: transformedArray,
          });
          this.setState({
            dataNominal: newDataNominal,
            dataBahan: newDataNominal,
            isCetak: true,
            loading: false,
          });

          this.setState({
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.log("Error pada tanggal", ":", error);
      });
    console.log(newDataNominal);
  };

  selectTotalGaji = () => {
    const postData = {
      bulan: this.state.bulan,
      tahun: this.state.selectedYear,
    };
    axios
      .post(`${urlAPI}/periode-perawat-gigi/cek/data`, postData)
      .then((response) => {
        console.log(response.data, "select data gaji");
      })
      .catch((error) => {
        console.log("Error fatching data: ", error);
      });
  };

  formatRupiah = (angka) => {
    var rupiah = "";
    var angkaRev = angka.toString().split("").reverse().join("");
    for (var i = 0; i < angkaRev.length; i++)
      if (i % 3 == 0) rupiah += angkaRev.substr(i, 3) + ".";
    return (
      "Rp " +
      rupiah
        .split("", rupiah.length - 1)
        .reverse()
        .join("")
    );
  };

  hitungTotalNilai = (arr) => {
    const result = {};
    arr.forEach((item) => {
      const key = item.barcode + item.nama_dokter;
      // const keyGajiPeriode = item.barcode;
      const existingItem = result[key];
      // const existingGaji = result[keyGajiPeriode];

      if (existingItem) {
        existingItem.total_nominal += item.nominal_shift;
        existingItem.total_data_nominal++;
        existingItem.total_insentif += item.insentif;
        existingItem.total_denda_telat += item.denda_telat;
        existingItem.total_data_gaji_akhir += item.total_gaji;
      } else {
        result[key] = {
          bulan: this.state.bulan,
          tahun: this.state.selectedYear,
          barcode: item.barcode,
          nama_perawat: item.nama_perawat,
          total_data_nominal: 1,
          total_nominal: item.nominal_shift,
          total_insentif: item.insentif,
          total_denda_telat: item.denda_telat,
          total_data_gaji_akhir: item.total_gaji,
        };
      }
    });

    // Ubah objek result menjadi array
    const output = Object.values(result);
    // this.hapusDataInsentif();
    console.log(output, "output");
    return output;
  };

  render() {
    const months = [
      { value: "01", label: "Januari" },
      { value: "02", label: "Februari" },
      { value: "03", label: "Maret" },
      { value: "04", label: "April" },
      { value: "05", label: "Mei" },
      { value: "06", label: "Juni" },
      { value: "07", label: "Juli" },
      { value: "08", label: "Agustus" },
      { value: "09", label: "September" },
      { value: "10", label: "Oktober" },
      { value: "11", label: "November" },
      { value: "12", label: "Desember" },
    ];

    const startYear = 1999; // Tahun mulai
    const endYear = new Date().getFullYear(); // Tahun saat ini
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    const listPerawatGigi = this.state.dataPeriode.map((data) => {
      return [
        data.nama_perawat,
        <button
          // onClick={() => this.handleInfo(data, "Shift")}
          className="cursor-pointer">
          {data.total_data_nominal}
        </button>,
        this.formatRupiah(data.total_nominal),
        <button
          // onClick={() => this.handleInfo(data, "Insentif")}
          className="cursor-pointer">
          {this.formatRupiah(data.total_insentif)}
        </button>,
        <button
          // onClick={() => this.handleInfo(data, "Telat")}
          className="cursor-pointer">
          {this.formatRupiah(data.total_denda_telat)}
        </button>,
        <button
          // onClick={() => this.handleInfo(data, "Telat")}
          className="cursor-pointer">
          {this.formatRupiah(data.total_data_gaji_akhir)}
        </button>,
      ];
    });

    const columnsPerawatGigi = [
      "Nama Perawat",
      "Total Shift",
      "Nominal Shift",
      "Insentif",
      "Denda Telat",
      "Total Gaji",
    ];

    const options = {
      selectableRows: false,
      elevation: 0,
      rowsPerPage: 15,
      rowsPerPageOption: [5, 10],
      filterDate: new Date().toLocaleDateString(),
    };

    return (
      <>
        {this.state.loading && (
          <>
            <LoadingAnimation />
          </>
        )}
        <div className="container mx-auto mb-16">
          <div className="rounded-lg bg-white shadow-lg my-5">
            <div className="flex flex-col p-10">
              <h4 className="text-black font-bold text-xl">
                Cari Rekapan Perawat Gigi Per Periode
              </h4>
              <br />
              <hr />
              <br />
              <div className="flex">
                <form action="" className=" w-full">
                  <div className="flex flex-row items-center gap-10">
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">
                        Pilih Bulan:
                      </Form.Label>

                      <select
                        className="bulan-field"
                        id="monthDropdown"
                        onChange={(e) =>
                          this.handleMonthChange(
                            months.find(
                              (month) => month.value === e.target.value
                            )
                          )
                        }
                        value={this.state.selectedMonth}>
                        <option value="">Pilih</option>
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </Form.Group>

                    <Form.Group className="form-field">
                      <Form.Label className="label-text">
                        Pilih Tahun:
                      </Form.Label>

                      <select
                        className="bulan-field"
                        id="yearDropdown"
                        onChange={this.handleYearChange}
                        value={this.state.selectedYear}>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </Form.Group>
                    <div
                      className="flex flex-row"
                      style={{ gap: "1rem", marginTop: "0" }}>
                      <div
                        className="btn-group"
                        style={{
                          marginTop: "0",
                          paddingTop: "0",
                          alignItems: "center",
                        }}>
                        <button
                          type="submit"
                          className="btn-input custom-btn btn-15"
                          onClick={this.handleSearch}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "1rem",
                          }}>
                          <div className="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="2rem"
                              height="2rem"
                              viewBox="0 0 24 24">
                              <g fill="none" stroke="white" stroke-width="2">
                                <circle cx="11" cy="11" r="7" />
                                <path stroke-linecap="round" d="m20 20l-3-3" />
                              </g>
                            </svg>
                          </div>
                          Cari Data
                        </button>

                        <button
                          type="submit"
                          className="btn-input custom-btn btn-15"
                          onClick={this.handleExport}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "1rem",
                          }}>
                          <div className="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="2rem"
                              height="2rem"
                              viewBox="0 0 256 256">
                              <g fill="white">
                                <path d="M208 88h-56V32Z" opacity="0.2" />
                                <path d="M48 180c0 11 7.18 20 16 20a14.24 14.24 0 0 0 10.22-4.66a8 8 0 0 1 11.56 11.06A30.06 30.06 0 0 1 64 216c-17.65 0-32-16.15-32-36s14.35-36 32-36a30.06 30.06 0 0 1 21.78 9.6a8 8 0 0 1-11.56 11.06A14.24 14.24 0 0 0 64 160c-8.82 0-16 9-16 20m79.6-8.69c-4-1.16-8.14-2.35-10.45-3.84c-1.25-.81-1.23-1-1.12-1.9a4.57 4.57 0 0 1 2-3.67c4.6-3.12 15.34-1.73 19.83-.56a8 8 0 0 0 4.14-15.48c-2.12-.55-21-5.22-32.84 2.76a20.58 20.58 0 0 0-9 14.95c-2 15.88 13.65 20.41 23 23.11c12.06 3.49 13.12 4.92 12.78 7.59c-.31 2.41-1.26 3.34-2.14 3.93c-4.6 3.06-15.17 1.56-19.55.36a8 8 0 0 0-4.31 15.44a61.34 61.34 0 0 0 15.19 2c5.82 0 12.3-1 17.49-4.46a20.82 20.82 0 0 0 9.19-15.23c2.19-17.31-14.32-22.14-24.21-25m83.09-26.84a8 8 0 0 0-10.23 4.84L188 184.21l-12.47-34.9a8 8 0 0 0-15.07 5.38l20 56a8 8 0 0 0 15.07 0l20-56a8 8 0 0 0-4.84-10.22M216 88v24a8 8 0 0 1-16 0V96h-48a8 8 0 0 1-8-8V40H56v72a8 8 0 0 1-16 0V40a16 16 0 0 1 16-16h96a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88m-27.31-8L160 51.31V80Z" />
                              </g>
                            </svg>
                          </div>
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-lg">
            <div className="flex flex-col p-10">
              <MUIDataTable
                title={"Data Rekap Dokter Gigi"}
                data={listPerawatGigi}
                columns={columnsPerawatGigi}
                options={options}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RekapGajiPeriodePerawat;
