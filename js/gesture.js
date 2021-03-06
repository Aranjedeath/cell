var stream,
    video,
    interval,
    pending = false;

function initWebcam() {
    // Thanks: https://github.com/willy-vvu/reveal.js/blob/master/js/gesture.js
    if(pending) { return false };

    pending = true;

    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    navigator.getMedia(
        { video: true },

        function(s) {
            stream = s;
            video = document.getElementById('video');
            video.src = window.URL.createObjectURL(stream);
            video.onplay = function() {
                interval = setInterval(dump, 30);
            };
            document.body.className += ' env--webcam';
        },

        function(error) {
            if(error.name == 'PermissionDeniedError') {
                alert('Access to your webcam is required to use this feature. If you have previously denied access to your webcam on this website, you may need to re-enable it.');
                var iDefault       = document.getElementById('default');
                var iWebcam        = document.getElementById('webcam');
                iWebcam.className  = 'btn btn--interact';
                iDefault.className += ' btn--selected';
                document.body.className = document.body.className.replace(' env--webcam', '');
                controls.autoRotate = true;
                pending = false;
            }
        }
    );

    var canvas = document.getElementById('canvas');
    var _      = canvas.getContext('2d');
    ccanvas    = document.getElementById('comp');
    var c_     = ccanvas.getContext('2d');

    var compression   = 5,
        width, height = 0;

    function dump() {
        if(canvas.width != video.videoWidth) {
            width  = Math.floor(video.videoWidth / compression);
            height = Math.floor(video.videoHeight / compression);
            canvas.width  = ccanvas.width  = width;
            canvas.height = ccanvas.height = height;
        }

        _.drawImage(video, width, 0, -width, height);
        draw = _.getImageData(0, 0, width, height);

        skinfilter();
        test();
    }

    var huemin = 0.0,
        huemax = 0.10,
        satmin = 0.0,
        satmax = 1.0,
        valmin = 0.4,
        valmax = 1.0;

    function skinfilter() {
        var skin_filter  = _.getImageData(0, 0, width, height);
        var total_pixels = skin_filter.width * skin_filter.height;
        var index_value  = total_pixels * 4;

        var count_data_big_array = 0;
        for(var y = 0; y < height; y++) {
            for(var x = 0; x < width; x++) {
                index_value = x + y * width;
                r = draw.data[count_data_big_array];
                g = draw.data[count_data_big_array+1]
                b = draw.data[count_data_big_array+2]
                a = draw.data[count_data_big_array+3]

                hsv = rgb2Hsv(r, g, b);
                //When the hand is too lose (hsv[0] > 0.59 && hsv[0] < 1.0)
                //Skin Range on HSV values
                if(((hsv[0] > huemin && hsv[0] < huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0)) && (hsv[1] > satmin && hsv[1] < satmax) && (hsv[2] > valmin && hsv[2] < valmax)) {
                    skin_filter[count_data_big_array]   = r;
                    skin_filter[count_data_big_array+1] = g;
                    skin_filter[count_data_big_array+2] = b;
                    skin_filter[count_data_big_array+3] = a;
                } else {
                    skin_filter.data[count_data_big_array]   =
                    skin_filter.data[count_data_big_array+1] =
                    skin_filter.data[count_data_big_array+2] =
                    skin_filter.data[count_data_big_array+3] = 0;
                }

                count_data_big_array = index_value * 4;
            }
        }

        draw = skin_filter;
    }

    function rgb2Hsv(r, g, b) {
        var r = r / 255,
            g = g / 255,
            b = b / 255;

        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);

        var h, s, v = max;

        var d = max - min;

        s = max == 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        } else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return [h, s, v];
    }

    var last    = false,
        thresh  = 150,
        down    = false,
        wasdown = false;

    function test() {
        delt = _.createImageData(width, height);
        if(last !== false) {
            var totalx = 0,
                totaly = 0,
                totald = 0,
                totaln = delt.width * delt.height,
                dscl   = 0,
                pix    = totaln * 4;

            while(pix -= 4) {
                var d = Math.abs(draw.data[pix] - last.data[pix]) + Math.abs(draw.data[pix+1] - last.data[pix+1]) + Math.abs(draw.data[pix+2] - last.data[pix+2]);

                if(d > thresh) {
                    delt.data[pix]   =
                    delt.data[pix+1] =
                    delt.data[pix+2] =
                    delt.data[pix+3] = 255;
                    totald          += 1;
                    totalx          += ((pix / 4) % width);
                    totaly          += (Math.floor((pix / 4) / delt.height));
                } else {
                    delt.data[pix]   =
                    delt.data[pix+1] =
                    delt.data[pix+2] =
                    delt.data[pix+3] = 0;
                }
            }
        }

        if(totald) {
            down = {
                x: totalx/totald,
                y: totaly/totald,
                d: totald
            }
            handledown();
        }

        last = draw;
        c_.putImageData(delt, 0, 0);
    }

    var movethresh   = 2,
        brightthresh = 600,
        overthresh   = 1000;

    var sensitivitySetting = document.getElementsByName('sensitivity');
    var sensitivitySettingChoice = 0;

    for(var i = 0; i < sensitivitySetting.length; i++) {
        sensitivitySetting[i].addEventListener('click', function() {
            sensitivitySettingChanged();
        }, false);
    }

    function sensitivitySettingChanged() {
        for(var i = 0; i < sensitivitySetting.length; i++) {
            if(sensitivitySetting[i].checked == true) {
                sensitivitySettingChoice = i;
            }
        }

        switch(sensitivitySettingChoice) {
            case 0:
                brightthresh = 300;
                break;
            case 1:
                brightthresh = 600;
                break;
            case 2:
                brightthresh = 900;
                break;
        }
    }

    function calibrate() {
        wasdown = {
            x: down.x,
            y: down.y,
            d: down.d
        }
    }

    var avg   = 0,
        state = 0;

    // States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

    function handledown() {

        avg = 0.9 * avg + 0.1 * down.d;
        var davg = down.d - avg,
            good = davg > brightthresh;

        switch(state) {
            case 0:
                if(good) { // Found a gesture, waiting for next move
                    state = 1;
                    calibrate();
                }
                break;

            case 2: // Wait for gesture to end
                if(!good) { // Gesture ended
                    state = 0;
                }
                break;

            case 1: // Got next move, do something based on direction
                var dx = down.x - wasdown.x, dy = down.y - wasdown.y;
                var dirx = Math.abs(dy) < Math.abs(dx);

                if(dx < -movethresh && dirx) {
                    controls.rotateLeft(.2);
                }
                else if(dx > movethresh && dirx) {
                    controls.rotateLeft(-.2);
                }
                if(dy > movethresh && !dirx) {
                    controls.rotateUp(.1);
                }
                else if(dy < -movethresh && !dirx) {
                    controls.rotateUp(-.1);
                }

                state = 2;
                break;
        }
    }
}

function stopWebcam() {
    if(stream) {
        stream.stop();
        video.src = '';
        clearInterval(interval);
        pending = false;
    }
}