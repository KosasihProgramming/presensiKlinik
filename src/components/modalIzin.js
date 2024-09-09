import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import FormAddIzin from "./formIzin";
import Swal from "sweetalert2";
import axios from "axios";
import { urlAPI } from "../config/global";
import dayjs from "dayjs";

export default function ModalAddIzin(props) {
  const setOpen = () => {
    props.setOpen(false);
  };
  const [tanggal, setTanggal] = useState(
    dayjs().locale("id").format("YYYY-MM-DD")
  );
  const [namaKlinik, setNamaKlinik] = useState("");
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
      let durasi = hitungSelisihMenit(mulai, akhir);

      const durasiJadwal = hitungSelisihMenit(
        jadwal[0].jam_masuk,
        jadwal[0].jam_pulang
      );

      console.log(durasi, durasiJadwal, "durasi");
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
        await sendMessage(text);
        setOpen();
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

  const handleSubmit = (
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
    if (!props.isPulang) {
      handleAdd(
        alasan,
        jenis,
        mulai,
        akhir,
        jadwal,
        barcode,
        isFile,
        image,
        nama
      );
    } else {
      props.handleAdd(alasan, jenis, isFile, image);
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
  const getKlinik = async () => {
    try {
      const response = await axios.get(`${urlAPI}/klinik`);
      setNamaKlinik(response.data[0].nama_instansi);
      return response.data[0].nama_instansi;
    } catch (error) {
      console.error("Error fetching API", error);
    }
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

  return (
    <Dialog open={props.open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-full overflow-y-auto  flex justify-center items-center pl-48">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg h-[95vh] overflow-y-scroll w-[45rem]   text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-slate-100  pb-8  w-[45rem]">
              <div className="flex items-start">
                <div className=" text-center w-full  ">
                  <div className=" w-full flex justify-center">
                    <DialogTitle
                      as="h3"
                      className="text-xl font-semibold leading-6 text-white w-[95%]  py-3 mt-8 rounded-xl bg-blue-600 "
                    >
                      Pengajuan Izin {props.isPulang ? "Pulang Cepat" : ""}
                    </DialogTitle>
                  </div>
                  <div className=" px-4">
                    <FormAddIzin
                      addData={handleSubmit}
                      nama={props.nama}
                      jamPulang={props.jamPulang}
                      isPulang={props.isPulang}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex justify-end w-full sm:px-6">
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="mt-3 justify-center rounded-md bg-blue-100 border border-blue-600 text-blue-700 hover:border-white px-3 py-2 text-sm font-semibold w-[8rem] shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
