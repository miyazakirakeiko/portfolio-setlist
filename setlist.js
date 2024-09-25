const setlist = [];
let invertColors = false;

function addSong() {
  const songInput = document.getElementById("song-input");
  const song = songInput.value.trim();
  if (song && setlist.length < 20) {
    setlist.push({ type: "song", name: song });
    updateSetlist();
    songInput.value = "";
  }
}

function addMC() {
  if (setlist.length < 20) {
    setlist.push({ type: "mc", name: "MC" });
    updateSetlist();
  }
}

function deleteItem(index) {
  setlist.splice(index, 1);
  updateSetlist();
}

function updateSetlist() {
  const ul = document.getElementById("setlist");
  ul.innerHTML = "";
  let songNumber = 1;
  setlist.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.type === "song") {
      li.textContent = `${songNumber++}. ${item.name}`;
    } else {
      li.textContent = item.name;
    }
    li.style.textAlign = "left";
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.onclick = () => deleteItem(index);
    li.appendChild(deleteButton);
    ul.appendChild(li);
  });
}

function getFontSizeForPDF(totalSongs) {
  if (totalSongs > 16) return "20px";
  if (totalSongs > 12) return "25px";
  if (totalSongs > 8) return "30px";
  if (totalSongs > 4) return "40px";
  return "40px";
}

function showPreview() {
  const bandName =
    document.getElementById("band-name").value.trim() || "バンド名未入力";
  const eventName =
    document.getElementById("event-name").value.trim() || "イベント名未入力";
  const inputDate =
    document.getElementById("date-input").value.trim() || "日付未入力";
  const venueName =
    document.getElementById("venue-name").value.trim() || "会場名未入力";

  let songNumber = 1;
  const previewContent = `
        <div style="padding: 10px; ${
          invertColors ? "background-color: black; color: yellow;" : ""
        }">
            <h3 style="font-size: 48px; text-align: center;">${bandName}</h3>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${inputDate}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${venueName}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0;">
                ${setlist
                  .map((item) => {
                    if (item.type === "song") {
                      return `<li style="font-size: 30px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis;">
                            ${songNumber++}. ${item.name}
                        </li>`;
                    } else {
                      return `<li style="font-size: 30px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis;">
                            ${item.name}
                        </li>`;
                    }
                  })
                  .join("")}
            </ul>
        </div>`;

  document.getElementById("preview-content").innerHTML = previewContent;
  document.getElementById("preview-area").style.display = "block";
}

function generatePDF() {
  const bandName =
    document.getElementById("band-name").value.trim() || "バンド名未入力";
  const eventName =
    document.getElementById("event-name").value.trim() || "イベント名未入力";
  const inputDate =
    document.getElementById("date-input").value.trim() || "日付未入力";
  const venueName =
    document.getElementById("venue-name").value.trim() || "会場名未入力";

  const totalSongs = setlist.filter((item) => item.type === "song").length;
  const fontSize = getFontSizeForPDF(totalSongs);

  let songNumber = 1;
  const pdfContent = `
        <div style="text-align: center; padding: 20px; ${
          invertColors ? "background-color: black; color: yellow;" : ""
        }">
            <h1 style="font-size: 48px;">${bandName}</h1>
            <p style="font-size: 15px; margin-bottom: 10px;">${inputDate}</p>
            <p style="font-size: 15px; margin-bottom: 10px;">${venueName}</p>
            <p style="font-size: 15px; margin-bottom: 10px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0;">
                ${setlist
                  .map((item) => {
                    if (item.type === "song") {
                      return `<li style="font-size: ${fontSize}; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${songNumber++}. ${item.name}
                        </li>`;
                    } else {
                      return `<li style="font-size: ${fontSize}; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis;">
                            ${item.name}
                        </li>`;
                    }
                  })
                  .join("")}
            </ul>
        </div>`;

  const opt = {
    margin: [20, 20, 20, 20],
    filename: `${bandName}_セットリスト.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(pdfContent).set(opt).save();
}

function toggleInvert() {
  invertColors = !invertColors;
  showPreview();
}

document.getElementById("add-song-button").addEventListener("click", addSong);
document.getElementById("add-mc-button").addEventListener("click", addMC);
document
  .getElementById("preview-button")
  .addEventListener("click", showPreview);
document
  .getElementById("generate-pdf-button")
  .addEventListener("click", generatePDF);
document
  .getElementById("toggle-invert-button")
  .addEventListener("click", toggleInvert);
