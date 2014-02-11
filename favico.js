/**
 * @license MIT
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
 * @version .4.0
 */

/**
 * Create new favico instance
 * @param {Object} Options
 * @return {Object} Favico object
 * @example
 * var favico = new Favico({
 *    bgColor : '#d00',
 *    textColor : '#fff',
 *    fontFamily : 'sans-serif',
 *    fontStyle : 'bold',
 *    position : 'down',
 *    type : 'circle',
 *    animation : 'slide',
 * });
 */
(function() {

    var Favico = (function(params) {'use strict';
        var VERSION = '.4.0';
        var defaultParams = {
            bgColor : '#d00',
            textColor : '#fff',
            fontFamily : 'sans-serif', //Arial,Verdana,Times New Roman,serif,sans-serif,...
            fontStyle : 'bold', //normal,italic,oblique,bold,bolder,lighter,100,200,300,400,500,600,700,800,900
            type : 'circle',
            position : 'down', // down, up, left, leftup (upleft)
            animation : 'slide',
            notification: 'jump',
            fallbackUrl : '//favico.jit.su/image',
            elementId : false
        };
        var element, height, width, canvas, ctx, tempImg, isReady, isBadgeDisplayed, isRunning, isReadyCb, stop, browser, animationTimer, drawTimer;

        var queue = [];

        var timer = null;
        var iconAnimationLifeTime = 0;
        var iconAnimationMaxLoop = 20;
        var animationState = {
            badge: null,
            icon: null,
            iconStopFrame: null
        };

        params = (params) ? params : {};
        isReadyCb = function() {
        };
        isReady = stop = false;

        browser = {};
        browser.ff = (/firefox/i.test(navigator.userAgent.toLowerCase()));
        browser.chrome = (/chrome/i.test(navigator.userAgent.toLowerCase()));
        browser.opera = (/opera/i.test(navigator.userAgent.toLowerCase()));
        browser.ie = (/msie/i.test(navigator.userAgent.toLowerCase())) || (/trident/i.test(navigator.userAgent.toLowerCase()));
        browser.safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        browser.supported = (browser.chrome || browser.ff || browser.opera);

        /**
         * Initialize favico
         */
        var init = function() {
            //merge initial options
            params = merge(defaultParams, params);
            params.position = params.position.toLowerCase();
            params.animation = (animation.types['' + params.animation]) ? params.animation : defaultParams.animation;
            params.type = (type['' + params.type]) ? params.type : defaultParams.type;

            try {
                element = link.getIcon();
                if (browser.supported) {
                    /**
                     * Create temporary elements
                     */
                    canvas = document.createElement('canvas');
                    tempImg = document.createElement('img');
                    if (element.hasAttribute('href')) {
                        tempImg.setAttribute('src', element.getAttribute('href'));
                        /**
                         * Get width and height of image
                         */
                        tempImg.onload = function() {
                            height = (tempImg.height > 0) ? tempImg.height : 32;
                            width = (tempImg.width > 0) ? tempImg.width : 32;
                            canvas.height = height;
                            canvas.width = width;
                            ctx = canvas.getContext('2d');
                            icon.ready();
                        };
                    } else {
                        /**
                         * Create default empty image
                         */
                        tempImg.setAttribute('src', '');
                        height = 32;
                        width = 32;
                        tempImg.height = height;
                        tempImg.width = width;
                        canvas.height = height;
                        canvas.width = width;
                        ctx = canvas.getContext('2d');
                        icon.ready();
                    }
                } else {
                    /**
                     * Fallback
                     */
                    icon.ready();
                }
            } catch(e) {
                throw 'Error initializing favico. Message: ' + e.message;
            }

        };
        /**
         * Icon namespace
         */
        var icon = {};
        /**
         * Icon is ready (reset icon) and start animation (if ther is any)
         */
        icon.ready = function() {
            isReady = true;
            icon.reset();
            isReadyCb();
        };

        /**
         * Reset icon to default state
         */
        icon.reset = function() {
            queue = [];
            isRunning = false;
            isBadgeDisplayed = false;
            if (browser.supported) {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(tempImg, 0, 0, width, height);
                link.setIcon(canvas);
            } else {
                link.setIcon();
            }
            window.clearTimeout(animationTimer);
            window.clearTimeout(drawTimer);
        };
        /**
         * Start animation
         */
        icon.start = function() {
            if (!isReady) {
                return;
            }

            animationState.badge = isBadgeDisplayed ? -animation.animationType().length : 0;
            animationState.icon = 0;
            if (timer == null) {
                iconAnimationLifeTime = iconAnimationMaxLoop * notification.type[params.notification].length;
                animation.run();
            }

        };

        /**
         * Badge types
         */
        var type = {};
        var options = function(opt) {
            opt.n = (( typeof opt.n) === 'number') ? Math.abs(opt.n | 0) : opt.n;
            opt.x = width * opt.x;
            opt.y = height * opt.y;
            opt.w = width * opt.w;
            opt.h = height * opt.h;
            opt.len = ("" + opt.n).length;
            return opt;
        };


        var clearContext = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        /**
         * Draw favion to context
         * @param {Object} opt Badge options
         */
        var drawIcon = function(frame) {
            var pos;
            if (frame) {
                pos = notification.type[params.notification].position(frame);
            } else {
                pos = notification.base();
            }

            var base = notification.base();

            ctx.drawImage(tempImg, pos.x, pos.y, pos.w, pos.h);
            ctx.translate(base.w / 2.0, base.h / 2.0);
            ctx.rotate(pos.r);
            ctx.translate(base.w / -2.0, base.h / -2.0);

            if (frame > iconAnimationLifeTime){
                stopAnimation();
            }
        }

        var drawBadge = function(frame, opt) {
            isBadgeDisplayed = true;
            var animationType = animation.animationType();
            if (frame === null || frame < -animationType.length || animationType.length < frame) {
                frame = animationType.length;
            }
            type[params.type](merge(opt, animationType.position(frame)));
        };

        var stopAnimation = function() {
            animationState.icon = null;
            isRunning = false;
        }


        /**
         * Generate circle
         * @param {Object} opt Badge options
         */
        type.circle = function(opt) {
            opt = options(opt);
            var badgeParams = merge(params,opt);
            var more = false;
            if (opt.len === 2) {
                opt.x = opt.x - opt.w * .4;
                opt.w = opt.w * 1.4;
                more = true;
            } else if (opt.len >= 3) {
                opt.x = opt.x - opt.w * .65;
                opt.w = opt.w * 1.65;
                more = true;
            }
            var bgColor = hexToRgb(badgeParams.bgColor);
            var textColor = hexToRgb(badgeParams.textColor);

            ctx.beginPath();
            ctx.font = badgeParams.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? .85 : 1)) + "px " + badgeParams.fontFamily;
            ctx.textAlign = 'center';
            if (more) {
                ctx.moveTo(opt.x + opt.w / 2, opt.y);
                ctx.lineTo(opt.x + opt.w - opt.h / 2, opt.y);
                ctx.quadraticCurveTo(opt.x + opt.w, opt.y, opt.x + opt.w, opt.y + opt.h / 2);
                ctx.lineTo(opt.x + opt.w, opt.y + opt.h - opt.h / 2);
                ctx.quadraticCurveTo(opt.x + opt.w, opt.y + opt.h, opt.x + opt.w - opt.h / 2, opt.y + opt.h);
                ctx.lineTo(opt.x + opt.h / 2, opt.y + opt.h);
                ctx.quadraticCurveTo(opt.x, opt.y + opt.h, opt.x, opt.y + opt.h - opt.h / 2);
                ctx.lineTo(opt.x, opt.y + opt.h / 2);
                ctx.quadraticCurveTo(opt.x, opt.y, opt.x + opt.h / 2, opt.y);
            } else {
                ctx.arc(opt.x + opt.w / 2, opt.y + opt.h / 2, opt.h / 2, 0, 2 * Math.PI);
            }
            ctx.fillStyle = 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + opt.o + ')';
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.stroke();
            ctx.fillStyle = 'rgba(' + textColor.r + ',' + textColor.g + ',' + textColor.b + ',' + opt.o + ')';
            if (( typeof opt.n) === 'number' && opt.n > 999) {
                ctx.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000) ) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * .2));
            } else {
                ctx.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * .15));
            }
            ctx.closePath();
        };
        /**
         * Generate rectangle
         * @param {Object} opt Badge options
         */
        type.rectangle = function(opt) {
            opt = options(opt);
            var badgeParams = merge(params,opt);
            
            var more = false;
            if (opt.len === 2) {
                opt.x = opt.x - opt.w * .4;
                opt.w = opt.w * 1.4;
                more = true;
            } else if (opt.len >= 3) {
                opt.x = opt.x - opt.w * .65;
                opt.w = opt.w * 1.65;
                more = true;
            }
            var bgColor = hexToRgb(badgeParams.bgColor);
            var textColor = hexToRgb(badgeParams.textColor);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(tempImg, 0, 0, width, height);
            ctx.beginPath();
            ctx.font = badgeParams.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? .9 : 1)) + "px " + badgeParams.fontFamily;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + opt.o + ')';
            ctx.fillRect(opt.x, opt.y, opt.w, opt.h);
            ctx.fillStyle = 'rgba(' + textColor.r + ',' + textColor.g + ',' + textColor.b + ',' + opt.o + ')';
            if (( typeof opt.n) === 'number' && opt.n > 999) {
                ctx.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000) ) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * .2));
            } else {
                ctx.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * .15));
            }
            ctx.closePath();
        };

        /**
         * Set badge
         */
        var badge = function(number, opts) {
            opts = (( typeof opts) === 'string' ? {
                animation : opts
            } : opts) || {};
            isReadyCb = function() {
                try {
                    if ( typeof (number) === 'number' ? (number > 0) : (number !== '')) {
                        var q = {
                            type : 'badge',
                            options : {
                            }
                        };
                        q.options = merge(params, opts);
                        q.options.n=number;
                        queue.push(q);
                        if (queue.length > 100) {
                            throw 'Too many badges requests in queue.';
                        }
                        icon.start();
                    } else {
                        icon.reset();
                    }
                } catch(e) {
                    throw 'Error setting badge. Message: ' + e.message;
                }
            };
            if (browser.supported) {
                if (isReady) {
                    isReadyCb();
                }
            } else {
                var badgeParams = params;
                badgeParams.url = element.getAttribute('x-orig-src');
                badgeParams.badge = number;
                badgeParams = merge(params, opts);
                element.href = params.fallbackUrl + '?options=' + encodeURIComponent(JSON.stringify(badgeParams)) + '&v=' + VERSION;
                element.src = element.href;
            }
        };

        /**
         * Set image as icon
         */
        var image = function(imageElement) {
            isReadyCb = function() {
                try {
                    var w = imageElement.width;
                    var h = imageElement.height;
                    var newImg = document.createElement('img');
                    var ratio = (w / width < h / height) ? (w / width) : (h / height);
                    newImg.setAttribute('src', imageElement.getAttribute('src'));
                    newImg.height = (h / ratio);
                    newImg.width = (w / ratio);
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(newImg, 0, 0, width, height);
                    link.setIcon(canvas);
                } catch(e) {
                    throw 'Error setting image. Message: ' + e.message;
                }
            };
            if (browser.supported) {
                if (isReady) {
                    isReadyCb();
                }
            } else {
                params.url = element.getAttribute('x-orig-src');
                params.badge = number;
                merge(params, opt);
                imageElement.src = params.fallbackUrl + '?options=' + encodeURIComponent(JSON.stringify(params)) + '&v=' + VERSION;
            }
        };
        /**
         * Set video as icon
         */
        var video = function(videoElement) {
            if (browser.supported) {
                isReadyCb = function() {
                    try {
                        if (videoElement === 'stop') {
                            stop = true;
                            icon.reset();
                            stop = false;
                            return;
                        }

                        videoElement.addEventListener('play', function() {
                            drawVideo(this);
                        }, false);

                    } catch(e) {
                        throw 'Error setting video. Message: ' + e.message;
                    }
                };
                if (isReady) {
                    isReadyCb();
                }
            }
        };
        /**
         * Set video as icon
         */
        var webcam = function(action) {
            if (browser.supported) {
                var newVideo = false;
                if (!window.URL || !window.URL.createObjectURL) {
                    window.URL = window.URL || {};
                    window.URL.createObjectURL = function(obj) {
                        return obj;
                    };
                }
                navigator.getUserMedia = navigator.getUserMedia || navigator.oGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                isReadyCb = function() {
                    try {
                        if (action === 'stop') {
                            stop = true;
                            icon.reset();
                            stop = false;
                            return;
                        }
                        newVideo = document.createElement('video');
                        newVideo.width = width;
                        newVideo.height = height;
                        navigator.getUserMedia({
                            video : true,
                            audio : false
                        }, function(stream) {
                            newVideo.src = URL.createObjectURL(stream);
                            newVideo.play();
                            drawVideo(newVideo);
                        }, function() {
                        });
                    } catch(e) {
                        throw 'Error setting webcam. Message: ' + e.message;
                    }
                };
                if (isReady) {
                    isReadyCb();
                }
            }

        };

        /**
         * Draw video to context and repeat :)
         */
        function drawVideo(video) {
            if (video.paused || video.ended || stop) {
                return false;
            }
            //nasty hack for FF webcam (Thanks to Julian Ćwirko, kontakt@redsunmedia.pl)
            try {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(video, 0, 0, width, height);
            } catch(e) {

            }
            drawTimer = setTimeout(drawVideo, animation.duration, video);
            link.setIcon(canvas);
        }

        var link = {};
        /**
         * Get icon from HEAD tag or create a new <link> element
         */
        link.getIcon = function() {
            var elm = false;
            var url = '';
            //get link element
            var getLink = function() {
                var link = document.getElementsByTagName('head')[0].getElementsByTagName('link');
                for (var l = link.length, i = (l - 1); i >= 0; i--) {
                    if ((/(^|\s)icon(\s|$)/i).test(link[i].getAttribute('rel'))) {
                        return link[i];
                    }
                }
                return false;
            };
            if (params.elementId) {
                //if img element identified by elementId
                elm = document.getElementById(params.elementId);
                elm.setAttribute('href', elm.src);
                elm.setAttribute('x-orig-src', elm.src);
            } else {
                //if link element
                elm = getLink();
                if (elm === false) {
                    elm = document.createElement('link');
                    elm.setAttribute('rel', 'icon');
                    document.getElementsByTagName('head')[0].appendChild(elm);
                }
                elm.setAttribute('x-orig-src', elm.href);
            }
            //check if image and link url is on same domain. if not raise error
            url = (params.elementId) ? elm.src : elm.href;
            if (browser.supported && url.substr(0, 5) !== 'data:' && url.indexOf(document.location.hostname) === -1) {
                throw new Error('Error setting favicon. Favicon image is on different domain (Icon: ' + url + ', Domain: ' + document.location.hostname + ')');
            }
            elm.setAttribute('type', 'image/png');
            return elm;
        };
        link.setIcon = function(canvas) {
            if (canvas) {
                var url = canvas.toDataURL('image/png');
                if (params.elementId) {
                    //if is attached to element (image)
                    element.setAttribute('src', url);
                } else {
                    //if is attached to fav icon
                    if (browser.ff || browser.opera) {
                        //for FF we need to "recreate" element, atach to dom and remove old <link>
                        var old = element;
                        element = document.createElement('link');
                        if (browser.opera) {
                            element.setAttribute('rel', 'icon');
                        }
                        element.setAttribute('rel', 'icon');
                        element.setAttribute('type', 'image/png');
                        document.getElementsByTagName('head')[0].appendChild(element);
                        element.setAttribute('href', url);
                        if (old.parentNode) {
                            old.parentNode.removeChild(old);
                        }
                    } else {
                        element.setAttribute('href', url);
                    }
                }
            } else {
                //it will reset the default state
                element.setAttribute('href', element.getAttribute('x-orig-src'));
                element.setAttribute('src', element.getAttribute('x-orig-src'));
            }
        };

        //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
        //HEX to RGB convertor
        function hexToRgb(hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r : parseInt(result[1], 16),
                g : parseInt(result[2], 16),
                b : parseInt(result[3], 16)
            } : false;
        }

        /**
         * Merge options
         */
        function merge(def, opt) {
            var mergedOpt = {};
            var attrname;
            for (attrname in def) {
                mergedOpt[attrname] = def[attrname];
            }
            for (attrname in opt) {
                mergedOpt[attrname] = opt[attrname];
            }
            return mergedOpt;
        }

        /**
         * Cross-browser page visibility shim
         * http://stackoverflow.com/questions/12536562/detect-whether-a-window-is-visible
         */
        function isPageHidden() {
            return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
        }

        /**
         * For each method (for older browsers)
         */
        function forEach(array, fn) {
            for (var i = 0; i < array.length; i++)
                fn(array[i], i);
        }

        /**
         * @namespace animation
         */
        var animation = {};
        /**
         * Animation "frame" duration
         */
        animation.duration = 40;

        /**
         * @namespace animation.generator
         */
        animation.generator = {};

        /**
         * Return default
         */
        animation.generator.defaultEnd = function() {
            return {
                x : .4,
                y : .4,
                w : .6,
                h : .6,
                o : 1
            };
        };

        animation.generator.animationPosition = function(start, end, frame, frameLength, timing){
            animation.generator.adjustPosition(start);
            animation.generator.adjustPosition(end);
            if (frame == null) {
                return end;
            }
            if (frame < 0) {
                frame = -frame;
            }
            timing = ( typeof timing !== 'undefined') ? timing : 'linear';
            var progress = animation.generator.animationTiming[timing](frame, frameLength);

            return {
                x : start.x + (end.x - start.x) * progress,
                y : start.y + (end.y - start.y) * progress,
                w : start.w + (end.w - start.w) * progress,
                h : start.h + (end.h - start.h) * progress,
                o : start.o + (end.o - start.o) * progress
            };
        };

        /**
         * Update badge position if its position is not bottom-right. (left, up)
         */
        animation.generator.adjustPosition = function(position) {
            var isUp = params.position.indexOf('up') > -1;
            var isLeft = params.position.indexOf('left') > -1;

            if (isLeft) {
                position.x = 1 - position.x - position.w;
            }
            if (isUp) {
                position.y = 1 - position.y - position.h;
            }
        }

        /**
         * Animation timing (linear)
         */
        animation.generator.animationTiming = {
            'linear': function(frame, frameLength) { return frameLength === 1 ? 1 : frame / (frameLength - 1); }
        }

        /**
         * Animation types (none,fade,pop,slide)
         */
        animation.types = {};

        animation.types.fade = {};
        animation.types.fade.length = 11;
        animation.types.fade.position = function(frame) {
            var start = {
                x : .4,
                y : .4,
                w : .6,
                h : .6,
                o : .0
            };
            return animation.generator.animationPosition(start, animation.generator.defaultEnd(), frame, animation.types.fade.length);
        };

        animation.types.none = {};
        animation.types.none.length = 1;
        animation.types.none.position = function(frame) {
            var start = {
                x : .4,
                y : .4,
                w : .6,
                h : .6,
                o : 1
            };
            return animation.generator.animationPosition(start, animation.generator.defaultEnd(), frame, animation.types.none.length);
        };

        animation.types.pop = {};
        animation.types.pop.length = 7;
        animation.types.pop.position = function(frame) {
            var start = {
                x : 1,
                y : 1,
                w : 0,
                h : 0,
                o : 1
            };
            return animation.generator.animationPosition(start, animation.generator.defaultEnd(), frame, animation.types.pop.length);
        };

        animation.types.slide = {};
        animation.types.slide.length = 7;
        animation.types.slide.position = function(frame) {
            var start = {
                x : .4,
                y : 1,
                w : .6,
                h : .6,
                o : 1
            };
            return animation.generator.animationPosition(start, animation.generator.defaultEnd(), frame, animation.types.slide.length);
        };

        animation.types.popFade = {};
        animation.types.popFade.length = 6;
        animation.types.popFade.position = function(frame) {
            var start = {
                x : .75,
                y : .75,
                w : 0,
                h : 0,
                o : 0
            };
            return animation.generator.animationPosition(start, animation.generator.defaultEnd(), frame, animation.types.popFade.length);
        };

        animation.animationType = function(){
            return animation.types[isPageHidden() ? 'none' : params.animation];
        }

        /**
         * Run animation
         * @param {Object} opt Animation options
         * @param {Object} cb Callbak after all frames are done
         * @param {Object} revert Reverse order? true|false
         * @param {Object} frame Optional frame number
         */
        animation.run = function() {
            var badgeOpt = animation.badgeNumber();

            clearContext();
            drawIcon(animationState.icon);
            drawBadge(animationState.badge, badgeOpt);

            if (animationState.icon != null || animationState.badge != null) {
                timer = setTimeout(function() {
                    if (animationState.icon != null) {
                        animationState.icon++;
                    }

                    if (animationState.badge != null) {
                        animationState.badge++;
                    }

                    if (animationState.badge == animation.animationType().length) {
                        animation.finish();
                    }
                    animation.run();
                }, animation.duration);

                link.setIcon(canvas);

            } else {
//                clearTimeout(timer);
                timer = null;
            }

        };

        animation.finish = function() {
            var animationType = animation.animationType();
            if (queue.length > 1) {
                animationState.badge = -animationType.length;
                iconAnimationLifeTime = animationState.icon + iconAnimationMaxLoop * notification.type[params.notification].length;
            } else {
                animationState.badge = null;
            }
        };

        animation.badgeNumber = function(){
            if (animationState.badge != 0) {
                return queue[0].options;
            }
            if (queue.length > 1) {
                queue.shift();
            }
            return queue[0].options;
        };


        var notification = {};
        notification.base = function(){
            return {
                x: 0,
                y: 0,
                w: 32,
                h: 32,
                r: 0
            };
        };

        notification.type = {};
        notification.type.jump = {};
        notification.type.jump.length = 10;
        notification.type.jump.position = function(frame) {
            var base = notification.base();
            var pos = notification.base();
            var len = notification.type.jump.length;
            frame %= len;

            pos.y = base.h * 0.8 * frame * (len - frame - 1) / Math.pow(len - 1, 2);
            pos.h = base.h - pos.y;
            return pos;
        };

        notification.type.rotate = {};
        notification.type.rotate.length = 30;
        notification.type.rotate.position = function(frame) {
            var pos = notification.base();
            var len = notification.type.rotate.length;
            pos.r = 360 / len;
            return pos;
        };

        notification.type.ring = {};
        notification.type.ring.length = 20;
        notification.type.ring.position = function(frame) {
            var pos = notification.base();
            if (frame < 5 || frame >= 15){
                pos.r = 5 * Math.PI / 180;
            } else {
                pos.r = -5 * Math.PI / 180;
            }
            return pos;
        };


        /**
         * Auto init
         */
        init();
        /**
         * Public methods
         */
        return {
            badge : badge,
            video : video,
            image : image,
            webcam : webcam,
            reset : icon.reset,
            browser : {
                supported : browser.supported
            }
        };
    });

    // AMD / RequireJS
    if ( typeof define !== 'undefined' && define.amd) {
        define([], function() {
            return Favico;
        });
    }
    // CommonJS
    else if ( typeof module !== 'undefined' && module.exports) {
        module.exports = Favico;
    }
    // included directly via <script> tag
    else {
        this.Favico = Favico;
    }

})();

