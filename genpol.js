var Genpol = function(outputCanvas, targetCanvas, polygonCount) {

    var proposalCanvas = document.createElement('canvas');

    var width = proposalCanvas.width = targetCanvas.width;
    var height = proposalCanvas.height = targetCanvas.height;

    var outputCtx = outputCanvas.getContext('2d');
    var proposalCtx = proposalCanvas.getContext('2d');

    var targetData = targetCanvas.getContext('2d').getImageData(0, 0, width, height).data;
    var sampleDistance = 1;

    var worstFitness = targetData.length * 255 * 255 * 3 / (4 * sampleDistance);

    var DNA = [];

    var mutator = new PolygonMutator();

    for (var i = 0; i < polygonCount; i++) {
        var polygon = new Polygon();
        DNA.push(polygon);
    }

    function getFitness() {
        var offscreenData = proposalCtx.getImageData(0, 0, width, height).data;

        var fitness = 0;
        for (var i = 0; i < targetData.length; i += 4 * sampleDistance) {
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

        var prevFitness = worstFitness;

        var iterator = 0;
        var improvements = 0;
        var lastImprovements = 0;

        var iterator = 1;
        var iterations = 1500000;
        var stepSize = 1500;

        function draw() {
            iterator++;

            mutator.mutateDNA(DNA);

            proposalCtx.fillStyle = 'black';
            proposalCtx.fillRect(0, 0, width, height);

            for (var i = 0; i < DNA.length; i++) {
                var polygon = DNA[i];

                proposalCtx.beginPath();
                proposalCtx.fillStyle = 'rgba(' + polygon.color.r + ',' + polygon.color.g + ',' + polygon.color.b + ',' + polygon.color.a + ')';;

                for (var j = 0; j < polygon.points.length; j++) {
                    if (j === 0) {
                        proposalCtx.moveTo(polygon.points[j].x * width, polygon.points[j].y * height);
                    } else {
                        proposalCtx.lineTo(polygon.points[j].x * width, polygon.points[j].y * height);
                    }
                }

                proposalCtx.closePath();
                proposalCtx.fill();
            }

            var fitness = getFitness();

            if (fitness < prevFitness) {
                improvements++;
                prevFitness = fitness;
                prevDNA = JSON.parse(JSON.stringify(DNA));
            } else {
                DNA = JSON.parse(JSON.stringify(prevDNA));
            }

            if (iterator <= iterations) {
                if (improvements - lastImprovements === 100) {
                    console.log("Fitness: " + (1 - prevFitness / worstFitness) * 100 + "% \n" + "Iterations: " + iterator + "\n" + "Improvements: " + improvements + "\n" + "Polygon count: " + DNA.length + "\n" + "- - - - - - - - - -");
                    lastImprovements = improvements;
                    renderFinal();
                    setTimeout(function() {
                        draw();
                    }, 0);
                } else if (iterator % stepSize === 0) {
                    console.log(" - Iterations: " + iterator);
                    setTimeout(function() {
                        draw();
                    }, 0);
                } else {
                    draw();
                }
            } else {
                renderFinal();
            }
        }

        function renderFinal() {

            var w = 512;
            var h = 512;

            outputCanvas.width = w;
            outputCanvas.height = h;

            outputCtx.fillStyle = 'black';
            outputCtx.fillRect(0, 0, w, h);

            for (var i = 0; i < DNA.length; i++) {
                var polygon = DNA[i];

                outputCtx.beginPath();
                outputCtx.fillStyle = 'rgba(' + polygon.color.r + ',' + polygon.color.g + ',' + polygon.color.b + ',' + polygon.color.a + ')';;

                for (var j = 0; j < polygon.points.length; j++) {
                    if (j === 0) {
                        outputCtx.moveTo(polygon.points[j].x * w, polygon.points[j].y * h);
                    } else {
                        outputCtx.lineTo(polygon.points[j].x * w, polygon.points[j].y * h);
                    }
                }

                outputCtx.closePath();
                outputCtx.fill();
            }
        }

        draw();

    };
};

var Polygon = function() {
    this.points = [];
    this.color = new Color();

    var origin = new Point();
    this.points.push(origin);

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    var delta = 0.01;

    for (var j = 0; j < 2; j++) {
        var x = Math.min(Math.max(0, origin.x + getRandom(-delta, delta)), 1);
        var y = Math.min(Math.max(0, origin.y + getRandom(-delta, delta)), 1);
        this.points.push(new Point(x, y));
    }

    return this;
};

var Point = function(x, y) {
    this.x = x ? x : Math.random();
    this.y = y ? y : Math.random();

    return this;
};

var Color = function() {
    this.r = Math.round(Math.random() * 255);
    this.g = Math.round(Math.random() * 255);
    this.b = Math.round(Math.random() * 255);
    this.a = Math.random() * 0.5 + 0.1;

    return this;
};

var PolygonMutator = function() {

    var deltaLarge = 0.1;
    var deltaSmall = 0.01;

    var pointsPerPolygonMax = 10;
    var pointsPerPolygonMin = 3;

    var maxPolygons = 250;
    var minPolygons = 1;

    var colorMutationRate = 1500;
    var positionMutationRate = 1000;
    var movePolygonMutationRate = 700;
    var addPointsMutationRate = 1000;
    var removePointsMutationRate = 1500;
    var addPolygonMutationRate = 700;
    var removePolygonMutationRate = 1500;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getDelta(a) {
        return getRandom(-a, a);
    }

    function shouldMutate(n) {
        return getRandomInt(0, n) == 1;
    }

    function getRandomIndex(array) {
        return getRandomInt(0, array.length - 1);
    }

    function mutateColor(polygon) {
        if (shouldMutate(colorMutationRate)) {
            polygon.color.r = getRandomInt(0, 255);
        }
        if (shouldMutate(colorMutationRate)) {
            polygon.color.g = getRandomInt(0, 255);
        }
        if (shouldMutate(colorMutationRate)) {
            polygon.color.b = getRandomInt(0, 255);
        }
        if (shouldMutate(colorMutationRate)) {
            polygon.color.a = getRandom(0.1, 0.6);
        }
    }

    function mutatePoint(point, d) {
        if (d) {
            point.x = Math.min(Math.max(0, point.x + getDelta(d)), 1);
            point.y = Math.min(Math.max(0, point.y + getDelta(d)), 1);
        } else {
            point = new Point();
        }
    }

    function mutatePosition(polygon) {
        for (var i = 0; i < polygon.points.length; i++) {
            if (shouldMutate(positionMutationRate)) {
                mutatePoint(polygon.points[i], deltaSmall);
                continue;
            }
            if (shouldMutate(positionMutationRate)) {
                mutatePoint(polygon.points[i], deltaLarge);
                continue;
            }
            if (shouldMutate(positionMutationRate)) {
                mutatePoint(polygon.points[i]);
            }
        }
    }

    function movePolygon(polygon) {
        if (shouldMutate(movePolygonMutationRate)) {
            var deltaX = getDelta(deltaSmall);
            var deltaY = getDelta(deltaSmall);
            for (var i = 0; i < polygon.points.length; i++) {
                polygon.points[i].x = Math.min(Math.max(0, polygon.points[i].x + deltaX), 1);
                polygon.points[i].y = Math.min(Math.max(0, polygon.points[i].y + deltaY), 1);
            }
        }
    }

    function addPoint(polygon) {
        if (shouldMutate(addPointsMutationRate) && polygon.points.length < pointsPerPolygonMax) {
            var index = getRandomIndex(polygon.points);
            var x = Math.min(Math.max(0, polygon.points[index].x + getDelta(deltaSmall)), 1);
            var y = Math.min(Math.max(0, polygon.points[index].y + getDelta(deltaSmall)), 1);
            polygon.points.splice(index, 0, new Point(x, y));
        }
        // if (shouldMutate(addPointsMutationRate) && polygon.points.length < pointsPerPolygonMax) {
        //     var index = getRandomIndex(polygon.points);
        //     var secondIndex = index + 1;
        //     if (index === polygon.points.length - 1) {
        //         secondIndex = 0;
        //     }
        //     var x = Math.min(Math.max(0, 0.5 * (polygon.points[index].x + polygon.points[secondIndex].x)), 1);
        //     var y = Math.min(Math.max(0, 0.5 * (polygon.points[index].y + polygon.points[secondIndex].y)), 1);
        //     polygon.points.splice(index, 0, new Point(x, y));
        // }
    }

    function removePoint(polygon) {
        if (shouldMutate(removePointsMutationRate) && polygon.points.length > pointsPerPolygonMin) {
            var index = getRandomIndex(polygon.points);
            polygon.points.splice(index, 1);
        }
    }

    function addPolygon(dna) {
        if (shouldMutate(addPolygonMutationRate) && dna.length < maxPolygons) {
            var index = getRandomIndex(dna);
            dna.splice(index, 0, new Polygon());
        }
    }

    function removePolygon(dna) {
        if (shouldMutate(removePolygonMutationRate) && dna.length > minPolygons) {
            var index = getRandomIndex(dna);
            dna.splice(index, 1);
        }
    }

    this.mutateDNA = function(dna) {
        addPolygon(dna);
        removePolygon(dna);
        for (var i = 0; i < dna.length; i++) {
            var polygon = dna[i];
            mutateColor(polygon);
            mutatePosition(polygon);
            movePolygon(polygon);
            addPoint(polygon);
            removePoint(polygon);
        }
    }
};