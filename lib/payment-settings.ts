export const paymentDestination = {
  bankName: process.env.JASTIP_BANK_NAME || "BCA (Demo)",
  accountNumber: process.env.JASTIP_BANK_ACCOUNT || "1234567890",
  accountHolder: process.env.JASTIP_BANK_ACCOUNT_HOLDER || "Nama Pemilik Jastip",
};
