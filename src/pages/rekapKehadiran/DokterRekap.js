import axios from "axios";
import { Component } from "react";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import MUIDataTable from "mui-datatables";
import { Form } from "react-bootstrap";
import "../../style/jadwal.css";
import { urlAPI } from "../../config/global";
import Loader from "../../function/loader";
import Swal from "sweetalert2";

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
      cabang: "",
      charLoad: "Sedang Memuat Data...",
      isLoad: false,
      tahun: new Date().getFullYear(),
      rekapKehadiran: [],
      namaKlinik: "",
      dataGanti: [],
      footer: [],
    };
  }

  componentDidMount() {
    // this.getKlinik();
  }

  getData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };
    this.setState({ charLoad: "Sedang Mengambil data.." });
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
    const cabang = this.state.cabang;
    this.setState({ charLoad: "Sedang Menghapus Data Lama..." });
    const arg = { bulan, tahun, cabang };
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
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };

    const loadingMessages = [
      "Sabar hehe...",
      "Sedang mengambil data...",
      "Data hampir selesai...",
      "Harap tunggu sebentar...",
    ];

    let messageIndex = 0;
    const intervalId = setInterval(() => {
      this.setState({ charLoad: loadingMessages[messageIndex] });
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 10000); // interval 10 detik

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

      // Hentikan interval setelah permintaan selesai
      clearInterval(intervalId);

      // Setel status setelah data berhasil diambil
      this.setState({ charLoad: "Sedang mengambil data..." });

      // Panggil fungsi untuk memformat data CSV
      this.formatCSVData(response.data);
    } catch (error) {
      // Hentikan interval jika ada error
      clearInterval(intervalId);

      // Setel status error
      this.setState({ charLoad: "Error dalam mengambil data" });
      console.log("Error pada tanggal:", error);
    }
  };

  cekData = async (bulan, tahun) => {
    const cabang = this.state.cabang;
    const arg = { bulan, tahun, cabang };
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

      this.setState({ charLoad: "Sedang Memeriksa Data..." });
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
    const cabang = this.state.cabang;
    const arg = { tanggal: tanggal, barcode: barcode, cabang: cabang };

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

      const cleanedData = allDetailSales.map((item) => {
        // Menerjemahkan formula ke operasi perhitungan angka
        let formula = item.formula
          .replace(/v\.ProductSalesPrice/g, item.price)
          .replace(/v\.ProductQuantity/g, item.salesqty);

        // Mengevaluasi formula menjadi angka
        let evaluatedFormula;
        try {
          evaluatedFormula = eval(formula); // Hasil dari perhitungan formula
        } catch (error) {
          evaluatedFormula = 0; // Jika terjadi kesalahan evaluasi, berikan nilai default
          console.error("Error evaluating formula:", error);
        }

        return {
          ...item,
          rumus: evaluatedFormula, // Menyimpan hasil evaluasi formula
        };
      });

      // Mengelompokkan berdasarkan productid dan menghitung jumlahnya serta menjumlahkan nilai lainnya
      const groupedByProductId = cleanedData.reduce((acc, item) => {
        // Jika productid belum ada di accumulator, inisialisasi
        if (!acc[item.productid]) {
          acc[item.productid] = {
            productid: item.productid,
            nama: item.name,
            count: 0,
            cost: parseInt(item.costprice),
            price: parseInt(item.price),
            totalCost: 0,
            totalPrice: 0,
            totalLaba: 0,
            totalKomisi: 0,
          };
        }

        // Menambahkan jumlah kemunculan
        acc[item.productid].count += 1;

        // Menambahkan total cost, price, laba, dan komisi
        acc[item.productid].totalCost +=
          parseInt(item.costprice) * parseInt(item.salesqty);
        acc[item.productid].totalPrice +=
          parseInt(item.price) * parseInt(item.salesqty);
        acc[item.productid].totalLaba += Math.abs(
          parseInt(item.price) * parseInt(item.salesqty) -
            parseInt(item.costprice) * parseInt(item.salesqty)
        );
        acc[item.productid].totalKomisi += item.rumus; // Menggunakan hasil perhitungan formula

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
  getKomisiByTanggal = async (tanggal) => {
    // Array salesIds dengan properti name dan code
    const salesIds = [
      { name: "Dokter Pengganti Gigi (P)", code: "DPG001" },
      { name: "Dokter Pengganti Gigi (S)", code: "DPG002" },
      { name: "Dokter Pengganti Gigi (M)", code: "DPG003" },
      { name: "Dokter Pengganti Umum (P)", code: "DPU001" },
      { name: "Dokter Pengganti Umum (S)", code: "DPU002" },
      { name: "Dokter Pengganti Umum (M)", code: "DPU003" },
    ];

    // Array untuk menyimpan hasil yang memiliki komisi > 0
    const result = [];

    // Loop melalui setiap ID dan hitung komisi
    for (const sales of salesIds) {
      const komisi = await this.getDataKomisi(tanggal, sales.code); // Panggil fungsi dengan tanggal dan salesId

      // Jika komisi lebih dari 0, tambahkan ke hasil
      if (komisi > 0) {
        result.push({ nama_dokter: sales.name, totalKomisi: komisi, tanggal }); // Tambahkan tanggal
      }
    }

    // Kembalikan array objek yang berisi data komisi lebih dari 0
    return result;
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.setState({ isProses: true, isLoad: true });
    const { bulan, tahun } = this.state;
    console.log(bulan, tahun);
    this.cekData(bulan, tahun);
    this.setState({ isProses: false });
  };

  formatCSVData = async (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );
    this.setState({ charLoad: "Sabar Hehe, Disini Agak Lama..." });
    // Gunakan Promise.all untuk menangani operasi asynchronous
    const updatedData = sortedData

    console.log(updatedData, "sort");
    this.setState({ charLoad: "hehe..." });

    const dataPengganti = updatedData.filter(
      (a) => a.nama_dokter_pengganti !== "" && a.nama_dokter_pengganti !== " ()"
    );

    // Variabel untuk menyimpan hasil dari semua tanggal
    const allKomisiResults = [];

    // Iterasi setiap item dan kumpulkan hasil komisi dari tiap tanggal
    // for (const item of dataPengganti) {
    //   const komisiResult = await this.getKomisiByTanggal(item.tanggal); // Dapatkan hasil komisi berdasarkan tanggal
    //   allKomisiResults.push(...komisiResult); // Push semua hasil dari komisiResult ke allKomisiResults
    // }
    this.setState({ charLoad: "Bentarr Lagi..." });

    console.log("data pengganti", allKomisiResults);
    const dataArrayString = updatedData.map((obj, index) => {
      return [
        index + 1,
        obj.tanggal,
        obj.tgl_pulang,
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
        obj.keterangan,
        obj.nama_petugas,
      ];
    });
    const dataArrayKomPengganti = allKomisiResults.map((obj, index) => {
      return [
        index + 1,
        this.formatTanggal(obj.tanggal),
        obj.nama_dokter,
        obj.totalKomisi,
      ];
    });
    const dataArrayPengganti = dataPengganti.map((obj, index) => {
      return [
        index + 1,
        obj.tanggal,
        obj.tgl_pulang,

        obj.nama_dokter,
        obj.nama_dokter_pengganti,
        obj.nama_shift,
        obj.jam_masuk,
        obj.jam_pulang,
        obj.telat,
        obj.denda_telat,
        obj.pulang_cepat,
        obj.denda_pulang_cepat,
        obj.nominal_shift,
        obj.komisi,
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
        "Tanggal Masuk",
        "Tanggal Pulang",
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
        "Keterangan",
        "Nama Petugas",
      ],
    ];
    const propertyNames2 = [
      ["Rekap Kehadiran Staff Dokter Pengganti  " + this.state.namaKlinik],
      [""],
      [`PERIODE  : ${this.state.bulan} ${this.state.tahun}`],
      [""],
      [
        "No",
        "Tanggal Masuk",
        "Tanggal Pulang",
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

    const footer = [
      [""],
      [""],
      ["List Komisi Dokter Pengganti"],
      ["No", "Tanggal", "Nama Pengganti", "Total Komisi"],
    ];
    this.setState({ rekapKehadiran: data });

    // Set data ke state
    this.setState({
      isLoad: false,
      judul: propertyNames,
      judul2: propertyNames2,
      footer: footer,
      dataGanti: dataArrayKomPengganti,
      dataExport: dataArrayString,
      dataExport2: dataArrayPengganti,
      charLoad: "Sedang Memuat Data...",
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
      `Data Rekap Kehadiran Dokter ${this.state.bulan} ${this.state.tahun} ${this.state.namaKlinik}.csv`
    );
    const { dataExport2, judul2 } = this.state;
    // Flatten the array for csv
    const csvContent2 = this.convertToCSV([
      ...judul2,
      ...dataExport2,
      ...this.state.footer,
      ...this.state.dataGanti,
    ]);
    this.downloadCSV(
      csvContent2,
      `Data Rekap Kehadiran Dokter Pengganti ${this.state.bulan} ${this.state.tahun} ${this.state.namaKlinik}.csv`
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
  showAlert = (url) => {
    Swal.fire({
      title: "Foto ",
      imageUrl: url,
      imageWidth: 600,
      imageHeight: 450,
      imageAlt: "Bukti",
      customClass: {
        popup: "bg-white text-blue-500 p-4",
        title: "text-2xl font-medium mb-4",
        image: "object-cover rounded-xl",
        confirmButton: "bg-blue-500 text-white hover:bg-blue-500",
      },
    });
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
      item.foto_masuk ? (
        <div
          className="flex justify-center items-center "
          onClick={() => {
            this.showAlert(item.foto_masuk);
          }}
        >
          <img
            src={item.foto_masuk}
            alt="Foto Masuk"
            className="w-10 h-10 rounded-full object-cover bg-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex justify-center items-center">
          Belum Ada Foto
        </div>
      ),
      item.foto_keluar ? (
        <div
          className="flex justify-center items-center "
          onClick={() => {
            this.showAlert(item.foto_keluar);
          }}
        >
          <img
            src={item.foto_keluar}
            alt="Foto Pulang"
            className="w-10 h-10 rounded-full object-cover bg-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex justify-center items-center">
          Belum Ada Foto
        </div>
      ),
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
      "Masuk",
      "Pulang",
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
        {this.state.isLoad ? (
          <>
            <div className="w-full h-[100vh] flex flex-col gap-4 justify-center items-center">
              <Loader />
              <h4 className="mt-8 text-xl font-medium">
                {this.state.charLoad}
              </h4>
            </div>
          </>
        ) : (
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
                            Cabang:
                          </Form.Label>

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
                          <Form.Label className="label-text">Bulan:</Form.Label>

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
                          <Form.Label className="label-text">Tahun:</Form.Label>

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
                                    <path
                                      strokeLinecap="round"
                                      d="m20 20l-3-3"
                                    />
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
        )}
      </>
    );
  }
}

export default RekapKehadiranDokter;
