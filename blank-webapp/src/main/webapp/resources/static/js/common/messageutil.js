/**
 * MessageUtil
 */
(function (name, context, definition) {
    if (typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        context[name] = definition();
    }
})('messageutil', this, function () {
    'use strict';

    var CACHE_PREFIX = 'messageutil-';
    var CACHE_SUFFIX = '-cacheexpiration';
    var DEFAULT_PATH = '../../resources/js/i18n/';
    var DEFAULT_FILE = 'locale_i18n_en.json';
    var DEFAULT_LANG = 'default';

    var path,
        files,
        defaultFiles,
        cache,
        maxAge,
        isAsync,
        cacheBucket,
        callback,
        cacheObj,
		lang,
		type, //Vue or default
		
		//type
		module_main,
		module_vue = {
			init:function(options){
				setParam(options);

				cacheObj = {};
				retrieveFiles(defaultFiles);
				var default_cacheObj = cacheObj;

				var vue_cacheObj = {};
				for(var i=0;i<files.length;i++){
					cacheObj = {};
					filesIndex=i;
					retrieveFiles(files,false);

					var defaultTempObj = {};
					merge(defaultTempObj,default_cacheObj);
					merge(defaultTempObj,cacheObj);
					var lan = i<lang.length?lang[i]:i<lang[i-1];

					VueUtil.setLang(lan);
					VueUtil.setLocale(lan, defaultTempObj);
					vue_cacheObj[lan] = cacheObj;
				}
				cacheObj = vue_cacheObj;
				afterLoad();
			},
			get:function(key){
              	var ret = Vue.t(key);
                if (ret && ret !== key) {
                    if (arguments.length > 1) {
                        var params = Array.prototype.slice.call(arguments, 1);
                        params.forEach(function (param, index) {
                            ret = ret.replace(new RegExp('\\{' + index + '\\}', 'gm'), param);
                        });
                    }
                    return ret;
                } else {
                    return key;
                }
			}
		}

    function setParam(options){
			filesIndex = 0;
    		options = isObject(options) ? options : {};
			path = options.path || DEFAULT_PATH;
			files = typeof options.file == 'string' ? [options.file] : options.file || [DEFAULT_FILE];
			defaultFiles = typeof options.defaultFile == 'string' ? [options.defaultFile] : options.defaultFile || [];
			cache = options.cache == undefined ? true : options.cache;
			maxAge = options.maxAge || 0;
			isAsync = options.async == undefined ? true : options.async;
			cacheBucket = options.cacheBucket || '';
			callback = options.callback;
			lang = typeof options.lang == 'string' ? [options.lang] : options.lang || [DEFAULT_LANG];
    };
    
    function isObject(obj) {
        return typeof obj === 'object' && obj !== null;
    }
	
	function isString(obj) {
		return typeof obj === 'string' && obj !== null;
	}


    function merge(o1, o2, exports) {
        if(isString(exports)){
			exports = [exports];
		}else if(!isObject(exports)){
			exports = [];
		}
		for (var key in o2) {
			if(exports.indexOf(key)>-1){continue;}
            if (o1[key] === undefined) {
                o1[key] = o2[key];
                continue;
            }

            if (isObject(o2[key]) && isObject(o1[key])) {
                merge(o1[key], o2[key],exports);
            } else {
                o1[key] = o2[key];
            }
        }
    }

    function expirationKey(key) {
        return key + CACHE_SUFFIX;
    }

    function setCache(key, value, time) {
        try {
            value = JSON.stringify(value);
        } catch (e) {
            return;
        }

        try {
            setItem(key, value);
        } catch (e) {
            warn("Could not add item with key '" + key + "'", e);
            return;
        }

        if (time) {
            setItem(expirationKey(key), (currentTime() + time).toString());
        } else {
            removeItem(expirationKey(key));
        }
    }

    function getCache(key) {
        if (flushExpiredItem(key)) {
            return null;
        }

        var value = getItem(key);

        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    function removeNeverExpireItem(key) {
        var exprKey = expirationKey(key);
        var expr = getItem(exprKey);
        if (!expr) {
            removeItem(key);
        }
    }

    function setItem(key, value) {
        localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
        localStorage.setItem(CACHE_PREFIX + cacheBucket + key, value);
    }

    function getItem(key) {
        return localStorage.getItem(CACHE_PREFIX + cacheBucket + key);
    }

    function removeItem(key) {
        localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
    }

    function flushExpiredItem(key) {
        var exprKey = expirationKey(key);
        var expr = getItem(exprKey);
        if (expr) {
            var expirationTime = parseInt(expr);
            if (currentTime() >= expirationTime) {
                removeItem(key);
                removeItem(exprKey);
                return true;
            }
        }
    }

    function currentTime() {
        return Math.floor(new Date().getTime() / 1000);
    }

    function removeRepeatFile(aArr, bArr) {
        if (bArr.length == 0) { return aArr }
        var diff = [];
        for (var e in aArr) {
            if (bArr.indexOf(aArr[e]) == -1) {
                diff.push(aArr[e]);
            }
        }
        return diff;
    }

    function sendAjax(url, cb, finalFunc) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', url, isAsync);
        xmlHttp.setRequestHeader('Content-type', 'charset=utf-8');
        xmlHttp.onreadystatechange = function ParseResult(ReturnVal) {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                cb(JSON.parse(xmlHttp.responseText));
            }
            
            if (xmlHttp.readyState == 4) {
                finalFunc();
            }
        };
        xmlHttp.send();
    }
	
	function getLangs(files){//file:[{}]/[""]
		var langs = [];
		for(var i=0;i<files.length;i++){
			var file = files[i];
			if(isObject(file)){
				for(var key in file){
					langs.push(key);
				}
			}
		}
		return langs;
	}

	function init(option){
		var temp = {};
		merge(temp,module);
		merge(temp,window.VueUtil?module_vue:{});
		temp.init(option);
		merge(module_main,temp,'init');
	}

    var filesIndex = 0;
    var loaded = false;
    function retrieveFiles(targetFiles,autoNextFile) {
		if(typeof autoNextFile == "undefined"){autoNextFile = true}
        var url = path + targetFiles[filesIndex];

        var cacheData;

        if (cache && localStorage) {
            if (maxAge > 0) {
                removeNeverExpireItem(url);
            }
            cacheData = getCache(url);
        }

        if (cacheData) {
            merge(cacheObj, cacheData);
            autoNextFile && nextFile(targetFiles);
            return;
        }

        sendAjax(url, function (data) {
            if (data && isObject(data)) {
                cache && setCache(url, data, maxAge);
                merge(cacheObj, data);
            }
        }, function() {
            autoNextFile && nextFile(targetFiles);
        });
    }

    function nextFile(targetFiles) {
        if (++filesIndex < targetFiles.length) {
            retrieveFiles(targetFiles);
        } else {
            afterLoad();
        }
    }

    function afterLoad() {
        loaded = true;
        callback && callback(cacheObj);
    }

    function isInit() {
        if (loaded) {
            if (Object.keys(cacheObj).length == 0) {
                console.warn('loaded resources is empty');
                return false
            }
            return true
        } else {
            console.warn('not init, run messageutil.init first');
            return false
        }
    }

	var module = {
		init: function (options) {
			setParam(options);
			cacheObj = {};
			filesIndex = 0;
			//load defaultFiles first, and merge current language into it.
			files = removeRepeatFile(defaultFiles, files).concat(files);
			retrieveFiles(files);
		},
		get: function (key) {
			if (!isInit()) {
				return;
			}
			var ret = cacheObj[key];
			if (ret != undefined && ret != null) {
				if (arguments.length > 1) {
					var params = Array.prototype.slice.call(arguments, 1);
					params.forEach(function (param, index) {
						ret = ret.replace(new RegExp('\\{' + index + '\\}', 'gm'), param);
					});
				}
				return ret;
			} else {
				return key;
			}
		},
		getObj: function () {
			if (!isInit()) {
				return;
			}
			return cacheObj;
		}
	}
	var module_main = {
		/**
		 * init
		 * @param {object} options
		 *  option.path        {string}         url path, end with /
		 *  option.file        {string, array}  file name, array for multiple
		 *  option.defaultFile {string, array}  When the key can not be found in [option.file], will try [option.defaultFile]
		 *  option.async       {boolean}        load json aysnc, default true
		 *  option.cache       {boolean}        enable cache lang file to localStorage default true
		 *  option.maxAge      {integer}        cache max age in seconds, default 0 never expire
		 *  option.cacheBucket {string}         partition data in to different buckets 
		 *  option.callback    {function}       callback function after init
		 *  option.lang	       {string, array}  language, array for multiple,The order in the array is the same as that in the file array. 
		 */
		init:function(option){
			init(option);
		},
      
		/**
		 * get message
		 * @param  {string} key message key
		 * @param  {string} ... param 1
		 * @param  {string} ... param 2
		 * @param  {string} ... param ...
		 * @param  {string} ... param N
		 * @return {string} message string
		 */
		get:function(){isInit();},
		getObj: function () {isInit();},
		clearCache: function() {
			for (var key in localStorage){
				if (key.indexOf(CACHE_PREFIX) == 0) {
					localStorage.removeItem(key);
				}
			 }
		}
	}
    return module_main;
});