import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Shift from "./Shift";
import Navigation from "../components/Navigation";
import JadwalKehadiran from "./Jadwal";
import DetailJadwal from "./DetailJadwal";
import Kehadiran from "./Kehadiran";
import Absen from "./Absen";
import Pulang from "./Pulang";
import RekapGajiPerShift from "./RekapGajiPerShift";
import RekapGajiDokter from "./RekapGajiDokter";
import RekapGajiShiftPerawat from "./RekapGajiShiftPerawat";
import RekapGajiPeriodePerawat from "./RekapGajiPeriodePerawat";
import RekapShiftPerawatUmum from "./RekapShiftPerawatUmum";

class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="bg-gray-200 pb-10">
        <Router>
          <Navigation />
          <Routes>
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
          </Routes>
        </Router>
      </div>
    );
  }
}

export default Dashboard;
