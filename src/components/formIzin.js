import React, { useState } from "react";
import "dayjs/locale/id";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { DatePicker, Space, TimePicker } from "antd";
import { MdOutlineSave } from "react-icons/md";

import { FiSearch } from "react-icons/fi";

import Select from "react-select";

import { Bounce, toast } from "react-toastify";
import axios from "axios";
import { urlAPI } from "../config/global";
import Swal from "sweetalert2";
const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY", "DD-MM-YYYY", "DD-MM-YY"];
const format = "HH:mm";

function FormAddIzin(props) {
  const [open, setOpen] = useState(true);
  const [judul, setJudul] = useState("");
  const [barcode, setBarcode] = useState(0);
  const [files, setFiles] = useState([]);
  const [alasan, setAlasan] = useState("");
  const [nama, setNama] = useState(props.nama || "");
  const [mulai, setMulai] = useState(dayjs().locale("id").format("HH:mm"));
  const [akhir, setAkhir] = useState(dayjs().locale("id").format("HH:mm"));
  const [jenisIzin, setJenisIzin] = useState({});
  const [jadwal, setJadwal] = useState({});
  const [image, setImage] = useState(null);
  const [search, setIsSearch] = useState(props.isPulang ? true : false);
  const [isFile, setIsFile] = useState(false);
  const [preview, setPreview] = useState(null); // State untuk pratinjau gambar

  const handleChangeTime = (name, date) => {
    const dayjsDate = dayjs(date);
    if (!dayjsDate.isValid()) {
      return;
    }
    if (name == "Mulai") {
      const formattedDate = dayjsDate.format("HH:mm");
      setMulai(formattedDate);
    } else {
      const formattedDate = dayjsDate.format("HH:mm");
      setAkhir(formattedDate);
    }
  };
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setIsFile(true);
    const file = e.target.files[0];
    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);
  };
  const handleAdd = (e) => {
    e.preventDefault();
    if (!props.isPulang) {
      if (jadwal.length > 0) {
        props.addData(
          alasan,
          jenisIzin,
          mulai,
          akhir,
          jadwal,
          barcode,
          isFile,
          image,
          nama
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "Jadwal hari ini tidak Ditemukan",
          showConfirmButton: false,
          timer: 2000, // Durasi 3 detik
        });
      }
    } else {
      props.addData(
        alasan,
        jenisIzin,
        mulai,
        akhir,
        jadwal,
        barcode,
        isFile,
        image,
        nama
      );
    }

    const data = {
      alasan,
      jenisIzin,
      mulai,
      akhir,
      jadwal,
      image,
    };
    console.log(data);
  };
  const handleSearch = () => {
    if (barcode == 0) {
      Swal.fire({
        icon: "warning",
        title: "Isi barcode terlebih dahulu",
        showConfirmButton: false,
        timer: 3000, // Durasi 3 detik
      });
    } else {
      axios
        .get(`${urlAPI}/barcode/jadwal-izin/${barcode}`)
        .then((response) => {
          console.log(barcode);
          console.log(response.data, "data");

          if (
            response.data.jadwal.length > 0 &&
            response.data.barcode.length > 0
          ) {
            Swal.fire({
              icon: "success",
              title: "Jadwal ditemukan",
              showConfirmButton: false,
              timer: 2000, // Durasi 3 detik
            });
            setJadwal(response.data.jadwal);
            setNama(response.data.barcode[0].nama);
            setIsSearch(true);
          } else if (
            response.data.jadwal.length == 0 &&
            response.data.barcode.length == 0
          ) {
            Swal.fire({
              icon: "error",
              title: "Barcode tidak ditemukan",
              showConfirmButton: false,
              timer: 2000, // Durasi 3 detik
            });
          } else if (
            response.data.jadwal.length == 0 &&
            response.data.barcode.length > 0
          ) {
            Swal.fire({
              icon: "warning",
              title: "Tidak ada jadwal hari ini",
              showConfirmButton: false,
              timer: 2000, // Durasi 3 detik
            });
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Tidak dapat menemukan barcode",
            showConfirmButton: false,
            timer: 3000, // Durasi 3 detik
          });
        });
    }
  };

  const optionIzin = [
    { value: "Izin", label: "Izin" },
    { value: "Sakit", label: "Sakit" },
  ];
  function getFormattedDate() {
    const daysOfWeek = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const today = new Date();
    const dayName = daysOfWeek[today.getDay()];
    const day = today.getDate();
    const monthName = months[today.getMonth()];

    return `Jadwal ${dayName} ${day} ${monthName}`;
  }
  function getTimeFromDatetime(datetime) {
    // Memisahkan tanggal dan waktu
    const timePart = datetime.split(" ")[1]; // Mendapatkan bagian waktu "14:21:39"

    // Memisahkan jam dan menit dari waktu
    const [hours, minutes] = timePart.split(":"); // [14, 21]

    // Mengembalikan format HH:mm
    return `${hours}:${minutes}`;
  }

  return (
    <div>
      <div
        className={`p-6 duration-500 flex w-full flex-col justify-between items-start px-2 mt-5 bg-white rounded-xl shadow-md `}
      >
        <div
          className={`flex w-full flex-col justify-start items-start rounded-xl mb-2  `}
        >
          <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
            <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
              <div className="w-full flex p-2 bg-white   border-blue-500 border rounded-xl justify-center font-medium items-center h-[3rem] text-base">
                {getFormattedDate()}
              </div>
            </div>
          </div>
          {!props.isPulang && (
            <>
              <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
                <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
                  <h4 className="font-semibold text-sm">Barcode Pegawai</h4>
                  <div className="w-full flex justify-between items-center gap-6">
                    <input
                      type="number"
                      className="w-full flex p-2 bg-white font-normal border-blue-500 border rounded-xl justify-start items-center h-[3rem] text-sm"
                      onChange={(e) => {
                        setBarcode(e.target.value);
                      }}
                      required
                    />
                    <button
                      className="px-4 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:bg-blue-600"
                      onClick={handleSearch}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
            <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
              <h4 className="font-semibold text-sm">Nama Pegawai</h4>
              <div className="w-full flex justify-between items-center gap-6">
                <input
                  type="text"
                  className="w-full flex p-2 bg-white font-normal border-blue-500 border rounded-xl justify-start items-center h-[3rem] text-sm"
                  value={nama}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
            <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 z-[9999] ">
              <h4 className="font-semibold text-sm">Jenis Izin</h4>
              <Select
                onChange={(selectedOption) => {
                  if (search == false) {
                    Swal.fire({
                      icon: "warning",
                      title: "Cari Jadwal Terlebih Dahulu!",
                      showConfirmButton: false,
                      timer: 2000, // Durasi 3 detik
                    });
                  } else {
                    setJenisIzin(selectedOption);
                  }
                }}
                inputId="input"
                className="w-full p-1 border border-blue-600 rounded-xl z-[9999]"
                value={jenisIzin}
                placeholder="Pilih Jenis Kelamin..."
                options={optionIzin}
                isSearchable={true}
              />
            </div>
            <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
              <h4 className="font-semibold text-sm">Alasan Keperluan Izin</h4>
              <input
                type="text"
                className="w-full flex p-2 bg-white font-normal border-blue-500 border rounded-xl justify-start items-center h-[3rem] text-sm"
                value={alasan}
                onChange={(e) => {
                  if (search == false) {
                    Swal.fire({
                      icon: "warning",
                      title: "Cari Jadwal Terlebih Dahulu!",
                      showConfirmButton: false,
                      timer: 2000, // Durasi 3 detik
                    });
                  } else {
                    setAlasan(e.target.value);
                  }
                }}
              />
            </div>
          </div>
          {!props.isPulang && (
            <>
              <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
                <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
                  <h4 className="font-semibold text-sm">Jam Mulai</h4>

                  <div className="w-[100%] flex z-[99] bg-white justify-start gap-3 items-center  rounded-xl">
                    <TimePicker
                      value={dayjs(mulai, "HH:mm")}
                      format={format}
                      onChange={(a) => {
                        if (search == false) {
                          Swal.fire({
                            icon: "warning",
                            title: "Cari Jadwal Terlebih Dahulu!",
                            showConfirmButton: false,
                            timer: 2000, // Durasi 3 detik
                          });
                        } else {
                          handleChangeTime("Mulai", a);
                        }
                      }}
                      className="bg-white border w-[19rem] rounded-xl border-blue-500  p-3 hover:text-blue-800 active:text-blue-800"
                    />
                  </div>
                </div>
                <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
                  <h4 className="font-semibold text-sm">Jam Selesai</h4>

                  <div className="w-[100%] flex z-[99] bg-white justify-start gap-3 items-center  rounded-xl">
                    <TimePicker
                      value={dayjs(akhir, "HH:mm")}
                      format={format}
                      onChange={(a) => {
                        if (search == false) {
                          Swal.fire({
                            icon: "warning",
                            title: "Cari Jadwal Terlebih Dahulu!",
                            showConfirmButton: false,
                            timer: 2000, // Durasi 3 detik
                          });
                        } else {
                          handleChangeTime("Stop", a);
                        }
                      }}
                      className="bg-white border w-[19rem] rounded-xl border-blue-500  p-3 hover:text-blue-800 active:text-blue-800"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          {props.isPulang && (
            <>
              <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
                <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
                  <h4 className="font-semibold text-sm">Jam Mulai</h4>

                  <div className="w-[100%] flex z-[99] bg-white justify-start gap-3 items-center  rounded-xl">
                    <TimePicker
                      value={dayjs(mulai, "HH:mm")}
                      format={format}
                      readOnly
                      className="bg-white border w-[19rem] rounded-xl border-blue-500  p-3 hover:text-blue-800 active:text-blue-800"
                    />
                  </div>
                </div>
                <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
                  <h4 className="font-semibold text-sm">Jam Selesai</h4>

                  <div className="w-[100%] flex z-[99] bg-white justify-start gap-3 items-center  rounded-xl">
                    <TimePicker
                      value={dayjs(props.jamPulang, "HH:mm")}
                      format={format}
                      readOnly
                      className="bg-white border w-[19rem] rounded-xl border-blue-500  p-3 hover:text-blue-800 active:text-blue-800"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="w-[100%] gap-2 flex  justify-between items-center p-2 gap-4 ">
            <div className="w-[100%] gap-2 flex flex-col justify-start items-start p-2 gap-4 ">
              <h4 className="font-semibold text-sm">Bukti Gambar (jika ada)</h4>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full flex p-2 bg-white font-normal border-blue-500 border rounded-xl justify-start items-center h-[3rem] text-sm"
              />
            </div>
            <div className="w-[100%] gap-2 flex flex-wrap justify-start items-start p-2 gap-4 ">
              <div className="w-[150px] h-[150px] p-2">
                <img
                  src={preview}
                  className="w-full h-full object-cover rounded-xl border border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          class="flex justify-center text-sm hover:bg-white border duration-150 hover:border-blue-500 hover:text-blue-600 items-center p-3 px-10 ml-4 bg-blue-600 text-white font-medium rounded-xl gap-4"
          onClick={handleAdd}
        >
          Ajukan
          <MdOutlineSave className="text-white text-xl" />
        </button>
      </div>
    </div>
  );
}

export default FormAddIzin;
