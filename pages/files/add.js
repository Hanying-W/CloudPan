const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    //用户id
    folderIndex: -1,
    folders: [],
    filesOrigin: [],
    filesNew: [],
    index: ''
  },
  onLoad(options) {
    this.setData({
      folderIndex: options.id,
      filesOrigin: app.globalData.allData.folders[options.id].files
    })
  },
  // 提交表单
  formSubmit(e) {
    //提示用户正在加载
    wx.showLoading({
      title: '加载中'
    })
    // 并发上传文件
    const uploadTasks = this.data.filesNew.map(item => this.uploadFile(item.src))
    Promise.all(uploadTasks).then(result => {
      //打印信息
      console.log("result的值", result)
      console.log("e的值是啥", e)
      //添加文件信息到数据库
      this.addFiles(result, e.detail.value.desc)
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
      //上传错误提示
      wx.showToast({
        title: '文件上传错误',
        icon: 'error'
      })
    })
  },

  // 选择文件
  chooseMessageFile: function() {
    const items = this.data.filesNew
    console.log('选择文件之后的items', items)
    //选择文件
    wx.chooseMessageFile({
      //设置上传文件个数
      count: 5,
      //回调函数
      success: res => {
        //打印选择的文件信息
        console.log('选择文件之后的res', res)
        //创建变量用于存放上传后的文件信息
        let tempFilePaths = res.tempFiles
        //保存文件信息
        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath.path,
            name: tempFilePath.name
          })
        }
        //更新文件文件信息
        this.setData({
          filesNew: items
        })
        console.log('选择文件之后的items', this.data.filesNew)
      }
    })
  },
  // 上传文件
  uploadFile(filePath) {
    //提取文件名
    const cloudPath = `cloudbase/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}` + filePath.match(/\.[^.]+?$/)
    //上传文件
    return wx.cloud.uploadFile({
      cloudPath,
      filePath
    })
  },
  // 添加文件信息到数据库
  addFiles(files, comment) {
    const oldFiles = app.globalData.allData.folders[this.data.folderIndex].files
    //提取上传的文件名
    const name = this.data.filesNew.map(file => file.name)
    //打印文件名
    console.log('name的值', name)
    //提取上传后的文件信息
    const folderFiles = files.map((file, index) => ({
      fileID: file.fileID,
      comments: comment,
      name: name[index]
    }))
    //打印上传后的文件信息
    console.log("folderFiles", folderFiles)
    // 合并老文件的数组和新文件的数组
    app.globalData.allData.folders[this.data.folderIndex].files = [...oldFiles, ...folderFiles]
    //查询用户保存在数据库中的记录，上传文件信息到数据库
    db.collection('user').doc(app.globalData.id).update({
      data: {
        //在原数据里添加一条记录
        folders: db.command.set(app.globalData.allData.folders)
      }
    }).then(result => {
      //打印结果
      console.log("写入成功", result)
      //关闭页面，返回到文件列表
      wx.navigateBack()
    })
  }
})