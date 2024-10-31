import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Swal from "sweetalert2";

const loggedInNavItems = [
  { name: "Kehadiran", href: "/kehadiran" },
  { name: "Absen", href: "/presensi" },
  { name: "Shift", href: "/shift" },
  { name: "Jadwal", href: "/jadwal-kehadiran" },
  { name: "Data Pegawai", href: "/data-pegawai" },
];

const notLoggedInNavItems = [
  { name: "Kehadiran", href: "/kehadiran" },
  { name: "Absen", href: "/presensi" },
];

const masterData = [
  { name: "Rekap Kehadiran Dokter", href: "/rekap-kehadiran-dokter" },
  // { name: "Rekap Kehadiran Dokter Gigi", href: "/rekap-kehadiran-dokter-gigi" },
  { name: "Rekap Kehadiran Perawat", href: "/rekap-kehadiran-perawat" },
  {
    name: "Rekap Kehadiran Perawat Gigi",
    href: "/rekap-kehadiran-perawat-gigi",
  },
  { name: "Rekap Kehadiran Farmasi", href: "/rekap-kehadiran-farmasi" },
  { name: "Rekap Kehadiran Apoteker", href: "/rekap-kehadiran-apoteker" },
  { name: "Rekap Kehadiran Analis", href: "/rekap-kehadiran-analis" },
  { name: "Rekap Kehadiran CS", href: "/rekap-kehadiran-cs" },
  { name: "Rekap Kehadiran GTS", href: "/rekap-kehadiran-terapis" },
];
const Navbar = () => {
  const isLoggedIn = sessionStorage.getItem("user");
  const [isShow, setIsShow] = useState(false);
  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin keluar?",
      showCancelButton: true,
      confirmButtonText: "Keluar",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("user");
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Berhasil logout",
          showConfirmButton: false,
          timer: 1500,
          didClose: () => {
            window.location.href = "/";
          },
        });
      }
    });
  };

  const handleBlur = () => {
    setIsShow(false);
  };

  return (
    <nav className="bg-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-i">
              Presensi Klinik Kosasih
            </div>
            <div className=" md:block ml-10">
              <div className="flex space-x-4">
                {/* Dynamic Nav Items based on login status */}
                {(isLoggedIn ? loggedInNavItems : notLoggedInNavItems).map(
                  (item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className="hover:bg-teal-50 duration-300 px-3 py-2 rounded-md text-sm font-medium hover:text-teal-600"
                    >
                      {item.name}
                    </Link>
                  )
                )}

                <div className="relative group">
                  <button
                    onClick={() => {
                      setIsShow(!isShow);
                    }}
                    className="hover:bg-teal-50 duration-300 px-3 py-2 rounded-md text-sm font-medium flex items-center hover:text-teal-600"
                  >
                    Rekap Kehadiran
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-[9999999] opacity-0 ${
                      isShow ? "opacity-100 scale-100" : "scale-95 hidden"
                    } transition-all duration-300 transform `}
                  >
                    {masterData.map((item) => (
                      <Link
                        onBlur={handleBlur}
                        onClick={handleBlur}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Logout Button if logged in */}
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="hover:bg-teal-100 hover:text-teal-700 duration-300 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="hover:bg-teal-50 duration-300 px-3 py-2 rounded-md text-sm font-medium hover:text-teal-600"
                    >
                      Login Admin
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
