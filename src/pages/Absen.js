import axios from "axios";
import React, { Component } from "react";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import { urlAPI, botTokenTelegram, chatIdTelegram } from "../config/global";
import { konfersiJam } from "../function/konfersiJam";
import { FiSearch } from "react-icons/fi";
import { ToastContainer, Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { db, dbImage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";
import Loader from "../function/loader";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import Face from "../style/face.png";
// import { stat } from "fs";

class Absen extends Component {
  constructor(props) {
    super(props);
    this.webcamRef = React.createRef();
    this.state = {
      barcode: "",
      idJadwal: 0,
      idDetailJadwal: 0,
      idShift: 0,
      tanggal: dayjs().locale("id").format("YYYY/MM/DD"),
      fotoMasuk: "",
      fotoKeluar: "",
      jamMasuk: "",
      jamKeluar: "",
      no_hp_pengganti: "",
      durasi: 0,
      dataIzin: [],
      dendaTelat: 0,
      isPerawat: false,
      isPindahKlinik: 0,
      pegawai: {},
      cabang: {},
      namaPetugas: "",
      keterangan: "",
      isLoad: false,
      isComp: false,
      isLanjutShift: 0,
      isSearch: false,
      isDokterPengganti: 0,
      lembur: 0,
      dataPerawat: [],
      dokterPengganti: "",
      harusMasuk: "",
      errorMessage: "",
      dataJadwalHariIni: [],
      selectedJadwal: {},
      namaPegawai: "",
      namaKlinik: "",
      timer: null, // Menyimpan ID timer untuk pembatalan
      dataPosisi: [
        { text: "Kantor Pusat", value: "Kantor Pusat" },
        { text: "Klinik Kosasih Kemiling", value: "Klinik Kosasih Kemiling" },
        { text: "Klinik Kosasih Rajabasa", value: "Klinik Kosasih Rajabasa" },
        { text: "Klinik Kosasih Urip", value: "Klinik Kosasih Urip" },
        { text: "Klinik Kosasih Tirtayasa", value: "Klinik Kosasih Tirtayasa" },
        { text: "Klinik Kosasih Palapa", value: "Klinik Kosasih Palapa" },
        { text: "Klinik Kosasih Amanah", value: "Klinik Kosasih Amanah" },
        { text: "Klinik Kosasih Panjang", value: "Klinik Kosasih Panjang" },
        { text: "Klinik Kosasih Teluk", value: "Klinik Kosasih Teluk" },
        {
          text: "Klinik Kosasih Sumber Waras",
          value: "Klinik Kosasih Sumber Waras",
        },
        {
          text: "Griya Terapi Sehat Kemiling",
          value: "Griya Terapi Sehat Kemiling",
        },
        {
          text: "Griya Terapi Sehat Tirtayasa",
          value: "Griya Terapi Sehat Tirtayasa",
        },
      ],
      lokasiAbsen: "",
      isProses: false,
    };
  }

  componentDidMount() {
    // this.getKlinik();
    this.checkDevice();
  }

  checkDevice = () => {
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
          this.getKehadiranPerawat(response.data[0].cabang);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };

  handleCheckSubmit = () => {
    // Set timer untuk menjalankan fungsi tambahan setelah 5 detik
    const newTimer = setTimeout(() => {
      this.handleSubmit();
    }, 15000);
    this.setState({ timer: newTimer }); // Simpan ID timer dalam state
  };
  getKlinik = async () => {
    try {
      const response = await axios.get(`${urlAPI}/klinik`);
      this.setState({ namaKlinik: response.data[0].nama_instansi });
    } catch (error) {
      console.error("Error fetching API", error);
    }
  };

  handleSearch = () => {
    this.setState({ isLoad: true });
    const { barcode } = this.state;
    const jamMasuk = this.getCurrentTime();
    const dataIzin = this.getAllDataIzin();

    console.log("Jam Masuk", jamMasuk);
    console.log("Jam Rel", this.state.harusMasuk);
    if (!barcode) {
      toast.warning("Isi barcode terlebih dahulu", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      axios
        .get(`${urlAPI}/barcode/jadwal/${barcode}`)
        .then((response) => {
          console.log(response.data);

          if (
            response.data.jadwal.length > 0 &&
            response.data.barcode.length > 0
          ) {
            const sortData = response.data.jadwal.sort((a, b) => {
              const timeA = new Date(`1970-01-01T${a.jam_masuk}Z`).getTime();
              const timeB = new Date(`1970-01-01T${b.jam_masuk}Z`).getTime();
              return timeA - timeB;
            });

            // Mendapatkan waktu saat ini dalam format yang sama
            const now = new Date();
            const currentTime = new Date(
              `1970-01-01T${now.toTimeString().split(" ")[0]}Z`
            ).getTime();

            // Mencari objek dengan jam_masuk terdekat dengan waktu saat ini
            const closestTimeObj = sortData.reduce((closest, current) => {
              const currentDiff = Math.abs(
                new Date(`1970-01-01T${current.jam_masuk}Z`).getTime() -
                  currentTime
              );
              const closestDiff = Math.abs(
                new Date(`1970-01-01T${closest.jam_masuk}Z`).getTime() -
                  currentTime
              );

              return currentDiff < closestDiff ? current : closest;
            });

            console.log(closestTimeObj, "closes");

            this.getKehadiranPerawat(this.state.cabang);

            this.setState({
              selectedJadwal: closestTimeObj,
              idDetailJadwal: closestTimeObj.id,
              idJadwal: closestTimeObj.id_jadwal,
              idShift: closestTimeObj.id_shift,
              harusMasuk: closestTimeObj.jam_masuk,
            });

            this.setState({
              dataJadwalHariIni: sortData,
              namaPegawai: response.data.barcode[0].nama,
              pegawai: response.data.barcode,
              isSearch: true,
            });
            toast.success("Jadwal ditemukan", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            });
            this.handleCheckSubmit();
          } else if (
            response.data.jadwal.length == 0 &&
            response.data.barcode.length == 0
          ) {
            toast.error("Barcode tidak ditemukan", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            });
          } else if (
            response.data.jadwal.length == 0 &&
            response.data.barcode.length > 0
          ) {
            toast.warning("Tidak ada jadwal hari ini", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            });
          }

          this.setState({ isLoad: false });
        })
        .catch((err) => {
          console.error(err);
          this.setState({ isLoad: false });

          toast.error("Tidak dapat menemukan barcode", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        });
    }
  };

  handleCheckboxChange = (e) => {
    // Jika ada timer aktif, batalkan
    if (this.state.timer) {
      clearTimeout(this.state.timer);
      this.setState({ timer: null });
    }
    const isChecked = e.target.checked;
    this.setState({
      isPindahKlinik: isChecked ? 1 : 0,
      isLanjutShift: isChecked ? 0 : this.state.isLanjutShift,
    });
  };

  handleCheckboxChangeShift = (e) => {
    // Jika ada timer aktif, batalkan
    if (this.state.timer) {
      clearTimeout(this.state.timer);
      this.setState({ timer: null });
    }
    const isChecked = e.target.checked;
    this.setState({
      isLanjutShift: isChecked ? 1 : 0,
      isPindahKlinik: isChecked ? 0 : this.state.isPindahKlinik,
    });
  };

  handleCheckboxChangeDokter = (e) => {
    // Jika ada timer aktif, batalkan
    if (this.state.timer) {
      clearTimeout(this.state.timer);
      this.setState({ timer: null });
    }
    const { name, checked } = e.target;
    this.setState({ [name]: checked ? 1 : 0 });
  };

  sendMessageToTelegram = async (message, thread, chatId) => {
    console.log(message, thread, chatId);
    try {
      const botToken = "bot6823587684:AAE4Ya6Lpwbfw8QxFYec6xAqWkBYeP53MLQ";

      const response = await fetch(
        `https://api.telegram.org/${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "html",
            message_thread_id: thread,
          }),
        }
      );

      if (response.ok) {
        console.log("Berhasil Dikirmkan");
      } else {
        console.log("Gagal mengirim pesan");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours(); // Mengambil jam saat ini
    const minutes = now.getMinutes(); // Mengambil menit saat ini

    // Menambahkan leading zero jika kurang dari 10
    const formattedHours = hours < 10 ? "0" + hours : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };

  handleSubmit = async () => {
    this.setState({ isProses: true, isLoad: true });
    const {
      barcode,
      idJadwal,
      idDetailJadwal,
      idShift,
      fotoMasuk,
      fotoKeluar,
      jamKeluar,
      durasi,
      dendaTelat,
      lembur,
      isPindahKlinik,
      isLanjutShift,
      isDokterPengganti,
      harusMasuk,
      namaPegawai,
      dataJadwalHariIni,
      pegawai,
      namaKlinik,
      dokterPengganti,
      lokasiAbsen,
      dataIzin,
      cabang,
      selectedJadwal,
    } = this.state;

    if (
      Object.keys(selectedJadwal).length === 0 &&
      idDetailJadwal === 0 &&
      idJadwal === 0 &&
      idShift === 0 &&
      harusMasuk === "" &&
      this.state.namaPetugas === ""
    ) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Harap Lengkapi Data",
      });
      this.setState({
        isProses: false,
        isLoad: false,
        // tanggal: "2024/10/25",
      });

      return true; // Jika semua kosong, return true
    }

    if (
      this.state.isDokterPengganti == 1 &&
      (this.state.dokterPengganti === "" || this.state.no_hp_pengganti == "")
    ) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Harap Lengkapi Data Dokter Pengganti",
      });
      this.setState({
        isProses: false,
        isLoad: false,
        // tanggal: "2024/10/25",
      });

      return true; // Jika semua kosong, return true
    }

    const namaInstansi = this.state.namaKlinik;
    const tanggalHariIni = this.getTodayDate();
    let imageSrc = this.webcamRef.current.getScreenshot();

    if (imageSrc == null) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Kamera Tidak Terdeteksi",
      });
      this.setState({ isProses: false, isLoad: false });

      return;
    }
    // Convert data URL to Blob
    const fotoKeluarBlob = this.dataURLToBlob(imageSrc);

    // Compress the image to a maximum of 20KB
    try {
      const compressedFile = await imageCompression(fotoKeluarBlob, {
        maxSizeMB: 0.1, // Set max size to 20KB (0.02MB)
        maxWidthOrHeight: 1920, // Adjust if needed to control image dimensions
      });

      // Convert compressed file to base64
      imageSrc = await imageCompression.getDataUrlFromFile(compressedFile);
    } catch (compressionError) {
      console.error("Error compressing image:", compressionError);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengkompres gambar",
      });
      this.setState({ isProses: false, isLoad: false });

      return;
    }
    const [jamHarusMasuk, menitHarusMasuk] = this.state.harusMasuk
      .split(":")
      .map(Number);

    const jamMasuk = await this.getCurrentTime();
    const jamSaatIni = jamMasuk + ":00";
    let jamMasukJadwal = "";

    console.log("izin data", dataIzin);
    const izinNow = dataIzin.filter((a) => a.barcode == barcode);

    if (izinNow.length > 0) {
      jamMasukJadwal = konfersiJam(izinNow[0].waktuSelesai);
    } else {
      jamMasukJadwal = this.state.harusMasuk;
    }
    console.log("Jam Masuk", jamMasuk);
    console.log("Jam jadwal", jamMasukJadwal);
    // Menghitung keterlambatan dalam menit
    const telat = await this.hitungKeterlambatan(jamMasuk, jamMasukJadwal);
    console.log("telat", telat);
    const lanjutShift = this.state.isLanjutShift;
    const pindahKlinik = this.state.isPindahKlinik;

    let telatMenit = 0;
    const chatId = "-1001859405516";
    const thread = "18";
    console.log("Jam Masuk");
    if (parseInt(telat) < 0 || lanjutShift == 1) {
      telatMenit = 0;
    } else {
      telatMenit = parseInt(telat);
    }

    let denda = 0;
    const cekJam = this.compareDatesAndTimes(
      jamSaatIni,
      this.state.selectedJadwal.jam_pulang,
      tanggalHariIni,
      this.state.selectedJadwal.tanggal
    );
    console.log(this.state.selectedJadwal, "jadwal terpilih");
    if (
      cekJam == true &&
      this.state.selectedJadwal.jam_masuk !=
        this.state.selectedJadwal.jam_pulang
    ) {
      this.setState({ isProses: false, isLoad: false });
      await this.handleHadir();
      await Swal.fire({
        icon: "warning",
        title: "Perhatian!",
        text: "Jadwal Anda Hari Ini Telah Berakhir, Kehadiran Anda Di Catat Dengan Status Alpha",
        // confirmButtonText: `Lanjutkan`,
        focusConfirm: false,
        reverseButtons: true,
        focusCancel: true,
      });
    } else {
      console.log("pegawi", pegawai);
      const nik = pegawai[0].nik;
      if (!nik.includes("AP")) {
        const jabatan = await this.cekJabatan(pegawai[0]);
        if (jabatan == true) {
          if (pindahKlinik == 1) {
            if (telatMenit > 0 && telatMenit <= 30) {
              denda = 7500;
            } else if (telatMenit > 30) {
              const durasi = telatMenit - 30;
              if (durasi > 0 && durasi <= 4) {
                denda = 2500 + 7500;

                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 4 && durasi <= 9) {
                denda = 5000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 9 && durasi <= 19) {
                denda = 10000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 19 && durasi <= 29) {
                denda = 20000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 29) {
                denda = (durasi - 29) * 1000 + 20000 + 7500;

                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              }
            }
          }
          // Akhir logic aturan denda pindah klinik
          // Logic Aturan Denda Normal
          else if (pindahKlinik == 0) {
            if (telatMenit <= 0) {
              denda = 0;
            } else if (telatMenit > 0 && telatMenit <= 4) {
              denda = 2500;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 4 && telatMenit <= 9) {
              denda = 5000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 9 && telatMenit <= 19) {
              denda = 10000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 19 && telatMenit <= 29) {
              denda = 20000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 29) {
              denda = (telatMenit - 29) * 1000 + 20000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (!idDetailJadwal) {
              const message = `${this.state.namaPegawai} tidak ada jadwal & berusaha melakukan absen di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            }
          }
        } else {
          if (pindahKlinik == 1) {
            if (telatMenit > 0 && telatMenit <= 30) {
              denda = 7500;
            } else if (telatMenit > 30) {
              const durasi = telatMenit - 30;
              if (durasi > 0 && durasi <= 4) {
                denda = 2500 + 7500;

                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 4 && durasi <= 9) {
                denda = 10000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 9 && durasi <= 19) {
                denda = 15000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 19 && durasi <= 29) {
                denda = 25000 + 7500;
                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              } else if (durasi > 29) {
                denda = (durasi - 29) * 1000 + 25000 + 7500;

                const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
                await this.sendMessageToTelegram(message, thread, chatId);
              }
            }
          }
          if (pindahKlinik == 0) {
            if (telatMenit <= 0) {
              denda = 0;
            } else if (telatMenit > 0 && telatMenit <= 4) {
              denda = 2500;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 4 && telatMenit <= 14) {
              denda = 10000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 14 && telatMenit <= 29) {
              denda = 15000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (telatMenit > 29) {
              denda = (telatMenit - 29) * 1000 + 25000;
              const message = `${this.state.namaPegawai} telat masuk selama ${telatMenit} menit, di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            } else if (!idDetailJadwal) {
              const message = `${this.state.namaPegawai} tidak ada jadwal & berusaha melakukan absen di ${this.state.cabang}`;
              await this.sendMessageToTelegram(message, thread, chatId);
            }
          }
        }
      }

      // Logic aturan denda pindah klinik

      // Akhir logic denda Normal

      console.log("telatnya ", telatMenit);
      console.log("dendanya: ", denda);
      console.log("nama: ", dokterPengganti);
      const diganti = this.state.isDokterPengganti;
      const namaDokterPengganti = this.state.dokterPengganti;

      if (diganti == 1) {
        const id = "-1001859405516";
        const topic = "14";
        const message = `<b>dr. Tetap</b>: ${this.state.namaPegawai}\n<b>Nama Pengganti</b> :${namaDokterPengganti}\n<b>No HP Pengganti</b> :${this.state.no_hp_pengganti}\n<b>Pada Tanggal : ${tanggalHariIni}</b>\n<b>Waktu Shift</b> :${dataJadwalHariIni[0].jam_masuk} : ${dataJadwalHariIni[0].jam_pulang}\n<b>Petugas Penjaga</b> : ${this.state.namaPetugas}\n<b>Lokasi Klinik</b> : ${this.state.cabang}`;
        await this.sendMessageToTelegram(message, topic, id);
      }

      const absenMasuk = {
        barcode: barcode,
        id_jadwal: idJadwal,
        id_detail_jadwal: idDetailJadwal,
        id_shift: idShift,
        foto_masuk: imageSrc,
        jam_masuk: jamMasuk,
        telat: telatMenit,
        denda_telat: denda,
        is_pindah_klinik: isPindahKlinik,
        is_lanjut_shift: isLanjutShift,
        is_dokter_pengganti: isDokterPengganti,
        nama_dokter_pengganti:
          isDokterPengganti == 1
            ? `${dokterPengganti} (${this.state.no_hp_pengganti})`
            : "",
        nama_petugas: this.state.namaPetugas,
        keterangan: "Masuk: " + this.state.keterangan,
        lokasiAbsen: this.state.namaKlinik,
        cabang: cabang,
      };
      console.log(absenMasuk);
      axios
        .post(urlAPI + "/kehadiran", absenMasuk)
        .then((response) => {
          this.setState({
            barcode: "",
            isPindahKlinik: 0,
            isLanjutShift: 0,
            isDokterPengganti: 0,
            lokasiAbsen: "",
          });
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Berhasil melakukan presensi",
            // confirmButtonText: `Lanjutkan`,
            focusConfirm: false,
            reverseButtons: true,
            focusCancel: true,
          });
          if (denda > 0) {
            Swal.fire({
              icon: "warning",
              title: "Maaf",
              text: `Anda Terkena Denda Telat Sebesar ${this.formatRupiah(
                denda
              )}`,
              focusConfirm: false,
              reverseButtons: true,
              focusCancel: true,
            });
          }
          this.getKehadiranPerawat(this.state.cabang);
          this.setState({
            selectedJadwal: {},
            idDetailJadwal: 0,
            idJadwal: 0,
            idShift: 0,
            harusMasuk: "",
          });
          this.setState({
            dataJadwalHariIni: [],
            namaPegawai: "",
            pegawai: {},
          });

          this.setState({
            isProses: false,
            isLoad: false,
            isPindahKlinik: 0,
            isLanjutShift: 0,
            isDokterPengganti: 0,
            dokterPengganti: "",
            keterangan: "",
            isSearch: false,
          });
        })
        .catch((error) => {
          this.setState({ isProses: false, isLoad: false });
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: error,
          });
          console.log("Error:", error);
        });
    }
  };

  handleHadir = async () => {
    const absenMasuk = {
      barcode: this.state.barcode,
      id_jadwal: this.state.selectedJadwal.id_jadwal,
      id_detail_jadwal: this.state.selectedJadwal.id,
      id_shift: this.state.selectedJadwal.id_shift,
      jam_masuk: this.state.selectedJadwal.jam_masuk,
      jam_keluar: this.state.selectedJadwal.jam_pulang,
      lokasiAbsen: this.state.lokasiAbsen,
      ket: "Alpha / Tidak Presensi",
      petugas: this.state.namaPetugas,
    };
    console.log(absenMasuk);
    axios.post(urlAPI + "/kehadiran/absen-izin", absenMasuk);

    await this.handleIzin(false, null)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Berhasil melakukan presensi",
          focusConfirm: false,
          reverseButtons: true,
          focusCancel: true,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error,
        });
        console.log("Error:", error);
      });
  };

  handleIzin = async (isFile, image) => {
    try {
      const durasi = this.hitungSelisihMenit(
        konfersiJam(this.state.selectedJadwal.jam_masuk),
        konfersiJam(this.state.selectedJadwal.jam_pulang)
      );
      console.log(
        konfersiJam(this.state.selectedJadwal.jam_masuk),
        konfersiJam(this.state.selectedJadwal.jam_pulang),
        durasi,
        "jam"
      );

      // Membuat FormData untuk mengirim data dan file
      const formData = new FormData();
      formData.append("idJadwal", this.state.idJadwal);
      formData.append("idDetailJadwal", this.state.idDetailJadwal);
      formData.append("idShift", this.state.idShift);
      formData.append("waktuMulai", "00:00");
      formData.append("waktuSelesai", "00:00");
      formData.append("tanggal", this.getTodayDate());
      formData.append("durasi", durasi);
      formData.append("jenisizin", "Absen");
      formData.append("alasan", "Tidak Presensi Masuk dan Izin");
      formData.append("barcode", this.state.barcode);

      // Jika ada file gambar yang diunggah
      if (isFile && image) {
        formData.append("image", image); // Gambar diunggah sebagai file
      }

      // Menggunakan async/await untuk request HTTP
      const response = await axios.post(
        urlAPI + "/kehadiran/add-izin/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Pastikan tipe konten adalah multipart
          },
        }
      );
      const text = `${this.state.namaPegawai} Alpha Selama ${durasi} Menit, Dengan Alasan Tidak Presensi Masuk dan Izin`;
      await this.sendMessageToTelegram(text);
      // Jika berhasil
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil disimpan",
      });
    } catch (error) {
      // Jika terjadi kesalahan
      console.log("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data",
      });
    }
  };
  hitungKeterlambatan = (waktuMasuk, waktuSeharusnya) => {
    // Urai jam dan menit dari waktu masuk aktual
    const [jamMasuk, menitMasuk] = waktuMasuk.split(":").map(Number);

    // Urai jam dan menit dari waktu yang seharusnya
    const [jamHarusMasuk, menitHarusMasuk] = waktuSeharusnya
      .split(":")
      .map(Number);

    // Hitung total menit untuk setiap waktu
    const totalMenitMasuk = jamMasuk * 60 + menitMasuk;
    const totalMenitHarusMasuk = jamHarusMasuk * 60 + menitHarusMasuk;

    // Hitung selisih menit
    const selisihMenit = totalMenitMasuk - totalMenitHarusMasuk;

    return selisihMenit > 0 ? selisihMenit : 0; // Hanya hitung keterlambatan positif
  };

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Menambahkan 1 karena bulan dimulai dari 0
    const day = String(today.getDate()).padStart(2, "0"); // Pad untuk memastikan dua digit

    return `${year}-${month}-${day}`;
  }

  dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };
  compareDatesAndTimes(jam1, jam2, tanggal1, tanggal2) {
    // Cek apakah tanggal 1 dan tanggal 2 sama
    if (tanggal1 === tanggal2) {
      // Ubah string jam1 dan jam2 menjadi objek Date dengan format waktu (termasuk detik)
      const time1 = new Date(`1970-01-01T${jam1}`);
      const time2 = new Date(`1970-01-01T${jam2}`);

      // Bandingkan jam1 dan jam2
      return time1 > time2; // Return true jika jam1 lebih besar dari jam2
    }

    return false; // Return false jika tanggal tidak sama
  }
  getAllDataIzin = () => {
    axios
      .get(`${urlAPI}/kehadiran/izin/today`)
      .then((response) => {
        console.log("izizn: ", response.data);
        this.setState({ dataIzin: response.data });
        return response.data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  formatToTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0"); // Pastikan dua digit untuk jam
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Pastikan dua digit untuk menit

    return `${hours}:${minutes}`;
  }
  hitungSelisihMenit(jam1, jam2) {
    // Format input jam: "HH:MM" (contoh: "14:30", "16:45")
    const formatTime = (time) => {
      return time.length > 5 ? time.substring(0, 5) : time;
    };

    // Ubah jam1 dan jam2 menjadi format HH:mm
    const formattedJam1 = formatTime(jam1);
    const formattedJam2 = formatTime(jam2);

    // Memecah jam dan menit dari kedua input
    const [hours1, minutes1] = formattedJam1.split(":").map(Number);
    const [hours2, minutes2] = formattedJam2.split(":").map(Number);

    // Mengonversi jam menjadi total menit
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // Menghitung selisih waktu dalam menit
    const selisihMenit = totalMinutes2 - totalMinutes1;

    return Math.abs(selisihMenit);
  }

  cekJabatan(obj) {
    // Mengecek apakah properti jbtn ada dan mengandung kata "dokter"
    if (obj.hasOwnProperty("jbtn") && obj.jbtn.includes("dokter")) {
      return true;
    } else {
      return false;
    }
  }

  getKehadiranPerawat = (cabang) => {
    const postData = {
      tanggal: this.state.tanggal,
      jabatan: "Farmasi",
      cabang: cabang,
    };
    console.log(postData);

    axios
      .post(urlAPI + "/jadwal/perawat-hadir/", postData)
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const nama = data[data.length - 1].nama
            .split(" ")
            .slice(0, 3)
            .join(" ");
          this.setState({ namaPetugas: nama, isPerawat: true });
        } else {
          this.getJadwalPerawat();
        }

        // Adding tanggal property to each data item
        console.log("Data Hadir Perawat", response.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  getJadwalPerawat = () => {
    const postData = {
      tanggal: this.state.tanggal,
      jabatan: "Farmasi",
    };
    console.log(postData);

    axios
      .post(urlAPI + "/jadwal/jadwal-today/", postData)
      .then((response) => {
        // Adding tanggal property to each data item
        this.setState({ dataPerawat: response.data });
        console.log("Data", response.data);
      })
      .catch((error) => {
        console.log("Error:", error);
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

  handleInputChange = (e) => {
    const value = e.target.value;

    if (value.length === 5) {
      this.setState({
        barcode: value,
        isComp: true,
        errorMessage: "Klik Enter",
      });
    } else if (value.length === 4) {
      this.setState({
        barcode: value,
        isComp: false,
        errorMessage: "Karakter harus 5 karakter, awali Barcode dengan angka 0",
      });
    } else if (value.length > 5) {
      this.setState({
        barcode: value,
        isComp: false,

        errorMessage: "Salah, Karakter Melebihi 5 Karakter",
      });
    } else {
      this.setState({
        isComp: false,
        barcode: value,
        errorMessage: "Isi Barcode Kehadiran Anda",
      });
    }
  };

  handleKeyDown = (e) => {
    // e.preventDefault();
    if (e.key === "Enter" && this.state.barcode.length === 5) {
      this.triggerFunction();
    }
  };

  handleBlur = () => {
    if (this.state.barcode.length === 5) {
      this.triggerFunction();
    }
  };

  triggerFunction = () => {
    this.handleSearch();
    this.setState({ isComp: false, errorMessage: "" });
  };
  render() {
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
    console.log("petugas", this.state.namaPetugas);
    return (
      <div>
        <ToastContainer />
        {this.state.isLoad ? (
          <>
            <div className="w-full h-[100vh] flex justify-center items-center">
              <Loader />
            </div>
          </>
        ) : (
          <>
            <div className="card-presensi">
              <div className="rounded-lg bg-white shadow-lg">
                <div className="grid grid-cols-2 overflow-hidden">
                  {this.state.isSearch ? (
                    <>
                      <div className="flex p-10 h-[70vh] justify-center items-center relative">
                        <Webcam
                          className="rounded-3xl"
                          audio={false}
                          ref={this.webcamRef}
                          screenshotFormat="image/jpeg"
                        />
                        <div className="w-full   px-[2.5rem] py-[7rem]  flex justify-center items-center absolute ">
                          <img
                            src={Face}
                            className="w-full  z-[99] object-cover rounded-2xl"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-[85%] mr-10 h-[70vh] flex flex-col gap-6 justify-center items-center rounded-xl bg-slate-700">
                        <h4 className="text-lg text-white font medium">
                          Masukkan Barcode Untuk Akses Kamera
                        </h4>
                        <h4 className="text-lg text-white font medium text-center">
                          Pastikan Anda Tidak Menggunakan Helm atau Masker Saat
                          Absen
                        </h4>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col justify-center">
                    <h4 className="title text-teal-500">Presensi masuk</h4>
                    <form action="">
                      <div className="flex flex-col gap-4 w-[60%]">
                        <div className="flex flex-row gap-3">
                          <div className="flex flex-col gap-4 justify-start items-start w-full ">
                            <input
                              type="number"
                              placeholder="Masukkan barcode.."
                              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500"
                              value={this.state.barcode}
                              onChange={this.handleInputChange}
                              onKeyDown={this.handleKeyDown}
                              onBlur={this.handleBlur}
                              required
                            />
                            {this.state.errorMessage && (
                              <p
                                className={`${
                                  this.state.isComp
                                    ? "text-teal-600"
                                    : "text-red-500"
                                } text-base mt-1`}
                              >
                                {this.state.errorMessage}
                              </p>
                            )}
                          </div>
                          {/* <button
                            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:bg-teal-600"
                            onClick={this.handleSearch}
                          >
                            <FiSearch />
                          </button> */}
                        </div>
                        {this.state.isSearch ? (
                          <>
                            <input
                              type="text"
                              placeholder="Nama dokter pengganti - no hp"
                              className={`mt-1 p-2 text-xl border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500`}
                              value={this.state.selectedJadwal.nama}
                              readOnly
                            />
                            <div className="relative">
                              <select
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={this.state.idDetailJadwal}
                                onChange={(e) => {
                                  const selectedData =
                                    this.state.dataJadwalHariIni.find(
                                      (data) =>
                                        data.id === parseInt(e.target.value)
                                    );
                                  const selectedIdJadwal =
                                    selectedData.id_jadwal;
                                  const selectedIdShift = selectedData.id_shift;
                                  const selectedHarusMasuk = konfersiJam(
                                    selectedData.jam_masuk
                                  );
                                  // Jika ada timer aktif, batalkan
                                  if (this.state.timer) {
                                    clearTimeout(this.state.timer);
                                    this.setState({ timer: null });
                                  }
                                  this.setState({
                                    selectedJadwal: selectedData,
                                    idDetailJadwal: e.target.value,
                                    idJadwal: selectedIdJadwal,
                                    idShift: selectedIdShift,
                                    harusMasuk: selectedHarusMasuk,
                                  });
                                }}
                              >
                                <option>Pilih Jadwal Anda</option>
                                {this.state.dataJadwalHariIni.map((data) => (
                                  <option value={data.id}>
                                    {data.nama_shift}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex flex-rows gap-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="checkbox"
                                  name="checkbox"
                                  checked={this.state.isPindahKlinik === 1}
                                  onChange={this.handleCheckboxChange}
                                  className="form-checkbox h-5 w-5 text-teal-600"
                                />
                                <label
                                  htmlFor="checkbox"
                                  className="ml-2 text-gray-700"
                                >
                                  Saya pindah klinik
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="checkboxShift"
                                  name="checkboxShift"
                                  checked={this.state.isLanjutShift === 1}
                                  onChange={this.handleCheckboxChangeShift}
                                  className="form-checkbox h-5 w-5 text-teal-600"
                                />
                                <label
                                  htmlFor="checkbox"
                                  className="ml-2 text-gray-700"
                                >
                                  Saya lanjut shift
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="checkboxPengganti"
                                name="isDokterPengganti"
                                checked={this.state.isDokterPengganti === 1}
                                onChange={this.handleCheckboxChangeDokter}
                                className="form-checkbox h-5 w-5 text-teal-600"
                              />
                              <label className="ml-2 text-gray-700">
                                Saya Pengganti Dari Luar Klinik
                              </label>
                            </div>
                            <input
                              type="text"
                              placeholder="Nama dokter pengganti - no hp"
                              className={`mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500 ${
                                this.state.isDokterPengganti === 1
                                  ? ""
                                  : "hidden"
                              }`}
                              value={this.state.dokterPengganti}
                              onChange={(e) => {
                                this.setState({
                                  dokterPengganti: e.target.value,
                                });
                              }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="No hp Dokter Pengganti"
                              className={`mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500 ${
                                this.state.isDokterPengganti === 1
                                  ? ""
                                  : "hidden"
                              }`}
                              value={this.state.no_hp_pengganti}
                              onChange={(e) => {
                                this.setState({
                                  no_hp_pengganti: e.target.value,
                                });
                              }}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Keterangan"
                              className={`mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500 `}
                              value={this.state.keterangan}
                              onChange={(e) => {
                                // Jika ada timer aktif, batalkan
                                if (this.state.timer) {
                                  clearTimeout(this.state.timer);
                                  this.setState({ timer: null });
                                }
                                this.setState({ keterangan: e.target.value });
                              }}
                            />
                            {this.state.isPerawat ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Nama Petugas PO"
                                  className={`mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-teal-500 `}
                                  value={this.state.namaPetugas}
                                  readOnly
                                />
                              </>
                            ) : (
                              <>
                                <select
                                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                  value={this.state.namaPetugas}
                                  onChange={(e) => {
                                    // Jika ada timer aktif, batalkan
                                    if (this.state.timer) {
                                      clearTimeout(this.state.timer);
                                      this.setState({ timer: null });
                                    }
                                    this.setState({
                                      namaPetugas: e.target.value,
                                    });
                                  }}
                                >
                                  <option>Pilih Petugas PO</option>
                                  {this.state.dataPerawat.map((data) => (
                                    <option value={data.nama}>
                                      {data.nama}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}

                            <div className="flex flex-row gap-4">
                              <button
                                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:bg-teal-600"
                                onClick={this.handleSubmit}
                                disabled={this.state.isProses}
                              >
                                Hadir
                              </button>
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Absen;
