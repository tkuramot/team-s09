// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { title } = require('process')
const { toUnicode } = require('punycode')
const sqlite3 = require('sqlite3')
const ejs = require('ejs')
const fs = require('fs')

const db = new sqlite3.Database("./todo.db")

// Create html file from ejs template
// 引数dataToPassはテンプレートに渡す値を{key: value, key1: value1}のような連想配列で記述
// templateFile, outputFileはそれぞれテンプレートのパスと作成されるhtmlファイルのパス
function createHtml(dataToPass, templateFile, outputFile) {
  ejs.renderFile(templateFile, dataToPass, function(err, html){

    // 出力情報 => ejsから作成したhtmlソース
    // console.log(err)

    // 出力ファイル名
    const file = outputFile

    // テキストファイルに書き込む
    fs.writeFileSync(file, String(html), 'utf8', (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('save')
      }
    });
  });
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  db.all("SELECT id, text, display FROM data", function(err, allTasks) {
    if (err) {
      throw err
    }
    createHtml({allTasks: allTasks}, './src/index.ejs', './dist/index.html')
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./dist/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function createDetailWindow() {
  const detailWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  detailWindow.loadFile('./detail.html')
}

function creareUpdatewindow() {
  const updatewindow = new BrowserWindow({
    width: 300,
    height: 300,
    webPreferences: {
      pleload: path.join(__dirname, "preload.js")
    }
  })
  updatewindow.loadFile("updated.html")
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Open detail window
ipcMain.handle('detail', () => {
  createDetailWindow()
  return
})

// Save data to the database
ipcMain.handle('save', (event, data) => {
  if (data.length === 0) {
    return dialog.showErrorBox("", "入力がありません")
  }
  db.run("INSERT INTO data (text, display, UpdatedAt) values(?, ?, ?)", data, false, Date.now())
  // Close window after saving data
  const currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close()
  return
})


/*TODO
edit function*/

//id get complete
ipcMain.handle("update", (event, number) => {
  creareUpdatewindow()
  console.log(typeof (number))
  let id = parseFloat(number)
  console.log(typeof (id))
  db.run("UPDATE data SET text = ? WHERE id = ?", number, id)
  return
})


ipcMain.handle("updatedbtn", (event, stextarea) => {
  console.log(stextarea)
  const currentupdatedWindow = BrowserWindow.getFocusedWindow()
  currentupdatedWindow.close()
  return
})

/*TODO
delete function*/
ipcMain.handle("deleted",(event,task_id)=>{
  db.run("delete from data where id = ?",task_id)
})
