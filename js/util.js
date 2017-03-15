'use strict';


const MAGENTA = '#330033';

// 60 degrees in radians
const RADIANS_60_DEGREES = (2*Math.PI)/6;


function drawFractalRow(paper, fractalCount, maxOrder, fractalFunction, baseFractalFunction) {

	// distance (px) between fractals and side of canvas
	const buffer_size = 10;

	var canvasWidth = paper.canvas.clientWidth;
	var canvasHeight = paper.canvas.clientHeight;

	// draw a bunch of fractals in a row, with increasing order
	let order = 1;
	let orderIncrement = Math.round(maxOrder/fractalCount);

	// var fractalSize = 300; // deal with mobile sizing later
	var fractalSize = (canvasWidth - (2*buffer_size))/fractalCount;
	let fractals = {};
	let centerPoint = {
		X: buffer_size + (1/2)*fractalSize,
		Y: canvasHeight/2
	}
	let orientation = 1;
	for (var i=1; i<=fractalCount; i++) {
		// draw circle at center for debugging
		// paper.circle(centerPoint.X, centerPoint.Y, 3);

		let base = baseFractalFunction(centerPoint, fractalSize, order, orientation);
		fractals[order] = fractalFunction(centerPoint, fractalSize, order, orientation);
		// draw base in lighter stroke color
		let pathBelow = paper.path(base);
		pathBelow.attr({'stroke': 'gray'});
		// draw with animation on top of base in darker stroke color
		draw(paper, fractals[order]);

		// increment center point along x-axis
		centerPoint.X += fractalSize;
		// alternate orientation
		orientation *= (-1);
		// draw next fractal with a higher order
		order += orderIncrement;
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

	let currentPath = paper.path(pathList[0]);
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

	let nextPart = pathList.slice(0, index + 1);
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
	if (!(angle < 360 && angle > -360)) {
		console.error('getNextPoint called with bad angle', angle);
		return;
	}
	const fromX = fromPoint.X;
	const fromY = fromPoint.Y;

	const toPoint = {
		X: (fromX + distance*Math.cos(angle)),
		Y: (fromY + distance*Math.sin(angle)),
	}

	return toPoint;
}

function addLine(pathList, nextPoint) {
	pathList.push(["L", nextPoint.X, nextPoint.Y]);
	return pathList;
}
