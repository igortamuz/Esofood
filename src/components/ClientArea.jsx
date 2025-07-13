import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import OrderStatus from './OrderStatus';

function ClientArea() {
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Efeito para o scanner de câmera
  useEffect(() => {
    // Só inicializa o scanner se não houver um ID escaneado
    if (scannedOrderId) {
      // Se já temos um ID, garantimos que qualquer scanner ativo seja limpo.
      if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 = SCANNING
         scannerRef.current.clear().catch(err => console.error("Falha ao limpar o scanner após sucesso.", err));
      }
      return;
    };

    // Previne múltiplas inicializações
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader-container",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // 0 = CAMERA
      },
      false // verbose
    );

    const onScanSuccess = (decodedText) => {
      setScanError(null);
      setScannedOrderId(decodedText);
      // A limpeza agora é tratada no return do useEffect
    };

    const onScanFailure = (error) => {
      // Ignoramos erros comuns que não são "falhas" reais
    };

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    // Função de limpeza do useEffect
    return () => {
      if (scannerRef.current) {
        // Verifica se o scanner não foi limpo ainda
        if (scannerRef.current.getState() !== 3) { // 3 = NOT_STARTED
            scannerRef.current.clear().catch(err => {
                // A biblioteca pode dar um erro se já estiver em transição, podemos ignorá-lo no cleanup
                console.warn("Pequeno erro ao limpar o scanner, geralmente seguro ignorar:", err);
            });
        }
        scannerRef.current = null;
      }
    };
  }, [scannedOrderId]); // Dependência para reavaliar quando um ID for escaneado

  // Função para lidar com o scan de um arquivo de imagem
  const handleFileScan = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanError(null);
    const html5QrCode = new Html5Qrcode("qr-reader-container");
    try {
      const decodedText = await html5QrCode.scanFile(file, false);
      setScannedOrderId(decodedText);
    } catch (err) {
      console.error("Erro ao escanear a imagem:", err);
      setScanError("Não foi possível encontrar um QR Code nesta imagem. Tente outra.");
    } finally {
        // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  // Se já temos um ID, mostramos o status do pedido
  if (scannedOrderId) {
    return <OrderStatus orderId={scannedOrderId} />;
  }

  // Se não, mostramos a interface de escaneamento
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl mb-4 text-gray-300">Aponte para o QR Code do seu pedido</h2>

      {/* Container onde o scanner de câmera ou o resultado do scan de arquivo será mostrado */}
      <div id="qr-reader-container" className="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden mb-6"></div>

      {scanError && <p className="text-red-400 mb-4">{scanError}</p>}

      <p className="text-gray-400 mb-4">ou</p>

      {/* Input de arquivo escondido */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileScan}
        style={{ display: 'none' }}
      />

      {/* Botão para acionar o input de arquivo */}
      <button
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="area-button client-button"
        style={{ fontSize: '1.2rem', padding: '0.75rem 1.5rem' }}
      >
        Escanear QR Code de uma Imagem
      </button>
    </div>
  );
}

export default ClientArea;