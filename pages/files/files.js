const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({
  //用户id
  folderId: undefined,
  // 页面的初始数据
  data: {
    //用户id
    folderIndex: '',
    //文件夹中的文件信息
    files: [],
    //保存文件路径
    fileIds: [],
    realUrls: [],
  },

  onLoad(options) {
    this.folderId = options.id
    console.log(options)
  },

  onShow() {
    //获取文件夹中的数据
    this.getFiles()
  },

  addfile(e) {
    //跳转到上传文件页面
    wx.navigateTo({
      url: '/pages/files/add?id=' + this.folderId,
    })
  },

  // 获取文件夹中的数据
  async getFiles() {
    //获取用户信息
    const userinfo = await db.collection('user').doc(app.globalData.id).get()
    //打印用户信息
    console.log(userinfo)
    //获取用户文件夹列表
    const folders = userinfo.data.folders
    //获取用户文件夹中的文件信息
    const files = folders[this.folderId].files
    //更新文件信息用户显示用户的文件
    app.globalData.allData.folders[this.folderId].files = files
    // 获取文件列表
    const fileList = files.map(file => file.fileID)
    // 根据文件列表拉取文件的真实地址
    const fileIds = []
    //获取文件的真实链接
    const realUrlsRes = await wx.cloud.getTempFileURL({
      fileList
    })
    const realUrls = realUrlsRes.fileList.map(file => {
      fileIds.push(file.fileID)
      return file.tempFileURL
    })
    //更新局部变量
    this.setData({
      //更新用户id
      folderIndex: this.folderId,
      //更新文件路径
      files,

      realUrls: realUrls,
    })
  },
  // 长按事件
  longpress(e) {
    const fileIndex = e.currentTarget.dataset.index
    const realurl = this.data.realUrls[fileIndex]
    wx.setClipboardData({
      data: realurl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
      }
    })

  },
})