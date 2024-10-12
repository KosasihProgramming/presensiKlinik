import axios from "axios";
import React, { useState, useEffect } from "react";
import { urlAPI } from "../config/global";
import Swal from "sweetalert2";

const SetDevice = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [storedText, setStoredText] = useState("");
  const [cabang, setCabang] = useState("");
  const [name, setName] = useState("");

  // Fungsi untuk encode kalimat menjadi base64
  const encodeText = (text) => {
    return btoa(text); // btoa() digunakan untuk melakukan base64 encoding
  };

  // Fungsi untuk decode base64 kembali ke kalimat
  const decodeText = (encoded) => {
    try {
      return atob(encoded); // atob() digunakan untuk melakukan base64 decoding
    } catch (error) {
      return "Error: Tidak dapat mendecode teks!";
    }
  };

  // Fungsi untuk menyimpan teks yang di-encode ke localStorage
  const saveToLocalStorage = () => {
    const encoded = encodeText(`${name}${cabang}`);
    insertData();
    setEncodedText(encoded);
    localStorage.setItem("device", encoded);
    alert("Teks berhasil di-encode dan disimpan ke LocalStorage!");
  };

  // Fungsi untuk memuat data dari LocalStorage saat pertama kali komponen di-render
  useEffect(() => {
    const storedEncodedText = localStorage.getItem("device");
    if (storedEncodedText) {
      setEncodedText(storedEncodedText);
      setStoredText(decodeText(storedEncodedText)); // Decode teks dari localStorage
    }
  }, []);

  const insertData = () => {
    const postData = {
      nama: name,
      cabang: cabang,
      encoded: encodedText,
    };

    axios
      .post(urlAPI + "/device/add/", postData)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan",
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };
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
  return (
    <div style={{ padding: "20px" }}>
      <h1>Konversi Kalimat dengan Base64</h1>
      <textarea
        rows="4"
        cols="50"
        placeholder="Masukkan Nama di sini..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <select
        id="cabangSelect"
        value={cabang}
        onChange={(e) => {
          setCabang(e.target.value);
        }}
      >
        <option value="">--Pilih Cabang--</option>
        {optionCabang.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
      <button onClick={saveToLocalStorage} style={{ marginTop: "10px" }}>
        Simpan ke LocalStorage
      </button>

      {encodedText && (
        <div style={{ marginTop: "20px" }}>
          <h3>Kalimat yang di-encode (Base64):</h3>
          <p>{encodedText}</p>
        </div>
      )}

      {storedText && (
        <div style={{ marginTop: "20px" }}>
          <h3>Kalimat yang didecode dari LocalStorage:</h3>
          <p>{storedText}</p>
        </div>
      )}
    </div>
  );
};

export default SetDevice;
