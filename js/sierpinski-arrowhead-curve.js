// 'use strict'; // commented out in prod to work nicely with safari
/*************************************
Generates a Sierpiński arrowhead curve as a Raphael JS path.

Author: Alex Berke (aberke)

Has dependencies in util.js
*************************************/


/*
Sierpiński arrowhead curve
---------------------------
The Sierpiński arrowhead curve can be expressed by a rewrite system (L-system).
Alphabet: X, Y
Constants: F, +, −
Axiom: XF
Production rules:
	X → YF + XF + Y
	Y → XF − YF − X
Here, F means “draw forward”, + means “turn left 60°”, and − means “turn right 60°”

@param {X: Number, Y: Number} centerPoint
@param {number} sideLength
@param {Object} options:
	{number} level or depth of recursion with which to continue
	{number} orientation where +1 => triangle points down, -1 => triangle points up=

@returns {array} pathList
*/
function getSierpinskiArrowheadCurve(centerPoint, sideLength, options) {
	options = options || {};

	// Get or set default level.  level represents the depth of recursion
	let level = options.level || 3;

	// Get or set default orientation. -1 => point downwards, +1 => point upwards
	let orientation = options.orientation;
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;

	// start at bottom left corner
	let height = getTriangleHeight((2*Math.PI)/6, sideLength);
	let startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + (orientation)*(1/2)*height,
	}

	// initialize pathList with only startPoint
	// this pathList will be appended to throughout the algorithm
	let pathList = [
		["M", startPoint.X, startPoint.Y]
	];

	// orient Sierpiński arrowhead curve
	let angle = 0;
	if ((level % 2) == 0) { // level is even
		arrowheadCurve(level, pathList, startPoint, sideLength, angle, 1, orientation);
	} else { // level is odd
		angle -= RADIANS_60_DEGREES;
		arrowheadCurve(level, pathList, startPoint, sideLength, angle, 1, orientation);
	}
	return pathList;
}


/*
Recursive subroutine to construct the Sierpiński arrowhead curve

@param {number} level or depth of recursion with which to continue
@param {array} pathList
@param {X: Number, Y: Number} fromPoint
@param {number} sideLength length of current side
@param {number} angle angle expressed in radians.  Is a multiple of 60 degrees
@param {number} angleChange (-1 | 1) indicates whether to update angle by -60 or +60 degrees
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {angle: Number, point: Point} current point and angle in path
*/
function arrowheadCurve(level, pathList, fromPoint, sideLength, angle, angleChange, orientation) {
	// last is the most current point and angle in path
	let last;

	// at level 0: at bottom of recursion: draw next part of path
	if (level == 0) {
		let nextPoint = getNextPoint(fromPoint, sideLength, (orientation)*angle);
		// appends to pathList
		pathList = addLine(pathList, nextPoint);
		last = {
			point: nextPoint,
			angle: angle
		}
		return last;
	}

	last = arrowheadCurve(level - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange, orientation);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(level - 1, pathList, fromPoint, sideLength/2, angle, angleChange, orientation);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(level - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange, orientation);
	return last;
}
