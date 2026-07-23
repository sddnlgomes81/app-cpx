function ThermalReceiptContent({ selectedOs, companySettings, clients, printers }: any) {
  const c = clients.find((x: any) => x.id === selectedOs.clientId);
  const p = printers.find((x: any) => x.id === selectedOs.printerId);
  const isFailed = selectedOs.status === 'Sem Conserto' || selectedOs.status === 'Orçamento Não Aprovado' || (selectedOs.status === 'Entregues' && !selectedOs.paid);

  return (
    <div className="bg-white mx-auto text-black" style={{ width: '100%', maxWidth: '80mm', padding: '4mm', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2' }}>
      {/* Header */}
      <div className="text-center mb-2 flex flex-col items-center">
        {companySettings.logoUrl && (
          <img src={companySettings.logoUrl} alt="Logo" className="max-w-[100px] mb-2 grayscale" style={{ filter: 'grayscale(100%) contrast(1.2)' }} />
        )}
        <h1 className="font-bold text-sm uppercase">{companySettings.tradeName || 'COMPATIX - SOLUÇÕES PARA IMPRESSORAS'}</h1>
        <div className="text-[11px]">
          <div>{companySettings.address}</div>
          <div>CNPJ: {companySettings.cnpj}</div>
          <div>Tel: {companySettings.phone}</div>
        </div>
      </div>

      <div className="text-center mb-2">--------------------------------</div>

      {/* OS Info */}
      <div className="mb-2">
        <div><span className="font-bold">OS N°:</span> {selectedOs.osNumber}</div>
        <div><span className="font-bold">Data:</span> {new Date().toLocaleString('pt-BR')}</div>
      </div>

      <div className="text-center mb-2">--------------------------------</div>

      <div className="mb-2">
        <h2 className="font-bold uppercase mb-1">DADOS DO CLIENTE</h2>
        <div>{c ? c.name : 'N/A'}</div>
        <div>Doc: {c ? c.document : 'N/A'}</div>
      </div>

      <div className="text-center mb-2">--------------------------------</div>

      <div className="mb-2">
        <h2 className="font-bold uppercase mb-1">EQUIPAMENTO</h2>
        <div>{p ? `${p.brand} ${p.model}` : 'N/A'}</div>
        <div>S/N: {p ? p.serialNumber : 'N/A'}</div>
      </div>

      <div className="text-center mb-2">--------------------------------</div>

      <div className="mb-2">
        <h2 className="font-bold uppercase mb-1">VALORES</h2>
        {selectedOs.usedParts.length > 0 && (
          <div className="mb-1">
            <div className="font-bold">Peças:</div>
            {selectedOs.usedParts.map((part: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{part.quantity}x {part.productName.substring(0, 15)}</span>
                <span>R$ {part.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-1">
          <span>Mão de Obra:</span>
          <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.laborCost.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>TOTAL:</span>
          <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.totalAmount.toFixed(2)}`}</span>
        </div>
        {selectedOs.paid && (
          <div className="text-center font-bold mt-2">
            PAGO VIA {selectedOs.paymentMethod?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="text-center mb-2">--------------------------------</div>

      <div className="text-justify space-y-2 mb-6">
        <p>
          <span className="font-bold">GARANTIA DE 90 DIAS:</span> A garantia cobre apenas os serviços realizados e peças trocadas nesta OS, não cobrindo defeitos por mau uso, quedas ou descargas elétricas.
        </p>
        <p>
          O cliente declara estar recebendo o equipamento acima descrito devidamente consertado e em perfeitas condições de uso.
        </p>
      </div>

      <div className="text-center mb-8">
        <div>--------------------------------</div>
        <div>Assinatura do Cliente</div>
      </div>
    </div>
  );
}
