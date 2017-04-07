'use strict';
/***
Used to draw Pythagoras Tree as a Raphael JS path.

Author: Alex Berke (aberke)
**/


/**
Creates path of pythagoras tree, square by square.
Starts with base (largest) square and recursively calls for the creation of the
current square's 2 child nodes (squares).

@param {X: number, Y: number} origin center that block should be drawn around
@param {number} sideLength of square to draw
@param {Object} options:
				{number} level or depth of recursion to continue with.  Counts down.
				{number} orientation as angle in radians that square should "point" to

@returns {array} pathList as array of RaphaelJS paths to draw
*/
function getPythagorasTree(origin, sideLength, options) {
	var pathList = []; // what will be returned

	options = options || {};
	var levels = options.levels || 4;
	var orientation = options.orientation || (-1)*RADIANS_90_DEGREES;
	var edgePathFunction = options.edgePathFunction || getStraightPath;

	pythagorasTreeRoutine(pathList, origin, sideLength, levels, orientation, edgePathFunction);
	
	return pathList;
}

/**
Recursive call to create path of pythagoras tree, square by square.
Starts with base (largest) square and recursively calls for the creation of the
current square's 2 child nodes (squares).

@param {array} pathList representing path.  Appended to as each square drawn.
@param {X: number, Y: number} centerPoint that block should be drawn around
@param {number} sideLength of square to draw
@param {number} level or depth of recursion to continue with.  Counts down.
@param {number} orientation as angle in radians that square should "point" to
@param {function} edgePathFunction (optional) function with which to draw edges of squares
**/
function pythagorasTreeRoutine(pathList, centerPoint, sideLength, level, orientation, edgePathFunction) {
	if (level <= 0)
		return;

	// add shape around this centerPoint
	// gets path of shape as list.  Each element of this list should be appended to
	// the pathList
	var shapePathList = pythagorasTreeSquare(centerPoint, orientation, sideLength, edgePathFunction);
	for (var i=0; i<shapePathList.length; i++) {
		pathList.push(shapePathList[i]);
	}

	// Draw left child curving in the -45 degree direction from current block
	// and right child curving in the +45 degree direction from this block

	// scale down sideLength by factor of (1/2)*sqrt(2) for children
	var childSideLength = (1/2)*Math.sqrt(2)*sideLength;

	var leftChildOrientation = orientation - RADIANS_45_DEGREES;
	var rightChildOrientation = orientation + RADIANS_45_DEGREES;

	// TODO: figure out how to do this the right way
	// Without this multiplier the fractals do not perfectly line up and touch
	var tightener = 0.96;

	var leftChildCenterPoint = {
		X: centerPoint.X + (
			(1/2)*tightener*sideLength*Math.cos(orientation)
			+
			(3/4)*tightener*sideLength*Math.cos(leftChildOrientation)
		),
		Y: centerPoint.Y + (
			(1/2)*tightener*sideLength*Math.sin(orientation)
			+
			(3/4)*tightener*sideLength*Math.sin(leftChildOrientation)
		)
	}
	var rightChildCenterPoint = {
		X: centerPoint.X + (
			(1/2)*tightener*sideLength*Math.cos(orientation)
			+
			(3/4)*tightener*sideLength*Math.cos(rightChildOrientation)
		),
		Y: centerPoint.Y + (
			(1/2)*tightener*sideLength*Math.sin(orientation)
			+
			(3/4)*tightener*sideLength*Math.sin(rightChildOrientation)
		)
	}

	pythagorasTreeRoutine(pathList, leftChildCenterPoint, childSideLength, level - 1, leftChildOrientation, edgePathFunction);
	pythagorasTreeRoutine(pathList, rightChildCenterPoint, childSideLength, level - 1, rightChildOrientation, edgePathFunction);

	return pathList;
}


/*
Draws square by taking centerPoint and starting at "bottom left" corner where
"bottom left" subject to orientation.

@param {X: number, Y: number} centerPoint that block should be drawn around
@param {number} orientation as angle in radians that square should "point" to
@param {number} sideLength of square to draw
@param {function} edgePathFunction with which to draw each 'side' of square

@returns {array} pathList representing path of square.
*/
function pythagorasTreeSquare(centerPoint, orientation, sideLength, edgePathFunction) {
	// compute the corner points as if square was oriented up and then rotate them
	var diagonal = sideLength*Math.sqrt(2);

	var bottomLeftPoint = {
		X: centerPoint.X - (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y + (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	var bottomRightPoint = {
		X: centerPoint.X + (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y + (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	var topLeftPoint = {
		X: centerPoint.X - (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y - (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	var topRightPoint = {
		X: centerPoint.X + (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y - (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	bottomLeftPoint = rotatePoint(bottomLeftPoint, orientation, centerPoint);
	bottomRightPoint = rotatePoint(bottomRightPoint, orientation, centerPoint);
	topRightPoint = rotatePoint(topRightPoint, orientation, centerPoint);
	topLeftPoint = rotatePoint(topLeftPoint, orientation, centerPoint);

	// default edge is a straight line
	edgePathFunction = edgePathFunction || getStraightPath;

	return [
		// include center point so that animation can grow square from center
		["M", centerPoint.X, centerPoint.Y],
		// start from 'bottom left' point and draw counter clockwise
		["M", bottomLeftPoint.X, bottomLeftPoint.Y],
		edgePathFunction(bottomLeftPoint, bottomRightPoint, centerPoint),
		edgePathFunction(bottomRightPoint, topRightPoint, centerPoint),
		edgePathFunction(topRightPoint, topLeftPoint, centerPoint),
		edgePathFunction(topRightPoint, bottomLeftPoint, centerPoint)
	];
}

/**** Edge Path functions ****/

function getCurvedPath(fromPoint, toPoint, centerPoint) {
	return ["S", toPoint.X, toPoint.Y, fromPoint.X, fromPoint.Y];
}
function getEllipsePath(fromPoint, toPoint, centerPoint) {
	// elliptical arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
	return ["A", 5, 5, 0, 1, 1, toPoint.X, toPoint.Y];
}

/* Returns path for straight line to toPoint. */
function getStraightPath(fromPoint, toPoint) {
	return ["L", toPoint.X, toPoint.Y];
}

/* Function to draw each edge with a slightly different curve. */
function getCatmullRomPathRandom(fromPoint, toPoint, centerPoint) {
	var multiplier = Math.random();
	return getCatmullRomPath(fromPoint, toPoint, centerPoint, multiplier);
}

/* Draws curved path to toPoint where center of curve is between fromPoint and centerPoint. */
function getCatmullRomPath(fromPoint, toPoint, centerPoint, multiplier) {
	multiplier = multiplier || 3/4;

	var differenceX = (centerPoint.X - fromPoint.X);
	var differenceY = (centerPoint.Y - fromPoint.Y);

	return ["R", fromPoint.X + multiplier*differenceX, fromPoint.Y + multiplier*differenceY, toPoint.X, toPoint.Y];
}


/*
Draws path of tree on paper, level by level, with animation.
Recursively calls drawing function on each segment's children.
*/
function drawPythagorasTree(paper, pathList, animationInterval, drawCallback) {
	// Set default animation interval
	animationInterval = animationInterval || 1000; // unit: ms

	// Set default drawCallback to do nothing
	drawCallback = drawCallback || function(level) {};

	// Initialize the start and end values to look at entire pathList
	var start = 0;
	var end = pathList.length;
	// There are this many path pieces that compose a square of the tree
	// These pieces should be drawn together
	var jump = 6;
	// Initially, draw blocks at level=1
	var initialLevel = 1;
	drawBranchedPathList(paper, pathList, start, end, jump, animationInterval, drawCallback, initialLevel);
}

/*
Draws current 'square' and then for that square, recursively draws its 2 children
*/
function drawBranchedPathList(paper, pathList, start, end, jump, animationInterval, drawCallback, level) {
	// Check base case: there are no more blocks to draw in this segment of the list
	if (start + jump > end) return;

	// announce we are drawing something at this level
	drawCallback(level);

	var nextPart = pathList.slice(start, start + jump);
	// animates out from first point
	var animatePoint = paper.path(nextPart[0]);
	// color the path purple
	animatePoint.attr({'stroke': PURPLE, 'stroke-width': 2});
	animatePoint.animate({path: nextPart}, animationInterval, function() {
		// done drawing own block
		// recursively call to draw 2 child blocks at next level

		// compute indices of child blocks in the pathList
		var nextIndex1 = start + jump;
		var nextIndex2 = Math.floor(start + end)/2;
		nextIndex2 += (nextIndex2 % jump);

		drawBranchedPathList(paper, pathList, nextIndex1, nextIndex2, jump, animationInterval, drawCallback, level + 1);
		drawBranchedPathList(paper, pathList, nextIndex2, end, jump, animationInterval, drawCallback, level + 1);
	});
}
