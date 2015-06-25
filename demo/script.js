function startDemo() {

    var canvas = document.getElementById("canvas");
    var target = document.getElementById("target");
    var offscreenCanvas = document.getElementById("offscreenCanvas");

    var image = new Image();

    image.src = 'mona.png';
    image.onload = function(){
        var ctx = target.getContext('2d');
        ctx.drawImage(image, 0, 0, 512, 512);

        var genpol = new Genpol(canvas, target, offscreenCanvas, 80, 3);
        genpol.render();
    }


}