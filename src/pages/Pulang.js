import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { urlAPI } from "../config/global";
import { Link, useParams, useNavigate } from "react-router-dom";
import { konfersiJam } from "../function/konfersiJam";
import Swal from "sweetalert2";
import ModalAddIzin from "../components/modalIzin";
import dayjs from "dayjs";

const Pulang = () => {
  const webcamRef = useRef(null);
  const { id_kehadiran } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    dataPulang: [],
    idKehadiran: id_kehadiran,
    barCode: 0,
    idJadwal: 0,
    idDetailJadwal: 0,
    idShift: 0,
    fotoMasuk: "",
    fotoKeluar: "",
    jamMasuk: "",
    jamKeluar: "",
    jamKeluarShift: "",
    durasi: 0,
    telat: 0,
    keterangan: "",
    tanggalAbsen: "",
    dendaTelat: 0,
    isPindahKlinik: 1,
    lembur: 0,
    namaDokter: "",
    namaShift: "",
    isIzin: false,
    isProses: false,
    jadwal: null,
    ket: "",
    tanggal: dayjs().locale("id").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    getKehadiran();
    getNamaDokter();
  }, [state.idKehadiran]);

  const getKehadiran = () => {
    axios
      .get(`${urlAPI}/kehadiran/${state.idKehadiran}`)
      .then((response) => {
        const data = response.data[0];
        console.log(response.data[0]);
        setState((prevState) => ({
          ...prevState,

          idJadwal: data.id_jadwal,
          idDetailJadwal: data.id_detail_jadwal,
          idShift: data.id_shift,
          fotoMasuk: data.foto_masuk,
          fotoKeluar: data.foto_keluar,
          jamMasuk: data.jam_masuk,
          jamKeluar: data.jam_keluar,
          jamKeluarShift: data.jam_keluar_shift,
          tanggalAbsen: data.tanggal,
          durasi: data.durasi,
          telat: data.telat,
          dendaTelat: data.denda_telat,
          isPindahKlinik: data.is_pindah_klinik,
          lembur: data.lembur,
          namaShift: data.nama_shift,
          ket: data.keterangan,
        }));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const getNamaDokter = () => {
    axios
      .get(`${urlAPI}/barcode/dokter/${state.idKehadiran}`)
      .then((response) => {
        const dataDokter = response.data[0];

        setState((prevState) => ({
          ...prevState,
          namaDokter: dataDokter.nama,
        }));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handlePulang = (e) => {
    e.preventDefault();

    handleSubmit();
  };
  const handleSubmit = () => {
    setState((prevState) => ({ ...prevState, isProses: true }));
    const { barCode, idKehadiran } = state;

    axios
      .get(`${urlAPI}/kehadiran/${state.idKehadiran}`)
      .then((response) => {
        const data = response.data[0];
        const barcodeData = data.barcode;

        console.log(barcodeData, "data Bar");
        console.log(barCode);
        if (barcodeData != `0${barCode}`) {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Barcode yang dimasukkan tidak sesuai",
          }).then((result) => {
            if (result.value) {
              setState((prevState) => ({ ...prevState, isProses: false }));
            }
          });
        } else {
          const fotoKeluar = webcamRef.current.getScreenshot();
          const waktuSekarang = new Date(); //jam pulang
          const jamKeluar = getCurrentTime();
          console.log(jamKeluar, "Jam Keluar");
          axios
            .patch(`${urlAPI}/kehadiran/${idKehadiran}`, {
              foto_keluar: fotoKeluar,
              jam_masuk: state.jamMasuk,
              jam_keluar: state.jamKeluarShift,
              isIzin: state.isIzin,
              ket:
                state.ket == null
                  ? "Pulang : " + state.keterangan
                  : state.ket + "Pulang : " + state.keterangan,
            })
            .then((response) => {
              Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Berhasil melakukan presensi pulang",
              }).then((result) => {
                if (result.value) {
                  navigate("/kehadiran"); // Pindah ke halaman utama atau rute lain
                }
              });
            })
            .catch((error) => {
              setState((prevState) => ({ ...prevState, isProses: false }));

              Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menyimpan data",
              });
            });
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err,
        });
        console.error(err);
      });
  };

  const handleIzin = async (alasan, jenis, isFile, image) => {
    try {
      const jamPulang = getCurrentTime();
      const durasi = hitungSelisihMenit(jamPulang, state.jamKeluarShift);

      // Membuat FormData untuk mengirim data dan file
      const formData = new FormData();
      formData.append("idJadwal", state.idJadwal);
      formData.append("idDetailJadwal", state.idDetailJadwal);
      formData.append("idShift", state.idShift);
      formData.append("waktuMulai", jamPulang);
      formData.append("waktuSelesai", state.jamKeluarShift);
      formData.append("tanggal", state.tanggal);
      formData.append("durasi", durasi);
      formData.append("jenisizin", jenis.value);
      formData.append("alasan", alasan);
      formData.append("barcode", state.barCode);

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
      const text = `${state.namaDokter} ${jenis.value} Selama ${durasi} Menit, Dengan Alasan ${alasan}`;
      await sendMessage(text);
      await handleSubmit();
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
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours(); // Mengambil jam saat ini
    const minutes = now.getMinutes(); // Mengambil menit saat ini

    // Menambahkan leading zero jika kurang dari 10
    const formattedHours = hours < 10 ? "0" + hours : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };
  function hitungSelisihMenit(jam1, jam2) {
    console.log(jam1, jam2);
    // Format input jam: "HH:MM" (contoh: "14:30", "16:45")

    // Memecah jam dan menit dari kedua input
    const [hours1, minutes1] = jam1.split(":").map(Number);
    const [hours2, minutes2] = jam2.split(":").map(Number);

    // Mengonversi jam menjadi total menit
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // Menghitung selisih waktu dalam menit
    const selisihMenit = totalMinutes2 - totalMinutes1;

    return Math.abs(selisihMenit);
  }
  return (
    <div>
      <div className="card-presensi">
        <ModalAddIzin
          open={state.isIzin}
          setOpen={() => {
            setState({ ...state, isIzin: !state.isIzin });
          }}
          nama={state.namaDokter}
          isPulang={true}
          handleAdd={handleIzin}
          jamPulang={state.jamKeluarShift}
        />
        <div className="rounded-lg bg-white shadow-lg">
          <div className="grid grid-cols-2">
            <div className="flex p-10 h-[70vh] justify-center items-center">
              <Webcam
                className="rounded-3xl"
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="title">Presensi pulang</h4>
              <p className="text-xl">
                Nama Dokter:{" "}
                <span className="font-bold">{state.namaDokter}</span>
              </p>
              <p className="text-xl mb-5">
                Shift: <span className="font-bold">{state.namaShift}</span>
              </p>
              <form onSubmit={handlePulang}>
                <div className="flex flex-col gap-4 w-[60%]">
                  <input
                    type="number"
                    onChange={(e) =>
                      setState({ ...state, barCode: e.target.value })
                    }
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Keterangan"
                    className={`mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-blue-500 `}
                    value={state.keterangan}
                    onChange={(e) => {
                      setState({ ...state, keterangan: e.target.value });
                    }}
                  />
                  <div className="flex flex-row gap-4">
                    <Link
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                      to={"/kehadiran"}
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                      disabled={state.isProses}
                    >
                      Pulang
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pulang;
