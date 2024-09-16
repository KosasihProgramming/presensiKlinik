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

class RekapKehadiranDokter extends Component {
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
    };
  }

  componentDidMount() {
    this.getKlinik();
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
    const arg = { bulan, tahun };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-dokter/get`,
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
    const arg = { bulan, tahun };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-dokter/delete`,
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
    const arg = { bulan, tahun };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-dokter/cek`,
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
    const arg = { bulan, tahun };
    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-dokter/cek`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
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
  getDataKomisi = async (tanggal, barcode) => {
    const arg = { tanggal: tanggal, barcode: barcode };

    try {
      const response = await axios.post(
        `${urlAPI}/rekap-kehadiran-dokter/get-insentif`,
        arg,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Proses untuk menghitung total dan menambahkan properti baru
      const sales = response.data;
      const data = sales.forEach((sale) => {
        const totalGrossAmount = sale.salesdetail.reduce(
          (total, detail) => total + detail.grossamount,
          0
        );
        const totalNetAmount = sale.salesdetail.reduce(
          (total, detail) => total + detail.netamount,
          0
        );
        const totalPrice = sale.salesdetail.reduce(
          (total, detail) => total + detail.price,
          0
        );
        const cost = sale.salesdetail.reduce(
          (total, detail) => total + detail.price - detail.costprice,
          0
        );
        // Menambahkan total ke dalam properti baru pada objek sales
        sale.totalGrossAmount = totalGrossAmount;
        sale.totalNetAmount = totalNetAmount;
        sale.totalPrice = totalPrice;
        sale.totalCost = cost;
        sale.totalDetail = sale.salesdetail.length;
      });

      const dataFilter = sales.map((a) => {
        return {
          gross: a.totalGrossAmount,
          net: a.totalNetAmount,
          price: a.totalPrice,
          cost: a.totalCost,
          total: a.totalDetail,
          man: a.salesmanid,
        };
      });
      const totalGrossAmount = dataFilter.reduce(
        (total, detail) => total + detail.gross,
        0
      );
      const totalNetAmount = dataFilter.reduce(
        (total, detail) => total + detail.net,
        0
      );

      console.log(sales);
      const total = dataFilter.reduce((a, detail) => a + detail.total, 0);
      // Menggabungkan semua objek dalam detailSales menjadi satu array
      // Menggabungkan semua objek dalam detailSales menjadi satu array
      const allDetailSales = sales.flatMap((sale) => sale.salesdetail);

      const cleanedData = allDetailSales.map((item) => ({
        ...item,
        formula: item.formula.replace("v.ProductQuantity*", ""), // Menghapus kata "Tahun"
      }));
      // Mengelompokkan berdasarkan productid dan menghitung jumlahnya
      // Mengelompokkan berdasarkan productid dan menghitung jumlahnya serta menjumlahkan nilai lainnya
      const groupedByProductId = cleanedData.reduce((acc, item) => {
        // Jika productid belum ada di accumulator, inisialisasi
        if (!acc[item.productid]) {
          acc[item.productid] = {
            productid: item.productid,
            nama: item.name,
            count: 0,
            cost: item.costprice,
            price: item.price,
            totalCost: 0,
            totalPrice: 0,
            totalLaba: 0,
            totalKomisi: 0,
          };
        }

        // Menambahkan jumlah kemunculan
        acc[item.productid].count += 1;

        // Menambahkan total grossamount, netamount, dan price
        acc[item.productid].totalCost += item.costprice * item.salesqty;
        acc[item.productid].totalPrice += item.price * item.salesqty;
        acc[item.productid].totalLaba += Math.abs(
          item.price * item.salesqty - item.costprice * item.salesqty
        );
        acc[item.productid].totalKomisi +=
          parseInt(item.formula) * item.salesqty;
        return acc;
      }, {});

      // Mengonversi hasil menjadi array
      const result = Object.values(groupedByProductId);
      const sortedResult = result.sort((a, b) =>
        a.productid.localeCompare(b.productid)
      );
      const totalPrice = dataFilter.reduce(
        (total, detail) => total + detail.net,
        0
      );
      const totalCost = result.reduce(
        (total, detail) => total + Math.round(detail.totalLaba, 4),
        0
      );
      const komisi = result.reduce(
        (total, detail) => total + Math.round(detail.totalKomisi, 4),
        0
      );
      console.log(sortedResult);
      console.log("total gross", totalGrossAmount);
      console.log("total net", totalNetAmount);
      console.log("total Price", totalPrice);
      console.log("total Cost", totalCost);
      console.log("total Commision", komisi);
      console.log(sales);
      console.log(allDetailSales);
      return komisi;
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

  formatCSVData = async (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );

    // Gunakan Promise.all untuk menangani operasi asynchronous
    const updatedData = await Promise.all(
      sortedData.map(async (item) => {
        const komisi = await this.getDataKomisi(item.tanggal, item.salesmanid); // Tunggu hasil getDataKomisi
        return { ...item, komisi }; // Kembalikan objek baru dengan properti 'komisi'
      })
    );

    console.log(updatedData, "sort");

    const dataPengganti = sortedData.filter(
      (a) => a.nama_dokter_pengganti !== ""
    );

    const dataArrayString = updatedData.map((obj, index) => {
      return [
        index + 1,
        this.formatTanggal(obj.tanggal),
        obj.nama_dokter,
        obj.nama_shift,
        obj.jam_masuk,
        obj.jam_pulang,
        obj.telat,
        obj.denda_telat,
        obj.pulang_cepat,
        obj.denda_pulang_cepat,
        obj.nominal_shift,
        obj.komisi,
        parseInt(obj.nominal_shift) - parseInt(obj.denda_telat),
        obj.nama_petugas,
      ];
    });

    const dataArrayPengganti = dataPengganti.map((obj, index) => {
      return [
        index + 1,
        this.formatTanggal(obj.tanggal),
        obj.nama_dokter,
        obj.nama_dokter_pengganti,
        obj.nama_shift,
        obj.jam_masuk,
        obj.jam_pulang,
        obj.nominal_shift,
        obj.komisi,
        obj.telat,
        obj.denda_telat,
        obj.pulang_cepat,
        obj.denda_pulang_cepat,
        parseInt(obj.nominal_shift) -
          parseInt(obj.denda_telat) +
          parseInt(obj.komisi),
        obj.nama_petugas,
      ];
    });

    const propertyNames = [
      ["Rekap Kehadiran Staff Dokter " + this.state.namaKlinik],
      [""],
      [`PERIODE  : ${this.state.bulan} ${this.state.tahun}`],
      [""],
      [
        "No",
        "Tanggal",
        "Nama Dokter",
        "Nama Shift",
        "Jam Masuk",
        "Jam Pulang",
        "Telat (Menit)",
        "Denda Telat",
        "Pulang Cepat",
        "Denda Pulang Cepat",
        "Nominal Kehadiran",
        "Nominal Komisi",
        "Total Nominal Kehadiran",
        "Nama Petugas",
      ],
    ];
    const propertyNames2 = [
      ["Rekap Kehadiran Staff Dokter Pengganti " + this.state.namaKlinik],
      [""],
      [`PERIODE  : ${this.state.bulan} ${this.state.tahun}`],
      [""],
      [
        "No",
        "Tanggal",
        "Nama Dokter",
        "",
        "Nama Shift",
        "Jam",
        "",
        "Telat",
        "",
        "",
        "",
        "Gaji",
        "",
        "Total",
        "Petugas",
        "",
      ],
      [
        "",
        "",
        "Dokter Tetap",
        "Dokter Pengganti",
        "",
        "Jam Masuk",
        "Jam Pulang",
        "Durasi Telat",
        "Denda",
        "Durasi Pulang Cepat",
        "Denda",
        "Uang Duduk",
        "Uang Insentif",
        "",
        "Nama",
        "Paraf",
      ],
    ];

    // Set data ke state
    this.setState({
      judul: propertyNames,
      judul2: propertyNames2,
      dataExport: dataArrayString,
      dataExport2: dataArrayPengganti,
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
      `Data Rekap Kehadiran Dokter ${this.state.bulan} ${this.state.tahun}.csv`
    );
    const { dataExport2, judul2 } = this.state;
    // Flatten the array for csv
    const csvContent2 = this.convertToCSV([...judul2, ...dataExport2]);
    this.downloadCSV(
      csvContent2,
      `Data Rekap Kehadiran Dokter Pengganti ${this.state.bulan} ${this.state.tahun}.csv`
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
  render() {
    const { rekapKehadiran } = this.state;

    const dataTabel = rekapKehadiran.map((item) => [
      item.tanggal,
      item.nama_dokter,
      item.nama_shift,
      item.telat ? (
        <div className="rounded bg-red-500 p-1 text-white">{`${item.telat} Menit`}</div>
      ) : (
        <div>{`${item.telat} Menit`}</div>
      ),
      formatCurrency(item.garansi_fee),
      formatCurrency(item.nominal),
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
      "Nama Dokter",
      "Nama Shift",
      "Telat",
      "Garansi Fee",
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

    return (
      <>
        <div className="container mx-auto mb-16">
          <div className="rounded-lg bg-white shadow-lg my-5">
            <div className="flex flex-col p-10">
              <h4 className="text-black font-bold text-xl">
                Cari Rekapan per periode
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
                            gap: "1rem",
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
                  title={"Data Rekap Dokter Umum"}
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

export default RekapKehadiranDokter;
