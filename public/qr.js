// Step 6: QR code print page. A print page that makes a QR code for the Join
// page URL in the browser, so Lexie can print it and guests scan it to join.
// The QR is built client-side with the qrcode-generator library, which is
// loaded as a classic script and so puts `qrcode` on window before this
// module runs. Static page, no build step.

const joinUrl = window.location.origin + "/";

document.getElementById("join-url").textContent = joinUrl;

const qrBox = document.getElementById("qr-box");

if (typeof qrcode !== "undefined") {
  const qr = qrcode(0, "M");
  qr.addData(joinUrl);
  qr.make();

  // innerHTML is allowed here only because this SVG comes from the library,
  // not from a person.
  qrBox.innerHTML = qr.createSvgTag({ cellSize: 8, margin: 4, scalable: true });
} else {
  const note = document.createElement("p");
  note.className = "qr-error";
  note.textContent = "The QR code could not be made. Please refresh the page.";
  qrBox.textContent = "";
  qrBox.appendChild(note);
}
