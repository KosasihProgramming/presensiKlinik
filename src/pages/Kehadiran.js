import axios from "axios";
import MUIDataTable from "mui-datatables";
import { Component } from "react";
import { urlAPI } from "../config/global";
import { Link } from "react-router-dom";
import { HiOutlineSelector } from "react-icons/hi";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";

class Kehadiran extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKehadiran: [],
      dataKepulangan: [],
      dataIzin: [],
      cabang: "",
      isSudahPulang: "tidak",
      tanggalFilter: new Date().toLocaleDateString(),
    };
  }

  componentDidMount = () => {
    this.checkDevice();
  };

  checkDevice = async () => {
    const storedEncodedText = localStorage.getItem("device");

    console.log(storedEncodedText);

    if (storedEncodedText) {
      const postData = {
        encode: storedEncodedText,
      };

      axios
        .post(urlAPI + "/device/", postData)
        .then((response) => {
          console.log("Berhasil Di izinkan", response);
          this.setState({ cabang: response.data[0].cabang });
          this.getAllDataKehadiran(response.data[0].cabang);
          this.getAllDataKepulangan(response.data[0].cabang);
          this.getAllDataIzin(response.data[0].cabang);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };
  getAllDataKehadiran = (cabang) => {
    axios
      .post(urlAPI + `/kehadiran/now`, {
        cabang: cabang, // Mengirim cabang melalui body request
      })
      .then((response) => {
        console.log(response);
        this.setState({ dataKehadiran: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  getAllDataIzin = (cabang) => {
    axios
      .get(`${urlAPI}/kehadiran/izin/today`)
      .then((response) => {
        console.log("izizn: ", response.data);

        this.setState({ dataIzin: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  getAllDataKepulangan = (cabang) => {
    axios
      .post(`${urlAPI}/kehadiran/pulang/all`, {
        cabang: cabang, // Mengirim cabang melalui body request
      })
      .then((response) => {
        this.setState({ dataKepulangan: response.data });
        console.log("Sudah Pulang: ", response.data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  };

  handleChange = (e) => {
    const value = e.target.value === "Sudah Pulang" ? true : false;
    this.setState({ isSudahPulang: value });
  };

  handleTanggalFilterChange = (e) => {
    const tanggalParam = e.target.value;
    this.setState({ tanggalFilter: tanggalParam });
    axios
      .get(`${urlAPI}/kehadiran/filter/${tanggalParam}/${this.state.cabang}`)
      .then((response) => {
        this.setState({ dataKepulangan: response.data });
      })
      .catch((err) => {
        console.error("Error Fetching data", err);
      });
  };
  formatToTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0"); // Pastikan dua digit untuk jam
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Pastikan dua digit untuk menit

    return `${hours}:${minutes}`;
  }

  render() {
    const dataHadir = this.state.dataKehadiran.map((data) => {
      const masukDate = new Date(data.jam_masuk);

      const tanggal = masukDate.getDate();
      const bulan = masukDate.getMonth() + 1;
      const tahun = masukDate.getFullYear();
      const jam = masukDate.getHours();
      const menit = masukDate.getMinutes();
      const detik = masukDate.getSeconds();

      const formatTanggal = `${tanggal}-${bulan}-${tahun}`;
      const formatJam = `${jam}:${menit}:${detik}`;

      const masukTime = `${formatJam} WIB, ${formatTanggal} `;

      return [
        data.nama,
        data.barcode.toString().padStart(5, "0"),
        data.nama_shift,
        data.jam_masuk,
        data.tanggal,
        <img
          className="w-24 rounded-full"
          src={data.foto_masuk}
          alt={data.foto_masuk}
        />,
      ];
    });

    const dataPulang = this.state.dataKepulangan.map((data) => {
      const masukDate = new Date(data.jam_masuk);

      const tanggal = masukDate.getDate();
      const bulan = masukDate.getMonth() + 1;
      const tahun = masukDate.getFullYear();
      const jam = masukDate.getHours();
      const menit = masukDate.getMinutes();
      const detik = masukDate.getSeconds();

      const formatTanggal = `${tanggal}-${bulan}-${tahun}`;
      const formatJam = `${jam}:${menit}:${detik}`;

      const masukTime = `${formatJam} WIB`;

      const pulangDate = new Date(data.jam_keluar);

      const tanggalPulang = pulangDate.getDate();
      const bulanPulang = pulangDate.getMonth() + 1;
      const tahunPulang = pulangDate.getFullYear();
      const jamPulang = pulangDate.getHours();
      const menitPulang = pulangDate.getMinutes();
      const detikPulang = pulangDate.getSeconds();

      const formatTanggalPulang = `${tanggalPulang}-${bulanPulang}-${tahunPulang}`;
      const formatJamPulang = `${jamPulang}:${menitPulang}:${detikPulang}`;

      const pulangTime = `${formatJamPulang} WIB`;
      return [
        data.nama,
        data.barcode.toString().padStart(5, "0"),
        data.nama_shift,
        data.jam_masuk,
        data.jam_keluar,

        data.tanggal,
        <img
          className="w-24 rounded-full"
          src={`${data.foto_masuk}`}
          alt={data.foto_masuk}
        />,
        <img
          className="w-24 rounded-full"
          src={`${data.foto_keluar}`}
          alt={data.foto_keluar}
        />,
      ];
    });

    const dataIzib = this.state.dataIzin.map((data) => {
      const masukDate = new Date(data.waktuMulai);

      const tanggal = masukDate.getDate();
      const bulan = masukDate.getMonth() + 1;
      const tahun = masukDate.getFullYear();
      const jam = masukDate.getHours();
      const menit = masukDate.getMinutes();
      const detik = masukDate.getSeconds();

      const formatTanggal = `${tanggal}-${bulan}-${tahun}`;
      const formatJam = `${jam}:${menit}:${detik}`;

      const masukTime = `${formatJam} WIB`;

      const pulangDate = new Date(data.waktuSelesai);

      const tanggalPulang = pulangDate.getDate();
      const bulanPulang = pulangDate.getMonth() + 1;
      const tahunPulang = pulangDate.getFullYear();
      const jamPulang = pulangDate.getHours();
      const menitPulang = pulangDate.getMinutes();
      const detikPulang = pulangDate.getSeconds();

      const formatTanggalPulang = `${tanggalPulang}-${bulanPulang}-${tahunPulang}`;
      const formatJamPulang = `${jamPulang}:${menitPulang}:${detikPulang}`;

      const pulangTime = `${formatJamPulang} WIB`;
      return [
        data.nama,
        data.jenisIzin,
        data.alasan,
        data.waktuMulai + " WIB",
        data.waktuSelesai + " WIB",
        data.tanggal,

        data.durasi + " Menit",
        <div>
          {data.bukti !== null ? (
            <>
              <img
                className="w-24 rounded-md"
                src={`${urlAPI}/uploads/${data.bukti}`}
                alt={data.bukti}
              />
            </>
          ) : (
            <>
              <h3>Tidak Ada Bukti</h3>
            </>
          )}
        </div>,
      ];
    });
    console.log(dataIzib);
    const columnsIzin = [
      "Nama Pegawai",
      "jenis",
      "Alasan",
      "Jam Mulai",
      "Jam Selesai",
      "Tanggal",
      "Durasi",
      "Foto Bukti",
    ];
    const columnsHadir = [
      "Nama Dokter",
      "Barcode",
      "Shift",
      "Jam Masuk",
      "Tanggal",
      "Foto Masuk",
      {
        name: "Aksi",
        options: {
          customBodyRender: (value, tableMeta, updateValue) => {
            const item = this.state.dataKehadiran[tableMeta.rowIndex];
            return (
              <div className="flex flex-row justify-center gap-2">
                <Link
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-white cursor-pointer hover:bg-cyan-700"
                  to={`/pulang/${item.id_kehadiran}`}
                >
                  Absen Pulang
                </Link>
              </div>
            );
          },
        },
      },
    ];

    const columnsPulang = [
      "Nama Pegawai",
      "Barcode",
      "Shift",
      "Jam Masuk",
      "Jam Keluar",
      "Tanggal",
      "Foto Masuk",
      "Foto Foto Keluar",
    ];

    const options = {
      selectableRows: false,
      elevation: 0,
      rowsPerPage: 10,
      rowsPerPageOption: [5, 10],
      filterDate: new Date().toLocaleDateString(),
    };

    console.log(this.state.tanggalFilter);

    return (
      <>
        <div className="container mx-auto mb-16 mt-5 ">
          <div className="rounded-lg bg-white shadow-lg">
            <div className="flex flex-rows items-center gap-5 pt-4 px-6 ">
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white "
                  onChange={(e) =>
                    this.setState({
                      isSudahPulang: e.target.value,
                    })
                  }
                >
                  <option value={"tidak"}>Belum Pulang</option>
                  <option value={"ya"}>Sudah Pulang</option>
                  <option value={"izin"}>Izin / Sakit</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <HiOutlineSelector />
                </div>
              </div>
              <div>
                {/* Filter tanggal */}
                <input
                  type="date"
                  value={this.state.tanggalFilter}
                  onChange={this.handleTanggalFilterChange}
                  className={
                    this.state.isSudahPulang
                      ? `block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md leading-tight focus:outline-none focus:border-gray-500`
                      : `hidden`
                  }
                />
              </div>
            </div>
            <div className="flex flex-col pb-10 px-7">
              {this.state.isSudahPulang == "ya" && (
                <MUIDataTable
                  title={"Data Kepulangan"}
                  data={dataPulang}
                  columns={columnsPulang}
                  options={options}
                />
              )}

              {this.state.isSudahPulang == "tidak" && (
                <MUIDataTable
                  title={"Data Kehadiran"}
                  data={dataHadir}
                  columns={columnsHadir}
                  options={options}
                />
              )}
              {this.state.isSudahPulang == "izin" && (
                <MUIDataTable
                  title={"Data Izin"}
                  data={dataIzib}
                  columns={columnsIzin}
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

export default Kehadiran;
