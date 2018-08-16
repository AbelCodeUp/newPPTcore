var LogDevelopment = {
    error:function(){
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        console.error.apply(console, args);
    } ,
    info:function(){
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];TkAppListDumb
        }
        console.info.apply(console, args);
    } ,
    warn:function(){
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        console.warn.apply(console, args);
    } ,
    log:function(){
        if(!window.dynamicPptDebug){
            return ;
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        console.log.apply(console, args);
    } ,
    trace:function(){
        if(!window.dynamicPptDebug){
            return ;
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        console.trace.apply(console, args);
    } ,
    debug:function(){
        if(!window.dynamicPptDebug){
            return ;
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        console.debug.apply(console, args);
    }
};
window.dynamicPptLog = LogDevelopment ;
window.onload = function(){
    var divsupernatant = document.createElement('div');
    divsupernatant.className = 'ppt-supernatant' ;
    divsupernatant.id = 'ppt_supernatant';
    document.body.appendChild(divsupernatant);
    var pptSupernatant = document.getElementById('ppt_supernatant');
    window.GLOBAL = window.GLOBAL || {} ;
    window.isPlayFalg = true; //控制播放一次
    window.GLOBAL.saveVideoSrc = []; //存储每页PPTvideo数据
    window.GLOBAL.saveAudioSrc = []; //存储每页PPTaudio数据
    window.GLOBAL.browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || navigator.language).toLowerCase()
    };
    window.GLOBAL.isMobile = function(){
        var browser = window.GLOBAL.browser;
        return (browser.versions.mobile || browser.versions.ios || browser.versions.android || browser.versions.iPhone || browser.versions.iPad);
    };

    function loadStyle(url){
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(link);
    }
     loadStyle('../../Public/css/newppt.css?ts=2018081012');

    window.GLOBAL.onPlayerInit = function(player) {
        window.GLOBAL.newpptPresentationConnector = {};
        window.GLOBAL.NewPptAynamicPPT = function (options) {
            var that = this;
            this.options = options || {};
            this.isResized = false;
            this.isOpenPptFile = false;
            that.sendMessagePermission = false;
            window.GLOBAL.newPptAynamicThat = {
                that: that
            };
            this.aynamicPptData = {
                old: {
                    slide: null,
                    step: null,
                    fileid: null
                },
                now: {
                    slide: null,
                    step: null,
                    fileid: null
                }
            };

            this.recvAynamicPptData = {
                slide: null,
                step: null,
                fileid: null
            };
            this.recvCount = 0;
            that.newDopPresentation(options);
        };


        window.GLOBAL.NewPptAynamicPPT.prototype = {
            constructor: window.GLOBAL.NewPptAynamicPPT,
            newDopPresentation: function (options, loadUrl) { //初始化PPT对象
                var that = window.GLOBAL.newPptAynamicThat.that;
                that.options = options || that.options;
                that.playbackController = null;
                that.slidesCount = null;
                that.isPlayedPresentation = null;
                that.view = null;
                that.presentation = null;
                that.needUpdateSlideAndStep = false;
                that.isOpenPptFile = true;
                window.GLOBAL.newpptPresentationConnector.register = function (player, newppt) {
                    try {
                        dynamicPptLog.log("receive player and newppt:", player, newppt);
                        that.presentation = player.presentation();
                        that.slidesCount = that.presentation.slides().count();
                        that.view = player.view();
                        that.viewData = {
                            width: that.view.width(),
                            height: that.view.height(),
                        };
                        //that.playbackController = that.view.playbackController();
                        that.playbackController = that.view.restrictedPlaybackController();
                        that.slideTransitionController = that.playbackController.slideTransitionController();
                        initPlaybackControllerEventsHandlers();
                        _findAllVideoAndAudioRedefinePlay(true);

                    } catch (e) {
                        dynamicPptLog.error("register error:", e);

                    }
                };
                that.clearOldSlideInfo = function () {
                    pauseAutoPlayNoSend();
                };
                that.closeDynamicPptAutoVideo = function () {
                    pauseAutoPlayNoSend();
                };
                that.classBeginCheckAutoPlay = function (pptslide, externalData) {
                    if (window.GLOBAL.role == 0 && window.GLOBAL.classbegin) { //如果是老师，并且上课了
                        if (pptslide === undefined) {

                            var ts = that.playbackController.clock().timestamp();
                            var slideIndex = ts.slideIndex();
                            pptslide = slideIndex;
                        }
                        externalData = externalData || {initiative: true};
                        pauseAutoPlayNoSend();
                        sendAutoPlayToParentIframe(pptslide, externalData);
                    }
                };

                function _findParentNodeVideo_player($vd, isShow) {
                    if ($vd) {
                        var parNode = $vd.parentNode;
                        for (var i = 0; i < 200; i++) {
                            var rq = /(poster|video_player|video_player poster_frame)/g;
                            if (parNode && rq.test(parNode.className)) {
                                parNode.style.display = isShow ? '' : 'none';
                                parNode = parNode.parentNode;
                            } else {
                                break;
                            }
                        }
                    }
                }

                function playAutoPlayNoSend(pptslide, oldSlideIndex) { //直接播放动态ppt视频,不发送数据
                    var browser = window.GLOBAL.browser;

                    if (browser.versions.mobile || browser.versions.ios || browser.versions.android || browser.versions.iPhone || browser.versions.iPad) { //移动端
                        if (browser.versions.ios && window.GLOBAL.deviceType != undefined && parseInt(window.GLOBAL.deviceType) == 0) { //是ios,并且是手机 ， 则直接跳转到下一页或者上一页
                            var autoStart = true;
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                            if (oldSlideIndex != undefined) {
                                if (pptslide >= oldSlideIndex) {
                                    window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextSlide(autoStart, externalData);
                                } else if (pptslide < oldSlideIndex) {
                                    window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
                                }
                            } else {
                                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextSlide(autoStart, externalData);
                            }
                        } else {
                            var $video = that.view.displayObject().querySelectorAll("video");
                            if ($video && $video.length > 0) {
                                for (var i = 0; i < $video.length; i++) {
                                    var $vd = $video[i];
                                    if ($vd) {
                                        $vd.style.display = "";
                                        $vd.volume = parseFloat(window.GLOBAL.PptVolumeValue);
                                        $vd.load();
                                        $vd.play();
                                        _findParentNodeVideo_player($vd, true);
                                    }
                                }
                            }
                        }
                    } else {
                        var $playEle = that.view.displayObject().querySelectorAll(".controls .component_container.play .component_base.play");
                        if ($playEle && $playEle.length > 0) {
                            var $video = that.view.displayObject().querySelectorAll("video");
                            if ($video && $video.length > 0) {
                                for (var i = 0; i < $video.length; i++) {
                                    var $vd = $video[i];
                                    if ($vd) {
                                        $vd.style.display = "";
                                        $vd.volume = parseFloat(window.GLOBAL.PptVolumeValue);
                                        $vd.load();
                                        _findParentNodeVideo_player($vd, true);
                                    }
                                }
                            }
                            for (var i = 0; i < $playEle.length; i++) {
                                var $ele = $playEle[i];
                                if ($ele && $ele.getAttribute("aria-pressed") == "false") {
                                    window.GLOBAL.fireEvent($ele, "click");
                                }
                            }
                        } else {
                            var $video = that.view.displayObject().querySelectorAll("video");
                            if ($video && $video.length > 0) {
                                for (var i = 0; i < $video.length; i++) {
                                    var $vd = $video[i];
                                    if ($vd) {
                                        $vd.style.display = "";
                                        $vd.volume = parseFloat(window.GLOBAL.PptVolumeValue);
                                        $vd.load();
                                        $vd.play();
                                        _findParentNodeVideo_player($vd, true);
                                    }
                                }
                                ;
                            }
                        }
                    }
                };

                function pauseAutoPlayNoSend() { //暂停动态PPT的video,不发送数据
                    var $video = that.view.displayObject().querySelectorAll("video");
                    if ($video && $video.length > 0) {
                        for (var i = 0; i < $video.length; i++) {
                            var $vd = $video[i];
                            if ($vd) {
                                if(!window.GLOBAL.isControl){
                                  $vd.style.display = "none";
                                  $vd.removeAttribute("autoplay");
                                  $vd.removeAttribute("preload");
                                  $vd.load();
                                  $vd.pause();
                                  $vd.volume = 0;
                                  _findParentNodeVideo_player($vd);
                                }

                            }
                        }
                        ;
                    }
                };

                function sendAutoPlayToParentIframe(pptslide, externalData) {
                    var $video = that.view.displayObject().querySelectorAll("video");
                    if ($video.length > 0) {
                        var $vd = $video[$video.length - 1];
                        if ($vd) {
                            $vd.style.display = "none"
                            $vd.removeAttribute("autoplay");
                            $vd.removeAttribute("preload");
                            $vd.load();
                            $vd.pause();
                            $vd.volume = 0;
                            var noticeParentIFramePlayVideo = true, noticeParentIFrameData = {
                                pptslide: pptslide,
                                externalData: externalData,
                            };
                            $vd.play(noticeParentIFramePlayVideo, noticeParentIFrameData);
                            _findParentNodeVideo_player($vd);
                        }
                    }
                };

                function videoAutoPlay(pptslide, externalData, oldSlideIndex) {
                    if (!window.GLOBAL.notPlayAV) {
                        if (window.GLOBAL.versions && window.GLOBAL.versions >= 2017082901) { //react重构版
                            if (window.GLOBAL.playback) { //回放直接播放动态PPT视频
                                pauseAutoPlayNoSend(pptslide, externalData, oldSlideIndex);
                            } else {
                                try {
                                    var $video = that.view.displayObject().querySelectorAll("video");
                                    if ($video && $video.length > 0) {
                                        if (window.GLOBAL.classbegin) { //上课了
                                            //2017091401：动态ppt同步版本 ， 2017082901：动态ppt非同步版本
                                            if ((window.GLOBAL.versions >= 2017091401 && externalData && externalData.initiative && window.GLOBAL.publishDynamicPptMediaPermission_video) ||
                                                (window.GLOBAL.versions >= 2017082901 && window.GLOBAL.versions < 2017091401 && window.GLOBAL.role == 0)) { //主动的操作，并且拥有发布流的权限
                                                sendAutoPlayToParentIframe(pptslide, externalData);
                                            } else {
                                                if (!(externalData && externalData.initiative)) { //非主动的操作
                                                    pauseAutoPlayNoSend(pptslide, externalData, oldSlideIndex);
                                                } else {
                                                    playAutoPlayNoSend(pptslide, oldSlideIndex);
                                                }
                                            }
                                        } else { //没上课
                                            playAutoPlayNoSend(pptslide, oldSlideIndex);
                                        }
                                    }
                                } catch (e5) {
                                    dynamicPptLog.error("视频播放错误:", e5);
                                    return undefined;
                                }
                            }
                        } else if (window.GLOBAL.isLoadPageController) {
                            playAutoPlayNoSend(pptslide, oldSlideIndex);
                        }
                    }
                };
                //bxk gotoslide
                function resetGotoSlide () {
                  var displayObject = that.view.displayObject();
                  setTimeout(function () {
                      var aElementList = that.view.displayObject().querySelectorAll("a");
                      if (aElementList && aElementList.length > 0) {
                          for (var i = 0; i < aElementList.length; i++) {
                              var aElement = aElementList[i];
                              if (aElement && aElement.href && !aElement.attributes['title']) {
                                var aEle = aElement.onclick.toString();

                                var idReg = /\'[\w]+\'/;
                                var _aELeID = aEle.match(idReg)[0];
                                var aEleId = _aELeID.substring(1,_aELeID.length-1);
                                var slideReg = /gotoSlide\(\d\)/;
                                var pptSlide = aEle.match(slideReg)[0].match(/\d/)[0];

                                aElement.onclick = null;
                                aElement.onclick = function(ev){
                                  _clickSlide( aEleId, pptSlide )
                                  return false;
                                }
                              }
                          }
                      }
                  }, 250);
                }

                function _clickSlide( aEleId, pptslide ){
                  var extendedData = {
                    initiative: true
                  }
                  if(aEleId){
                    document.getElementById(aEleId).getCore().processTriggerEffect(this);
                    console.error(document.getElementById(aEleId).getCore().gotoSlide);
                    document.getElementById(aEleId).getCore().gotoSlide( pptslide, extendedData);
                  }

                  return false;
                }

                //点击LICK跳转PPT
                function _clickLink() {
                    var displayObject = that.view.displayObject();
                    setTimeout(function () {
                        var aElementList = that.view.displayObject().querySelectorAll("a");
                        if (aElementList && aElementList.length > 0) {
                            for (var i = 0; i < aElementList.length; i++) {
                                var aElement = aElementList[i];
                                if (aElement && aElement.href && aElement.href !== "#") {
                                    window._aElementClickHandler = window._aElementClickHandler || function (e) {
                                        var currentTarget = e.currentTarget;
                                        if (currentTarget && currentTarget.href && currentTarget.href !== "#") {
                                            var data = {
                                                action: "clickLink",
                                                href: decodeURIComponent(currentTarget.href),
                                                fileid: window.GLOBAL.fileid,
                                                externalData: {initiative: true}
                                            };
                                            that.postMessageToParent(data);
                                            e.stopPropagation();
                                            e.preventDefault();
                                            return false;
                                        }
                                    };
                                    window.GLOBAL.removeEvents(aElement, 'click', window._aElementClickHandler);
                                    window.GLOBAL.addEvents(aElement, 'click', window._aElementClickHandler);
                                }
                            }
                        }
                    }, 250);
                }

                function initPlaybackControllerEventsHandlers() {
                    try {
                        if (that.playbackController && that.playbackController.slideChangeEvent) {
                            that.playbackController.slideChangeEvent().removeHandler(function (slideIndex) {
                            });
                            console.error(that.playbackController.slideChangeEvent());
                            that.playbackController.slideChangeEvent().addHandler(function (slideIndex, externalData) {
                                console.error('argument--->>>>',arguments[1]);
                                console.error('slideIndex--->>>',slideIndex,'externalData----->>>',externalData);
                                window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray = [];
                                window.dynamicPptLog.log("ChangeEvent slideChangeEvent slideIndex and externalData:", slideIndex, externalData);
                                console.error('ChangeEventChangeEventChangeEvent');
                                // bxk-->> _goslide
                                resetGotoSlide();
                                // _clickLink();
                                if (that.isOpenPptFile) {
                                    var ts = that.playbackController.clock().timestamp();
                                    var stepIndex = ts.stepIndex();
                                    var oldSlideIndex = that.nowSlideIndex;
                                    that.nowSlideIndex = slideIndex;
                                    stepIndex = (stepIndex >= 0 ? stepIndex : 0);
                                    var stepTotal = null;
                                    if (that.playbackController && that.playbackController.currentSlide) {
                                        try {
                                            var iSlide = that.playbackController.currentSlide();
                                            if (iSlide && iSlide.animationSteps) {
                                                var iAnimationSteps = iSlide.animationSteps();
                                                if (iSlide && iSlide.animationSteps) {
                                                    stepTotal = iAnimationSteps.count();
                                                }
                                            }

                                        } catch (e) {
                                            dynamicPptLog.error("that.playbackController.currentSlide error:", e);
                                        }
                                    }
                                    if (!that.isLoadFinshed) {
                                        that.isLoadFinshed = true;
                                        var data = {
                                            action: "initEvent",
                                            view: that.viewData,
                                            slidesCount: that.slidesCount,
                                            slide: slideIndex,
                                            step: stepIndex,
                                            stepTotal: stepTotal,
                                            externalData: externalData
                                        };
                                        that.postMessageToParent(data);
                                        that.videoPlayPPTTimerNum = 0;
                                        clearInterval(that.videoPlayPPTTimer);
                                        _findAllVideoAndAudioRedefinePlay();
                                        that.videoPlayPPTTimer = setInterval(function () {
                                            that.videoPlayPPTTimerNum++;
                                            var playbackState = that.playbackController.playbackState();
                                            dynamicPptLog.log("slide setInterval  videoPlayPPTTimerNum 、 playbackState、slideTransitionControllerState:", that.videoPlayPPTTimerNum, playbackState, that.slideTransitionController.state());
                                            if (/(playingSlide|pausedSlide|suspended)/g.test(playbackState) && that.slideTransitionController.state() !== 'playing') {
                                                _findAllVideoAndAudioRedefinePlay();
                                                videoAutoPlay(slideIndex, externalData, oldSlideIndex);
                                                _findAllAudioAndVideoSetVolumeAndMute();
                                                clearInterval(that.videoPlayPPTTimer);
                                                that.videoPlayPPTTimerNum = 0;
                                            } else if (that.videoPlayPPTTimerNum > 30) {
                                                clearInterval(that.videoPlayPPTTimer);
                                                that.videoPlayPPTTimerNum = 0;
                                            }
                                        }, 300);
                                        setTimeout(function () {
                                            window.GLOBAL.fireEvent(window, 'resize');
                                        }, 100);
                                    } else {
                                        if (that.isLoadFinshed) {

                                            //that.OnSlideChangeTimer = that.OnSlideChangeTimer || null;
                                            //clearTimeout(that.OnSlideChangeTimer);
                                            //that.OnSlideChangeTimer = setTimeout(function () {
                                            try {
                                                var data = {
                                                    action: "slideChangeEvent",
                                                    slide: slideIndex,
                                                    step: stepIndex,
                                                    stepTotal: stepTotal,
                                                    externalData: externalData
                                                };

                                                if (that.aynamicPptData.now.slide != slideIndex || that.aynamicPptData.now.step != stepIndex) {
                                                    that.postMessageToParent(data);
                                                }
                                                that.videoPlayPPTTimerNum = 0;
                                                /*
                                                 var $video = that.view.displayObject().querySelectorAll("video") ;
                                                 if( $video && $video.length>0){
                                                 for(var i=0 ; i<$video.length ; i++){
                                                 var $vd = $video[i];
                                                 $vd.removeAttribute("autoplay");
                                                 $vd.removeAttribute("preload");
                                                 //$vd.load();
                                                 $vd.pause();
                                                 }
                                                 }*/
                                                clearInterval(that.videoPlayPPTTimer);
                                                _findAllVideoAndAudioRedefinePlay();
                                                that.videoPlayPPTTimer = setInterval(function () {
                                                    that.videoPlayPPTTimerNum++;
                                                    var playbackState = that.playbackController.playbackState();
                                                    dynamicPptLog.log("slide setInterval  videoPlayPPTTimerNum 、 playbackState、slideTransitionControllerState:", that.videoPlayPPTTimerNum, playbackState, that.slideTransitionController.state());
                                                    if (/(playingSlide|pausedSlide|suspended)/g.test(playbackState) && that.slideTransitionController.state() !== 'playing') {
                                                        _findAllVideoAndAudioRedefinePlay();
                                                        videoAutoPlay(slideIndex, externalData, oldSlideIndex);
                                                        _findAllAudioAndVideoSetVolumeAndMute();
                                                        clearInterval(that.videoPlayPPTTimer);
                                                        that.videoPlayPPTTimerNum = 0;
                                                    } else if (that.videoPlayPPTTimerNum > 30) {
                                                        clearInterval(that.videoPlayPPTTimer);
                                                        that.videoPlayPPTTimerNum = 0;
                                                    }
                                                }, 300);
                                            } catch (e) {
                                                dynamicPptLog.error("OnSlideChange", e);
                                            }
                                            //}, 150);
                                        }
                                    }
                                    that.aynamicPptData.now.slide = slideIndex;
                                    that.aynamicPptData.now.step = (stepIndex >= 0 ? stepIndex : 0);
                                }
                                that.canJumpToAnim();
                                if (window.GLOBAL.checkCustomControllerButtonState) {
                                    window.GLOBAL.checkCustomControllerButtonState();
                                }
                            });
                        }

                        if (that.playbackController && that.playbackController.stepChangeEvent) {
                            that.playbackController.stepChangeEvent().removeHandler(function (stepIndex) {
                            });
                            that.playbackController.stepChangeEvent().addHandler(function (stepIndex, externalData) {
                                window.dynamicPptLog.log("ChangeEvent stepChangeEvent stepIndex and externalData:", stepIndex, externalData);
                                //_clickLink();

                                if (that.isOpenPptFile) {
                                    var ts = that.playbackController.clock().timestamp();
                                    var slideIndex = ts.slideIndex();
                                    var stepTotal = null;
                                    if (that.playbackController && that.playbackController.currentSlide) {
                                        try {
                                            var iSlide = that.playbackController.currentSlide();
                                            if (iSlide && iSlide.animationSteps) {
                                                var iAnimationSteps = iSlide.animationSteps();
                                                if (iSlide && iSlide.animationSteps) {
                                                    stepTotal = iAnimationSteps.count();
                                                }
                                            }

                                        } catch (e) {
                                            dynamicPptLog.error("that.playbackController.currentSlide error:", e);
                                        }
                                    }
                                    stepIndex = (stepIndex >= 0 ? stepIndex : 0);
                                    that.OnMovToPrvAnimTimer = that.OnMovToPrvAnimTimer || null;
                                    if (that.isLoadFinshed) {
                                        //clearTimeout(that.OnMovToPrvAnimTimer);
                                        //that.OnMovToPrvAnimTimer = setTimeout(function () {
                                        try {
                                            var data = {
                                                action: "stepChangeEvent",
                                                slide: slideIndex,
                                                step: stepIndex,
                                                stepTotal: stepTotal,
                                                externalData: externalData
                                            };

                                            if (that.aynamicPptData.now.slide != slideIndex || that.aynamicPptData.now.step != stepIndex) {
                                                that.postMessageToParent(data);
                                            }
                                        } catch (e) {
                                            dynamicPptLog.error("OnMovToPrvAnim", e);
                                        }
                                        var nowSlideIndex = slideIndex;
                                        if (that.remoteActionDataJson && that.remoteActionDataJson["remoteActionData_" + nowSlideIndex] && that.remoteActionDataJson["remoteActionData_" + nowSlideIndex].length > 0) {
                                            that.remoteActionDataArrHandler(that.remoteActionDataJson["remoteActionData_" + nowSlideIndex]);
                                        }
                                        //}, 150);
                                    }
                                    that.aynamicPptData.now.slide = slideIndex;
                                    that.aynamicPptData.now.step = (stepIndex >= 0 ? stepIndex : 0);
                                }
                                that.canJumpToAnim();
                                if (window.GLOBAL.checkCustomControllerButtonState) {
                                    window.GLOBAL.checkCustomControllerButtonState();
                                }
                            });
                        }


                        if (that.playbackController && that.playbackController.navigationRestrictedEvent) {
                            that.playbackController.navigationRestrictedEvent().addHandler(function (restriction) {
                                window.dynamicPptLog.log(
                                    "Navigation action", restriction.navigationAction(),
                                    "is restricted by", restriction.restrictionSource(),
                                    "for the following reason:", restriction.restrictionReason().type()
                                );
                            });
                        }

                        if (that.playbackController && that.playbackController.playbackCompleteEvent) {
                            that.playbackController.playbackCompleteEvent().addHandler(function (restriction) {
                                window.dynamicPptLog.log("Presentation playback has been completed.");
                                that.canJumpToAnim();
                            });
                        }


                        var clock = that.playbackController.clock();
                        clock.stateChangeEvent().addHandler(function (theClock) {
                            window.dynamicPptLog.log("Clock state has been changed to", theClock.state());
                            that.canJumpToAnim();
                        });

                        clock.stopEvent().addHandler(function (theClock) {
                            var ts = theClock.timestamp();
                            window.dynamicPptLog.log("Clock has been stopped at slide:", ts.slideIndex(), "step:", ts.stepIndex(), "time offset:", ts.timeOffset());
                            that.canJumpToAnim();
                        });

                        clock.bufferStateChangeEvent().addHandler(function (theClock) {
                            window.dynamicPptLog.log("Clock buffering state has been changed to", theClock.buffering());
                            that.canJumpToAnim();
                        });

                        clock.startEvent().addHandler(function (theClock) {
                            var ts = theClock.timestamp();
                            window.dynamicPptLog.log("Clock has been started at slide:", ts.slideIndex(), "step:", ts.stepIndex(), "time offset:", ts.timeOffset());
                            that.canJumpToAnim();
                        });

                        that.playbackController.navigationRestrictedEvent().addHandler(function (restriction) {
                            window.dynamicPptLog.log(
                                "Navigation action", restriction.navigationAction(),
                                "is restricted by", restriction.restrictionSource(),
                                "for the following reason:", restriction.restrictionReason().type()
                            );
                        });

                        that.slideTransitionController.transitionEffectCompleteEvent().addHandler(function (slideIndex) {
                            window.dynamicPptLog.log("Transition to slide #" + slideIndex + " has been completed.");
                            that.canJumpToAnim();
                        });

                        that.slideTransitionController.transitionEffectStartEvent().addHandler(function (slideIndex) {
                            window.dynamicPptLog.log("Transition to slide #" + slideIndex + " has been started.");
                        });

                    } catch (eve) {
                        dynamicPptLog.error("initPlaybackControllerEventsHandlers error:", eve);
                    }

                };
                return that;
            },
            jumpToAnim: function (slide, step, timeOffset, autoStart, externalData) {
                try {
                    var that = window.GLOBAL.newPptAynamicThat.that;
                    that.jumpToAnimData = null;
                    var slideIndex, stepIndex, timeOffset, autoStart;
                    slideIndex = slide - 1;
                    stepIndex = step;
                    slideIndex = slideIndex >= 0 ? slideIndex : 0;
                    stepIndex = stepIndex >= 0 ? stepIndex : 0;
                    timeOffset = timeOffset != undefined ? timeOffset : 0;
                    autoStart = autoStart != undefined ? autoStart : true;
                    var ts = that.playbackController.clock().timestamp();
                    var nowSlideIndex = ts.slideIndex();
                    var nowStepIndex = ts.stepIndex() >= 0 ? ts.stepIndex() : 0;
                    dynamicPptLog.log("nowSlideIndex and nowStepIndex:", nowSlideIndex, nowStepIndex, "\n slideIndex and stepIndex:", slideIndex, stepIndex);
                    if (slideIndex === nowSlideIndex && stepIndex === nowStepIndex) {
                        try {
                            var stepTotal = null;
                            if (that.playbackController && that.playbackController.currentSlide) {
                                try {
                                    var iSlide = that.playbackController.currentSlide();
                                    if (iSlide && iSlide.animationSteps) {
                                        var iAnimationSteps = iSlide.animationSteps();
                                        if (iSlide && iSlide.animationSteps) {
                                            stepTotal = iAnimationSteps.count();
                                        }
                                    }

                                } catch (e1) {
                                    dynamicPptLog.error("that.playbackController.currentSlide error:", e1);
                                }
                            }
                            var data = {
                                action: "slideChangeEvent",
                                slide: slideIndex,
                                step: stepIndex,
                                stepTotal: stepTotal,
                                externalData: externalData
                            };
                            that.postMessageToParent(data);
                            that.aynamicPptData.now.slide = slideIndex;
                            that.aynamicPptData.now.step = (stepIndex >= 0 ? stepIndex : 0);
                        } catch (e) {
                            dynamicPptLog.error("notJumpToAnim error:", e);
                        }
                        return;
                    }
                    if (slide != undefined && step != undefined) {
                        if (nowSlideIndex === slideIndex) {
                            if (stepIndex >= 0 && nowStepIndex >= 0) {
                                if (stepIndex - nowStepIndex === 1) {
                                    dynamicPptLog.log("执行jumpToAnim-->gotoNextStep");
                                    that.playbackController.gotoNextStep(externalData);
                                } else if (nowStepIndex - stepIndex === 1) {
                                    dynamicPptLog.log("执行jumpToAnim-->gotoPreviousStep");
                                    that.playbackController.gotoPreviousStep(externalData);
                                } else {
                                    window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                    that.playbackController.gotoTimestamp(slideIndex, stepIndex, timeOffset, autoStart, externalData);
                                }
                            } else {
                                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                that.playbackController.gotoTimestamp(slideIndex, stepIndex, timeOffset, autoStart, externalData);
                            }
                        } else {
                            if (that.remoteActionDataJson && that.remoteActionDataJson["remoteActionData_" + slideIndex] && that.remoteActionDataJson["remoteActionData_" + slideIndex].length > 0) {
                                that.remoteActionDataJson["remoteActionData_" + slideIndex].length = 0;
                            }
                            if (slideIndex - nowSlideIndex === 1 && stepIndex === 0) {
                                dynamicPptLog.log("执行jumpToAnim-->gotoNextSlide");
                                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                that.playbackController.gotoNextSlide(autoStart, externalData)
                            } else if (nowSlideIndex - slideIndex === 1 && stepIndex === 0) {
                                dynamicPptLog.log("执行jumpToAnim-->gotoPreviousSlide");
                                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                that.playbackController.gotoPreviousSlide(autoStart, externalData)
                            } else {
                                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                that.playbackController.gotoTimestamp(slideIndex, stepIndex, timeOffset, autoStart, externalData);
                            }
                        }
                    } else if (slide != undefined) {
                        window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                        that.playbackController.gotoSlide(slideIndex, autoStart, externalData);
                    } else {
                        dynamicPptLog.error("slide 和 step必须有值");
                    }
                } catch (e) {
                    dynamicPptLog.error("jumpToAnim error:", e);
                }

            },
            canJumpToAnim: function () {
                var that = this;
                var playbackState = that.playbackController.playbackState();
                dynamicPptLog.log("canJumpToAnim 当前状态(playbackState and slideTransitionControllerState )：", playbackState, that.slideTransitionController.state(), that.jumpToAnimData ? JSON.stringify(that.jumpToAnimData) : that.jumpToAnimData);
                if (that.jumpToAnimData && /(playingSlide|pausedSlide|suspended)/g.test(playbackState) && that.slideTransitionController.state() !== 'playing') {
                    that.jumpToAnim(that.jumpToAnimData.slide, that.jumpToAnimData.step, that.jumpToAnimData.timeOffset, that.jumpToAnimData.autoStart, that.jumpToAnimData.externalData);
                }
            },
            postMessageToParent: function (data) {
                if (window.parent && window.parent !== window) {
                    try {
                        var source = "tk_dynamicPPT";
                        var sendData = {
                            source: source,
                            data: data
                        };
                        sendData = JSON.stringify(sendData);
                        //dynamicPptLog.log("iframe Child To TargetOrigin:" , window.GLOBAL.targetOrigin);
                        //window.parent.postMessage( data, window.GLOBAL.targetOrigin);
                        window.parent.postMessage(sendData, "*");
                    } catch (e2) {
                        dynamicPptLog.error("that.postMessageToParent error:", e2);
                    }
                }
            },
            clickNewpptVideoEventHandler:function(data){
              if(window.GLOBAL.isControl){
                var videos = document.getElementsByTagName("video")[0];
                videos.currentTime = data.currentTime;
              }
            },
            clickNewpptTriggerEventHandler: function (data) {
                var that = this;
                var ts = that.playbackController.clock().timestamp();
                var nowSlideIndex = ts.slideIndex();
                that.remoteActionDataJson = that.remoteActionDataJson || {};
                that.remoteActionDataJson["remoteActionData_" + data.slide] = that.remoteActionDataJson["remoteActionData_" + data.slide] || [];
                that.remoteActionDataJson["remoteActionData_" + data.slide].push(data);
                if (true) {
                // if (data.slide === nowSlideIndex) { //TODO  BUG: 页数不一致
                    var remoteActionDataArr = that.remoteActionDataJson["remoteActionData_" + data.slide];
                    that.remoteActionDataArrHandler(remoteActionDataArr);
                }
            },
            remoteActionDataArrHandler: function (remoteActionDataArr) {
                var that = this;
                for (var i = 0; i < remoteActionDataArr.length; i++) {
                    var data = remoteActionDataArr[i];
                    var needTriggerElement = null;
                    needTriggerElement = that.view.displayObject().querySelectorAll("#" + data.triggerElementId);


                    dynamicPptLog.log("clickNewpptTriggerEvent handler element:", data.triggerElementId, needTriggerElement);
                    if (needTriggerElement && needTriggerElement.length > 0) {
                        for (var i = 0; i < needTriggerElement.length; i++) {
                            var element = needTriggerElement[i];
                            if (data.childElementTagName) {
                                element = element.getElementsByTagName(data.childElementTagName)[0];
                            }

                            if (element.nodeName.toLowerCase() === "video") {
                                return;
                            } else if (element.getElementsByTagName("video") && element.getElementsByTagName("video").length > 0) {
                                return;
                            }

                            var event = "click";
                            window.GLOBAL.fireEvent(element, event);
                            var event = "touchstart";
                            window.GLOBAL.fireEvent(element, event);
                            /*var element = needTriggerElement[i],event = "touchmove" ;
                             window.GLOBAL.fireEvent(element,event);*/
                            var event = "touchend";
                            window.GLOBAL.fireEvent(element, event);
                            /*var element = needTriggerElement[i],event = "touchcancel" ;
                             window.GLOBAL.fireEvent(element,event);*/
                        }
                    }
                }
                remoteActionDataArr.length = 0;
            }
        };


        /**
         * @description 事件绑定，兼容各浏览器
         * @param target 事件触发对象
         * @param type   事件
         * @param func   事件处理函数
         */
        window.GLOBAL.addEvents = function (target, type, func) {
            if (target.addEventListener)    //非ie 和ie9
                target.addEventListener(type, func, false);
            else if (target.attachEvent)   //ie6到ie8
                target.attachEvent("on" + type, func);
            else target["on" + type] = func;   //ie5
        };

        /**
         * @description 事件移除，兼容各浏览器
         * @param target 事件触发对象
         * @param type   事件
         * @param func   事件处理函数
         */
        window.GLOBAL.removeEvents = function (target, type, func) {
            if (target.removeEventListener)
                target.removeEventListener(type, func, false);
            else if (target.detachEvent)
                target.detachEvent("on" + type, func);
            else target["on" + type] = null;
        };

        /*触发事件*/
        window.GLOBAL.fireEvent = window.GLOBAL.fireEvent || function (element, event) {
            if (document.createEventObject) {
                // IE浏览器支持fireEvent方法
                var evt = document.createEventObject();
                var externalData = {initiative: false};
                evt.externalData = externalData;
                return element.fireEvent('on' + event, evt)
            }
            else {
                // 其他标准浏览器使用dispatchEvent方法
                var evt = document.createEvent('HTMLEvents');
                // initEvent接受3个参数：
                // 事件类型，是否冒泡，是否阻止浏览器的默认行为
                evt.initEvent(event, true, true);
                var externalData = {initiative: false};
                evt.externalData = externalData;
                return !element.dispatchEvent(evt);
            }
        };

        /*@desc 获取地址栏指定参数*/
        window.GLOBAL.initiativeDataDefault = true; //默认externalData的initiative为true
        window.GLOBAL.externalData = {initiative: window.GLOBAL.initiativeDataDefault}; //动作是否主动触发
        window.GLOBAL.getUrlParams = window.GLOBAL.getUrlParams || function (key) {
            // var urlAdd = decodeURI(window.location.href);
            var urlAdd = decodeURIComponent(window.location.href);
            var urlIndex = urlAdd.indexOf("?");
            var urlSearch = urlAdd.substring(urlIndex + 1);
            var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
            var arr = urlSearch.match(reg);
            if (arr != null) {
                return arr[2];
            } else {
                return "";
            }
            //reg表示匹配出:$+url传参数名字=值+$,并且$可以不存在，这样会返回一个数组
        };
        window.GLOBAL.videoInitiativeData = true;
        //window.GLOBAL.targetOrigin = window.GLOBAL.targetOrigin || ( window.GLOBAL.getUrlParams("remoteProtocol")+"//"+window.GLOBAL.getUrlParams("remoteHost") ) ;
        window.GLOBAL.mClientType = window.GLOBAL.getUrlParams("mClientType");
        window.GLOBAL.deviceType = window.GLOBAL.getUrlParams("deviceType");
        window.GLOBAL.fileid = window.GLOBAL.getUrlParams("fileid");
        window.GLOBAL.fileid = window.GLOBAL.fileid ? Number(window.GLOBAL.fileid) : window.GLOBAL.fileid;
        window.GLOBAL.playback = window.GLOBAL.getUrlParams("playback") == "true" || window.GLOBAL.getUrlParams("playback") == true;
        window.GLOBAL.classbegin = window.GLOBAL.getUrlParams("classbegin") == "true" || window.GLOBAL.getUrlParams("classbegin") == true;
        window.dynamicPptDebug = window.GLOBAL.getUrlParams("dynamicPptDebug") ? window.GLOBAL.getUrlParams("dynamicPptDebug") == "true" : false;
        window.GLOBAL.role = window.GLOBAL.getUrlParams("role");
        window.GLOBAL.dynamicPptActionClick = window.GLOBAL.getUrlParams("dynamicPptActionClick") ? window.GLOBAL.getUrlParams("dynamicPptActionClick") == "true" : false;
        window.GLOBAL.newpptPagingPage = window.GLOBAL.getUrlParams("newpptPagingPage") ? window.GLOBAL.getUrlParams("newpptPagingPage") == "true" : false;
        window.GLOBAL.publishDynamicPptMediaPermission_video = window.GLOBAL.getUrlParams("publishDynamicPptMediaPermission_video") == "true" || window.GLOBAL.getUrlParams("publishDynamicPptMediaPermission_video") == true;
        window.GLOBAL.PptVolumeValue = window.GLOBAL.getUrlParams("PptVolumeValue") ? parseFloat(window.GLOBAL.getUrlParams("PptVolumeValue")) : 1;
        window.GLOBAL.notPlayAV = window.GLOBAL.getUrlParams("notPlayAV") ? window.GLOBAL.getUrlParams("notPlayAV") == "true" : false;
        window.GLOBAL.PptVolumeMute = window.GLOBAL.getUrlParams("PptVolumeMute") ? window.GLOBAL.getUrlParams("PptVolumeMute") == "true" : false;
        window.GLOBAL.isNotPlayAudio = window.GLOBAL.getUrlParams("isNotPlayAudio") ? window.GLOBAL.getUrlParams("isNotPlayAudio") == "true" : false;
        window.GLOBAL.isNotPlayVideo = window.GLOBAL.getUrlParams("isNotPlayVideo") ? window.GLOBAL.getUrlParams("isNotPlayVideo") == "true" : false;
        window.GLOBAL.isLoadPageController = window.GLOBAL.getUrlParams("isLoadPageController");
        window.GLOBAL.isControl = window.GLOBAL.getUrlParams("control") == 'true' ? window.GLOBAL.getUrlParams("control") : false;
        window.GLOBAL.languageName = window.GLOBAL.browser.language && window.GLOBAL.browser.language.toLowerCase().match(/zh/g) ? 'chinese' : 'english';
        window.GLOBAL.versions = window.GLOBAL.getUrlParams("versions"); //版本号：2017082901
        window.GLOBAL.versions = window.GLOBAL.versions ? Number(window.GLOBAL.versions) : window.GLOBAL.versions;
        /**
         * [backEvent 是否返回当前PPT操作的event对象]
         */
        window.GLOBAL.backEvent = window.GLOBAL.getUrlParams("backevent") ? window.GLOBAL.getUrlParams("backevent") == "true" : false;
        window.GLOBAL.ServiceNewPptAynamicPPT = new window.GLOBAL.NewPptAynamicPPT();
        window.GLOBAL.actionHandlerFunction = function (data) {
            try {
                var JUMPTOANIM = "jumpToAnim";
                var GOTOPREVIOUSSTEP = "gotoPreviousStep";
                var GOTONEXTSTEP = "gotoNextStep";
                var GOTOPREVIOUSSLIDE = "gotoPreviousSlide";
                var GOTONEXTSLIDE = "gotoNextSlide";
                var RESIZEHANDLER = "resizeHandler";
                var CLICKNEWPPTTRIGGEREVENT = "clickNewpptTriggerEvent";
                var CHANGECLASSBEGIN = "changeClassBegin";
                var CHANGEPUBLISHDYNAMICPPTMEDIAPERMISSION_VIDEO = "changePublishDynamicPptMediaPermission_video";
                var CLOSEDYNAMICPPTAUTOVIDEO = "closeDynamicPptAutoVideo";
                var CLASSBEGINCHECKAUTOPLAY = "classBeginCheckAutoPlay";
                var CHANGEDYNAMICPPTACTIONCLICK = "changeDynamicPptActionClick";
                var CHANGENEWPPTPAGINGPAGE = "changeNewpptPagingPage";
                var STOPDYNAMICPPT = "stopDynamicPpt";
                var PLAYDYNAMICPPT = "playDynamicPpt";
                var PPTVOLUMECONTROL = "PptVolumeControl";
                var EXTENDEDNOTICE = "ExtendedNotice";
                var CLICKNEWPPTVIDEOEVENT = 'clickNewpptVideoEvent';
                //bxk video
                var PLAYVIDEO = 'startPlayVideoEvent';
                var GETVIDEODATA = 'getVideoData';
                var USERTRIGGERAUDIO = 'userTriggerAudio';
                var CLOSEACTIVEAUDIO = 'closeActiveAudio';
                var OPENACTIVEAUDIO = 'openActiveAudio';
                var SETCURSOR = 'setCursor';
                switch (data.action) {
                    case SETCURSOR:
                      var iconUrl = data.iconUrl || '';
                      var offsetX = data.offsetX || 0;
                      var offsetY = data.offsetY || 0;
                      (document.getElementById('playerView') || document.body).style.cursor = 'url('+ iconUrl +') '+ offsetX +' '+ offsetY +',auto';
                    break;
                    case CLOSEACTIVEAUDIO:
                      var allAudios = window.GLOBAL.saveAudioSrc;
                      if(allAudios && allAudios.length > 0){
                        for (var i = 0; i < allAudios.length; i++) {
                          var audioEle = allAudios[i];
                          if(audioEle.isActive){
                            audioEle.ele.pause();
                          }
                        }
                      }

                    break;
                    case OPENACTIVEAUDIO:
                      var allAudios = window.GLOBAL.saveAudioSrc;
                      if(allAudios && allAudios.length > 0){
                        for (var i = 0; i < allAudios.length; i++) {
                          var audioEle = allAudios[i];
                          if(audioEle.isActive){
                            audioEle.ele.play();
                          }
                        }
                      }

                    break;
                    case USERTRIGGERAUDIO:
                       if( document.getElementById('testAudio') ){
                          document.getElementById('testAudio').play();
                          document.body.removeChild( document.getElementById('testAudio') );
                       }else{
                          var audioEle = document.createElement('audio');
                          audioEle.id = 'testAudio';
                          audioEle.src = '../../Public/media/test.mp3';
                          document.body.appendChild( audioEle );
                          audioEle.play();
                          document.body.removeChild(audioEle);
                       }
                    break;
                    case PLAYVIDEO :
                    if(window.GLOBAL.isControl){
                      window.GLOBAL.videoInitiative = data.externalData.initiative;
                      var videos = document.getElementsByTagName('video')[0];

                      if(!window.GLOBAL.isMobile()){

                        var parentNode = videos.parentNode;
                        var playBtnBox = parentNode.getElementsByClassName('component_container')[0];
                        var playBtn = playBtnBox.getElementsByClassName('component_base')[0];
                        if(data.videoStatus == 'play'){
                          parentNode.classList.remove('poster_frame');

                          playBtn.classList.add('selected');
                          videos.play();
                        }else{
                          playBtn.classList.remove('selected');
                          videos.pause();
                        }
                      }else{
                          if(data.videoStatus == 'play'){
                            var parentNode = videos.parentNode;
                            if(parentNode.classList.contains('iphone')){
                              parentNode.classList.remove('video_player');
                            }
                            videos.play();
                          }else{
                            videos.pause();
                          }

                      }
                    }
                    break;
                    case GETVIDEODATA :
                      if(window.GLOBAL.isControl){
                        var videos = document.getElementsByTagName('video');
                        if(videos && videos.length > 0){
                          var data = {
                              action: "getVideoData",
                              currentTime:videos[0].currentTime,
                              duration:videos[0].duration,
                              externalData: {
                                initiative:false
                              }
                          };
                          window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
                        }
                      }
                      break;
                    case CLICKNEWPPTVIDEOEVENT:
                      if(window.GLOBAL.isControl){
                        window.GLOBAL.ServiceNewPptAynamicPPT.clickNewpptVideoEventHandler(data);
                      }
                        break;
                    case JUMPTOANIM :
                        window.GLOBAL.ServiceNewPptAynamicPPT.jumpToAnimData = data.data || {};
                        var externalData = {initiative: window.GLOBAL.ServiceNewPptAynamicPPT.jumpToAnimData.initiative};
                        window.GLOBAL.ServiceNewPptAynamicPPT.jumpToAnimData.externalData = externalData;
                        window.GLOBAL.ServiceNewPptAynamicPPT.canJumpToAnim();
                        break;
                    case GOTOPREVIOUSSTEP :
                        var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                        var stepIndex = ts.stepIndex();
                        if (stepIndex <= 0) {
                            var autoStart = true;
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                            window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
                        } else {
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousStep(externalData);
                        }
                        break;
                    case GOTONEXTSTEP:
                        var externalData = {initiative: true};
                        window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextStep(externalData);
                        break;
                    case GOTOPREVIOUSSLIDE:
                        var externalData = {initiative: true};
                        window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                        window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(data.autoStart, externalData);
                        break;
                    case GOTONEXTSLIDE:
                        var externalData = {initiative: true};
                        window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                        window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextSlide(data.autoStart, externalData);
                        break;
                    case RESIZEHANDLER:
                        dynamicPptLog.log("resizeHandler width and height:", data.width, data.height);
                        window.GLOBAL.ServiceNewPptAynamicPPT.view.resize(data.width, data.height);
                        setTimeout(function () {
                            window.GLOBAL.fireEvent(window, 'resize');
                        }, 250);
                        break;
                    case CLICKNEWPPTTRIGGEREVENT:
                        window.GLOBAL.ServiceNewPptAynamicPPT.clickNewpptTriggerEventHandler(data);
                        break;
                    case CHANGECLASSBEGIN:
                        window.GLOBAL.classbegin = data.classbegin;
                        break;
                    case CHANGEPUBLISHDYNAMICPPTMEDIAPERMISSION_VIDEO:
                        window.GLOBAL.publishDynamicPptMediaPermission_video = data.publishDynamicPptMediaPermission_video;
                        break;
                    case CLOSEDYNAMICPPTAUTOVIDEO:
                        window.GLOBAL.ServiceNewPptAynamicPPT.closeDynamicPptAutoVideo();
                        break;
                    case CLASSBEGINCHECKAUTOPLAY:
                        window.GLOBAL.ServiceNewPptAynamicPPT.classBeginCheckAutoPlay();
                        break;
                    case CHANGEDYNAMICPPTACTIONCLICK:
                        window.GLOBAL.dynamicPptActionClick = data.dynamicPptActionClick;
                        if (window.GLOBAL.dynamicPptActionClick) {
                            pptSupernatant.style.display = 'none';
                        } else {
                            pptSupernatant.style.display = 'block';
                        }
                        break;
                    case CHANGENEWPPTPAGINGPAGE:
                        window.GLOBAL.newpptPagingPage = data.newpptPagingPage;
                        break;
                    case STOPDYNAMICPPT:
                        window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.pause();
                        window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray = [];
                        var $audioAll = document.querySelectorAll("audio");
                        for (var i = 0; i < $audioAll.length; i++) {
                            var $ad = $audioAll[i];
                            if ($ad && !$ad.paused) {
                                window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray.push($ad);
                                $ad.pause();
                                //$ad.volume = 0 ;
                            }
                        }
                        break;
                    case PLAYDYNAMICPPT:
                        var autoNextStep = false;
                        window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.play(autoNextStep);
                        if (window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray && window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray.length > 0) {
                            for (var i = 0; i < window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray.length; i++) {
                                var $ad = window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray[i];
                                if ($ad) {
                                    //$ad.volume = 1 ;
                                    if ($ad.paused) {
                                        $ad.play();
                                    }
                                }
                            }
                        }
                        window.GLOBAL.ServiceNewPptAynamicPPT.pauseAudioArray = [];
                        break;
                    case PPTVOLUMECONTROL:
                        window.GLOBAL.PptVolumeValue = parseFloat(data.volumeValue);
                        _findAllAudioAndVideoSetVolumeAndMute();
                        break;
                    case EXTENDEDNOTICE:
                        if (data.extendedData && data.extendedData.type === 'updateMute' && data.extendedData.data) {
                            window.GLOBAL.PptVolumeMute = data.extendedData.data.mute;
                            _findAllAudioAndVideoSetVolumeAndMute();
                        }
                        break;
                }
            } catch (e) {
                dynamicPptLog.error("actionHandlerFunction error:", e);
            }

        };
        window.GLOBAL.getParents = function (el, parentSelector) {
            try {
                // If no parentSelector defined will bubble up all the way to *document*
                if (parentSelector === undefined) {
                    parentSelector = 'document';
                }
                var parents = [];
                var p = el;
                var num = 0;
                while (true) {
                    var o = p;
                    if (!o) {
                        break;
                    }
                    if (o && o.getAttribute("id")) {
                        parents.push(o);
                        break;
                    }
                    p = o.parentNode;
                    if (++num > 150) {
                        break;
                    }
                }
                //parents.push(parentSelector); // Push that parentSelector you wanted to stop at
                return parents;
            } catch (e) {
                dynamicPptLog.error("getParents error:", e);
            }
        };

        /*捕捉所有的audio和video*/
        function _findAllAudioAndVideoSetVolumeAndMute() {
            var $audioAll = document.querySelectorAll("audio");
            var $videoAll = document.querySelectorAll("video");
            if ($audioAll.length > 0) {
                for (var i = 0; i < $audioAll.length; i++) {
                    var $ad = $audioAll[i];
                    $ad.volume = parseFloat(window.GLOBAL.PptVolumeValue);
                    if (window.GLOBAL.PptVolumeMute) {
                        $ad.mute = true;
                    } else {
                        $ad.mute = false;
                    }
                }
            }
            if ($videoAll.length > 0) {
                for (var i = 0; i < $videoAll.length; i++) {
                    var $vd = $videoAll[i];
                    $vd.volume = parseFloat(window.GLOBAL.PptVolumeValue);
                    if (window.GLOBAL.PptVolumeMute) {
                        $vd.mute = true;
                    } else {
                        $vd.mute = false;
                    }
                }
            }
            var totalAudioAndVideoNumber = $audioAll.length + $videoAll.length;
            if (totalAudioAndVideoNumber !== window.GLOBAL.totalAudioAndVideoNumber) {
                window.GLOBAL.totalAudioAndVideoNumber = totalAudioAndVideoNumber;
                var data = {
                    action: "allVideoAndAudio",
                    allVideoAndAudioLength: totalAudioAndVideoNumber
                };
                window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
                /*发送所有的audio和video的个数*/
            }
        };

        function _findAllVideoAndAudioRedefinePlay(isAllMediaElementPause) {
            var newPptAynamicThat = window.GLOBAL.newPptAynamicThat.that;
            var audios = document.getElementsByTagName("audio");
            var videos = document.getElementsByTagName("video");

            //保存当前页所有PPT音频状态
            if(audios.length > 0){
              var audioArray = [];
              setTimeout(function(){
                for (var i = 0; i < audios.length; i++) {
                  var aELe = audios[i];
                  if (aELe.paused) {
                        // 暂停中
                        var aObj = {
                          ele:aELe,
                          isActive:false,
                        }
                        audioArray.push(aObj);
                    } else {
                        // 播放中
                        var aObj = {
                          ele:aELe,
                          isActive:true,
                        }
                        audioArray.push(aObj);
                    }
                }
                window.GLOBAL.saveAudioSrc = audioArray;
              },500)
            }

            if( (audios.length > 0 || videos.length > 0) && window.isPlayFalg && !( (window.GLOBAL.isNotPlayAudio&&window.GLOBAL.isNotPlayVideo) || window.GLOBAL.notPlayAV ) ){
                //bxk --->>> 测试音视频播放是否被chrome 66禁止
                function testAudioAutoPlay(){
                    var audioEle =  document.getElementById('testAudio') || document.createElement('audio');
                    audioEle.id = 'testAudio';
                    // require一个本地文件，会变成base64格式
                    audioEle.src = '../../Public/media/test.mp3';
                    if(!document.getElementById('testAudio')){
                        document.body.appendChild(audioEle);
                    }
                    try{
                        // play返回的是一个promise
                        audioEle.play().then(function(){
                            if( document.getElementById('testAudio') ){
                                // 支持自动播放
                                audioEle.pause();
                                document.body.removeChild( document.getElementById('testAudio') );
                            }
                            window.isPlayFalg = false;
                        }).catch(function(err){
                            console.error('audio error--->',err);
                            console.error('error name--->',err.name);
                            // 不支持自动播放
                            if(err && err.name === 'NotAllowedError'){
                                window.isPlayFalg = false;
                                var data = {
                                    action: "againReconnect"
                                };
                                window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
                            };
                            if( document.getElementById('testAudio') ){
                                document.body.removeChild( document.getElementById('testAudio') );
                            }
                        });
                    }catch (errorinfo){
                        dynamicPptLog.error('audio play error:',errorinfo);
                    }
                }
                //bxk 检测audio video 自动播放错误
                testAudioAutoPlay();
            }

            if(!window.GLOBAL.isControl){
                if(audios.length > 0){
                    for (var i = audios.length - 1; i >= 0; i--) {
                        if(audios[i] && audios[i].id === 'testAudio'){
                            continue;
                        }
                        if (isAllMediaElementPause) {
                            audios[i].pause();
                        }
                        audios[i].play = _redefineAudioPlay;
                    }
                }
                if(videos.length > 0){
                    for (var i = videos.length - 1; i >= 0; i--) {
                        if (isAllMediaElementPause) {
                            videos[i].pause();
                        }
                        videos[i].play = _redefineVideoPlay;
                    }
                }
            }

            if(videos.length >= 1 && window.GLOBAL.isControl){
              var eventTester = function(e){
                window.GLOBAL.addEvents(videos[0],e,function(){
                  if(window.GLOBAL.videoInitiative){
                    if(e === 'seeked'){
                      window.GLOBAL.clickGoVideoTime && window.GLOBAL.clickGoVideoTime( videos[0], window.GLOBAL.videoInitiative );
                    }else{
                      var data = {
                          action: "startPlayVideoEvent",
                          videoStatus:e,
                          externalData: {
                            initiative:window.GLOBAL.videoInitiative
                          }
                      };

                      newPptAynamicThat.postMessageToParent(data);

                      var parentNode = videos[0].parentNode;
                      if(parentNode.classList.contains('iphone')){
                        parentNode.classList.remove('video_player');
                      }

                    }
                  }


                })
              }
              if(!window.GLOBAL.isMobile()){
                var control = document.getElementsByClassName("controls")[0];
                if(window.GLOBAL.isControl){
                  control.classList.add('openControl');
                  eventTester('play');
                  eventTester('pause');
                }else{
                  control.classList.add('closeControl');
                }
              }else{
                eventTester('play');
                eventTester('pause');
                eventTester('seeked');
              }
            }
            //bxk end

        };

        /*重新定义audio的play方法*/
        function _redefineAudioPlay(noticeParentIFramePlayAudio, noticeParentIFrameData) {
            if (window.GLOBAL.notPlayAV || window.GLOBAL.isNotPlayAudio) { //不执行play方法

            } else {
                if (noticeParentIFramePlayAudio) {

                } else {
                    if (this && this.__proto__ && this.__proto__.play && typeof    this.__proto__.play === 'function') {

                        this.__proto__.play.apply(this, arguments);
                        var allAudio = window.GLOBAL.saveAudioSrc;
                        var that = this;
                        for (var i = 0; i < allAudio.length; i++) {
                          var el = allAudio[i];
                          if(that == el.ele){
                            el.isActive = true;
                          }
                        }
                    }
                }
            }
        };

        /*重新定义video的play方法*/
        function _redefineVideoPlay(noticeParentIFramePlayVideo, noticeParentIFrameData) {
            if (window.GLOBAL.notPlayAV || window.GLOBAL.isNotPlayVideo || window.GLOBAL.playback) {//不执行play方法

            } else {

                if (noticeParentIFramePlayVideo) { //由上iframe层来play video
                    var newPptAynamicThat = window.GLOBAL.newPptAynamicThat.that;
                    var $vd = this;
                    noticeParentIFrameData = noticeParentIFrameData || {};
                    if ($vd) {
                        var eleId = "new_ppt_video_" + new Date().getTime();
                        $vd.setAttribute("id", eleId);
                        var $resouce = $vd.querySelectorAll("source");
                        var videoFileUrl = undefined;
                        if ($resouce && $resouce.length > 0) {
                            for (var j = 0; j < $resouce.length; j++) {
                                var $rs = $resouce[j];
                                if ($rs) {
                                    //$vd.removeChild($rs);
                                    if ($rs.getAttribute("type").indexOf('webm') !== -1) {
                                        videoFileUrl = $rs.getAttribute("src");
                                        break;
                                    }
                                }
                            }
                            if (!videoFileUrl) {
                                dynamicPptLog.error('video resouce webm url is not exist!', $resouce);
                                return;
                            }
                            //bxk -->>存储每页存储video数据
                            var sourceHTML = [];
                            for (var i = 0; i < $resouce.length; i++) {
                              sourceHTML.push($resouce[i].outerHTML)
                            }
                            var videoData = {
                              src: videoFileUrl,
                              slide: noticeParentIFrameData.pptslide,
                              source: sourceHTML
                            }
                            window.GLOBAL.saveVideoSrc[noticeParentIFrameData.pptslide-1] = videoData;
                            // bxk -->>清空video src source 数据
                            $vd.src = '';
                            if($resouce && $resouce.length > 0){
                              for (var i = $resouce.length - 1; i >= 0; i--) {
                                $vd.removeChild($resouce[i]);
                              }
                            }
                        }else{
                          //bxk 如果video没有子节点，从saveVideoSrc中重新获取节点
                          if(window.GLOBAL.saveVideoSrc.length > 0){
                            var index = noticeParentIFrameData.pptslide - 1;
                            if(window.GLOBAL.saveVideoSrc[index].slide == noticeParentIFrameData.pptslide){
                              videoFileUrl = window.GLOBAL.saveVideoSrc[index].src;
                            }
                          }
                        }
                        if(videoFileUrl){
                            var data = {
                                action: "autoPlayVideoInNewPpt",
                                videoElementId: eleId,
                                isvideo: true,
                                fileid: window.GLOBAL.fileid,
                                url: videoFileUrl,
                                pptslide: noticeParentIFrameData.pptslide,
                                externalData: noticeParentIFrameData.externalData,
                            };
                            newPptAynamicThat.postMessageToParent(data);
                        }
                    }
                } else {
                    if (this && this.__proto__ && this.__proto__.play && typeof this.__proto__.play === 'function') {
                        //bxk start 判断video 里有没有子节点，如果没有 从saveVideosrc中获取
                        var $vb = this;
                        if( $vb){
                            var $resouce = $vb.querySelectorAll('source');
                            var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                            var nowSlideIndex = ts.slideIndex();
                            if($resouce && $resouce.length <= 0){
                                $vb.innerHTML = window.GLOBAL.saveVideoSrc[nowSlideIndex].source.join('');
                            }
                        }
                        //bxk end
                        this.__proto__.play.apply(this, arguments);

                    }
                }
            }
        };
        /* 触发器 触发视频进度 */
        window.GLOBAL.clickGoVideoTime = function( ele, initiative ) {
          if(window.GLOBAL.isControl && ele){
            var $video = ele;
            var $duration = $video.duration;
            var $currentTime = $video.currentTime;

            var data = {
                action: "clickNewpptVideoEvent",
                currentTime:$currentTime,
                duration:$duration,
                externalData: {
                  initiative:initiative
                }
            };
            window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
          }
        };

        /*触发器点击捕获函数*/
        window.GLOBAL.clickTriggerElementToNewPpt = function (e, externalData) {
            var target = e.target;
            var currentTarget = e.currentTarget;
            window.dynamicPptLog.log("点击触发器，节点数据[target , currentTarget , externalData]:", target, currentTarget, externalData);
            var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
            var nowSlideIndex = ts.slideIndex();
            var nowStepIndex = ts.stepIndex() >= 0 ? ts.stepIndex() : 0;
            var triggerElementId = null;
            if (!target.getAttribute("id") && !currentTarget.getAttribute("id")) {
                var idEleArr = window.GLOBAL.getParents(currentTarget);
                if (idEleArr && idEleArr.length > 0) {
                    triggerElementId = idEleArr[0].getAttribute("id");
                }
            }
            var data = {
                action: "clickNewpptTriggerEvent",
                slide: nowSlideIndex,
                step: nowStepIndex,
                triggerElementId: target.getAttribute("id") || currentTarget.getAttribute("id") || triggerElementId,
                externalData: externalData
            };
            if (triggerElementId) {
                data.childElementTagName = currentTarget.nodeName;
            }
            window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
        };

        var _documentKeydown = function (event) {    //给当前document建立keydown监听函数
            clearTimeout(window.GLOBAL.documentTimer);
            window.GLOBAL.documentTimer = setTimeout(function () {
                if (window.GLOBAL.newpptPagingPage) {
                    var code = event.keyCode;
                    switch (code) {
                        case 39:
                            var autoStart = true;
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                            window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextSlide(autoStart, externalData);
                            event.preventDefault();
                            event.stopPropagation()
                            return false;
                            break;
                        case 37:
                            var autoStart = true;
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                            window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
                            event.preventDefault();
                            event.stopPropagation()
                            return false;
                            break;
                        case 38:
                            var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                            var stepIndex = ts.stepIndex();
                            if (stepIndex <= 0) {
                                var autoStart = true;
                                var externalData = {initiative: true};
                                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
                            } else {
                                var externalData = {initiative: true};
                                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousStep(externalData);
                            }
                            //window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousStep();
                            event.preventDefault();
                            event.stopPropagation()
                            return false;
                            break;
                        case 40:
                            var externalData = {initiative: true};
                            window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextStep(externalData);
                            event.preventDefault();
                            event.stopPropagation()
                            return false;
                            break;
                    }
                }

            }, 400);
        }
        window.GLOBAL.removeEvents(document, 'keydown', _documentKeydown);
        window.GLOBAL.addEvents(document, 'keydown', _documentKeydown);

        //添加事件监听,并发送数据 bxk
        if(window.GLOBAL.isControl){
          var _backEvent = function(event){
            var data = {
              action: 'MouseLocation',
              clientX: event.clientX,
              clientY: event.clientY
            };
            window.GLOBAL.ServiceNewPptAynamicPPT.postMessageToParent(data);
          }
          window.GLOBAL.addEvents(document, 'mousedown', _backEvent);
          window.GLOBAL.addEvents(document, 'mouseup', _backEvent);
          window.GLOBAL.addEvents(document, 'click', _backEvent);
          window.GLOBAL.addEvents(document, 'keydown', _backEvent);
          window.GLOBAL.addEvents(document, 'touchstart', _backEvent);
          window.GLOBAL.addEvents(document, 'mousemove', _backEvent);
        }

        //禁止右键
        document.oncontextmenu = null ;
        document.oncontextmenu = function() {return false;};

        var _windowMessage = function (event) {    //给当前window建立message监听函数
            try {
                // 通过origin属性判断消息来源地址
                dynamicPptLog.log("receive remote iframe's parent  data form " + event.origin + ":", event);
                //if ( window.GLOBAL.targetOrigin.toString().indexOf(event.origin) != -1 ) {
                if (event.data) {
                    var recvData = JSON.parse(event.data);
                    if (recvData.source === "tk_dynamicPPT") {
                        window.GLOBAL.actionHandlerFunction(recvData.data);
                    }
                }
                //}
            } catch (e3) {
                dynamicPptLog.error("message Event form iframe :", e3);
            }

        };
        window.GLOBAL.removeEvents(window, 'message', _windowMessage);
        window.GLOBAL.addEvents(window, 'message', _windowMessage);
        //bxk 临时修改 有疑问
        if (window.GLOBAL.dynamicPptActionClick) {
            pptSupernatant.style.display = 'block';
        } else {
            pptSupernatant.style.display = 'none';
        }
        window.GLOBAL.newpptPresentationConnector.register(player);
        var preloader = document.getElementById("preloader");
        preloader.parentNode.removeChild(preloader);

        if (window.GLOBAL.isLoadPageController) {
            var div = document.createElement('div');
            div.id = 'customPageController';
            div.style.display = 'none';
            div.className = 'custom-page-controller';

            var button_prevPage = document.createElement('button');
            button_prevPage.id = 'customController_prevSlide';
            button_prevPage.className = 'prev-slide';
            button_prevPage.innerHTML = window.GLOBAL.languageName === 'chinese' ? '上一页' : 'Previous Page';
            button_prevPage.onclick = function (e) {  // 上一页
                var autoStart = true;
                var externalData = {initiative: true};
                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
            }
            div.appendChild(button_prevPage);

            var button_prevStep = document.createElement('button');
            button_prevStep.id = 'customController_prevStep';
            button_prevStep.className = 'prev-step';
            button_prevStep.innerHTML = window.GLOBAL.languageName === 'chinese' ? '上一帧' : 'Previous Step';
            button_prevStep.onclick = function (e) {  // 上一帧
                var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                var stepIndex = ts.stepIndex();
                if (stepIndex <= 0) {
                    var autoStart = true;
                    var externalData = {initiative: true};
                    window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                    window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousSlide(autoStart, externalData);
                } else {
                    var externalData = {initiative: true};
                    window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoPreviousStep(externalData);
                }
            };
            div.appendChild(button_prevStep);

            var input_skipSlide = document.createElement('input');
            input_skipSlide.id = 'customController_skipSlide';
            input_skipSlide.className = 'skip-slide';
            input_skipSlide.type = 'number';
            input_skipSlide.setAttribute('placeholder', window.GLOBAL.languageName === 'chinese' ? '请输入需要跳转的页数' : 'Please enter the number of pages to jump');
            input_skipSlide.onchange = function (e) {  // 跳转到某一页
                var skipSlide = Number(this.value);
                if (typeof skipSlide === 'number') {
                    if (skipSlide < 1) {
                        alert(window.GLOBAL.languageName === 'chinese' ? '跳转的页数不能小于1' : 'The page number of the jump cannot be less than 1.');
                        var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                        var nowSlideIndex = ts.slideIndex() + 1;
                        this.value = nowSlideIndex;
                        return;
                    }
                    if (skipSlide > window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount) {
                        alert(window.GLOBAL.languageName === 'chinese' ? '跳转的页数不能大于' + window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount : 'The page number of the jump cannot be greater than ' + window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount);
                        var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                        var nowSlideIndex = ts.slideIndex() + 1;
                        this.value = nowSlideIndex;
                        return;
                    }
                    window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                    var externalData = {initiative: true};
                    window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoTimestamp(skipSlide - 1, 0, 0, true, externalData);
                }
            }
            div.appendChild(input_skipSlide);

            var span_totalSlide = document.createElement('span');  //总页数
            span_totalSlide.id = 'customController_totalSlideSpan';
            span_totalSlide.className = 'total-slide-span';
            span_totalSlide.innerHTML = '&nbsp;/&nbsp;&nbsp;' + 0;
            div.appendChild(span_totalSlide);

            var button_nextStep = document.createElement('button');
            button_nextStep.id = 'customController_nextStep';
            button_nextStep.className = 'next-step';
            button_nextStep.innerHTML = window.GLOBAL.languageName === 'chinese' ? '下一帧' : 'Next Step';
            button_nextStep.onclick = function (e) {  // 下一帧
                var externalData = {initiative: true};
                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextStep(externalData);
            }
            div.appendChild(button_nextStep);

            var button_nextPage = document.createElement('button');
            button_nextPage.id = 'customController_nextSlide';
            button_nextPage.className = 'next-slide';
            button_nextPage.innerHTML = window.GLOBAL.languageName === 'chinese' ? '下一页' : 'Next Page';
            button_nextPage.onclick = function (e) {  // 下一页
                var autoStart = true;
                var externalData = {initiative: true};
                window.GLOBAL.ServiceNewPptAynamicPPT.clearOldSlideInfo();
                window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.gotoNextSlide(autoStart, externalData);
            }
            div.appendChild(button_nextPage);

            document.body.appendChild(div);

            window.GLOBAL.checkCustomControllerButtonState = function () {
                if (window.GLOBAL.ServiceNewPptAynamicPPT && window.GLOBAL.ServiceNewPptAynamicPPT.playbackController) {
                    div.style.display = '';
                    span_totalSlide.innerHTML = '&nbsp;/&nbsp;&nbsp;' + window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount;
                    var ts = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.clock().timestamp();
                    var nowSlideIndex = ts.slideIndex() + 1;
                    var nowStepIndex = ts.stepIndex() >= 0 ? ts.stepIndex() : 0;
                    var stepTotal = null;
                    if (window.GLOBAL.ServiceNewPptAynamicPPT.playbackController && window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.currentSlide) {
                        try {
                            var iSlide = window.GLOBAL.ServiceNewPptAynamicPPT.playbackController.currentSlide();
                            if (iSlide && iSlide.animationSteps) {
                                var iAnimationSteps = iSlide.animationSteps();
                                if (iSlide && iSlide.animationSteps) {
                                    stepTotal = iAnimationSteps.count();
                                }
                            }

                        } catch (e) {
                            dynamicPptLog.error("that.playbackController.currentSlide error:", e);
                        }
                    }
                    if (nowSlideIndex <= 1) {
                        button_prevPage.setAttribute('disabled', true);
                    } else {
                        button_prevPage.removeAttribute('disabled');
                    }
                    if (nowSlideIndex >= window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount) {
                        button_nextPage.setAttribute('disabled', true);
                    } else {
                        button_nextPage.removeAttribute('disabled');
                    }
                    if (nowSlideIndex <= 1 && nowStepIndex <= 0) {
                        button_prevStep.setAttribute('disabled', true);
                    } else {
                        button_prevStep.removeAttribute('disabled');
                    }
                    if (nowSlideIndex >= window.GLOBAL.ServiceNewPptAynamicPPT.slidesCount && nowStepIndex >= stepTotal - 1) {
                        button_nextStep.setAttribute('disabled', true);
                    } else {
                        button_nextStep.removeAttribute('disabled');
                    }
                    input_skipSlide.value = nowSlideIndex;
                }
            };
        }
    }
    try{
        startPlaying();
    }catch(e){
        dynamicPptLog.error("动态PPT出现错误，错误信息:",e);
    }

};
