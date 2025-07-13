import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import OrderStatus from './OrderStatus';

function ClientArea() {
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const scannerRef = useRef(null);
  const qrReaderDivId = "qr-reader";

  useEffect(() => {

    if (!scannedOrderId) {

      const qrReaderElement = document.getElementById(qrReaderDivId);
      if (!qrReaderElement) {


        return;
      }

      const scanner = new Html5QrcodeScanner(
          qrReaderDivId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
      );
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText) => {
          setScannedOrderId(decodedText);

          if (scannerRef.current) {
            scannerRef.current.clear().catch(error => console.error("Falha ao limpar o scanner após sucesso:", error));
            scannerRef.current = null;
          }
      };

      const onScanFailure = (error) => {
       console.warn(`Erro na leitura do QR Code: ${error}`);

      };

      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {

      
      if (scannerRef.current) {

        if (scannerRef.current.getState() !== 2) {
          scannerRef.current.clear().catch(err => console.error("Falha ao limpar o scanner na desmontagem:", err));
        }
        scannerRef.current = null;
      }
    };
  }, [scannedOrderId]);


  if (scannedOrderId) {
    return <OrderStatus orderId={scannedOrderId} />;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4 text-gray-300">Aponte para o QR Code do seu pedido</h2>
      <div id={qrReaderDivId} className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden"></div>
    </div>
  );
}

export default ClientArea;