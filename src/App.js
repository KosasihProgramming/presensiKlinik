import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Shift from "./pages/Shift";
import Navigation from "./components/Navigation";
import JadwalKehadiran from "./pages/Jadwal";
import DetailJadwal from "./pages/DetailJadwal";
import Kehadiran from "./pages/Kehadiran";
import Absen from "./pages/Absen";
import Pulang from "./pages/Pulang";
import RekapGajiPerShift from "./pages/RekapGajiPerShift";
import RekapGajiDokter from "./pages/RekapGajiDokter";
import RekapGajiShiftPerawat from "./pages/RekapGajiShiftPerawat";
import RekapGajiPeriodePerawat from "./pages/RekapGajiPeriodePerawat";
import RekapShiftPerawatUmum from "./pages/RekapShiftPerawatUmum";
import Login from "./pages/Login";
import RekapKehadiranDokter from "./pages/rekapKehadiran/DokterRekap";
import RekapKehadiranDokterGigi from "./pages/rekapKehadiran/RekapDokterGigi";
import RekapKehadiranPerawat from "./pages/rekapKehadiran/RekapPerawat";
import RekapKehadiranPerawatGigi from "./pages/rekapKehadiran/RekapPerawatGigi";
import RekapKehadiranFarmasi from "./pages/rekapKehadiran/RekapFarmasi";
import RekapKehadiranPegawai from "./pages/rekapKehadiran/RekapPegawaiKantor";
import DataPegawai from "./pages/dataPegawai";
import ModalAddIzin from "./components/modalIzin";
import IzinPage from "./pages/izinPage";
import SendedForm from "./components/succes";
import RekapKehadiranAnalis from "./pages/rekapKehadiran/RekapAnalis";
import RekapKehadiranApoteker from "./pages/rekapKehadiran/RekapApoteker";
import LocalStorage from "./pages/localstorage";
import axios from "axios";
import { urlAPI } from "./config/global";
import NoAkses from "./pages/noAkses";
import SetDevice from "./pages/localstorage";
import JadwalKehadiranMobile from "./pages/mobile/Jadwal";
import DetailJadwalMobile from "./pages/mobile/DetailJadwal";
import LoginMobile from "./pages/mobile/Login";
import TodayJadwal from "./pages/TodayJadwal";
import Navbar from "./components/navbar";
import TodayJadwalMobile from "./pages/mobile/JadwalToday";
import RekapKehadiranTerapis from "./pages/rekapKehadiran/RekapTerapis";

function App() {
  const isLoggedIn = sessionStorage.getItem("user");
  const [isMobile, setIsMobile] = useState(false);
  const [isIzin, setIsizin] = useState(false);
  const [isAkses, setIsAkses] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobileCheck =
        /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 1024;
      setIsMobile(mobileCheck);
    };
    checkDevice();
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const checkDevice = () => {
    const storedEncodedText = localStorage.getItem("device");

    if (storedEncodedText) {
      const postData = {
        encode: storedEncodedText,
      };
      axios
        .post(urlAPI + "/device/", postData)
        .then((response) => {
          console.log(response);
          if (response.data.length > 0) {
            setIsAkses(true);
          }
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  };

  return (
    <div className="bg-gray-200 pb-10">
      <Router>
        {isMobile ? (
          <>
            {isLoggedIn ? (
              <>
                <Routes>
                  <Route
                    path="*"
                    element={<Navigate to="/jadwal-kehadiran" />}
                  />
                  <Route path="/today-jadwal" element={<TodayJadwal />} />
                  <Route
                    path="/jadwal-kehadiran"
                    element={<JadwalKehadiranMobile />}
                  />
                  <Route
                    path="/detail-jadwal-mobile/:idJadwal"
                    element={<DetailJadwalMobile />}
                  />
                  <Route
                    path="/today-jadwal-mobile"
                    element={<TodayJadwalMobile />}
                  />
                </Routes>
              </>
            ) : (
              <>
                <Routes>
                  <Route
                    path="/today-jadwal-mobile"
                    element={<TodayJadwalMobile />}
                  />
                  <Route path="/" Component={LoginMobile} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </>
            )}
          </>
        ) : (
          <>
            {isAkses ? (
              <>
                <Navbar />
                <Routes>
                  {isLoggedIn ? (
                    <>
                      {/* <Route path="/" element={<Home />} /> */}
                      <Route path="/shift" element={<Shift />} />
                      <Route path="/today-jadwal" element={<TodayJadwal />} />
                      <Route
                        path="/today-jadwal-mobile"
                        element={<TodayJadwalMobile />}
                      />

                      <Route
                        path="/jadwal-kehadiran"
                        element={<JadwalKehadiran />}
                      />
                      <Route
                        path="/jadwal/detail-jadwal/:idJadwal"
                        element={<DetailJadwal />}
                      />
                      <Route path="/kehadiran" element={<Kehadiran />} />
                      <Route path="/" element={<Absen />} />
                      <Route path="/presensi" element={<Absen />} />
                      <Route
                        path="/pulang/:id_kehadiran"
                        element={<Pulang />}
                      />
                      <Route
                        path="/rekap-kehadiran-dokter"
                        element={<RekapKehadiranDokter />}
                      />
                      <Route
                        path="/rekap-kehadiran-terapis"
                        element={<RekapKehadiranTerapis />}
                      />
                      <Route
                        path="/rekap-kehadiran-dokter-gigi"
                        element={<RekapKehadiranDokterGigi />}
                      />
                      <Route
                        path="/rekap-kehadiran-perawat"
                        element={<RekapKehadiranPerawat />}
                      />
                      <Route
                        path="/rekap-kehadiran-apoteker"
                        element={<RekapKehadiranApoteker />}
                      />
                      <Route
                        path="/rekap-kehadiran-analis"
                        element={<RekapKehadiranAnalis />}
                      />
                      <Route
                        path="/rekap-kehadiran-perawat-gigi"
                        element={<RekapKehadiranPerawatGigi />}
                      />
                      <Route
                        path="/rekap-kehadiran-farmasi"
                        element={<RekapKehadiranFarmasi />}
                      />
                      <Route
                        path="/rekap-kehadiran-cs"
                        element={<RekapKehadiranPegawai />}
                      />
                      <Route
                        path="/rekap-gaji"
                        element={<RekapGajiPerShift />}
                      />
                      <Route
                        path="/rekap-gaji-dokter"
                        element={<RekapGajiDokter />}
                      />
                      <Route
                        path="/rekap-shift-perawat-gigi"
                        element={<RekapGajiShiftPerawat />}
                      />
                      <Route
                        path="/rekap-periode-perawat-gigi"
                        element={<RekapGajiPeriodePerawat />}
                      />
                      <Route
                        path="/rekap-shift-perawat-umum"
                        element={<RekapShiftPerawatUmum />}
                      />
                      <Route path="/data-pegawai" element={<DataPegawai />} />
                    </>
                  ) : (
                    <>
                      <Route path="/today-jadwal" element={<TodayJadwal />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/kehadiran" element={<Kehadiran />} />
                      <Route
                        path="/jadwal-kehadiran"
                        element={<JadwalKehadiranMobile />}
                      />
                      <Route
                        path="/today-jadwal-mobile"
                        element={<TodayJadwalMobile />}
                      />
                      <Route
                        path="/detail-jadwal-mobile/:idJadwal"
                        element={<DetailJadwalMobile />}
                      />
                      <Route path="/" element={<Absen />} />
                      <Route path="/presensi" element={<Absen />} />
                      <Route
                        path="/pulang/:id_kehadiran"
                        element={<Pulang />}
                      />
                      <Route
                        path="/rekap-kehadiran-dokter"
                        element={<RekapKehadiranDokter />}
                      />
                      <Route
                        path="/rekap-kehadiran-dokter-gigi"
                        element={<RekapKehadiranDokterGigi />}
                      />
                      <Route
                        path="/rekap-kehadiran-terapis"
                        element={<RekapKehadiranTerapis />}
                      />
                      <Route
                        path="/rekap-kehadiran-perawat"
                        element={<RekapKehadiranPerawat />}
                      />
                      <Route
                        path="/rekap-kehadiran-apoteker"
                        element={<RekapKehadiranApoteker />}
                      />
                      <Route
                        path="/rekap-kehadiran-analis"
                        element={<RekapKehadiranAnalis />}
                      />
                      <Route
                        path="/rekap-kehadiran-perawat-gigi"
                        element={<RekapKehadiranPerawatGigi />}
                      />
                      <Route
                        path="/rekap-kehadiran-farmasi"
                        element={<RekapKehadiranFarmasi />}
                      />
                      <Route
                        path="/rekap-kehadiran-cs"
                        element={<RekapKehadiranPegawai />}
                      />
                      <Route
                        path="/rekap-gaji"
                        element={<RekapGajiPerShift />}
                      />
                      <Route
                        path="/rekap-gaji-dokter"
                        element={<RekapGajiDokter />}
                      />
                      <Route
                        path="/rekap-shift-perawat-gigi"
                        element={<RekapGajiShiftPerawat />}
                      />
                      <Route
                        path="/rekap-periode-perawat-gigi"
                        element={<RekapGajiPeriodePerawat />}
                      />
                      <Route
                        path="/rekap-shift-perawat-umum"
                        element={<RekapShiftPerawatUmum />}
                      />
                      {sessionStorage.getItem("isSuccess") && (
                        <Route path="/success" element={<SendedForm />} />
                      )}
                    </>
                  )}
                </Routes>
              </>
            ) : (
              <>
                <Routes>
                  <Route path="/" element={<NoAkses />} />

                  <Route
                    path="/device-access-kosasih/2024"
                    element={<SetDevice />}
                  />
                </Routes>
              </>
            )}
          </>
        )}
      </Router>
    </div>
  );
}

export default App;
