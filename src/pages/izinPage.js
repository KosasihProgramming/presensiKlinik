import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
// import FormAddIzin from "./formIzin";
import Swal from "sweetalert2";
import axios from "axios";
import { urlAPI } from "../config/global";
import dayjs from "dayjs";
import FormAddIzin from "../components/formIzin";
import FormAddIzinMobile from "../components/formIzinMobile";
import { Navigate } from "react-router-dom";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function IzinPage(props) {
  const [tanggal, setTanggal] = useState(
    dayjs().locale("id").format("YYYY-MM-DD")
  );
  const navigate = useNavigate();

  const handleAdd = async (
    alasan,
    jenis,
    mulai,
    akhir,
    jadwal,
    barcode,
    isFile,
    image,
    nama
  ) => {
    // Cek kelengkapan form
    if (!alasan || !jenis || !mulai || !akhir || !jadwal || !barcode) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Data harus diisi lengkap",
      });
      return;
    }
    const jamMasuk = await getCurrentTime();
    const jamSaatIni = jamMasuk + ":00";
    const cekJam = await compareDatesAndTimes(
      jamSaatIni,
      jadwal[0].jam_pulang,
      tanggal,
      jadwal[0].tanggal
    );
    if (cekJam == true) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian!",
        text: "Jadwal Anda Hari Ini Telah Berakhir",
        // confirmButtonText: `Lanjutkan`,
        focusConfirm: false,
        reverseButtons: true,
        focusCancel: true,
      });
    } else {
      const durasi = hitungSelisihMenit(mulai, akhir);
      const durasiJadwal = hitungSelisihMenit(
        jadwal[0].jam_masuk,
        jadwal[0].jam_pulang
      );

      // Membuat FormData untuk mengirim data dan file
      const formData = new FormData();
      formData.append("idJadwal", jadwal[0].id_jadwal);
      formData.append("idDetailJadwal", jadwal[0].id);
      formData.append("idShift", jadwal[0].id_shift);
      formData.append("waktuMulai", mulai);
      formData.append("waktuSelesai", akhir);
      formData.append("tanggal", tanggal);
      formData.append("durasi", durasi);
      formData.append("jenisizin", jenis.value);
      formData.append("alasan", alasan);
      formData.append("barcode", barcode);

      // Jika ada file gambar yang diunggah
      if (isFile && image) {
        formData.append("image", image); // Gambar diunggah sebagai file
      }

      try {
        const response = await axios.post(
          urlAPI + "/kehadiran/add-izin/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Pastikan tipe konten adalah multipart
            },
          }
        );
        if (parseInt(durasi) >= parseInt(durasiJadwal)) {
          await handleHadir(barcode, jadwal, mulai, akhir);
        }
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });

        const text = `${nama} ${jenis.value} Selama ${durasi} Menit, Dengan Alasan ${alasan}`;
        await sendMessage(text); // Menunggu pengiriman pesan selesai
        sessionStorage.setItem("isSuccess", true);
        navigate("/success"); // Pindah ke halaman utama atau rute lain
        // setOpen(); // Menutup form atau melakukan tindakan lain setelah data berhasil disimpan
      } catch (error) {
        console.log("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan saat menyimpan data",
        });
      }
    }
  };
  const getKlinik = async () => {
    try {
      const response = await axios.get(`${urlAPI}/klinik`);
      return response.data[0].nama_instansi;
    } catch (error) {
      console.error("Error fetching API", error);
    }
  };
  const handleHadir = async (barcode, jadwal, waktuAwal, waktuAkhir) => {
    const namaInstansi = await getKlinik();

    const absenMasuk = {
      barcode,
      id_jadwal: jadwal[0].id_jadwal,
      id_detail_jadwal: jadwal[0].id,
      id_shift: jadwal[0].id_shift,
      jam_masuk: waktuAwal,
      jam_keluar: waktuAkhir,
      lokasiAbsen: namaInstansi,
    };
    console.log(absenMasuk);
    axios
      .post(urlAPI + "/kehadiran/absen-izin", absenMasuk)
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
  const sendMessage = async (message) => {
    try {
      const botToken = "bot6823587684:AAE4Ya6Lpwbfw8QxFYec6xAqWkBYeP53MLQ";
      const chatId = "-1001812360373";
      const thread = "4294967304";
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
  function hitungSelisihMenit(jam1, jam2) {
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
  const compareDatesAndTimes = (jam1, jam2, tanggal1, tanggal2) => {
    // Cek apakah tanggal 1 dan tanggal 2 sama
    if (tanggal1 === tanggal2) {
      // Ubah string jam1 dan jam2 menjadi objek Date dengan format waktu (termasuk detik)
      const time1 = new Date(`1970-01-01T${jam1}`);
      const time2 = new Date(`1970-01-01T${jam2}`);

      // Bandingkan jam1 dan jam2
      return time1 > time2; // Return true jika jam1 lebih besar dari jam2
    }

    return false; // Return false jika tanggal tidak sama
  };
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours(); // Mengambil jam saat ini
    const minutes = now.getMinutes(); // Mengambil menit saat ini

    // Menambahkan leading zero jika kurang dari 10
    const formattedHours = hours < 10 ? "0" + hours : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full bg-white rounded-lg shadow-lg py-4">
          <h4 className="text-center text-2xl text-wrap font-medium">
            Form Izin
          </h4>
          <h4 className="text-center text-2xl text-wrap font-medium">
            Karyawan Kosasih Group
          </h4>
          <FormAddIzinMobile addData={handleAdd} />
        </div>
      </div>
    </>
  );
}
