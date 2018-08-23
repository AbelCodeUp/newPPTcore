function PPTMiddleWare(eleid) {
  this.eleid = eleid;
  this.iframe = null;
  this.onFinished = null;
  this.onSlideChanged = null;
  this.onStepChanged = null;
  this.onAction = null;
  this.onVideoChanged = null;
  this.onVideoAction = null;
  this.onMouseLocation = null;
  this.fileid = null;
  this.isVideoPlayer = false;
  this.isShowVideo = false;
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
              that.onSlideChanged == null ||
              typeof that.onSlideChanged != "function"
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
              that.onStepChanged == null ||
              typeof that.onStepChanged != "function"
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
              that.onAction == null ||
              typeof that.onAction != "function"
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
              that.onAction == null ||
              typeof that.onAction != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              that.isVideoPlayer = true;
              //是否主动触发
              that.onAction(that.FormatData(data.data));
            }
            break;
          case "clickNewpptVideoEvent":
            if (
              that.onAction == null ||
              typeof that.onAction != "function"
            ) {
              return;
            }
            if (data.data.externalData && data.data.externalData.initiative) {
              //是否主动触发
              // that.onVideoAction(that.FormatData(data.data));
              that.onAction(that.FormatData(data.data));
            }
            break;
          case "allVideoAndAudio":
            that.isVideoPlayer = true;
            break;
          case "getVideoData":
            if (
              that.onAction == null ||
              typeof that.onAction != "function"
            ) {
              //获取video数据
              return;
            }
            data.data.action = "clickNewpptVideoEvent";

            that.onAction(that.FormatData(data.data));

            break;
          case "MouseLocation":
            if (
              that.onMouseLocation == null ||
              typeof that.onMouseLocation != "function"
            ) {
              return;
            }
            that.onMouseLocation(data.data);

            break;
          case "againReconnect":
            var ifameDiv = document.getElementById(that.eleid);
            ifameDiv.style.position = 'relative'
            var iW = ifameDiv.offsetWidth;
            var iH = ifameDiv.offsetHeight;
            var oDiv = document.createElement('div');
            oDiv.id = 'againConnect';
            oDiv.style = 'width:'+ iW +'px;height:'+ iH +'px;position:absolute;background:rgba(0,0,0,0.4);top:0;left:0;right:0;bottom:0;';
            var imgDiv = document.createElement('div');
            imgDiv.style = 'position:absolute;top:50%;left:50%;width:500px;height:200px;margin-top:-100px;margin-left:-250px;cursor:pointer;';
            var srcArray = [
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ0AAABPCAMAAAAHgOgAAAAAZlBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+Vn2moAAAAIXRSTlMAD2Qj7kOrmDJ2Vdw7iLsIFeWzHJ7MjvbES1pu06UrfIJVI8N7AAAFsklEQVR42u3daXeaUBAG4LvCZZV9URTm///JzgBtTRtPTNvoTTPPF96TEy1hHATEjniIgyx0TUsbx7FSJ4W5yLowDM9Bh1nn+dCigHKSJKUxZsCcmh7ImgF+yzllswko42MnfJ6Oco6CIIgwX8Kwy9ARc60QrkaKWTrntNb1QXwBstbOWgpLFjZBlVeYawOrkjJsEqrCnifaejeyu67IG7nCPL4jUzWPez6vuTemTBKqrKW6nsNQ0fpEJ6rmeMFcaF1IKT4LG6toCc9nqkgPK0MZflakwGWPf/ZAmV7M2DER/Q791eoY27WnbOqQpqx1Lcla7zte1XK3PVZf9ucpLBq3HqmxXyMUU8Xx329wNU6YLfYZtWr4W6U2DWa15/Aqd/Q7UztQEamCLoroTxn1+hJ9av3U3DXVkBjKsNsy1qDNA9pKM65tPFon0Kd5rR2kpOagatptF0yVTTMs517NeN3pbtWJgLzM2Y9sTEQVzOnFmC30PNpa53QtP2AvatUcBkPZS8wGNpSroOnmkxoF+hI775/kxaVURLdWMKO30EphVlQ/tGCeYTNjXq5yVIXq8tcr4MYorGpMCWw05mWJ1JjqT9MSTyELufZLfFQqmi31UZW3LbYe9WADqOys+HNNCasUc9dkpzjVX6w9PoyO56AE6Is/eewyUYueoZ+q7jRyk3wMt9BbVlG/70HVfrBSF4J9uK7v7t/ORQPQN5Z3YY8SApRK3KmCvuOeeaRLDjDU4i660oI9VlyCGQXzVBH0TrwlCwV7Di3eEgE4wZ7m6MRtFkAJ9jRpb1JxS11CJtjzHM7Q29uH0rlgTxXeLM8RDJ/mPFsHfSpeowy/6TxfCEaL13Dn+KCq+Jqzvw7iF5/qw+WvSJozX5T2hWxS8YLio2l/zDC9bJUW+BKpNw4TLOKKg1Iwb6TQ1y+OsjvB/NFAI34q+dq0V3QP+uridCKYT653ZpfmJJhPLh3fPsAY+w/JfTl0fBXHOwlIPhX11gROEAWNYL4JQAkS8p04HjrtPTNAKphvNBhJyxL4zMdDAWS0MMAfjHroAr2m6hjBPNQk/I7jL8lnoYz9hZoP2fxU5zkdUdeCeagAI0TC5zueAhCi5ZsKPAXAV3K8dYBeiIrvNPSTBEMXdGLBPFRDKUTDnyD4SZtJiGjgPRtjjLGHGLVA+szfQPCQBJC4cNDzlTb/xDAIEkAlmG9yOAlSGz7l8Y4DI7d0hN4K5pUBMrHLoOcL1V6JoJTiu7Diewy8oie7py84w8B/vxakSPgLil7Q4eG1XR0kR8Ge7JD10InfjQnW58T37T5TnRmAcyFeoyYAw+V5ngYAcidusVVFFeQ5CA93kOvYlnN6x9G2qU4XwR7loqp+nR1ZiLepFlAZ8CnqA8jTuQQUiLsVxyYBoOpks7Kp5v819J+Tbjx1tKRGaOL3bmGtaHd4PZsyD85hNkdH+rnTmr/E8H5Sp7TVwskAqTFnSv9532U0vrK8MbO1H6iM+Ta48UQVVHFMoxv59t+drC+pjakKSz6V/T5HbwAwUxVGhfhnDjZWKlq6GbNrk8SYt6fo0vjbM2ZHc2CbbfqtjrZZxm7t74vGLvz0bXiQtb64tMBoo3mdVGwxN7AZMQcU+rKl6qSuEB/vINeq2ZjqdsSsmyDI87ZtMNt3zjiODUq+zzJG+wzWNMxINK67W7JVtrYkdTXmwulVsa4UeXfFrx9W4FM5VGxjXGN0dLQqUbRkWRdazGodzp2sF1hC2CiqyItsymmogrUi1vk2UFvKet1iBQ01pu2KWXfbLOOZqtBOCXXhy1nGt7Pac3hX/n2KLrn+0Y087znCnN2RO5oVPbXDSKubLTSp2Nb/2dVlibTeq4n2Se5aRSQb1z5CzTZdeszJ0EaY4zZZLVQds1neV52T2dDTKXyqFqmtRwJ0tphtls24KsphvqzDufVHjsX9BkHkjIsiCZjyAAAAAElFTkSuQmCC',

              'data:image/png;base64,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',
            ];
            for (var i = srcArray.length - 1; i >= 0; i--) {
              var _src = srcArray[i];
              var img = document.createElement('img');
              img.src = _src;
              img.style = 'display:block;z-index:1;';
              imgDiv.appendChild(img);
            }

            imgDiv.onclick = function(){
              //发送播放test.mp3
              var sendData = {
                action:'userTriggerAudio',
              };
              that.SendMessage(sendData);

              setTimeout(function(){
                ifameDiv.removeChild(oDiv);
                window.onresize = null;
              },200)

            }

            var oSpan = document.createElement('p');
            oSpan.style = 'color:#fff;width:100%;position:absolute;bottom:50px;left:160px;font-family:微软雅黑';
            oSpan.innerHTML = '加载有点慢......<br />点此继续';

            imgDiv.appendChild(oSpan);
            oDiv.appendChild(imgDiv);
            ifameDiv.appendChild(oDiv);

            window.onresize = function(){
              var iW = ifameDiv.offsetWidth;
              var iH = ifameDiv.offsetHeight;
              oDiv.style.width = iW + 'px';
              oDiv.style.height = iH + 'px';
            }

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
    // this.iframe.allow = "autoplay";
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
        that.starTimer = setInterval(function(){
          if(that.isVideoPlayer){
            that.SendMessage(data);
            clearInterval(that.starTimer);
          }
        },200)
        break;
      default:
    }
  }
};

PPTMiddleWare.prototype.setCursor = function( iconUrl, offsetX, offsetY ){
  var sendData = {
    action:'setCursor',
    iconUrl:iconUrl,
    offsetX:offsetX,
    offsetY:offsetY,
  }
  this.SendMessage(sendData);
}
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
  var sendData = action;
  if(action.action === 'clickNewpptVideoEvent'){
    if (!action.externalData.initiative) {
      that.timer = setInterval(function(){
        if(that.isVideoPlayer){
          that.SendMessage(sendData);
          clearInterval(that.timer);
        }
      },200);
    } else {
      that.SendMessage(sendData);
    };
  }else{

    that.saveAction.push(sendData);
    this.SendMessage(sendData);
  }

};
// 暂不用
//VIDEO动作 播放 暂停
PPTMiddleWare.prototype.videoAction  = function(action) {
  var that = this;
  var sendData = {
    action:'startPlayVideoEvent',
    videoStatus: action.videoStatus,
    externalData:{
      initiative:false
    }
  };
  that.saveAction.push(sendData);
  that.SendMessage(sendData);
};
// 暂不用
//VIDEO动作 进度
PPTMiddleWare.prototype.tiggerVideoAction = function(action) {
  var that = this;
  var sendData = {
      action: "clickNewpptVideoEvent",
      currentTime:action.currentTime,
      duration:action.duration,
      externalData:{
        initiative:false
      }
  };
  // that.SendMessage(sendData);

};
// 暂不用
//获取当前PPT的进度
PPTMiddleWare.prototype.getVideoAction = function() {
  var that = this;
  var sendData = {
    action: "getVideoData"
  };
  that.SendMessage(sendData);
};
