// 空の配列 setlist を定義しています。この配列には、追加される曲やMCが格納されます。
const setlist = [];
// カラーテーマの反転を制御するためのフラグです。false の場合は通常の色、true の場合は反転した色（背景が黒、文字が白）になります。
let invertColors = false;

// ドラッグ中のインデックスを保存する変数
let draggedItemIndex = null;

// ページ全体でid属性がfate-inputのものを探す
// その要素で「日付が変わったよ」というイベントが起きたら、以下の動作
// 日付を選んだら、自動的に入力欄からフォーカスが外れる（カーソルが別の場所に移動する）ようになる
document.getElementById("date-input").addEventListener("change", function () {
  this.blur();
});

function addSong() {
  const songInput = document.getElementById("song-input");
  // 要素に入力された値を表すプロパティ
  const song = songInput.value.trim();
  setlist.push({ type: "song", name: song });
  updateSetlist();
  // ユーザーが曲名を入力した後、入力フィールドを空にして次の入力ができるようにしてい
  songInput.value = "";
}

function addMC() {
  if (setlist.length < 20) {
    setlist.push({ type: "mc", name: "MC" });
    updateSetlist();
  }
}

function deleteItem(index) {
  // setlist 配列の index 番目の要素を1つ削除
  setlist.splice(index, 1);
  updateSetlist();
}

// セットリストの内容を更新する関数
function updateSetlist() {
  const setlistContainer = document.getElementById("setlist");
  setlistContainer.innerHTML = ""; // 既存のリストをクリア

  // 曲順の番号を管理するためのカウンタ
  let songCounter = 1;

  setlist.forEach((item, index) => {
    const listItem = document.createElement("li");

    // Tailwind CSSクラスを使用してスタイルを設定
    listItem.className = `
      border border-gray-300 
      rounded-md   
      p-2 
      my-1 
      transition 
      duration-500 
    
      hover:shadow-md 
      ${invertColors ? "bg-gray-800 text-white" : "bg-white text-black"}
    `;
    // 曲にもMCにも削除ボタンを追加
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "mr-2 text-red-500 hover:text-red-700"; // 左に配置するために 'mr-2'（右側にマージン）を使用
    deleteButton.addEventListener("click", () => deleteItem(index)); // indexで削除

    // 削除ボタンを先に追加して左側に配置
    listItem.appendChild(deleteButton);

    if (item.type === "song") {
      listItem.appendChild(
        document.createTextNode(`${songCounter}. ${item.name}`)
      );
      songCounter++; // 曲ごとにカウンタを増やす
    } else {
      listItem.appendChild(document.createTextNode(item.name)); // MCの場合はそのまま
    }

    setlistContainer.appendChild(listItem);
  });

  // SortableJSを初期化
  new Sortable(setlistContainer, {
    animation: 1000,
    onEnd: function (evt) {
      const movedItem = setlist.splice(evt.oldIndex, 1)[0];
      setlist.splice(evt.newIndex, 0, movedItem);
      updateSetlist(); // リストを再描画
    },
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

  let bandNameFontSize = "24px"; // 元は48px
  if (bandName.length >= 16) {
    bandNameFontSize = "17.5px"; // 元は35px
  } else if (bandName.length >= 11) {
    bandNameFontSize = "20px"; // 元は40px
  }

  const eventName =
    document.getElementById("event-name").value.trim() || "イベント名未入力";
  const inputDate =
    document.getElementById("date-input").value.trim() || "日付未入力";
  const venueName =
    document.getElementById("venue-name").value.trim() || "会場名未入力";

  let songNumber = 1;
  const previewContent = `
        <div style="width: 105mm; height: 149mm; padding: 10px; ${
          invertColors
            ? "background-color: black; color: yellow;"
            : "background-color: white; color: black;"
        }; margin: auto; border: 1px solid #ccc;">
            <h3 style="font-size: ${bandNameFontSize}; text-align: center;">${bandName}</h3>
            <p style="font-size: 7.5px; text-align: center; margin-bottom: 10px;">${inputDate}</p>
            <p style="font-size: 7.5px; text-align: center; margin-bottom: 10px;">${venueName}</p>
            <p style="font-size: 7.5px; text-align: center; margin-bottom: 10px;">${eventName}</p>
            <ul style="list-style-type: none; padding: 0;">
                ${setlist
                  .map((item) => {
                    if (item.type === "song") {
                      return `<li style="font-size: 15px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
                        invertColors
                          ? "color: yellow; background-color: black;"
                          : "color: black; background-color: white;"
                      }">
                            ${songNumber++}. ${item.name}
                        </li>`;
                    } else {
                      return `<li style="font-size: 15px; text-align: left; white-space: normal; overflow: hidden; text-overflow: ellipsis; ${
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

  document.getElementById("preview-content").innerHTML = previewContent;

  // プレビューエリア全体を中央寄せにする
  const previewArea = document.getElementById("preview-area");
  previewArea.style.display = "flex";
  previewArea.style.justifyContent = "center";
  previewArea.style.alignItems = "center";
  previewArea.style.height = "100%";
  previewArea.style.textAlign = "center";

  previewArea.style.display = "block";
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

  // bandNameの文字数に応じたフォントサイズの設定
  let bandNameFontSize;
  if (bandName.length >= 16) {
    bandNameFontSize = "25px"; // 16文字以上は35px
  } else if (bandName.length >= 11) {
    bandNameFontSize = "35px"; // 11文字以上16文字未満は40px
  } else {
    bandNameFontSize = "48px"; // 10文字以下は48px
  }

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

// カラーテーマを反転させるための関数です
function toggleInvert() {
  invertColors = !invertColors; // 現在の状態を反転
  updateSetlist(); // セットリストを再描画
  showPreview(); // プレビューを再表示
}

// 色反転用ボタンのイベントリスナーを追加
document
  .getElementById("toggle-invert")
  .addEventListener("click", toggleInvert);
