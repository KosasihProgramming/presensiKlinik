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

function App() {
  const isLoggedIn = sessionStorage.getItem("user");
  const [isMobile, setIsMobile] = useState(false);
  const [isIzin, setIsizin] = useState(false);
  useEffect(() => {
    // Deteksi apakah user menggunakan perangkat mobile
    const checkIsMobile = () => {
      const mobileCheck =
        /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 1024;
      setIsMobile(mobileCheck);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return (
    <div className="bg-gray-200 pb-10">
      <Router>
        <Navigation
          openIzin={() => {
            setIsizin(!isIzin);
          }}
        />

        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/" Component={Home} />
              <Route path="/shift" Component={Shift} />
              <Route path="/jadwal-kehadiran" Component={JadwalKehadiran} />
              <Route
                path="/jadwal/detail-jadwal/:idJadwal"
                Component={DetailJadwal}
              />
              <Route path="/kehadiran" Component={Kehadiran} />
              <Route path="/presensi" Component={Absen} />
              <Route path="/pulang/:id_kehadiran" Component={Pulang} />
              <Route
                path="/rekap-kehadiran-dokter"
                Component={RekapKehadiranDokter}
              />
              <Route
                path="/rekap-kehadiran-dokter-gigi"
                Component={RekapKehadiranDokterGigi}
              />
              <Route
                path="/rekap-kehadiran-perawat"
                Component={RekapKehadiranPerawat}
              />
              <Route
                path="/rekap-kehadiran-perawat-gigi"
                Component={RekapKehadiranPerawatGigi}
              />
              <Route
                path="/rekap-kehadiran-farmasi"
                Component={RekapKehadiranFarmasi}
              />
              <Route
                path="/rekap-kehadiran-pegawai-kantor"
                Component={RekapKehadiranPegawai}
              />
              {/* Penggajian */}
              <Route path="/rekap-gaji" Component={RekapGajiPerShift} />
              <Route path="/rekap-gaji-dokter" Component={RekapGajiDokter} />
              <Route
                path="/rekap-shift-perawat-gigi"
                Component={RekapGajiShiftPerawat}
              />
              <Route
                path="/rekap-periode-perawat-gigi"
                Component={RekapGajiPeriodePerawat}
              />
              <Route
                path="/rekap-shift-perawat-umum"
                Component={RekapShiftPerawatUmum}
              />
              <Route path="/data-pegawai" Component={DataPegawai} />
            </>
          ) : (
            <>
              <Route path="/login" Component={Login} />
              <Route path="/kehadiran" Component={Kehadiran} />
              <Route path="/presensi" Component={Absen} />
              <Route path="/pulang/:id_kehadiran" Component={Pulang} />
              {sessionStorage.getItem("isSuccess") && (
                <Route path="/success" Component={SendedForm} />
              )}
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
