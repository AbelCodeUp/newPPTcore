function PPTMiddleWare(eleid) {
  this.iframe = null;
  this.onFinished = null;
  this.onSlideChanged = null;
  this.onStepChanged = null;
  this.onAction = null;
  this.onVideoChanged = null;
  this.onVideoAction = null;
  this.fileid = null;
  this.VideoActionData = null;
  //判断PPT是否加载完成
  this.isPPTLoadFinish = false;
  //存储动作
  this.saveAction = [];
  this.saveVideoAction = {}; //返回的Video数据
  //监听PPT
  this.Listening();
  this.init(eleid);
  this.skipPage = function(page, step, initiative) {
    var sendData = {
      action: "jumpToAnim",
      data: {
        slide: page,
        step: step,
        timeOffset: undefined,
        autoStart: undefined,
        initiative: initiative //用户被动触发
      }
    };
    this.saveAction[0] = sendData;
    this.SendMessage(sendData);
  };
}

PPTMiddleWare.prototype.SendMessage = function(data) {
  let that = this;
  if (that.isPPTLoadFinish && that.fileid > 0) {
    //只有加载PPT完成后才可以发送信息
    var source = "tk_dynamicPPT";
    var sendData = {
      source: source,
      data: data
    };
    sendData = JSON.stringify(sendData);
    window.frames[0].postMessage(sendData, "*");
  }
};

PPTMiddleWare.prototype.FormatData = function(data) {
  var that = this;
  var data = data || {};
  for (var obj in data) {
    if (data.hasOwnProperty(obj)) {
      data.fileid = that.fileid;
      if (obj == "action") {
        delete data[obj];
      }
      if (obj == "slide") {
        data[obj] = data[obj] + 1;
      }
    }
  }
  return data;
};

PPTMiddleWare.prototype.Listening = function() {
  var that = this;
  window.addEventListener(
    "message",
    function(e) {
      if (e.source == window) {
        return;
      }
      var data = JSON.parse(e.data);
      if (data.source == "tk_dynamicPPT") {
        switch (data.data.action) {
          case "initEvent": //ppt加载完成
            that.isPPTLoadFinish = true;
            if (
              that.onFinished == null ||
              typeof that.onFinished != "function"
            ) {
              return;
            }
            that.onFinished(that.FormatData(data.data));
            that.loadAction();
            break;
          case "slideChangeEvent":
            if (
              that.onFinished == null ||
              typeof that.onFinished != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              that.onSlideChanged(that.FormatData(data.data));
            }
            break;
          case "stepChangeEvent":
            if (
              that.onFinished == null ||
              typeof that.onFinished != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              that.onStepChanged(that.FormatData(data.data));
            }
            break;
          case "clickNewpptTriggerEvent":
            if (
              that.onFinished == null ||
              typeof that.onFinished != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              that.onAction(that.FormatData(data.data));
            }
            break;
          case "startPlayVideoEvent":
            if (
              that.onVideoChanged == null ||
              typeof that.onVideoChanged != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              that.onVideoChanged(that.FormatData(data.data));
            }
            break;
          case "clickNewpptVideoEvent":
            if (
              that.onVideoAction == null ||
              typeof that.onVideoAction != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              that.onVideoAction(that.FormatData(data.data));
            }
            break;
          case "getVideoData":
            if (
              that.VideoActionData == null ||
              typeof that.VideoActionData != "function"
            ) {
              //获取video数据
              return;
            }
            data.data.action = "clickNewpptVideoEvent";
            that.VideoActionData(that.FormatData(data.data));
            break;
          default:
        }
      }
    },
    false
  );
};
PPTMiddleWare.prototype.init = function(eleid) {
  var that = this;
  var box =
    eleid == undefined || eleid == ""
      ? document.body
      : document.getElementById(eleid);
  try {
    this.iframe = document.createElement(
      '<iframe name="h5FileFrame" allow="autoplay" scrolling="no" allowfullscreen ></iframe>'
    );
  } catch (e) {
    this.iframe = document.createElement("iframe");
    this.iframe.allow = "autoplay";
    this.iframe.allowfullscreen = true;
    this.iframe.scrolling = "no";
    this.iframe.width = "100%";
    this.iframe.height = "100%";
    this.iframe.name = "h5FileFrame";
  }
  box.appendChild(this.iframe);
};
PPTMiddleWare.prototype.onOpenPPT = function(url, fileid) {
  if (fileid == "" || fileid == undefined) {
    console.error(
      "talkcloud warning:ppt fileid is undefined or An empty string"
    );
  }

  var url = url;
  this.fileid = fileid;
  this.iframe.src =
    url +
    (url.indexOf("?") >= 0
      ? "&fileid=" + this.fileid
      : "?fileid=" + this.fileid);
};

PPTMiddleWare.prototype.loadAction = function() {
  var that = this;
  //PPT加载完成后执行
  var saveAction = this.saveAction;
  for (var i = 0; i < saveAction.length; i++) {
    var data = saveAction[i];
    switch (data.action) {
      case "jumpToAnim":
        this.SendMessage(data);
        break;
      case "startPlayVideoEvent":
        setTimeout(function() {
          that.SendMessage(data);
        }, 500);

        break;
      default:
    }
  }
};

PPTMiddleWare.prototype.nextPage = function() {
  var that = this;
  var sendData = {
    action: "gotoNextSlide"
  };
  this.SendMessage(sendData);
};
PPTMiddleWare.prototype.prevPage = function() {
  var that = this;
  var sendData = {
    action: "gotoPreviousSlide"
  };
  this.SendMessage(sendData);
};
PPTMiddleWare.prototype.nextStep = function() {
  var that = this;
  var sendData = {
    action: "gotoNextStep"
  };
  this.SendMessage(sendData);
};
PPTMiddleWare.prototype.prevStep = function() {
  var that = this;
  var sendData = {
    action: "gotoPreviousStep"
  };
  this.SendMessage(sendData);
};
PPTMiddleWare.prototype.initiativeSkipPage = function(page, step) {
  var that = this;
  var step = step || 0;
  that.skipPage(page, step, true);
};
PPTMiddleWare.prototype.passiveSkipPage = function(page, step) {
  var that = this;
  var step = step || 0;
  that.skipPage(page, step, false);
};
//执行动作
PPTMiddleWare.prototype.tiggerAction = function(action) {
  var that = this;
  var sendData = {
    action: "clickNewpptTriggerEvent",
    slide: action.slide,
    step: action.step,
    triggerElementId: action.triggerElementId,
    externalData: action.externalData
  };
  that.saveAction.push(sendData);
  this.SendMessage(sendData);
};
//VIDEO动作 播放 暂停
PPTMiddleWare.prototype.videoAction  = function(action) {
  var that = this;
  var sendData = {
    action:'startPlayVideoEvent',
    videoStatus: action.videoStatus,
    externalData:action.externalData
  };
  that.saveAction.push(sendData);
  console.error(sendData,666)
  that.SendMessage(sendData);
};
//VIDEO动作 进度
PPTMiddleWare.prototype.tiggerVideoAction = function(action) {
  console.error('tiggerVideoAction',action);
  var that = this;
  var sendData = {
      action: "clickNewpptVideoEvent",
      currentTime:action.currentTime,
      duration:action.duration,
      externalData: action.externalData
  };
  if (!sendData.externalData.initiative) {
    setTimeout(function() {
      that.SendMessage(sendData);
    }, 1500);
  } else {
    that.SendMessage(sendData);
  }
};
//获取当前PPT的进度
PPTMiddleWare.prototype.getVideoAction = function() {
  var that = this;
  var sendData = {
    action: "getVideoData"
  };
  that.SendMessage(sendData);
};