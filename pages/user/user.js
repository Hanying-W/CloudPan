const app = getApp()
Page({
  data: {
    //保存用户信息
    userInfo: {},
    //标记用户是否登录
    hasUserInfo: false,
    //检查组件能否正常使用
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad() {
    //如果用户已经登陆
    if (app.globalData.userInfo) {
      //再本地更新用户信息
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      //添加用户信息到数据库
      this.addUser(app.globalData.userInfo)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      //保存用户信息到全局
      app.userInfoReadyCallback = res => {
        //在本地更新用户信息
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        //添加用户信息到数据库
        this.addUser(res.userInfo)
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        //回调函数
        success: res => {
          //保存用户信息到全局
          app.globalData.userInfo = res.userInfo
          //在本地更新用户信息
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          //添加用户信息到数据库
          this.addUser(app.globalData.userInfo)
        }
      })
    }
  },
  getUserInfo(e) {
    if (e.detail.userInfo) {
      //在全局变量中更新用户信息
      app.globalData.userInfo = e.detail.userInfo
      //在局部变量中更新用户信息
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      //添加用户信息到数据库
      this.addUser(app.globalData.userInfo)
    }
  },
  // 如果数据库没有此用户，则添加
  async addUser(user) {
    //如果用户没有登陆，就不能执行下面的操作
    if (app.globalData.hasUser) {
      return
    }
    const db = wx.cloud.database()
    //数据库中添加用户信息
    let result = await db.collection('user').add({
      data: {
        nickName: user.nickName,
        folders: []
      }
    })
    //在全局变量中更新用户昵称
    app.globalData.nickName = user.nickName
    //在全局变量中更新用户id
    app.globalData.id = result._id
  }
})