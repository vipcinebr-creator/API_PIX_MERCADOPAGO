import express from "express";
import mercadopago from "mercadopago";
import QRCode from "qrcode";

const app = express();
app.use(express.json());

// Configure com seu token do Mercado Pago
mercadopago.configure({
  access_token: "APP_USR-5092177616989788-032918-8a2c64a1c2b19e0a2c390d87dd627026-1838287409"
});

// Rota para criar Pix
app.post("/pix/criar", async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: descricao,
      payment_method_id: "pix",
      payer: { email: "cliente@teste.com" }
    });

    const pixCopiaCola =
      pagamento.body.point_of_interaction.transaction_data.qr_code;

    const qrCodeBase64 = await QRCode.toDataURL(pixCopiaCola);

    res.json({
      id: pagamento.body.id,
      status: pagamento.body.status,
      copia_cola: pixCopiaCola,
      qr_code: qrCodeBase64
    });

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Rota para verificar status
app.get("/pix/status/:id", async (req, res) => {
  try {
    const pagamento = await mercadopago.payment.get(req.params.id);
    res.json({ status: pagamento.body.status });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.listen(3000, () => {
  console.log("API Pix rodando");
});
