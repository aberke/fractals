'use strict';
// Note: cannot declare constants when using strict mode.

// Constants:

var LIGHT_GRAY = '#d3d3d3';
var PURPLE = '#670067';

// Representing 'degrees' in radians (I think in degrees :( )
var RADIANS_45_DEGREES = Math.PI/4;
var RADIANS_60_DEGREES = Math.PI/3;
var RADIANS_90_DEGREES = Math.PI/2;
var RADIANS_180_DEGREES = Math.PI;
var RADIANS_360_DEGREES = 2*Math.PI


/**
Returns center point of paper
@returns {X: number, Y: number}
*/
function getCanvasCenterPoint(paper) {
	return {
		X: paper.getSize().width/2,
		Y: paper.getSize().height/2,
	};
}


/*
Linear Algebra: Rotate point around center by angle
Rotation matrix:
	|cosθ, −sinθ|
	|sinθ,  cosθ|
@returns {X: number, Y: number} new point
*/
function rotatePoint(point, angle, center) {
	center = center || {X: 0, Y: 0};
	// translate point before rotating
	var translatedPoint = {
		X: point.X - center.X,
		Y: point.Y - center.Y
	};
	// rotate
	var rotatedPoint = {
		X: translatedPoint.X*Math.cos(angle) - translatedPoint.Y*Math.sin(angle),
		Y: translatedPoint.X*Math.sin(angle) + translatedPoint.Y*Math.cos(angle)
	};
	// translate it back
	return {
		X: rotatedPoint.X + center.X,
		Y: rotatedPoint.Y + center.Y
	}
}


function drawFractalRow(paper, fractalCount, maxLevel, fractalFunction, baseFractalFunction) {

	// distance (px) between fractals and side of canvas
	var buffer_size = 10;

	var canvasWidth = paper.getSize().width;
	var canvasHeight = paper.getSize().height;

	// draw a bunch of fractals in a row, with increasing level
	var level = 1;
	var levelIncrement = Math.round(maxLevel/fractalCount);

	// var fractalSize = 300; // deal with mobile sizing later
	var fractalSize = (canvasWidth - (2*buffer_size))/fractalCount;
	var fractals = {};
	var centerPoint = {
		X: buffer_size + (1/2)*fractalSize,
		Y: canvasHeight/2
	};
	var orientation = 1;
	for (var i=1; i<=fractalCount; i++) {

		var options = {
			level: level,
			orientation: orientation,
		};
		var base = baseFractalFunction(centerPoint, fractalSize, options);
		fractals[level] = fractalFunction(centerPoint, fractalSize, options);
		// draw base in lighter stroke color
		var pathBelow = paper.path(base);
		pathBelow.attr({'stroke': LIGHT_GRAY});
		// draw with animation on top of base in darker stroke color
		draw(paper, fractals[level]);

		// Place text: '_ levels' above or below the fractal drawn
		var levelsTextString = String(level) + ' levels';
		paper.text(centerPoint.X, centerPoint.Y + fractalSize/2 + 5, levelsTextString);

		// increment center point along x-axis
		centerPoint.X += fractalSize;
		// alternate orientation
		orientation *= (-1);
		// draw next fractal with a higher level
		level += levelIncrement;
	}
	return fractals;
}


/**
Animates drawing the path on the Paper

@param {Paper} paper on which to draw
@param {array} pathList of segments to draw
@param {number} interval or time it takes to draw a segment
@returns {Path object} path drawn 
*/
function draw(paper, pathList, interval) {
	// set default interval
	interval = interval || 300;

	if (pathList.length <= 0) return;

	var currentPath = paper.path(pathList[0]);
	currentPath.attr({'stroke': PURPLE, 'stroke-width': 2});
	drawNextPart(pathList, currentPath, 1, interval);
	return currentPath;
}


/**
Recursive subroutine for draw. Animates drawing segments of path

@param {array} pathList of segments to draw
@param {Path Object} currentPath to add segment to 
@param {number} index of next segment being drawn
@param {number} interval or time it takes to draw a segment
*/
function drawNextPart(pathList, currentPath, index, interval) {
	if (index > pathList.length) return;

	var nextPart = pathList.slice(0, index + 1);
	currentPath.animate({path: nextPart}, interval, function() {
		drawNextPart(pathList, currentPath, index + 1, interval);
	});
}

/**
Returns height of triangle.
@param {number} angle opposite height in radians
@param {number} hypotenuseLength is size of hypotenuse

@returns {number}
*/
function getTriangleHeight(angle, hypotenuseLength) {
	return hypotenuseLength*(Math.sin(angle));
}


/*
Returns next point
@param {object} fromPoint as {X: Number, Y: Number}
@param {number} distance point should be from fromPoint
@param {number} angle in degrees that point should be from fromPoint

@returns (dict) {X: Number, Y: Number}
**/
function getNextPoint(fromPoint, distance, angle) {
	if (angle > RADIANS_360_DEGREES || angle < (-1)*RADIANS_360_DEGREES) {
		console.error('getNextPoint called with bad angle', angle);
		return;
	}
	var fromX = fromPoint.X;
	var fromY = fromPoint.Y;

	var toPoint = {
		X: (fromX + distance*Math.cos(angle)),
		Y: (fromY + distance*Math.sin(angle)),
	};

	return toPoint;
}

function addLine(pathList, nextPoint) {
	pathList.push(["L", nextPoint.X, nextPoint.Y]);
	return pathList;
}
