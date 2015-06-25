var Genpol = function(outputCanvas, targetCanvas, proposalCanvas, polygonCount, polygonSize) {
    var outputCtx = outputCanvas.getContext('2d');
    var targetCtx = targetCanvas.getContext('2d');
    var proposalCtx = proposalCanvas.getContext('2d');

    var width = outputCanvas.width;
    var height = outputCanvas.height;

    var targetData = targetCtx.getImageData(0, 0, width, height).data;

    var DNA = [];

    for (var i = 0; i < polygonCount; i++) {

        var polygon = {
            color: {
                r: Math.round(Math.random() * 255),
                g: Math.round(Math.random() * 255),
                b: Math.round(Math.random() * 255),
                a: Math.random() * 0.4
            },
            points: []
        }

        for (var j = 0; j < polygonSize * 2; j++) {
            polygon.points.push(Math.random());
        }

        DNA.push(polygon);
    }

    function getScore() {
        var offscreenData = proposalCtx.getImageData(0, 0, width, height).data;

        var fitness = 0;
        for (var i = 0; i < targetData.length; i += 4){
            var deltaR = targetData[i + 0] - offscreenData[i + 0];
            var deltaG = targetData[i + 1] - offscreenData[i + 1];
            var deltaB = targetData[i + 2] - offscreenData[i + 2];

            var pixelFitness = deltaR * deltaR + deltaB * deltaB + deltaG * deltaG;

            fitness += pixelFitness;
        }

        return fitness;
    }

    this.render = function() {

        var prevDNA = JSON.parse(JSON.stringify(DNA));

        var prevScore = Number.MAX_VALUE;
        var iterator = 0;

        var colorDelta = 50;
        var alphaDelta = 0.1;
        var pointDelta = 0.05;

        var colorMutationRate = 0.1;
        var positionMutationRate = 0.1;

        function getDelta(a) {
            return a - Math.random() * (2 * a);
        }

        function mutateColor(color) {
            if (Math.random() < colorMutationRate) {
                var outcolor = {};

                outcolor.r = Math.round(Math.min(Math.max(0, color.r + getDelta(colorDelta)), 255));
                outcolor.g = Math.round(Math.min(Math.max(0, color.g + getDelta(colorDelta)), 255));
                outcolor.b = Math.round(Math.min(Math.max(0, color.b + getDelta(colorDelta)), 255));
                outcolor.a = Math.min(Math.max(0, color.a + getDelta(alphaDelta)), 0.4);

                return outcolor;
            }
            return color;
        }

        function mutatePosition(points) {
            if (Math.random() < positionMutationRate) {
                for (var i = 0; i < points.length; i += 2) {
                    if (Math.random() < 0.5) {
                        points[i + 0] = Math.min(Math.max(0, points[i + 0] + getDelta(pointDelta)), 1);
                        points[i + 1] = Math.min(Math.max(0, points[i + 1] + getDelta(pointDelta)), 1);
                    }
                }
            }

            return points;
        }

        setInterval(function() {
            iterator++;

            proposalCtx.fillStyle = 'black';
            proposalCtx.fillRect(0, 0, width, height);

            for (var i = 0; i < DNA.length; i++) {
                var polygon = DNA[i];

                polygon.points = mutatePosition(polygon.points);
                polygon.color = mutateColor(polygon.color);

                proposalCtx.beginPath();
                proposalCtx.fillStyle = 'rgba(' + polygon.color.r + ',' + polygon.color.g + ',' + polygon.color.b + ',' + polygon.color.a + ')';;

                for (var j = 0; j < polygon.points.length; j += 2) {
                    if (j === 0) {
                        proposalCtx.moveTo(polygon.points[j] * width, polygon.points[j + 1] * height);
                    } else {
                        proposalCtx.lineTo(polygon.points[j] * width, polygon.points[j + 1] * height);
                    }
                }

                proposalCtx.closePath();
                proposalCtx.fill();

            }

            var score = getScore();
            if (score < prevScore) {
                prevDNA = JSON.parse(JSON.stringify(DNA));
                prevScore = score;

                outputCtx.clearRect(0, 0, width, height);
                outputCtx.drawImage(proposalCanvas, 0, 0);
            } else {
                DNA = JSON.parse(JSON.stringify(prevDNA));
            }

        }, 16);
    };
};

