/*! OvenPlayerv0.9.5958 | (c)2019 AirenSoft Co., Ltd. | MIT license (https://github.com/AirenSoft/OvenPlayerPrivate/blob/master/LICENSE) | Github : https://github.com/AirenSoft/OvenPlayer */
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["ovenplayer.provider.DashProvider~ovenplayer.provider.HlsProvider~ovenplayer.provider.Html5~ovenplaye~2ec193ac"],{

/***/ "./src/js/api/provider/ads/Ads.js":
/*!****************************************!*\
  !*** ./src/js/api/provider/ads/Ads.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Listener = __webpack_require__(/*! api/provider/ads/Listener */ "./src/js/api/provider/ads/Listener.js");

var _Listener2 = _interopRequireDefault(_Listener);

var _likeA$ = __webpack_require__(/*! utils/likeA$.js */ "./src/js/utils/likeA$.js");

var _likeA$2 = _interopRequireDefault(_likeA$);

var _utils = __webpack_require__(/*! api/provider/utils */ "./src/js/api/provider/utils.js");

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Created by hoho on 08/04/2019.
 */
var Ads = function Ads(elVideo, provider, playerConfig, adTagUrl, errorCallback) {
    //Todo : move createAdContainer to MediaManager
    var AUTOPLAY_NOT_ALLOWED = "autoplayNotAllowed";
    var ADMANGER_LOADING_ERROR = "admanagerLoadingTimeout";
    var ADS_MANAGER_LOADED = "";
    var AD_ERROR = "";

    var that = {};
    var adsManagerLoaded = false;
    var spec = {
        started: false, //player started
        active: false, //on Ad
        isVideoEnded: false,
        checkAutoplayStart: true
    };
    var OnAdError = null;
    var OnManagerLoaded = null;

    var adDisplayContainer = null;
    var adsLoader = null;
    var adsManager = null;
    var listener = null;
    var adsRequest = null;
    var autoplayAllowed = false,
        autoplayRequiresMuted = false;

    // google.ima.settings.setAutoPlayAdBreaks(false);
    //google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);

    //google.ima.settings.setLocale('ko');
    //google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    //google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
    var sendWarningMessageForMutedPlay = function sendWarningMessageForMutedPlay() {
        provider.trigger(_constants.PLAYER_WARNING, {
            message: _constants.WARN_MSG_MUTEDPLAY,
            timer: 10 * 1000,
            iconClass: _constants.UI_ICONS.volume_mute,
            onClickCallback: function onClickCallback() {
                provider.setMute(false);
            }
        });
    };

    try {
        var initRequest = function initRequest() {

            OvenPlayerConsole.log("AutoPlay Support : ", "autoplayAllowed", autoplayAllowed, "autoplayRequiresMuted", autoplayRequiresMuted);

            adsRequest = new google.ima.AdsRequest();

            adsRequest.forceNonLinearFullSlot = false;
            /*if(playerConfig.getBrowser().browser === "Safari" && playerConfig.getBrowser().os === "iOS" ){
             autoplayAllowed = false;
             autoplayRequiresMuted = false;
             }*/

            adsRequest.setAdWillAutoPlay(autoplayAllowed);
            adsRequest.setAdWillPlayMuted(autoplayRequiresMuted);
            if (autoplayRequiresMuted) {
                sendWarningMessageForMutedPlay();
            }
            adsRequest.adTagUrl = adTagUrl;

            adsLoader.requestAds(adsRequest);

            //two way what ad starts.
            //adsLoader.requestAds(adsRequest); or  adsManager.start();
            //what? why?? wth??
        };

        var checkAutoplaySupport = function checkAutoplaySupport() {
            if (!elVideo.play) {
                autoplayAllowed = true;
                autoplayRequiresMuted = false;
                spec.checkAutoplayStart = false;
                initRequest();
                return false;
            }

            var playPromise = elVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(function () {
                    // If we make it here, unmuted autoplay works.
                    elVideo.pause();

                    autoplayAllowed = true;
                    autoplayRequiresMuted = false;
                    spec.checkAutoplayStart = false;
                    initRequest();
                })["catch"](function () {
                    elVideo.muted = true;
                    var playPromise = elVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function () {
                            // If we make it here, muted autoplay works but unmuted autoplay does not.
                            elVideo.pause();
                            autoplayAllowed = true;
                            autoplayRequiresMuted = true;
                            spec.checkAutoplayStart = false;
                            initRequest();
                        })["catch"](function () {
                            // Both muted and unmuted autoplay failed. Fall back to click to play.
                            elVideo.muted = false;
                            autoplayAllowed = false;
                            autoplayRequiresMuted = false;
                            spec.checkAutoplayStart = false;
                            initRequest();
                        });
                    }
                });
            } else {
                //Maybe this is IE11....
                elVideo.pause();
                autoplayAllowed = true;
                autoplayRequiresMuted = false;
                spec.checkAutoplayStart = false;
                initRequest();
            }
        };

        ADS_MANAGER_LOADED = google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED;
        AD_ERROR = google.ima.AdErrorEvent.Type.AD_ERROR;
        google.ima.settings.setLocale("ko");
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);

        var createAdContainer = function createAdContainer() {
            var adContainer = document.createElement('div');
            adContainer.setAttribute('class', 'ovp-ads');
            adContainer.setAttribute('id', 'ovp-ads');
            playerConfig.getContainer().append(adContainer);

            return adContainer;
        };
        OnAdError = function OnAdError(adErrorEvent) {
            //note : adErrorEvent.getError().getInnerError().getErrorCode() === 1205 & adErrorEvent.getError().getVastErrorCode() === 400 is Browser User Interactive error.

            //Do not triggering ERROR. becuase It just AD!

            console.log(adErrorEvent.getError().getVastErrorCode(), adErrorEvent.getError().getMessage());

            var innerError = adErrorEvent.getError().getInnerError();
            if (innerError) {
                console.log(innerError.getErrorCode(), innerError.getMessage());
            }
            if (adsManager) {
                adsManager.destroy();
            }
            spec.active = false;
            spec.started = true;
            provider.play();

            /*if(innerError && innerError.getErrorCode() === 1205){
             }else{
              }*/
        };
        OnManagerLoaded = function OnManagerLoaded(adsManagerLoadedEvent) {
            var adsRenderingSettings = new google.ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
            //adsRenderingSettings.useStyledNonLinearAds = true;
            adsManager = adsManagerLoadedEvent.getAdsManager(elVideo, adsRenderingSettings);

            listener = (0, _Listener2["default"])(adsManager, provider, spec, OnAdError);

            provider.on(_constants.CONTENT_VOLUME, function (data) {
                if (data.mute) {
                    adsManager.setVolume(0);
                } else {
                    adsManager.setVolume(data.volume / 100);
                }
            }, that);

            adsManagerLoaded = true;
        };

        adDisplayContainer = new google.ima.AdDisplayContainer(createAdContainer(), elVideo);
        adsLoader = new google.ima.AdsLoader(adDisplayContainer);

        adsLoader.addEventListener(ADS_MANAGER_LOADED, OnManagerLoaded, false);
        adsLoader.addEventListener(AD_ERROR, OnAdError, false);

        checkAutoplaySupport();

        that.isActive = function () {
            return spec.active;
        };
        that.started = function () {
            return spec.started;
        };
        that.play = function () {
            //provider.setState(STATE_LOADING);

            if (spec.started) {
                return new Promise(function (resolve, reject) {
                    try {
                        adsManager.resume();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            } else {
                var retryCount = 0;
                return new Promise(function (resolve, reject) {
                    (function checkAdsManagerIsReady() {
                        retryCount++;
                        if (adsManagerLoaded) {
                            if (playerConfig.isAutoStart() && !autoplayAllowed) {
                                autoplayAllowed = true;
                                spec.started = false;
                                reject(new Error(AUTOPLAY_NOT_ALLOWED));
                            } else {
                                //I think do not nessessary this code anymore. Because muted play solves everything. 2019-06-04
                                /*if(playerConfig.getBrowser().os  === "iOS" || playerConfig.getBrowser().os  === "Android"){
                                 //Don't playing video when player complete playing AD.
                                 //Only iOS Safari First loaded.
                                    elVideo.load();
                                }*/

                                adDisplayContainer.initialize();
                                adsManager.init("100%", "100%", google.ima.ViewMode.NORMAL);
                                adsManager.start();
                                spec.started = true;
                                resolve();
                            }
                        } else {
                            if (retryCount < 300) {
                                setTimeout(checkAdsManagerIsReady, 100);
                            } else {
                                reject(new Error(ADMANGER_LOADING_ERROR));
                            }
                        }
                    })();
                });
            }
        };
        that.pause = function () {
            adsManager.pause();
        };
        that.videoEndedCallback = function (completeContentCallback) {
            //listener.isLinearAd : get current ad's status whether linear ad or not.
            if (listener && (listener.isAllAdComplete() || !listener.isLinearAd())) {
                completeContentCallback();
            } else {
                //Post - Roll 을 재생하기 위해서는 콘텐츠가 끝났음을 adsLoader에게 알려야 한다
                spec.isVideoEnded = true;
                adsLoader.contentComplete();
            }
        };
        that.isAutoPlaySupportCheckTime = function () {
            return spec.checkAutoplayStart;
        };
        that.destroy = function () {
            if (adsLoader) {
                adsLoader.removeEventListener(ADS_MANAGER_LOADED, OnManagerLoaded);
                adsLoader.removeEventListener(AD_ERROR, OnAdError);
            }

            if (adsManager) {
                adsManager.destroy();
            }

            if (adDisplayContainer) {
                adDisplayContainer.destroy();
            }

            if (listener) {
                listener.destroy();
            }

            var $ads = (0, _likeA$2["default"])(playerConfig.getContainer()).find(".ovp-ads");
            if ($ads) {
                $ads.remove();
            }

            provider.off(_constants.CONTENT_VOLUME, null, that);
        };
        return that;
    } catch (error) {
        //let tempError = ERRORS[INIT_ADS_ERROR];
        //tempError.error = error;
        //errorCallback(tempError);
        return null;
    }
};

exports["default"] = Ads;

/***/ }),

/***/ "./src/js/api/provider/ads/Listener.js":
/*!*********************************************!*\
  !*** ./src/js/api/provider/ads/Listener.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _likeA$ = __webpack_require__(/*! utils/likeA$.js */ "./src/js/utils/likeA$.js");

var _likeA$2 = _interopRequireDefault(_likeA$);

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Created by hoho on 10/04/2019.
 */
var Listener = function Listener(adsManager, provider, adsSpec, OnAdError) {
    var that = {};
    var lowLevelEvents = {};

    var intervalTimer = null;

    var AD_BUFFERING = google.ima.AdEvent.Type.AD_BUFFERING;
    var CONTENT_PAUSE_REQUESTED = google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED;
    var CONTENT_RESUME_REQUESTED = google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED;
    var AD_ERROR = google.ima.AdErrorEvent.Type.AD_ERROR;
    var ALL_ADS_COMPLETED = google.ima.AdEvent.Type.ALL_ADS_COMPLETED;
    var CLICK = google.ima.AdEvent.Type.CLICK;
    var SKIPPED = google.ima.AdEvent.Type.SKIPPED;
    var COMPLETE = google.ima.AdEvent.Type.COMPLETE;
    var FIRST_QUARTILE = google.ima.AdEvent.Type.FIRST_QUARTILE;
    var LOADED = google.ima.AdEvent.Type.LOADED;
    var MIDPOINT = google.ima.AdEvent.Type.MIDPOINT;
    var PAUSED = google.ima.AdEvent.Type.PAUSED;
    var RESUMED = google.ima.AdEvent.Type.RESUMED;
    var STARTED = google.ima.AdEvent.Type.STARTED;
    var USER_CLOSE = google.ima.AdEvent.Type.USER_CLOSE;
    var THIRD_QUARTILE = google.ima.AdEvent.Type.THIRD_QUARTILE;

    var isAllAdCompelete = false; //Post roll을 위해
    var adCompleteCallback = null;
    var currentAd = null;

    lowLevelEvents[CONTENT_PAUSE_REQUESTED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        //This callls when player is playing contents for ad.
        if (adsSpec.started) {
            adsSpec.active = true;
            provider.pause();
        }
    };

    lowLevelEvents[CONTENT_RESUME_REQUESTED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        //This calls when one ad ended.
        //And this is signal what play the contents.
        adsSpec.active = false;

        if (adsSpec.started && (provider.getPosition() === 0 || !adsSpec.isVideoEnded)) {
            provider.play();
        }
    };
    lowLevelEvents[AD_ERROR] = OnAdError;

    lowLevelEvents[ALL_ADS_COMPLETED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        isAllAdCompelete = true;
        if (adsSpec.isVideoEnded) {
            provider.setState(_constants.STATE_COMPLETE);
        }
    };
    lowLevelEvents[CLICK] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
    };
    lowLevelEvents[FIRST_QUARTILE] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
    };
    //
    lowLevelEvents[AD_BUFFERING] = function (adEvent) {
        OvenPlayerConsole.log("AD_BUFFERING", adEvent.type);
    };
    lowLevelEvents[LOADED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        var remainingTime = adsManager.getRemainingTime();
        var ad = adEvent.getAd();
        /*var metadata = {
            duration: remainingTime,
            type :"ad"
        };*/
        provider.trigger(_constants.STATE_AD_LOADED, { remaining: remainingTime, isLinear: ad.isLinear() });
    };
    lowLevelEvents[MIDPOINT] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
    };
    lowLevelEvents[PAUSED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        provider.setState(_constants.STATE_AD_PAUSED);
    };
    lowLevelEvents[RESUMED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        provider.setState(_constants.STATE_AD_PLAYING);
    };

    lowLevelEvents[STARTED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        var ad = adEvent.getAd();
        currentAd = ad;

        var adObject = {
            isLinear: ad.isLinear(),
            duration: ad.getDuration(),
            skipTimeOffset: ad.getSkipTimeOffset() //The number of seconds of playback before the ad becomes skippable.
        };
        provider.trigger(_constants.AD_CHANGED, adObject);

        if (ad.isLinear()) {

            provider.setState(_constants.STATE_AD_PLAYING);
            adsSpec.started = true;
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            intervalTimer = setInterval(function () {
                var remainingTime = adsManager.getRemainingTime();
                var duration = ad.getDuration();

                provider.trigger(_constants.AD_TIME, {
                    duration: duration,
                    skipTimeOffset: ad.getSkipTimeOffset(),
                    remaining: remainingTime,
                    position: duration - remainingTime,
                    skippable: adsManager.getAdSkippableState()
                });
            }, 300); // every 300ms
        } else {
            provider.play();
        }
    };
    lowLevelEvents[COMPLETE] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        var ad = adEvent.getAd();
        if (ad.isLinear()) {
            clearInterval(intervalTimer);
        }
        provider.trigger(_constants.STATE_AD_COMPLETE);
    };
    //User skipped ad. same process on complete.
    lowLevelEvents[SKIPPED] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);

        var ad = adEvent.getAd();
        if (ad.isLinear()) {
            clearInterval(intervalTimer);
        }
        provider.trigger(_constants.STATE_AD_COMPLETE);
    };
    lowLevelEvents[USER_CLOSE] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
        var ad = adEvent.getAd();
        if (ad.isLinear()) {
            clearInterval(intervalTimer);
        }
        provider.trigger(_constants.STATE_AD_COMPLETE);
    };
    lowLevelEvents[THIRD_QUARTILE] = function (adEvent) {
        OvenPlayerConsole.log(adEvent.type);
    };

    Object.keys(lowLevelEvents).forEach(function (eventName) {
        adsManager.removeEventListener(eventName, lowLevelEvents[eventName]);
        adsManager.addEventListener(eventName, lowLevelEvents[eventName]);
    });
    that.setAdCompleteCallback = function (_adCompleteCallback) {
        adCompleteCallback = _adCompleteCallback;
    };
    that.isAllAdComplete = function () {
        return isAllAdCompelete;
    };
    that.isLinearAd = function () {
        return currentAd ? currentAd.isLinear() : true;
    };
    that.destroy = function () {
        OvenPlayerConsole.log("AdsEventListener : destroy()");
        provider.trigger(_constants.STATE_AD_COMPLETE);
        Object.keys(lowLevelEvents).forEach(function (eventName) {
            adsManager.removeEventListener(eventName, lowLevelEvents[eventName]);
        });
    };
    return that;
};

exports["default"] = Listener;

/***/ }),

/***/ "./src/js/api/provider/utils.js":
/*!**************************************!*\
  !*** ./src/js/api/provider/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pickCurrentSource = exports.errorTrigger = exports.separateLive = exports.extractVideoElement = undefined;

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

var _underscore = __webpack_require__(/*! utils/underscore */ "./src/js/utils/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Created by hoho on 2018. 11. 12..
 */
var extractVideoElement = exports.extractVideoElement = function extractVideoElement(elementOrMse) {
    if (_underscore2["default"].isElement(elementOrMse)) {
        return elementOrMse;
    }
    if (elementOrMse.getVideoElement) {
        return elementOrMse.getVideoElement();
    } else if (elementOrMse.media) {
        return elementOrMse.media;
    }
    return null;
};

var separateLive = exports.separateLive = function separateLive(mse) {
    //ToDo : You consider hlsjs. But not now because we don't support hlsjs.

    if (mse && mse.isDynamic) {
        return mse.isDynamic();
    } else {
        return false;
    }
};

var errorTrigger = exports.errorTrigger = function errorTrigger(error, provider) {
    if (provider) {
        provider.setState(_constants.STATE_ERROR);
        provider.pause();
        provider.trigger(_constants.ERROR, error);
    }
};

var pickCurrentSource = exports.pickCurrentSource = function pickCurrentSource(sources, currentSource, playerConfig) {
    var sourceIndex = Math.max(0, currentSource);
    var label = "";
    if (sources) {
        for (var i = 0; i < sources.length; i++) {
            if (sources[i]["default"]) {
                sourceIndex = i;
            }
            if (playerConfig.getSourceLabel() && sources[i].label === playerConfig.getSourceLabel()) {
                return i;
            }
        }
    }
    return sourceIndex;
};

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBpL3Byb3ZpZGVyL2Fkcy9BZHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2FwaS9wcm92aWRlci9hZHMvTGlzdGVuZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2FwaS9wcm92aWRlci91dGlscy5qcyJdLCJuYW1lcyI6WyJBZHMiLCJlbFZpZGVvIiwicHJvdmlkZXIiLCJwbGF5ZXJDb25maWciLCJhZFRhZ1VybCIsImVycm9yQ2FsbGJhY2siLCJBVVRPUExBWV9OT1RfQUxMT1dFRCIsIkFETUFOR0VSX0xPQURJTkdfRVJST1IiLCJBRFNfTUFOQUdFUl9MT0FERUQiLCJBRF9FUlJPUiIsInRoYXQiLCJhZHNNYW5hZ2VyTG9hZGVkIiwic3BlYyIsInN0YXJ0ZWQiLCJhY3RpdmUiLCJpc1ZpZGVvRW5kZWQiLCJjaGVja0F1dG9wbGF5U3RhcnQiLCJPbkFkRXJyb3IiLCJPbk1hbmFnZXJMb2FkZWQiLCJhZERpc3BsYXlDb250YWluZXIiLCJhZHNMb2FkZXIiLCJhZHNNYW5hZ2VyIiwibGlzdGVuZXIiLCJhZHNSZXF1ZXN0IiwiYXV0b3BsYXlBbGxvd2VkIiwiYXV0b3BsYXlSZXF1aXJlc011dGVkIiwic2VuZFdhcm5pbmdNZXNzYWdlRm9yTXV0ZWRQbGF5IiwidHJpZ2dlciIsIlBMQVlFUl9XQVJOSU5HIiwibWVzc2FnZSIsIldBUk5fTVNHX01VVEVEUExBWSIsInRpbWVyIiwiaWNvbkNsYXNzIiwiVUlfSUNPTlMiLCJ2b2x1bWVfbXV0ZSIsIm9uQ2xpY2tDYWxsYmFjayIsInNldE11dGUiLCJpbml0UmVxdWVzdCIsIk92ZW5QbGF5ZXJDb25zb2xlIiwibG9nIiwiZ29vZ2xlIiwiaW1hIiwiQWRzUmVxdWVzdCIsImZvcmNlTm9uTGluZWFyRnVsbFNsb3QiLCJzZXRBZFdpbGxBdXRvUGxheSIsInNldEFkV2lsbFBsYXlNdXRlZCIsInJlcXVlc3RBZHMiLCJjaGVja0F1dG9wbGF5U3VwcG9ydCIsInBsYXkiLCJwbGF5UHJvbWlzZSIsInVuZGVmaW5lZCIsInRoZW4iLCJwYXVzZSIsIm11dGVkIiwiQWRzTWFuYWdlckxvYWRlZEV2ZW50IiwiVHlwZSIsIkFkRXJyb3JFdmVudCIsInNldHRpbmdzIiwic2V0TG9jYWxlIiwic2V0RGlzYWJsZUN1c3RvbVBsYXliYWNrRm9ySU9TMTBQbHVzIiwiY3JlYXRlQWRDb250YWluZXIiLCJhZENvbnRhaW5lciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImdldENvbnRhaW5lciIsImFwcGVuZCIsImFkRXJyb3JFdmVudCIsImNvbnNvbGUiLCJnZXRFcnJvciIsImdldFZhc3RFcnJvckNvZGUiLCJnZXRNZXNzYWdlIiwiaW5uZXJFcnJvciIsImdldElubmVyRXJyb3IiLCJnZXRFcnJvckNvZGUiLCJkZXN0cm95IiwiYWRzTWFuYWdlckxvYWRlZEV2ZW50IiwiYWRzUmVuZGVyaW5nU2V0dGluZ3MiLCJBZHNSZW5kZXJpbmdTZXR0aW5ncyIsInJlc3RvcmVDdXN0b21QbGF5YmFja1N0YXRlT25BZEJyZWFrQ29tcGxldGUiLCJnZXRBZHNNYW5hZ2VyIiwib24iLCJDT05URU5UX1ZPTFVNRSIsImRhdGEiLCJtdXRlIiwic2V0Vm9sdW1lIiwidm9sdW1lIiwiQWREaXNwbGF5Q29udGFpbmVyIiwiQWRzTG9hZGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImlzQWN0aXZlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXN1bWUiLCJlcnJvciIsInJldHJ5Q291bnQiLCJjaGVja0Fkc01hbmFnZXJJc1JlYWR5IiwiaXNBdXRvU3RhcnQiLCJFcnJvciIsImluaXRpYWxpemUiLCJpbml0IiwiVmlld01vZGUiLCJOT1JNQUwiLCJzdGFydCIsInNldFRpbWVvdXQiLCJ2aWRlb0VuZGVkQ2FsbGJhY2siLCJjb21wbGV0ZUNvbnRlbnRDYWxsYmFjayIsImlzQWxsQWRDb21wbGV0ZSIsImlzTGluZWFyQWQiLCJjb250ZW50Q29tcGxldGUiLCJpc0F1dG9QbGF5U3VwcG9ydENoZWNrVGltZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCIkYWRzIiwiZmluZCIsInJlbW92ZSIsIm9mZiIsIkxpc3RlbmVyIiwiYWRzU3BlYyIsImxvd0xldmVsRXZlbnRzIiwiaW50ZXJ2YWxUaW1lciIsIkFEX0JVRkZFUklORyIsIkFkRXZlbnQiLCJDT05URU5UX1BBVVNFX1JFUVVFU1RFRCIsIkNPTlRFTlRfUkVTVU1FX1JFUVVFU1RFRCIsIkFMTF9BRFNfQ09NUExFVEVEIiwiQ0xJQ0siLCJTS0lQUEVEIiwiQ09NUExFVEUiLCJGSVJTVF9RVUFSVElMRSIsIkxPQURFRCIsIk1JRFBPSU5UIiwiUEFVU0VEIiwiUkVTVU1FRCIsIlNUQVJURUQiLCJVU0VSX0NMT1NFIiwiVEhJUkRfUVVBUlRJTEUiLCJpc0FsbEFkQ29tcGVsZXRlIiwiYWRDb21wbGV0ZUNhbGxiYWNrIiwiY3VycmVudEFkIiwiYWRFdmVudCIsInR5cGUiLCJnZXRQb3NpdGlvbiIsInNldFN0YXRlIiwiU1RBVEVfQ09NUExFVEUiLCJyZW1haW5pbmdUaW1lIiwiZ2V0UmVtYWluaW5nVGltZSIsImFkIiwiZ2V0QWQiLCJTVEFURV9BRF9MT0FERUQiLCJyZW1haW5pbmciLCJpc0xpbmVhciIsIlNUQVRFX0FEX1BBVVNFRCIsIlNUQVRFX0FEX1BMQVlJTkciLCJhZE9iamVjdCIsImR1cmF0aW9uIiwiZ2V0RHVyYXRpb24iLCJza2lwVGltZU9mZnNldCIsImdldFNraXBUaW1lT2Zmc2V0IiwiQURfQ0hBTkdFRCIsInNldEludGVydmFsIiwiQURfVElNRSIsInBvc2l0aW9uIiwic2tpcHBhYmxlIiwiZ2V0QWRTa2lwcGFibGVTdGF0ZSIsImNsZWFySW50ZXJ2YWwiLCJTVEFURV9BRF9DT01QTEVURSIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiZXZlbnROYW1lIiwic2V0QWRDb21wbGV0ZUNhbGxiYWNrIiwiX2FkQ29tcGxldGVDYWxsYmFjayIsImV4dHJhY3RWaWRlb0VsZW1lbnQiLCJlbGVtZW50T3JNc2UiLCJfIiwiaXNFbGVtZW50IiwiZ2V0VmlkZW9FbGVtZW50IiwibWVkaWEiLCJzZXBhcmF0ZUxpdmUiLCJtc2UiLCJpc0R5bmFtaWMiLCJlcnJvclRyaWdnZXIiLCJTVEFURV9FUlJPUiIsIkVSUk9SIiwicGlja0N1cnJlbnRTb3VyY2UiLCJzb3VyY2VzIiwiY3VycmVudFNvdXJjZSIsInNvdXJjZUluZGV4IiwiTWF0aCIsIm1heCIsImxhYmVsIiwiaSIsImxlbmd0aCIsImdldFNvdXJjZUxhYmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUdBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQU5BOzs7QUFnQkEsSUFBTUEsTUFBTSxTQUFOQSxHQUFNLENBQVNDLE9BQVQsRUFBa0JDLFFBQWxCLEVBQTRCQyxZQUE1QixFQUEwQ0MsUUFBMUMsRUFBb0RDLGFBQXBELEVBQWtFO0FBQzFFO0FBQ0EsUUFBTUMsdUJBQXVCLG9CQUE3QjtBQUNBLFFBQU1DLHlCQUF5Qix5QkFBL0I7QUFDQSxRQUFJQyxxQkFBcUIsRUFBekI7QUFDQSxRQUFJQyxXQUFXLEVBQWY7O0FBRUEsUUFBSUMsT0FBTyxFQUFYO0FBQ0EsUUFBSUMsbUJBQW1CLEtBQXZCO0FBQ0EsUUFBSUMsT0FBTztBQUNQQyxpQkFBUyxLQURGLEVBQ1M7QUFDaEJDLGdCQUFTLEtBRkYsRUFFUztBQUNoQkMsc0JBQWUsS0FIUjtBQUlQQyw0QkFBcUI7QUFKZCxLQUFYO0FBTUEsUUFBSUMsWUFBWSxJQUFoQjtBQUNBLFFBQUlDLGtCQUFrQixJQUF0Qjs7QUFFQSxRQUFJQyxxQkFBcUIsSUFBekI7QUFDQSxRQUFJQyxZQUFZLElBQWhCO0FBQ0EsUUFBSUMsYUFBYSxJQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBZjtBQUNBLFFBQUlDLGFBQWEsSUFBakI7QUFDQSxRQUFJQyxrQkFBa0IsS0FBdEI7QUFBQSxRQUE2QkMsd0JBQXdCLEtBQXJEOztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBTUMsaUNBQWlDLFNBQWpDQSw4QkFBaUMsR0FB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YztBQUN0Qzs7QUFFQSxRQUFHQSxPQUFPQSxJQUFJQyxTQUFkLEVBQXdCO0FBQ3BCLGVBQU9ELElBQUlDLFNBQUosRUFBUDtBQUNILEtBRkQsTUFFSztBQUNELGVBQU8sS0FBUDtBQUNIO0FBQ0osQ0FSTTs7QUFVQSxJQUFNQyxzQ0FBZSxTQUFmQSxZQUFlLENBQVN2RixLQUFULEVBQWdCN0YsUUFBaEIsRUFBeUI7QUFDakQsUUFBR0EsUUFBSCxFQUFZO0FBQ1JBLGlCQUFTNkksUUFBVCxDQUFrQndDLHNCQUFsQjtBQUNBckwsaUJBQVNrRCxLQUFUO0FBQ0FsRCxpQkFBU3lCLE9BQVQsQ0FBaUI2SixnQkFBakIsRUFBd0J6RixLQUF4QjtBQUNIO0FBRUosQ0FQTTs7QUFTQSxJQUFNMEYsZ0RBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBQ0MsT0FBRCxFQUFVQyxhQUFWLEVBQXlCeEwsWUFBekIsRUFBMEM7QUFDdkUsUUFBSXlMLGNBQWNDLEtBQUtDLEdBQUwsQ0FBUyxDQUFULEVBQVlILGFBQVosQ0FBbEI7QUFDQSxRQUFNSSxRQUFPLEVBQWI7QUFDQSxRQUFJTCxPQUFKLEVBQWE7QUFDVCxhQUFLLElBQUlNLElBQUksQ0FBYixFQUFnQkEsSUFBSU4sUUFBUU8sTUFBNUIsRUFBb0NELEdBQXBDLEVBQXlDO0FBQ3JDLGdCQUFJTixRQUFRTSxDQUFSLFlBQUosRUFBd0I7QUFDcEJKLDhCQUFjSSxDQUFkO0FBQ0g7QUFDRCxnQkFBSTdMLGFBQWErTCxjQUFiLE1BQWlDUixRQUFRTSxDQUFSLEVBQVdELEtBQVgsS0FBcUI1TCxhQUFhK0wsY0FBYixFQUExRCxFQUEwRjtBQUN0Rix1QkFBT0YsQ0FBUDtBQUNIO0FBQ0o7QUFDSjtBQUNELFdBQU9KLFdBQVA7QUFDSCxDQWRNLEMiLCJmaWxlIjoib3ZlbnBsYXllci5wcm92aWRlci5EYXNoUHJvdmlkZXJ+b3ZlbnBsYXllci5wcm92aWRlci5IbHNQcm92aWRlcn5vdmVucGxheWVyLnByb3ZpZGVyLkh0bWw1fm92ZW5wbGF5ZX4yZWMxOTNhYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBob2hvIG9uIDA4LzA0LzIwMTkuXG4gKi9cbmltcG9ydCBBZHNFdmVudHNMaXN0ZW5lciBmcm9tIFwiYXBpL3Byb3ZpZGVyL2Fkcy9MaXN0ZW5lclwiO1xuaW1wb3J0IExBJCBmcm9tIFwidXRpbHMvbGlrZUEkLmpzXCI7XG5pbXBvcnQge2Vycm9yVHJpZ2dlcn0gZnJvbSBcImFwaS9wcm92aWRlci91dGlsc1wiO1xuaW1wb3J0IHtcbiAgICBFUlJPUiwgRVJST1JTLFxuICAgIENPTlRFTlRfVk9MVU1FLFxuICAgIFNUQVRFX0xPQURJTkcsXG4gICAgSU5JVF9BRFNfRVJST1IsXG4gICAgUExBWUVSX1dBUk5JTkcsXG4gICAgV0FSTl9NU0dfTVVURURQTEFZLFxuICAgIFVJX0lDT05TXG59IGZyb20gXCJhcGkvY29uc3RhbnRzXCI7XG5cbmNvbnN0IEFkcyA9IGZ1bmN0aW9uKGVsVmlkZW8sIHByb3ZpZGVyLCBwbGF5ZXJDb25maWcsIGFkVGFnVXJsLCBlcnJvckNhbGxiYWNrKXtcbiAgICAvL1RvZG8gOiBtb3ZlIGNyZWF0ZUFkQ29udGFpbmVyIHRvIE1lZGlhTWFuYWdlclxuICAgIGNvbnN0IEFVVE9QTEFZX05PVF9BTExPV0VEID0gXCJhdXRvcGxheU5vdEFsbG93ZWRcIjtcbiAgICBjb25zdCBBRE1BTkdFUl9MT0FESU5HX0VSUk9SID0gXCJhZG1hbmFnZXJMb2FkaW5nVGltZW91dFwiO1xuICAgIGxldCBBRFNfTUFOQUdFUl9MT0FERUQgPSBcIlwiO1xuICAgIGxldCBBRF9FUlJPUiA9IFwiXCI7XG5cbiAgICBsZXQgdGhhdCA9IHt9O1xuICAgIGxldCBhZHNNYW5hZ2VyTG9hZGVkID0gZmFsc2U7XG4gICAgbGV0IHNwZWMgPSB7XG4gICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLCAvL3BsYXllciBzdGFydGVkXG4gICAgICAgIGFjdGl2ZSA6IGZhbHNlLCAvL29uIEFkXG4gICAgICAgIGlzVmlkZW9FbmRlZCA6IGZhbHNlLFxuICAgICAgICBjaGVja0F1dG9wbGF5U3RhcnQgOiB0cnVlXG4gICAgfTtcbiAgICBsZXQgT25BZEVycm9yID0gbnVsbDtcbiAgICBsZXQgT25NYW5hZ2VyTG9hZGVkID0gbnVsbDtcblxuICAgIGxldCBhZERpc3BsYXlDb250YWluZXIgPSBudWxsO1xuICAgIGxldCBhZHNMb2FkZXIgPSBudWxsO1xuICAgIGxldCBhZHNNYW5hZ2VyID0gbnVsbDtcbiAgICBsZXQgbGlzdGVuZXIgPSBudWxsO1xuICAgIGxldCBhZHNSZXF1ZXN0ID0gbnVsbDtcbiAgICBsZXQgYXV0b3BsYXlBbGxvd2VkID0gZmFsc2UsIGF1dG9wbGF5UmVxdWlyZXNNdXRlZCA9IGZhbHNlO1xuXG5cbiAgICAvLyBnb29nbGUuaW1hLnNldHRpbmdzLnNldEF1dG9QbGF5QWRCcmVha3MoZmFsc2UpO1xuICAgIC8vZ29vZ2xlLmltYS5zZXR0aW5ncy5zZXRWcGFpZE1vZGUoZ29vZ2xlLmltYS5JbWFTZGtTZXR0aW5ncy5WcGFpZE1vZGUuRU5BQkxFRCk7XG5cbiAgICAvL2dvb2dsZS5pbWEuc2V0dGluZ3Muc2V0TG9jYWxlKCdrbycpO1xuICAgIC8vZ29vZ2xlLmltYS5zZXR0aW5ncy5zZXRWcGFpZE1vZGUoZ29vZ2xlLmltYS5JbWFTZGtTZXR0aW5ncy5WcGFpZE1vZGUuRU5BQkxFRCk7XG4gICAgLy9nb29nbGUuaW1hLnNldHRpbmdzLnNldERpc2FibGVDdXN0b21QbGF5YmFja0ZvcklPUzEwUGx1cyh0cnVlKTtcbiAgICBjb25zdCBzZW5kV2FybmluZ01lc3NhZ2VGb3JNdXRlZFBsYXkgPSBmdW5jdGlvbigpe1xuICAgICAgICBwcm92aWRlci50cmlnZ2VyKFBMQVlFUl9XQVJOSU5HLCB7XG4gICAgICAgICAgICBtZXNzYWdlIDogV0FSTl9NU0dfTVVURURQTEFZLFxuICAgICAgICAgICAgdGltZXIgOiAxMCAqIDEwMDAsXG4gICAgICAgICAgICBpY29uQ2xhc3MgOiBVSV9JQ09OUy52b2x1bWVfbXV0ZSxcbiAgICAgICAgICAgIG9uQ2xpY2tDYWxsYmFjayA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXIuc2V0TXV0ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIHRyeXtcbiAgICAgICAgQURTX01BTkFHRVJfTE9BREVEID0gZ29vZ2xlLmltYS5BZHNNYW5hZ2VyTG9hZGVkRXZlbnQuVHlwZS5BRFNfTUFOQUdFUl9MT0FERUQ7XG4gICAgICAgIEFEX0VSUk9SID0gZ29vZ2xlLmltYS5BZEVycm9yRXZlbnQuVHlwZS5BRF9FUlJPUjtcbiAgICAgICAgZ29vZ2xlLmltYS5zZXR0aW5ncy5zZXRMb2NhbGUoXCJrb1wiKTtcbiAgICAgICAgZ29vZ2xlLmltYS5zZXR0aW5ncy5zZXREaXNhYmxlQ3VzdG9tUGxheWJhY2tGb3JJT1MxMFBsdXModHJ1ZSk7XG5cblxuXG5cbiAgICAgICAgY29uc3QgY3JlYXRlQWRDb250YWluZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgYWRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGFkQ29udGFpbmVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnb3ZwLWFkcycpO1xuICAgICAgICAgICAgYWRDb250YWluZXIuc2V0QXR0cmlidXRlKCdpZCcsICdvdnAtYWRzJyk7XG4gICAgICAgICAgICBwbGF5ZXJDb25maWcuZ2V0Q29udGFpbmVyKCkuYXBwZW5kKGFkQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFkQ29udGFpbmVyO1xuICAgICAgICB9O1xuICAgICAgICBPbkFkRXJyb3IgPSBmdW5jdGlvbihhZEVycm9yRXZlbnQpe1xuICAgICAgICAgICAgLy9ub3RlIDogYWRFcnJvckV2ZW50LmdldEVycm9yKCkuZ2V0SW5uZXJFcnJvcigpLmdldEVycm9yQ29kZSgpID09PSAxMjA1ICYgYWRFcnJvckV2ZW50LmdldEVycm9yKCkuZ2V0VmFzdEVycm9yQ29kZSgpID09PSA0MDAgaXMgQnJvd3NlciBVc2VyIEludGVyYWN0aXZlIGVycm9yLlxuXG4gICAgICAgICAgICAvL0RvIG5vdCB0cmlnZ2VyaW5nIEVSUk9SLiBiZWN1YXNlIEl0IGp1c3QgQUQhXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFkRXJyb3JFdmVudC5nZXRFcnJvcigpLmdldFZhc3RFcnJvckNvZGUoKSwgYWRFcnJvckV2ZW50LmdldEVycm9yKCkuZ2V0TWVzc2FnZSgpKTtcblxuICAgICAgICAgICAgbGV0IGlubmVyRXJyb3IgPSBhZEVycm9yRXZlbnQuZ2V0RXJyb3IoKS5nZXRJbm5lckVycm9yKCk7XG4gICAgICAgICAgICBpZihpbm5lckVycm9yKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpbm5lckVycm9yLmdldEVycm9yQ29kZSgpLCBpbm5lckVycm9yLmdldE1lc3NhZ2UoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWRzTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGFkc01hbmFnZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BlYy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHNwZWMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBwcm92aWRlci5wbGF5KCk7XG5cbiAgICAgICAgICAgIC8qaWYoaW5uZXJFcnJvciAmJiBpbm5lckVycm9yLmdldEVycm9yQ29kZSgpID09PSAxMjA1KXtcbiAgICAgICAgICAgICB9ZWxzZXtcblxuICAgICAgICAgICAgIH0qL1xuXG5cbiAgICAgICAgfTtcbiAgICAgICAgT25NYW5hZ2VyTG9hZGVkID0gZnVuY3Rpb24oYWRzTWFuYWdlckxvYWRlZEV2ZW50KXtcbiAgICAgICAgICAgIGxldCBhZHNSZW5kZXJpbmdTZXR0aW5ncyA9IG5ldyBnb29nbGUuaW1hLkFkc1JlbmRlcmluZ1NldHRpbmdzKCk7XG4gICAgICAgICAgICBhZHNSZW5kZXJpbmdTZXR0aW5ncy5yZXN0b3JlQ3VzdG9tUGxheWJhY2tTdGF0ZU9uQWRCcmVha0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vYWRzUmVuZGVyaW5nU2V0dGluZ3MudXNlU3R5bGVkTm9uTGluZWFyQWRzID0gdHJ1ZTtcbiAgICAgICAgICAgIGFkc01hbmFnZXIgPSBhZHNNYW5hZ2VyTG9hZGVkRXZlbnQuZ2V0QWRzTWFuYWdlcihlbFZpZGVvLCBhZHNSZW5kZXJpbmdTZXR0aW5ncyk7XG5cblxuICAgICAgICAgICAgbGlzdGVuZXIgPSBBZHNFdmVudHNMaXN0ZW5lcihhZHNNYW5hZ2VyLCBwcm92aWRlciwgc3BlYywgT25BZEVycm9yKTtcblxuICAgICAgICAgICAgcHJvdmlkZXIub24oQ09OVEVOVF9WT0xVTUUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZihkYXRhLm11dGUpe1xuICAgICAgICAgICAgICAgICAgICBhZHNNYW5hZ2VyLnNldFZvbHVtZSgwKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgYWRzTWFuYWdlci5zZXRWb2x1bWUoZGF0YS52b2x1bWUvMTAwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIHRoYXQpO1xuXG4gICAgICAgICAgICBhZHNNYW5hZ2VyTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICB9O1xuXG5cbiAgICAgICAgYWREaXNwbGF5Q29udGFpbmVyID0gbmV3IGdvb2dsZS5pbWEuQWREaXNwbGF5Q29udGFpbmVyKGNyZWF0ZUFkQ29udGFpbmVyKCksIGVsVmlkZW8pO1xuICAgICAgICBhZHNMb2FkZXIgPSBuZXcgZ29vZ2xlLmltYS5BZHNMb2FkZXIoYWREaXNwbGF5Q29udGFpbmVyKTtcblxuICAgICAgICBhZHNMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihBRFNfTUFOQUdFUl9MT0FERUQsIE9uTWFuYWdlckxvYWRlZCwgZmFsc2UpO1xuICAgICAgICBhZHNMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihBRF9FUlJPUiwgT25BZEVycm9yLCBmYWxzZSk7XG5cblxuICAgICAgICBmdW5jdGlvbiBpbml0UmVxdWVzdCgpe1xuXG4gICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJBdXRvUGxheSBTdXBwb3J0IDogXCIsIFwiYXV0b3BsYXlBbGxvd2VkXCIsYXV0b3BsYXlBbGxvd2VkLCBcImF1dG9wbGF5UmVxdWlyZXNNdXRlZFwiLGF1dG9wbGF5UmVxdWlyZXNNdXRlZCk7XG5cbiAgICAgICAgICAgIGFkc1JlcXVlc3QgPSBuZXcgZ29vZ2xlLmltYS5BZHNSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIGFkc1JlcXVlc3QuZm9yY2VOb25MaW5lYXJGdWxsU2xvdCA9IGZhbHNlO1xuICAgICAgICAgICAgLyppZihwbGF5ZXJDb25maWcuZ2V0QnJvd3NlcigpLmJyb3dzZXIgPT09IFwiU2FmYXJpXCIgJiYgcGxheWVyQ29uZmlnLmdldEJyb3dzZXIoKS5vcyA9PT0gXCJpT1NcIiApe1xuICAgICAgICAgICAgIGF1dG9wbGF5QWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgIGF1dG9wbGF5UmVxdWlyZXNNdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgIH0qL1xuXG4gICAgICAgICAgICBhZHNSZXF1ZXN0LnNldEFkV2lsbEF1dG9QbGF5KGF1dG9wbGF5QWxsb3dlZCk7XG4gICAgICAgICAgICBhZHNSZXF1ZXN0LnNldEFkV2lsbFBsYXlNdXRlZChhdXRvcGxheVJlcXVpcmVzTXV0ZWQpO1xuICAgICAgICAgICAgaWYoYXV0b3BsYXlSZXF1aXJlc011dGVkKXtcbiAgICAgICAgICAgICAgICBzZW5kV2FybmluZ01lc3NhZ2VGb3JNdXRlZFBsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkc1JlcXVlc3QuYWRUYWdVcmwgPSBhZFRhZ1VybDtcblxuICAgICAgICAgICAgYWRzTG9hZGVyLnJlcXVlc3RBZHMoYWRzUmVxdWVzdCk7XG5cbiAgICAgICAgICAgIC8vdHdvIHdheSB3aGF0IGFkIHN0YXJ0cy5cbiAgICAgICAgICAgIC8vYWRzTG9hZGVyLnJlcXVlc3RBZHMoYWRzUmVxdWVzdCk7IG9yICBhZHNNYW5hZ2VyLnN0YXJ0KCk7XG4gICAgICAgICAgICAvL3doYXQ/IHdoeT8/IHd0aD8/XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjaGVja0F1dG9wbGF5U3VwcG9ydCgpIHtcbiAgICAgICAgICAgIGlmKCFlbFZpZGVvLnBsYXkpe1xuICAgICAgICAgICAgICAgIGF1dG9wbGF5QWxsb3dlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXV0b3BsYXlSZXF1aXJlc011dGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3BlYy5jaGVja0F1dG9wbGF5U3RhcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpbml0UmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHBsYXlQcm9taXNlID0gZWxWaWRlby5wbGF5KCk7XG4gICAgICAgICAgICBpZiAocGxheVByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBsYXlQcm9taXNlLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgbWFrZSBpdCBoZXJlLCB1bm11dGVkIGF1dG9wbGF5IHdvcmtzLlxuICAgICAgICAgICAgICAgICAgICBlbFZpZGVvLnBhdXNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlBbGxvd2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlSZXF1aXJlc011dGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNwZWMuY2hlY2tBdXRvcGxheVN0YXJ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGluaXRSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBlbFZpZGVvLm11dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXlQcm9taXNlID0gZWxWaWRlby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5UHJvbWlzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5UHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBtYWtlIGl0IGhlcmUsIG11dGVkIGF1dG9wbGF5IHdvcmtzIGJ1dCB1bm11dGVkIGF1dG9wbGF5IGRvZXMgbm90LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsVmlkZW8ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvcGxheUFsbG93ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5UmVxdWlyZXNNdXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5jaGVja0F1dG9wbGF5U3RhcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0UmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvdGggbXV0ZWQgYW5kIHVubXV0ZWQgYXV0b3BsYXkgZmFpbGVkLiBGYWxsIGJhY2sgdG8gY2xpY2sgdG8gcGxheS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbFZpZGVvLm11dGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlBbGxvd2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlSZXF1aXJlc011dGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5jaGVja0F1dG9wbGF5U3RhcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0UmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIC8vTWF5YmUgdGhpcyBpcyBJRTExLi4uLlxuICAgICAgICAgICAgICAgIGVsVmlkZW8ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBhdXRvcGxheUFsbG93ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF1dG9wbGF5UmVxdWlyZXNNdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNwZWMuY2hlY2tBdXRvcGxheVN0YXJ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaW5pdFJlcXVlc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGVja0F1dG9wbGF5U3VwcG9ydCgpO1xuXG4gICAgICAgIHRoYXQuaXNBY3RpdmUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3BlYy5hY3RpdmU7XG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuc3RhcnRlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzcGVjLnN0YXJ0ZWQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoYXQucGxheSA9ICgpID0+IHtcbiAgICAgICAgICAgIC8vcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfTE9BRElORyk7XG5cbiAgICAgICAgICAgIGlmKHNwZWMuc3RhcnRlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRzTWFuYWdlci5yZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3Ipe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgcmV0cnlDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uIGNoZWNrQWRzTWFuYWdlcklzUmVhZHkoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5Q291bnQgKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhZHNNYW5hZ2VyTG9hZGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigocGxheWVyQ29uZmlnLmlzQXV0b1N0YXJ0KCkgJiYgIWF1dG9wbGF5QWxsb3dlZCkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlBbGxvd2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5zdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoQVVUT1BMQVlfTk9UX0FMTE9XRUQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9JIHRoaW5rIGRvIG5vdCBuZXNzZXNzYXJ5IHRoaXMgY29kZSBhbnltb3JlLiBCZWNhdXNlIG11dGVkIHBsYXkgc29sdmVzIGV2ZXJ5dGhpbmcuIDIwMTktMDYtMDRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyppZihwbGF5ZXJDb25maWcuZ2V0QnJvd3NlcigpLm9zICA9PT0gXCJpT1NcIiB8fCBwbGF5ZXJDb25maWcuZ2V0QnJvd3NlcigpLm9zICA9PT0gXCJBbmRyb2lkXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Eb24ndCBwbGF5aW5nIHZpZGVvIHdoZW4gcGxheWVyIGNvbXBsZXRlIHBsYXlpbmcgQUQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL09ubHkgaU9TIFNhZmFyaSBGaXJzdCBsb2FkZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbFZpZGVvLmxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWREaXNwbGF5Q29udGFpbmVyLmluaXRpYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRzTWFuYWdlci5pbml0KFwiMTAwJVwiLCBcIjEwMCVcIiwgZ29vZ2xlLmltYS5WaWV3TW9kZS5OT1JNQUwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHNNYW5hZ2VyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXRyeUNvdW50IDwgMzAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja0Fkc01hbmFnZXJJc1JlYWR5LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKEFETUFOR0VSX0xPQURJTkdfRVJST1IpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoYXQucGF1c2UgPSAoKSA9PiB7XG4gICAgICAgICAgICBhZHNNYW5hZ2VyLnBhdXNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoYXQudmlkZW9FbmRlZENhbGxiYWNrID0gKGNvbXBsZXRlQ29udGVudENhbGxiYWNrKSA9PiB7XG4gICAgICAgICAgICAvL2xpc3RlbmVyLmlzTGluZWFyQWQgOiBnZXQgY3VycmVudCBhZCdzIHN0YXR1cyB3aGV0aGVyIGxpbmVhciBhZCBvciBub3QuXG4gICAgICAgICAgICBpZihsaXN0ZW5lciAmJiAobGlzdGVuZXIuaXNBbGxBZENvbXBsZXRlKCkgfHwgIWxpc3RlbmVyLmlzTGluZWFyQWQoKSkpe1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlQ29udGVudENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAvL1Bvc3QgLSBSb2xsIOydhCDsnqzsg53tlZjquLAg7JyE7ZW07ISc64qUIOy9mO2FkOy4oOqwgCDrgZ3rgqzsnYzsnYQgYWRzTG9hZGVy7JeQ6rKMIOyVjOugpOyVvCDtlZzri6RcbiAgICAgICAgICAgICAgICBzcGVjLmlzVmlkZW9FbmRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYWRzTG9hZGVyLmNvbnRlbnRDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGF0LmlzQXV0b1BsYXlTdXBwb3J0Q2hlY2tUaW1lID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWMuY2hlY2tBdXRvcGxheVN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuZGVzdHJveSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmKGFkc0xvYWRlcil7XG4gICAgICAgICAgICAgICAgYWRzTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoQURTX01BTkFHRVJfTE9BREVELCBPbk1hbmFnZXJMb2FkZWQpO1xuICAgICAgICAgICAgICAgIGFkc0xvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKEFEX0VSUk9SLCBPbkFkRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihhZHNNYW5hZ2VyKXtcbiAgICAgICAgICAgICAgICBhZHNNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoYWREaXNwbGF5Q29udGFpbmVyKXtcbiAgICAgICAgICAgICAgICBhZERpc3BsYXlDb250YWluZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihsaXN0ZW5lcil7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgJGFkcyA9IExBJChwbGF5ZXJDb25maWcuZ2V0Q29udGFpbmVyKCkpLmZpbmQoXCIub3ZwLWFkc1wiKTtcbiAgICAgICAgICAgIGlmKCRhZHMpe1xuICAgICAgICAgICAgICAgICRhZHMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb3ZpZGVyLm9mZihDT05URU5UX1ZPTFVNRSwgbnVsbCwgdGhhdCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGF0O1xuXG4gICAgfWNhdGNoIChlcnJvcil7XG4gICAgICAgIC8vbGV0IHRlbXBFcnJvciA9IEVSUk9SU1tJTklUX0FEU19FUlJPUl07XG4gICAgICAgIC8vdGVtcEVycm9yLmVycm9yID0gZXJyb3I7XG4gICAgICAgIC8vZXJyb3JDYWxsYmFjayh0ZW1wRXJyb3IpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxufTtcblxuXG5leHBvcnQgZGVmYXVsdCBBZHM7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGhvaG8gb24gMTAvMDQvMjAxOS5cbiAqL1xuaW1wb3J0IExBJCBmcm9tIFwidXRpbHMvbGlrZUEkLmpzXCI7XG5pbXBvcnQge1xuICAgIEVSUk9SLFxuICAgIFNUQVRFX0lETEUsXG4gICAgU1RBVEVfUExBWUlORyxcbiAgICBTVEFURV9TVEFMTEVELFxuICAgIFNUQVRFX0xPQURJTkcsXG4gICAgU1RBVEVfQ09NUExFVEUsXG4gICAgU1RBVEVfQURfTE9BREVELFxuICAgIFNUQVRFX0FEX1BMQVlJTkcsXG4gICAgU1RBVEVfQURfUEFVU0VELFxuICAgIFNUQVRFX0FEX0NPTVBMRVRFLFxuICAgIEFEX0NIQU5HRUQsXG4gICAgQURfVElNRSxcbiAgICBTVEFURV9QQVVTRUQsXG4gICAgU1RBVEVfRVJST1IsXG4gICAgQ09OVEVOVF9DT01QTEVURSxcbiAgICBDT05URU5UX1NFRUssXG4gICAgQ09OVEVOVF9CVUZGRVJfRlVMTCxcbiAgICBDT05URU5UX1NFRUtFRCxcbiAgICBDT05URU5UX0JVRkZFUixcbiAgICBDT05URU5UX1RJTUUsXG4gICAgQ09OVEVOVF9WT0xVTUUsXG4gICAgQ09OVEVOVF9NRVRBLFxuICAgIFBMQVlFUl9VTktOV09OX0VSUk9SLFxuICAgIFBMQVlFUl9VTktOV09OX09QRVJBVElPTl9FUlJPUixcbiAgICBQTEFZRVJfVU5LTldPTl9ORVdXT1JLX0VSUk9SLFxuICAgIFBMQVlFUl9VTktOV09OX0RFQ09ERV9FUlJPUixcbiAgICBQTEFZRVJfRklMRV9FUlJPUixcbiAgICBQTEFZRVJfU1RBVEUsXG4gICAgUFJPVklERVJfSFRNTDUsXG4gICAgUFJPVklERVJfV0VCUlRDLFxuICAgIFBST1ZJREVSX0RBU0gsXG4gICAgUFJPVklERVJfSExTXG59IGZyb20gXCJhcGkvY29uc3RhbnRzXCI7XG5cbmNvbnN0IExpc3RlbmVyID0gZnVuY3Rpb24oYWRzTWFuYWdlciwgcHJvdmlkZXIsIGFkc1NwZWMsIE9uQWRFcnJvcil7XG4gICAgbGV0IHRoYXQgPSB7fTtcbiAgICBsZXQgbG93TGV2ZWxFdmVudHMgPSB7fTtcblxuICAgIGxldCBpbnRlcnZhbFRpbWVyID0gbnVsbDtcblxuICAgIGNvbnN0IEFEX0JVRkZFUklORyA9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkFEX0JVRkZFUklORztcbiAgICBjb25zdCBDT05URU5UX1BBVVNFX1JFUVVFU1RFRCA9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkNPTlRFTlRfUEFVU0VfUkVRVUVTVEVEO1xuICAgIGNvbnN0IENPTlRFTlRfUkVTVU1FX1JFUVVFU1RFRCA9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkNPTlRFTlRfUkVTVU1FX1JFUVVFU1RFRDtcbiAgICBjb25zdCBBRF9FUlJPUiA9IGdvb2dsZS5pbWEuQWRFcnJvckV2ZW50LlR5cGUuQURfRVJST1I7XG4gICAgY29uc3QgQUxMX0FEU19DT01QTEVURUQgPSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5BTExfQURTX0NPTVBMRVRFRDtcbiAgICBjb25zdCBDTElDSyA9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkNMSUNLO1xuICAgIGNvbnN0IFNLSVBQRUQgPSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5TS0lQUEVEO1xuICAgIGNvbnN0IENPTVBMRVRFID0gZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuQ09NUExFVEU7XG4gICAgY29uc3QgRklSU1RfUVVBUlRJTEU9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkZJUlNUX1FVQVJUSUxFO1xuICAgIGNvbnN0IExPQURFRCA9IGdvb2dsZS5pbWEuQWRFdmVudC5UeXBlLkxPQURFRDtcbiAgICBjb25zdCBNSURQT0lOVD0gZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuTUlEUE9JTlQ7XG4gICAgY29uc3QgUEFVU0VEID0gZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuUEFVU0VEO1xuICAgIGNvbnN0IFJFU1VNRUQgPSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5SRVNVTUVEO1xuICAgIGNvbnN0IFNUQVJURUQgPSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5TVEFSVEVEO1xuICAgIGNvbnN0IFVTRVJfQ0xPU0UgPSBnb29nbGUuaW1hLkFkRXZlbnQuVHlwZS5VU0VSX0NMT1NFO1xuICAgIGNvbnN0IFRISVJEX1FVQVJUSUxFID0gZ29vZ2xlLmltYS5BZEV2ZW50LlR5cGUuVEhJUkRfUVVBUlRJTEU7XG5cbiAgICBsZXQgaXNBbGxBZENvbXBlbGV0ZSA9IGZhbHNlOyAgIC8vUG9zdCByb2xs7J2EIOychO2VtFxuICAgIGxldCBhZENvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuICAgIGxldCBjdXJyZW50QWQgPSBudWxsO1xuXG4gICAgIGxvd0xldmVsRXZlbnRzW0NPTlRFTlRfUEFVU0VfUkVRVUVTVEVEXSA9IChhZEV2ZW50KSA9PiB7XG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhhZEV2ZW50LnR5cGUpO1xuICAgICAgICAvL1RoaXMgY2FsbGxzIHdoZW4gcGxheWVyIGlzIHBsYXlpbmcgY29udGVudHMgZm9yIGFkLlxuICAgICAgICAgaWYoYWRzU3BlYy5zdGFydGVkKXtcbiAgICAgICAgICAgICBhZHNTcGVjLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgcHJvdmlkZXIucGF1c2UoKTtcbiAgICAgICAgIH1cblxuICAgIH07XG5cbiAgICBsb3dMZXZlbEV2ZW50c1tDT05URU5UX1JFU1VNRV9SRVFVRVNURURdID0gKGFkRXZlbnQpID0+IHtcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKGFkRXZlbnQudHlwZSk7XG4gICAgICAgIC8vVGhpcyBjYWxscyB3aGVuIG9uZSBhZCBlbmRlZC5cbiAgICAgICAgLy9BbmQgdGhpcyBpcyBzaWduYWwgd2hhdCBwbGF5IHRoZSBjb250ZW50cy5cbiAgICAgICAgYWRzU3BlYy5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBpZihhZHNTcGVjLnN0YXJ0ZWQgJiYgKHByb3ZpZGVyLmdldFBvc2l0aW9uKCkgPT09IDAgfHwgIWFkc1NwZWMuaXNWaWRlb0VuZGVkKSAgKXtcbiAgICAgICAgICAgIHByb3ZpZGVyLnBsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50c1tBRF9FUlJPUl0gPSBPbkFkRXJyb3I7XG5cbiAgICBsb3dMZXZlbEV2ZW50c1tBTExfQURTX0NPTVBMRVRFRF0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICAgICAgaXNBbGxBZENvbXBlbGV0ZSA9IHRydWU7XG4gICAgICAgIGlmKGFkc1NwZWMuaXNWaWRlb0VuZGVkKXtcbiAgICAgICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX0NPTVBMRVRFKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgbG93TGV2ZWxFdmVudHNbQ0xJQ0tdID0gKGFkRXZlbnQpID0+IHtcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKGFkRXZlbnQudHlwZSk7XG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50c1tGSVJTVF9RVUFSVElMRV0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICB9O1xuICAgIC8vXG4gICAgbG93TGV2ZWxFdmVudHNbQURfQlVGRkVSSU5HXSA9IChhZEV2ZW50KSA9PiB7XG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkFEX0JVRkZFUklOR1wiLGFkRXZlbnQudHlwZSk7XG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50c1tMT0FERURdID0gKGFkRXZlbnQpID0+IHtcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKGFkRXZlbnQudHlwZSk7XG4gICAgICAgIGxldCByZW1haW5pbmdUaW1lID0gYWRzTWFuYWdlci5nZXRSZW1haW5pbmdUaW1lKCk7XG4gICAgICAgIGxldCBhZCA9IGFkRXZlbnQuZ2V0QWQoKTtcbiAgICAgICAgLyp2YXIgbWV0YWRhdGEgPSB7XG4gICAgICAgICAgICBkdXJhdGlvbjogcmVtYWluaW5nVGltZSxcbiAgICAgICAgICAgIHR5cGUgOlwiYWRcIlxuICAgICAgICB9OyovXG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoU1RBVEVfQURfTE9BREVELCB7cmVtYWluaW5nIDogcmVtYWluaW5nVGltZSwgaXNMaW5lYXIgOiBhZC5pc0xpbmVhcigpIH0pO1xuXG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50c1tNSURQT0lOVF0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICB9O1xuICAgIGxvd0xldmVsRXZlbnRzW1BBVVNFRF0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfQURfUEFVU0VEKTtcbiAgICB9O1xuICAgIGxvd0xldmVsRXZlbnRzW1JFU1VNRURdID0gKGFkRXZlbnQpID0+IHtcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKGFkRXZlbnQudHlwZSk7XG4gICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX0FEX1BMQVlJTkcpO1xuICAgIH07XG5cblxuICAgIGxvd0xldmVsRXZlbnRzW1NUQVJURURdID0gKGFkRXZlbnQpID0+IHtcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKGFkRXZlbnQudHlwZSk7XG4gICAgICAgIGxldCBhZCA9IGFkRXZlbnQuZ2V0QWQoKTtcbiAgICAgICAgY3VycmVudEFkID0gYWQ7XG5cbiAgICAgICAgbGV0IGFkT2JqZWN0ID0ge1xuICAgICAgICAgICAgaXNMaW5lYXIgOiBhZC5pc0xpbmVhcigpICxcbiAgICAgICAgICAgIGR1cmF0aW9uIDogYWQuZ2V0RHVyYXRpb24oKSxcbiAgICAgICAgICAgIHNraXBUaW1lT2Zmc2V0IDogYWQuZ2V0U2tpcFRpbWVPZmZzZXQoKSAgICAgLy9UaGUgbnVtYmVyIG9mIHNlY29uZHMgb2YgcGxheWJhY2sgYmVmb3JlIHRoZSBhZCBiZWNvbWVzIHNraXBwYWJsZS5cbiAgICAgICAgfTtcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihBRF9DSEFOR0VELCBhZE9iamVjdCk7XG5cblxuICAgICAgICBpZiAoYWQuaXNMaW5lYXIoKSkge1xuXG4gICAgICAgICAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9BRF9QTEFZSU5HKTtcbiAgICAgICAgICAgIGFkc1NwZWMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBGb3IgYSBsaW5lYXIgYWQsIGEgdGltZXIgY2FuIGJlIHN0YXJ0ZWQgdG8gcG9sbCBmb3JcbiAgICAgICAgICAgIC8vIHRoZSByZW1haW5pbmcgdGltZS5cbiAgICAgICAgICAgIGludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbChcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1RpbWUgPSBhZHNNYW5hZ2VyLmdldFJlbWFpbmluZ1RpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGR1cmF0aW9uID0gYWQuZ2V0RHVyYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlci50cmlnZ2VyKEFEX1RJTUUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uIDogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBza2lwVGltZU9mZnNldCA6IGFkLmdldFNraXBUaW1lT2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgOiByZW1haW5pbmdUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gOiBkdXJhdGlvbiAtIHJlbWFpbmluZ1RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBza2lwcGFibGUgOiBhZHNNYW5hZ2VyLmdldEFkU2tpcHBhYmxlU3RhdGUoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDMwMCk7IC8vIGV2ZXJ5IDMwMG1zXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcHJvdmlkZXIucGxheSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50c1tDT01QTEVURV0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICAgICAgbGV0IGFkID0gYWRFdmVudC5nZXRBZCgpO1xuICAgICAgICBpZiAoYWQuaXNMaW5lYXIoKSkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbFRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKFNUQVRFX0FEX0NPTVBMRVRFKTtcbiAgICB9O1xuICAgIC8vVXNlciBza2lwcGVkIGFkLiBzYW1lIHByb2Nlc3Mgb24gY29tcGxldGUuXG4gICAgbG93TGV2ZWxFdmVudHNbU0tJUFBFRF0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcblxuICAgICAgICBsZXQgYWQgPSBhZEV2ZW50LmdldEFkKCk7XG4gICAgICAgIGlmIChhZC5pc0xpbmVhcigpKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsVGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoU1RBVEVfQURfQ09NUExFVEUpO1xuICAgIH07XG4gICAgbG93TGV2ZWxFdmVudHNbVVNFUl9DTE9TRV0gPSAoYWRFdmVudCkgPT4ge1xuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coYWRFdmVudC50eXBlKTtcbiAgICAgICAgbGV0IGFkID0gYWRFdmVudC5nZXRBZCgpO1xuICAgICAgICBpZiAoYWQuaXNMaW5lYXIoKSkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbFRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKFNUQVRFX0FEX0NPTVBMRVRFKTtcbiAgICB9O1xuICAgIGxvd0xldmVsRXZlbnRzW1RISVJEX1FVQVJUSUxFXSA9IChhZEV2ZW50KSA9PiB7XG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhhZEV2ZW50LnR5cGUpO1xuICAgIH07XG5cblxuICAgIE9iamVjdC5rZXlzKGxvd0xldmVsRXZlbnRzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgIGFkc01hbmFnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxvd0xldmVsRXZlbnRzW2V2ZW50TmFtZV0pO1xuICAgICAgICBhZHNNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsb3dMZXZlbEV2ZW50c1tldmVudE5hbWVdKTtcbiAgICB9KTtcbiAgICB0aGF0LnNldEFkQ29tcGxldGVDYWxsYmFjayA9IChfYWRDb21wbGV0ZUNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGFkQ29tcGxldGVDYWxsYmFjayA9IF9hZENvbXBsZXRlQ2FsbGJhY2s7XG4gICAgfTtcbiAgICB0aGF0LmlzQWxsQWRDb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGlzQWxsQWRDb21wZWxldGU7XG4gICAgfTtcbiAgICB0aGF0LmlzTGluZWFyQWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJyZW50QWQgID8gY3VycmVudEFkLmlzTGluZWFyKCkgOiB0cnVlO1xuICAgIH07XG4gICAgdGhhdC5kZXN0cm95ID0gKCkgPT57XG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkFkc0V2ZW50TGlzdGVuZXIgOiBkZXN0cm95KClcIik7XG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoU1RBVEVfQURfQ09NUExFVEUpO1xuICAgICAgICBPYmplY3Qua2V5cyhsb3dMZXZlbEV2ZW50cykuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgICAgICAgICAgYWRzTWFuYWdlci5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbG93TGV2ZWxFdmVudHNbZXZlbnROYW1lXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHRoYXQ7XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RlbmVyOyIsIi8qKlxuICogQ3JlYXRlZCBieSBob2hvIG9uIDIwMTguIDExLiAxMi4uXG4gKi9cbmltcG9ydCB7RVJST1IsIFNUQVRFX0VSUk9SfSBmcm9tIFwiYXBpL2NvbnN0YW50c1wiO1xuaW1wb3J0IF8gZnJvbSBcInV0aWxzL3VuZGVyc2NvcmVcIjtcblxuZXhwb3J0IGNvbnN0IGV4dHJhY3RWaWRlb0VsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50T3JNc2UpIHtcbiAgICBpZihfLmlzRWxlbWVudChlbGVtZW50T3JNc2UpKXtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRPck1zZTtcbiAgICB9XG4gICAgaWYoZWxlbWVudE9yTXNlLmdldFZpZGVvRWxlbWVudCl7XG4gICAgICAgIHJldHVybiBlbGVtZW50T3JNc2UuZ2V0VmlkZW9FbGVtZW50KCk7XG4gICAgfWVsc2UgaWYoZWxlbWVudE9yTXNlLm1lZGlhKXtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRPck1zZS5tZWRpYTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQgY29uc3Qgc2VwYXJhdGVMaXZlID0gZnVuY3Rpb24obXNlKSB7XG4gICAgLy9Ub0RvIDogWW91IGNvbnNpZGVyIGhsc2pzLiBCdXQgbm90IG5vdyBiZWNhdXNlIHdlIGRvbid0IHN1cHBvcnQgaGxzanMuXG5cbiAgICBpZihtc2UgJiYgbXNlLmlzRHluYW1pYyl7XG4gICAgICAgIHJldHVybiBtc2UuaXNEeW5hbWljKCk7XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgZXJyb3JUcmlnZ2VyID0gZnVuY3Rpb24oZXJyb3IsIHByb3ZpZGVyKXtcbiAgICBpZihwcm92aWRlcil7XG4gICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX0VSUk9SKTtcbiAgICAgICAgcHJvdmlkZXIucGF1c2UoKTtcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihFUlJPUiwgZXJyb3IgKTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBjb25zdCBwaWNrQ3VycmVudFNvdXJjZSA9IChzb3VyY2VzLCBjdXJyZW50U291cmNlLCBwbGF5ZXJDb25maWcpID0+IHtcbiAgICBsZXQgc291cmNlSW5kZXggPSBNYXRoLm1heCgwLCBjdXJyZW50U291cmNlKTtcbiAgICBjb25zdCBsYWJlbCA9XCJcIjtcbiAgICBpZiAoc291cmNlcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2VzW2ldLmRlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBzb3VyY2VJbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGxheWVyQ29uZmlnLmdldFNvdXJjZUxhYmVsKCkgJiYgc291cmNlc1tpXS5sYWJlbCA9PT0gcGxheWVyQ29uZmlnLmdldFNvdXJjZUxhYmVsKCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZUluZGV4O1xufTsiXSwic291cmNlUm9vdCI6IiJ9