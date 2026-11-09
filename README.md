# Java Debug Lab｜Java 初學者常見錯誤圖鑑

> 寫錯也沒關係，理解才是最重要的。

一個給 Java 初學者使用的靜態學習網站。每篇文章固定包含：問題情境、錯誤程式碼、正確程式碼、原因解釋、複習重點。網站最重要的特色是：**AI 可依照 `AGENTS.md` 的規則，持續新增文章，而不必重做頁面。**

## 功能

- 響應式首頁、文章卡片、文章詳細頁
- 文章分類、即時關鍵字搜尋、結果數量
- 錯誤／正確程式碼對照、複製程式碼
- 文章下一篇導覽、找不到文章時的提示
- 三篇初始教學文章：`String` 的 `==` 與 `equals()`、`switch` 少了 `break`、`while` 無限迴圈
- 全站無框架、無後端，適合 GitHub Pages

## 專案架構

```text
java-debug-lab/
├── AGENTS.md
├── README.md
├── .nojekyll
├── index.html
├── article.html
├── assets/
│   ├── style.css
│   └── app.js
├── data/
│   └── articles.json
└── scripts/
    └── validate_data.py
```

## 本機預覽

在專案根目錄執行：

```bash
python -m http.server 8000
```

開啟 `http://localhost:8000/`。Windows 如果 `python` 指令不可用，可嘗試 `py -m http.server 8000`。

⚠️ 請不要直接雙擊 `index.html` 用 `file://` 模式開啟：瀏覽器可能會禁止 `fetch()` 讀取本機 JSON。

## 檢查文章資料

```bash
python scripts/validate_data.py
```

這項測試會檢查 JSON 格式、分類、所有必填欄位、文章 ID 和資料型別；它**不能取代 Java 編譯、瀏覽器互動測試**。

## 如何擴充網站（作業的核心展示）

1. 要求 AI **先閱讀 `AGENTS.md`**。
2. 請 AI 新增「for 迴圈條件判斷」教學。
3. AI 按既有格式在 `data/articles.json` 的 `articles` 裡新增一筆資料；不要新建 HTML 頁面。
4. 執行 `python scripts/validate_data.py`。
5. 重新整理首頁，就能看到新卡片。點擊可進入 `article.html?id=for-loop-condition`。
6. 檢查搜尋 `for`、切換「迴圈控制」分類是否都能找到新文章。
7. 可以將這次新增單獨提交成一個 Git commit，讓老師看到可重複使用的流程。

可直接提供 AI 的指令：

> 請先閱讀 AGENTS.md 和 data/articles.json。依照既有格式新增一篇「for 迴圈常見錯誤」文章。不要改變網站設計，不要新增獨立 HTML 頁面。新增後執行資料驗證，並列出修改檔案、遵守哪些規則、哪些測試完成了。

## GitHub Pages 部署

1. 在 GitHub 建立公開 Repository：`java-debug-lab`。
2. 將此資料夾**裡面的全部檔案（含 `.nojekyll`）**上傳到 Repository 的根目錄。請確認根目錄直接看到 `index.html`，不要多包一層 `java-debug-lab/`。
3. 進入 Repository → **Settings** → **Pages**。
4. **Build and deployment** → **Source** 選 **Deploy from a branch**。
5. 選擇 **main**、**/(root)**，按 **Save**。
6. 站點通常會位於：`https://你的帳號.github.io/java-debug-lab/`。以 GitHub Pages 設定頁的 **Visit site** 連結為準。

網站採用相對路徑，可部署在 GitHub Pages 的 Repository 子路徑，不需要修改程式碼。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 作業繳交內容

- **專案簡介**：Java Debug Lab，提供 Java 初學者常見錯誤的對照教學與搜尋分類。
- **Repository**：部署後填入自己的 GitHub Repository 網址。
- **網站網址**：部署後填入自己的 GitHub Pages 網址。
- **開發規範**：根目錄 `AGENTS.md`。
- **可重複使用性**：AI 讀取 `AGENTS.md`，依既有 JSON 格式新增教學，不需重做網頁；可用第四篇教學的提交紀錄說明。

## 內容聲明

本專案作為程式教育示範使用。文章例子為本專案撰寫，請在正式繳交前自行檢查並理解所有內容；如有引用外部素材，應依授權標明來源。
