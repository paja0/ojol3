// ======================================================
// KONFIGURASI
// ======================================================

const panels = [
  "servicePanel",
  "locationPanel",
  "tripPanel",
  "confirmPanel"
];

let selectedService = "Ojek";
let selectedBase = 10000;

// Koordinat GPS lokasi penjemputan
let pickupLocation = null;

// Data lokasi tujuan dari Google Maps
let destinationLocation = null;
let destinationPlace = null;

// Objek Google Maps
let map = null;
let directionsService = null;
let directionsRenderer = null;
let destinationAutocomplete = null;


// ======================================================
// PEMILIHAN LAYANAN
// ======================================================

const services = document.querySelectorAll(".service");

services.forEach(btn => {

  btn.addEventListener("click", () => {

    services.forEach(x =>
      x.classList.remove("selected")
    );

    btn.classList.add("selected");

    selectedService = btn.dataset.service;
    selectedBase = Number(btn.dataset.base);

  });

});


// ======================================================
// PROGRESS & PANEL
// ======================================================

const progressSteps =
  document.querySelectorAll(".step");

function showPanel(id, progress) {

  panels.forEach(panel => {

    const element =
      document.getElementById(panel);

    if (element) {
      element.classList.add("hidden");
    }

  });

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.remove("hidden");
  }

  progressSteps.forEach((step, index) => {

    step.classList.toggle(
      "active",
      index < progress
    );

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ======================================================
// TOMBOL LANJUTKAN
// ======================================================

document.getElementById("startBtn").onclick = () => {

  showPanel(
    "locationPanel",
    2
  );

};


// ======================================================
// TOMBOL KEMBALI
// ======================================================

document.querySelectorAll(".back").forEach(btn => {

  btn.addEventListener("click", () => {

    const target =
      btn.dataset.back;

    showPanel(
      target,
      target === "servicePanel"
        ? 1
        : 2
    );

  });

});


// ======================================================
// TOMBOL CLEAR
// ======================================================

document.querySelectorAll(".clear").forEach(btn => {

  btn.addEventListener("click", () => {

    const targetId =
      btn.dataset.clear;

    if (targetId) {

      const input =
        document.getElementById(targetId);

      if (input) {
        input.value = "";
      }

    }

    // Untuk tombol clear tujuan versi baru
    if (btn.id === "clearDestination") {

      const destination =
        document.getElementById("destination");

      if (destination) {
        destination.value = "";
      }

      destinationLocation = null;
      destinationPlace = null;

    }

  });

});


// ======================================================
// GOOGLE MAPS
// ======================================================

function initGoogleMaps() {

  console.log(
    "Google Maps berhasil dimuat."
  );

  directionsService =
    new google.maps.DirectionsService();

  directionsRenderer =
    new google.maps.DirectionsRenderer({
      suppressMarkers: false
    });


  // Posisi awal sementara
  const defaultLocation = {
    lat: 4.1448,
    lng: 96.1285
  };


  // Membuat map jika elemen #map tersedia
  const mapElement =
    document.getElementById("map");

  if (mapElement) {

    map = new google.maps.Map(
      mapElement,
      {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      }
    );

    directionsRenderer.setMap(map);

  }


  // ==================================================
  // GOOGLE PLACES AUTOCOMPLETE
  // ==================================================

  const destinationInput =
    document.getElementById("destination");

  if (!destinationInput) {
    console.error(
      "Input destination tidak ditemukan."
    );

    return;
  }


  destinationAutocomplete =
    new google.maps.places.Autocomplete(
      destinationInput,
      {
        fields: [
          "place_id",
          "geometry",
          "formatted_address",
          "name"
        ],

        // Membatasi hasil ke Indonesia
        componentRestrictions: {
          country: "id"
        }
      }
    );


  // Ketika pengguna memilih hasil Google Maps
  destinationAutocomplete.addListener(
    "place_changed",
    () => {

      const place =
        destinationAutocomplete.getPlace();


      if (
        !place.geometry ||
        !place.geometry.location
      ) {

        destinationLocation = null;
        destinationPlace = null;

        alert(
          "Silakan pilih tujuan dari daftar Google Maps."
        );

        return;
      }


      destinationPlace = place;

      destinationLocation =
        place.geometry.location;


      console.log(
        "Tujuan dipilih:",
        place.name
      );

      console.log(
        "Alamat:",
        place.formatted_address
      );

      console.log(
        "Latitude:",
        place.geometry.location.lat()
      );

      console.log(
        "Longitude:",
        place.geometry.location.lng()
      );


      // Pindahkan map ke tujuan
      if (map) {

        map.panTo(
          destinationLocation
        );

        map.setZoom(16);

      }

    }
  );

}


// ======================================================
// GPS LOKASI PENJEMPUTAN
// ======================================================

const locationBtn =
  document.getElementById("locationBtn");

const locationStatus =
  document.getElementById("locationStatus");

const pickupInput =
  document.getElementById("pickup");


locationBtn.addEventListener(
  "click",
  () => {

    if (!navigator.geolocation) {

      locationStatus.textContent =
        "❌ Browser Anda tidak mendukung GPS.";

      return;
    }


    locationStatus.textContent =
      "📡 Sedang mengambil lokasi GPS...";

    locationBtn.disabled = true;


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        console.log(
          "Latitude:",
          latitude
        );

        console.log(
          "Longitude:",
          longitude
        );


        // Simpan koordinat pickup
        pickupLocation = {
          lat: latitude,
          lng: longitude
        };


        locationStatus.textContent =
          "✓ Lokasi GPS berhasil ditemukan";


        locationBtn.textContent =
          "✓ Lokasi Saya Digunakan";


        // ============================================
        // Reverse Geocoding Google Maps
        // ============================================

        try {

          if (
            typeof google !== "undefined" &&
            google.maps
          ) {

            const geocoder =
              new google.maps.Geocoder();


            const response =
              await geocoder.geocode({
                location: {
                  lat: latitude,
                  lng: longitude
                }
              });


            if (
              response.results &&
              response.results.length > 0
            ) {

              pickupInput.value =
                response.results[0]
                  .formatted_address;

            } else {

              pickupInput.value =
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            }

          }

        } catch (error) {

          console.error(
            "Reverse geocoding error:",
            error
          );


          pickupInput.value =
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          locationStatus.textContent =
            "✓ GPS ditemukan, tetapi alamat tidak tersedia.";

        }


        // Tampilkan posisi pickup pada map
        if (map) {

          map.setCenter({
            lat: latitude,
            lng: longitude
          });

          map.setZoom(16);


          new google.maps.Marker({
            position: {
              lat: latitude,
              lng: longitude
            },
            map: map,
            title: "Lokasi Penjemputan"
          });

        }


        locationBtn.disabled = false;

      },


      // ==============================================
      // ERROR GPS
      // ==============================================

      (error) => {

        locationBtn.disabled = false;


        switch (error.code) {

          case error.PERMISSION_DENIED:

            locationStatus.textContent =
              "❌ Akses lokasi ditolak. Silakan izinkan GPS.";

            break;


          case error.POSITION_UNAVAILABLE:

            locationStatus.textContent =
              "❌ Lokasi tidak tersedia.";

            break;


          case error.TIMEOUT:

            locationStatus.textContent =
              "❌ Waktu pengambilan lokasi habis.";

            break;


          default:

            locationStatus.textContent =
              "❌ Terjadi kesalahan saat mengambil lokasi.";

        }

      },


      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }

    );

  }
);


// ======================================================
// HITUNG RUTE DAN TARIF
// ======================================================

document.getElementById("routeBtn").onclick =
  () => {

    const pickup =
      pickupInput.value.trim();

    const destination =
      document.getElementById(
        "destination"
      ).value.trim();


    // ================================================
    // Validasi pickup
    // ================================================

    if (!pickupLocation) {

      alert(
        "Silakan gunakan lokasi GPS terlebih dahulu."
      );

      return;
    }


    // ================================================
    // Validasi tujuan
    // ================================================

    if (
      !destination ||
      !destinationLocation
    ) {

      alert(
        "Silakan ketik tujuan lalu pilih salah satu lokasi dari hasil Google Maps."
      );

      return;
    }


    // Pastikan DirectionsService tersedia
    if (!directionsService) {

      alert(
        "Google Maps belum siap. Silakan tunggu beberapa saat lalu coba lagi."
      );

      return;
    }


    // Ubah tombol menjadi loading
    const routeBtn =
      document.getElementById("routeBtn");

    routeBtn.disabled = true;

    routeBtn.innerHTML =
      "Menghitung perjalanan...";


    // ================================================
    // REQUEST RUTE
    // ================================================

    const request = {

      origin: pickupLocation,

      destination: destinationLocation,

      travelMode:
        google.maps.TravelMode.DRIVING,

      // Hindari rute tol jika tersedia
      avoidTolls: false,

      // Hindari jalan yang tidak diperlukan
      provideRouteAlternatives: false

    };


    directionsService.route(
      request,
      (result, status) => {

        routeBtn.disabled = false;

        routeBtn.innerHTML =
          'Lihat Perjalanan <span>→</span>';


        if (
          status !==
          google.maps.DirectionsStatus.OK
        ) {

          console.error(
            "Directions error:",
            status
          );


          alert(
            "Rute tidak dapat ditemukan. Silakan periksa kembali lokasi penjemputan dan tujuan."
          );

          return;
        }


        // ==========================================
        // Tampilkan rute di Google Maps
        // ==========================================

        if (directionsRenderer) {

          directionsRenderer.setDirections(
            result
          );

        }


        // ==========================================
        // Ambil data rute
        // ==========================================

        const route =
          result.routes[0];

        const leg =
          route.legs[0];


        // Jarak dalam meter
        const distanceMeters =
          leg.distance.value;


        // Durasi dalam detik
        const durationSeconds =
          leg.duration.value;


        // ==========================================
        // HITUNG TARIF
        // ==========================================

        /*
          Tarif:
          Rp10.000 setiap 100 meter.

          Contoh:

          100 m   = Rp10.000
          200 m   = Rp20.000
          350 m   = Rp40.000
          1 km    = Rp100.000
          2 km    = Rp200.000
        */


        const distanceBlocks =
          Math.ceil(
            distanceMeters / 100
          );


        const fare =
          distanceBlocks * 10000;


        // ==========================================
        // FORMAT JARAK
        // ==========================================

        let distanceText;


        if (distanceMeters >= 1000) {

          const distanceKm =
            distanceMeters / 1000;


          distanceText =
            distanceKm
              .toFixed(2)
              .replace(".", ",")
            + " km";

        } else {

          distanceText =
            Math.round(distanceMeters)
            + " m";

        }


        // ==========================================
        // FORMAT DURASI
        // ==========================================

        const durationMinutes =
          Math.ceil(
            durationSeconds / 60
          );


        const durationText =
          durationMinutes +
          " menit";


        // ==========================================
        // TAMPILKAN DATA PERJALANAN
        // ==========================================

        document.getElementById(
          "pickupText"
        ).textContent = pickup;


        document.getElementById(
          "destinationText"
        ).textContent =
          destinationPlace &&
          destinationPlace.formatted_address
            ? destinationPlace.formatted_address
            : destination;


        document.getElementById(
          "distance"
        ).textContent =
          distanceText;


        document.getElementById(
          "duration"
        ).textContent =
          durationText;


        document.getElementById(
          "fare"
        ).textContent =
          "Rp" +
          fare.toLocaleString(
            "id-ID"
          );


        // Simpan tarif untuk konfirmasi
        document.getElementById(
          "confirmBtn"
        ).dataset.fare = fare;


        // Simpan jarak
        document.getElementById(
          "confirmBtn"
        ).dataset.distance =
          distanceMeters;


        // Simpan durasi
        document.getElementById(
          "confirmBtn"
        ).dataset.duration =
          durationSeconds;


        // ==========================================
        // Tampilkan halaman perjalanan
        // ==========================================

        showPanel(
          "tripPanel",
          3
        );

      }

    );

  };


// ======================================================
// KONFIRMASI PESANAN
// ======================================================

document.getElementById("confirmBtn").onclick =
  () => {

    const confirmBtn =
      document.getElementById(
        "confirmBtn"
      );


    const fare =
      Number(
        confirmBtn.dataset.fare
      );


    document.getElementById(
      "confirmedService"
    ).textContent =
      selectedService;


    document.getElementById(
      "confirmedPickup"
    ).textContent =
      pickupInput.value;


    document.getElementById(
      "confirmedDestination"
    ).textContent =
      destinationPlace &&
      destinationPlace.formatted_address
        ? destinationPlace.formatted_address
        : document.getElementById(
            "destination"
          ).value;


    document.getElementById(
      "confirmedFare"
    ).textContent =
      "Rp" +
      fare.toLocaleString(
        "id-ID"
      );


    showPanel(
      "confirmPanel",
      4
    );

  };


// ======================================================
// PESANAN BARU
// ======================================================

document.getElementById("newOrderBtn").onclick =
  () => {

    document.getElementById(
      "destination"
    ).value = "";


    destinationLocation = null;
    destinationPlace = null;


    document.getElementById(
      "distance"
    ).textContent = "-";


    document.getElementById(
      "duration"
    ).textContent = "-";


    document.getElementById(
      "fare"
    ).textContent = "-";


    locationStatus.textContent =
      "Lokasi GPS belum digunakan";


    locationBtn.disabled = false;


    locationBtn.textContent =
      "📍 Gunakan Lokasi Saya";


    showPanel(
      "servicePanel",
      1
    );

  };


// ======================================================
// MENUNGGU GOOGLE MAPS
// ======================================================

// Fungsi ini dipanggil oleh Google Maps API
window.initGoogleMaps =
  initGoogleMaps;
