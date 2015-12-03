function startDemo() {

    var canvas = document.getElementById("canvas");
    var target = document.getElementById("target");

    var width = target.width = 128;
    var height = target.height = 128;

    var image = new Image();

    image.src = 'mona.png';
    image.onload = function(){
        var ctx = target.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        var genpol = new Genpol(canvas, target, 80);
        genpol.render();
    }
}