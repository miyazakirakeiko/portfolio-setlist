// 空の配列 setlist を定義しています。この配列には、追加される曲やMCが格納されます。
const setlist = [];
// カラーテーマの反転を制御するためのフラグです。false の場合は通常の色、true の場合は反転した色（背景が黒、文字が黄色）になります。
let invertColors = false;

// ドラッグ中のインデックスを保存する変数
let draggedItemIndex = null;

document.getElementById("date-input").addEventListener("change", function () {
  // 日付を選択した後にカレンダーを閉じる
  this.blur();
});

function addSong() {
  const songInput = document.getElementById("song-input");
  const song = songInput.value.trim();
  setlist.push({ type: "song", name: song });
  updateSetlist();
  songInput.value = "";
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

// 曲の順番をドラッグアンドドロップで入れ替えるためのイベントリスナー
function addDragAndDropListeners() {
  const listItems = document.querySelectorAll("#setlist li");

  listItems.forEach((item, index) => {
    item.setAttribute("draggable", true);

    // ドラッグ開始
    item.addEventListener("dragstart", function () {
      draggedItemIndex = index;
    });

    // ドラッグしている要素が上に来たときに、デフォルトの動作を無効化
    item.addEventListener("dragover", function (event) {
      event.preventDefault(); // ドロップを可能にするための必須処理
    });

    // ドロップされたときに処理を実行
    item.addEventListener("drop", function () {
      if (draggedItemIndex !== null) {
        // ドラッグされた要素を現在の位置に挿入
        const draggedItem = setlist[draggedItemIndex];

        // 元の位置から削除
        setlist.splice(draggedItemIndex, 1);

        // 新しい位置に挿入
        setlist.splice(index, 0, draggedItem);

        // リストを再描画
        updateSetlist();

        // ドラッグが完了したのでリセット
        draggedItemIndex = null;
      }
    });
  });
}

// セットリストの内容を更新する関数
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
    li.style.color = invertColors ? "yellow" : "black"; // 文字色の設定
    li.style.backgroundColor = invertColors ? "black" : "white"; // 背景色の設定
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.onclick = () => deleteItem(index);
    li.appendChild(deleteButton);
    ul.appendChild(li);
  });

  // ドラッグ＆ドロップのイベントリスナーを追加
  addDragAndDropListeners();
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

  // バンド名の文字数に応じたフォントサイズの設定
  let bandNameFontSize = "48px";
  if (bandName.length >= 16) {
    bandNameFontSize = "35px";
  } else if (bandName.length >= 11) {
    bandNameFontSize = "40px";
  }

  const eventName =
    document.getElementById("event-name").value.trim() || "イベント名未入力";
  const inputDate =
    document.getElementById("date-input").value.trim() || "日付未入力";
  const venueName =
    document.getElementById("venue-name").value.trim() || "会場名未入力";

  let songNumber = 1;
  const previewContent = `
        <div style="width: 210mm; height: 297mm; padding: 10px; ${
          invertColors
            ? "background-color: black; color: yellow;"
            : "background-color: white; color: black;"
        }; margin-left: 0; border: 1px solid #ccc;">  <!-- A4比率、左寄せ設定 -->
            <h3 style="font-size: ${bandNameFontSize}; text-align: center;">${bandName}</h3>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${inputDate}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${venueName}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0;">
                ${setlist
                  .map((item) => {
                    if (item.type === "song") {
                      return `<li style="font-size: 30px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
                        invertColors
                          ? "color: yellow; background-color: black;"
                          : "color: black; background-color: white;"
                      }">
                            ${songNumber++}. ${item.name}
                        </li>`;
                    } else {
                      return `<li style="font-size: 30px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
                        invertColors
                          ? "color: yellow; background-color: black;"
                          : "color: black; background-color: white;"
                      }">
                            ${item.name}
                        </li>`;
                    }
                  })
                  .join("")}
            </ul>
        </div>`;

  // プレビューエリアに出力
  document.getElementById("preview-content").innerHTML = previewContent;
  document.getElementById("preview-area").style.display = "block";

  // プレビューエリア自体を左寄せに設定
  document.getElementById("preview-area").style.textAlign = "left";
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

  let bandNameFontSize = "48px";
  if (bandName.length >= 16) {
    bandNameFontSize = "35px";
  } else if (bandName.length >= 11) {
    bandNameFontSize = "40px";
  }

  let songNumber = 1;
  const pdfContent = `
        <div style="text-align: left; font-family: 'Noto Sans', sans-serif; ${
          invertColors
            ? "background-color: black; color: yellow;"
            : "background-color: white; color: black;"
        }">
            <h3 style="font-size: ${bandNameFontSize}; text-align: center;">${bandName}</h3>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${inputDate}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${venueName}</p>
            <p style="font-size: 15px; text-align: center; margin-bottom: 10px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0;">
                ${setlist
                  .map((item) => {
                    if (item.type === "song") {
                      return `<li style="font-size: ${fontSize}; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
                        invertColors
                          ? "color: yellow; background-color: black;"
                          : "color: black; background-color: white;"
                      }">
                            ${songNumber++}. ${item.name}
                        </li>`;
                    } else {
                      return `<li style="font-size: ${fontSize}; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
                        invertColors
                          ? "color: yellow; background-color: black;"
                          : "color: black; background-color: white;"
                      }">
                            ${item.name}
                        </li>`;
                    }
                  })
                  .join("")}
            </ul>
        </div>`;

  const element = document.createElement("div");
  element.innerHTML = pdfContent;
  document.body.appendChild(element);

  html2pdf()
    .from(element)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    })
    .catch((error) => {
      console.error("PDF生成中にエラーが発生しました:", error);
      alert("PDFの生成中にエラーが発生しました。");
    })
    .finally(() => {
      document.body.removeChild(element);
    });
}

function toggleInvert() {
  invertColors = !invertColors;
  updateSetlist(); // セットリストを再描画して色を反映
  showPreview(); // プレビューを再表示して色を反映
}
