export const whatsappTemplate = {
  pernikahan: ({ namaTamu, link, pengundang }) => `
Assalamu’alaikum Warahmatullahi Wabarakatuh.

Dengan memohon rahmat dan ridho Allah SWT, kami mengundang ${namaTamu} untuk menghadiri acara pernikahan kami.

Link Undangan:
${link}

Merupakan kehormatan dan kebahagiaan bagi kami apabila berkenan hadir dan memberikan doa restu.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.

Hormat kami,
${pengundang}
`.trim(),

  khitanan: ({ namaTamu, link, pengundang }) => `
Assalamu’alaikum Warahmatullahi Wabarakatuh.

Dengan izin Allah SWT, kami mengundang ${namaTamu} untuk menghadiri acara khitanan putra/putri kami.

Link Undangan:
${link}

Merupakan kebahagiaan bagi kami apabila berkenan hadir dan memberikan doa restu.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.

Hormat kami,
${pengundang}
`.trim()
};

export function buttonWhatsAppUndangan(button, event) {
  const namaTamu = button.dataset.nama || "Tamu";
  const link = button.dataset.link || "#";
  const pengundang = button.dataset.pengundang;
  const jenisAcara = button.dataset.acara || "pernikahan";

  const templateFn = whatsappTemplate[jenisAcara] || whatsappTemplate.pernikahan;
  const pesan = templateFn({ namaTamu, link, pengundang });

  const waNumber = button.dataset.kontak || "";
  const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;

  window.open(waURL, "_blank");
}
