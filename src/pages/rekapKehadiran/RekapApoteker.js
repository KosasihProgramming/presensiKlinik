import axios from "axios";
import { Component } from "react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import MUIDataTable from "mui-datatables";
import { Form } from "react-bootstrap";
import "../../style/jadwal.css";
import { urlAPI } from "../../config/global";

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

const startYear = 1999;
const endYear = new Date().getFullYear(); // Tahun saat ini
const years = [];
for (let year = endYear; year >= startYear; year--) {
  years.push(year);
}

const formatCurrency = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

class RekapKehadiranApoteker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProses: false,
      judul: [],
      judul2: [],
      dataExport2: [],
      dataExport: [],
      bulan: null,
      tahun: new Date().getFullYear(),
      rekapKehadiran: [],
      namaKlinik: "",
      cabang: "",
    };
  }

  componentDidMount() {
    // this.getKlinik();
  }

  getKlinik = async () => {
    try {
      const response = await axios.get(`${urlAPI}/klinik`);
      this.setState({ namaKlinik: response.data[0].nama_instansi });
    } catch (error) {
      console.error("Error fetching API", error);
    }
  };
  getData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-apoteker/get`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("Error pada tanggal:", error);
    }
  };

  deleteData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-apoteker/delete`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Data berhasil dihapus");
    } catch (error) {
      console.log("Error:", error);
    }
  };

  ambilData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-apoteker/cek`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      this.setState({ rekapKehadiran: response.data });
      this.formatCSVData(response.data);
    } catch (error) {
      console.log("Error pada tanggal:", error);
    }
  };

  cekData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-apoteker/cek`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.length > 0) {
        await this.deleteData(bulan, tahun);
        await this.getData(bulan, tahun);
        await this.ambilData(bulan, tahun);
      } else {
        await this.getData(bulan, tahun);
        await this.ambilData(bulan, tahun);
      }
    } catch (error) {
      console.log("Error pada tanggal:", error);
    }
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.setState({ isProses: true });
    const { bulan, tahun } = this.state;
    console.log(bulan, tahun);
    this.cekData(bulan, tahun);
    this.setState({ isProses: false });
  };
  0;

  formatCSVData = async (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );

    const groupedByProductId = sortedData.reduce((acc, item) => {
      // Jika productid belum ada di accumulator, inisialisasi
      if (!acc[item.barcode]) {
        acc[item.barcode] = {
          barcode: item.barcode,
          nama: item.nama_apoteker,
          count: 0,
          gaji: 0,
          transport: 0,
        };
      }

      // Menambahkan jumlah kemunculan
      acc[item.barcode].count += 1;

      // Menambahkan total grossamount, netamount, dan price
      acc[item.barcode].transport += item.total_jam;
      acc[item.barcode].pulangcepat += item.pulang_cepat;
      acc[item.barcode].telat += item.telat;
      acc[item.barcode].dendaTelat += item.denda_telat;
      acc[item.barcode].dendaPulangCepat += item.denda_pulang_cepat;
      return acc;
    }, {});

    // Mengonversi hasil menjadi array
    const result = Object.values(groupedByProductId);
    console.log("result", result);
    const dataMonth = this.transformData(result);

    const dataArray = sortedData.map((obj, index) => {
      return [
        index + 1,
        this.formatTanggal(obj.tanggal),
        obj.nama_apoteker,
        obj.nama_shift,
        obj.jam_masuk,
        obj.jam_keluar,

        obj.total_jam,
        obj.nama_petugas,
        obj.keterangan,
      ];
    });

    const propertyNames = [
      ["Usulan Uang Transport Staff Apoteker " + this.state.namaKlinik],
      [""],
      [`PERIODE  : ${this.state.bulan} ${this.state.tahun}`],
      [""],
      [
        "No",
        "Nama Apoteker",
        "Variabel",
        "Total Jam Kerja",
        "Uang Transport Perjam",
        "Pendapatan",
      ],
    ];

    const propertyNames2 = [
      ["Rekap Detail Kehadiran Staff Apoteker " + this.state.namaKlinik],
      [""],
      [`PERIODE  : ${this.state.bulan} ${this.state.tahun}`],
      [""],
      [
        "No",
        "Tanggal",
        "Nama Apoteker",
        "Nama Shift",
        "Jam Masuk",
        "jam Pulang",
        "Total Jam",
        "Nama Petugas",
        "Keterangan",
      ],
    ];
    // Set data ke state
    this.setState({
      judul: propertyNames,
      judul2: propertyNames2,
      dataExport: dataMonth,
      dataExport2: dataArray,
    });
  };

  convertToCSV = (array) => {
    return array.map((row) => row.join(";")).join("\r\n");
  };

  downloadCSV = (data, fileName) => {
    const csvData = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleExport = (e) => {
    e.preventDefault();
    console.log(this.state.rekapKehadiran);
    const { dataExport, judul } = this.state;
    // Flatten the array for csv
    const csvContent = this.convertToCSV([...judul, ...dataExport]);
    this.downloadCSV(
      csvContent,
      `Usulan Uang Transport Apoteker ${this.state.bulan} ${this.state.tahun} ${this.state.cabang}.csv`
    );
    const { dataExport2, judul2 } = this.state;
    // Flatten the array for csv
    const csvContent2 = this.convertToCSV([...judul2, ...dataExport2]);
    this.downloadCSV(
      csvContent2,
      `Data Rekap Kehadiran Apoteker ${this.state.bulan} ${this.state.tahun} ${this.state.cabang}.csv`
    );
  };
  formatTanggal = (tanggal) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = new Date(tanggal).toLocaleDateString(
      "id-ID",
      options
    );
    console.log(formattedDate);
    return formattedDate;
  };
  formatJam = (jam) => {
    const formatTime = (time) => {
      return time.length > 5 ? time.substring(0, 5) : time;
    };

    // Ubah jam1 dan jam2 menjadi format HH:mm
    const formattedJam1 = formatTime(jam);
    return formattedJam1;
  };

  transformData = (arr) => {
    return arr.flatMap((item, index) => {
      return [
        [
          index + 1, // Nomor urut
          item.nama, // Nama dengan huruf pertama kapital
          "Gaji Pokok",
          "",
          "",
          "",
        ],
        [
          "",
          "",
          "Uang Transport",
          item.transport > 40 ? 40 : item.transport,
          12500,
          item.transport > 40 ? 40 * 12500 : item.transport * 12500,
        ],
      ];
    });
  };

  render() {
    const { rekapKehadiran } = this.state;

    const dataTabel = rekapKehadiran.map((item) => [
      item.tanggal,
      item.nama_apoteker,
      item.nama_shift,
      item.telat ? (
        <div className="rounded bg-red-500 p-1 text-white">{`${item.telat} Menit`}</div>
      ) : (
        <div>{`${item.telat} Menit`}</div>
      ),
      formatCurrency(item.nominal_shift),
      item.denda_telat > 0 ? (
        <div className="rounded bg-red-500 p-1 text-white">
          {formatCurrency(item.denda_telat)}
        </div>
      ) : (
        formatCurrency(item.denda_telat)
      ),
    ]);

    const columnsData = [
      "Tanggal",
      "Nama Apoteker",
      "Nama Shift",
      "Telat",
      "Nominal",
      "Denda Telat",
    ];

    const options = {
      selectableRows: false,
      elevation: 0,
      rowsPerPage: 10,
      rowsPerPageOption: [5, 10],
      filterDate: new Date().toLocaleDateString(),
    };

    const optionCabang = [
      { value: "Kemiling", text: "Klinik Kosasih Kemiling" },
      { value: "Rajabasa", text: "Klinik Kosasih Rajabasa" },
      { value: "Urip", text: "Klinik Kosasih Urip" },
      { value: "Tugu", text: "Klinik Kosasih Tugu" },
      { value: "Palapa", text: "Klinik Kosasih Palapa" },
      { value: "Amanah", text: "Klinik Kosasih Amanah" },
      { value: "Tirtayasa", text: "Klinik Kosasih Tirtayasa" },
      { value: "Panjang", text: "Klinik Kosasih Panjang" },
      { value: "Teluk", text: "Klinik Kosasih Teluk" },
      { value: "Gading", text: "Klinik Kosasih Sumber Waras" },
      { value: "GTSKemiling", text: "GTS Kemiling" },
      { value: "GTSTirtayasa", text: "GTS Tirtayasa" },
    ];
    return (
      <>
        <div className="container mx-auto mb-16">
          <div className="rounded-lg bg-white shadow-lg my-5">
            <div className="flex flex-col p-10">
              <h4 className="text-black font-bold text-xl">
                Cari Rekapan per periode - Apoteker
              </h4>
              <br />
              <hr />
              <br />
              <div className="flex">
                <form action="" className=" w-full">
                  <div className="flex flex-row items-center gap-10">
                    <Form.Group className="form-field">
                      <Form.Label className="label-text">Cabang:</Form.Label>

                      <select
                        className="bulan-field"
                        onChange={(e) =>
                          this.setState({
                            cabang: e.target.value, // Mendapatkan value dari opsi yang dipilih
                            namaKlinik:
                              e.target.options[e.target.selectedIndex].text, // Mendapatkan teks dari opsi yang dipilih
                          })
                        }
                        value={this.state.cabang} // Mengikat nilai select ke state
                      >
                        <option value="">Pilih</option>
                        {optionCabang.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.text}
                          </option>
                        ))}
                      </select>
                    </Form.Group>

                    <Form.Group className="form-field">
                      <Form.Label className="label-text">
                        Pilih Bulan:
                      </Form.Label>

                      <select
                        className="bulan-field"
                        id="monthDropdown"
                        onChange={(e) =>
                          this.setState({ bulan: e.target.value })
                        }
                        value={this.state.bulan}
                      >
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
                        onChange={(e) =>
                          this.setState({ tahun: e.target.value })
                        }
                        value={this.state.tahun}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </Form.Group>
                    <div
                      className="flex flex-row"
                      style={{ gap: "1rem", marginTop: "0" }}
                    >
                      <div
                        className="btn-group"
                        style={{
                          marginTop: "0",
                          paddingTop: "0",
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="submit"
                          className="btn-input custom-btn btn-15"
                          onClick={this.handleSearch}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "0",
                            gap: "1rem",
                            width: "10rem",
                          }}
                        >
                          <div className="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="2rem"
                              height="2rem"
                              viewBox="0 0 24 24"
                            >
                              <g fill="none" stroke="white" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m20 20l-3-3" />
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
                            width: "12rem",
                          }}
                        >
                          <div className="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="2rem"
                              height="2rem"
                              viewBox="0 0 256 256"
                            >
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
              {this.state.isProses ? (
                <h2>Memproses...</h2>
              ) : (
                <MUIDataTable
                  title={"Data Rekap Perawat"}
                  data={dataTabel}
                  columns={columnsData}
                  options={options}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RekapKehadiranApoteker;
