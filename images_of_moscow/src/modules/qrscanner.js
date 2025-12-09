import QrScanner from 'qr-scanner';

let qrScanner = null;
async function startScanning() {
  const video = document.getElementById('video');
  const videoContainer = document.getElementById('videoContainer');

  qrScanner = new QrScanner(
    video,
    result => handleQRResult(result),
    {
      highlightScanRegion: true,
      highlightCodeOutline: true,
      preferredCamera: 'environment'
    }
  );
  qrScanner.setInversionMode('both');
  await qrScanner.start();
}

function handleQRResult(result) {
  qrScanner.stop();
  window.location.href = result.data;
}

startScanning()
