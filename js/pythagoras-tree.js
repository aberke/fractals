'use strict';

/**
Creates path of pythagoras tree, square by square.
Starts with base (largest) square and recursively calls for the creation of the
current square's 2 child nodes (squares).

@param {number} order or depth of recursion to continue with.  Counts down.
@param {array} pathList representing path.  Appeneded to as each square drawn.
@param {X: number, Y: number} centerPoint that block should be drawn around
@param {number} orientation as angle in radians that square should "point" to
@param {number} sideLength of square to draw
**/
function pythagorasTreeRoutine(order, pathList, centerPoint, orientation, sideLength) {
	if (order <= 0)
		return;

	// add shape around this centerPoint
	// gets path of shape as list.  Each element of this list should be appended to
	// the pathList
	let shapePathList = pythagorasTreeSquare(centerPoint, orientation, sideLength);
	for (var i=0; i<shapePathList.length; i++) {
		pathList.push(shapePathList[i]);
	}

	// Draw left child curving in the -45 degree direction from current block
	// and right child curving in the +45 degree direction from this block

	// scale down sideLength by factor of (1/2)*sqrt(2) for children
	let childSideLength = (1/2)*Math.sqrt(2)*sideLength;

	let leftChildOrientation = orientation - RADIANS_45_DEGREES;
	let rightChildOrientation = orientation + RADIANS_45_DEGREES;

	// TODO: figure out how to do this the right way
	// Without this multiplier the fractals do not perfectly line up and touch
	let tightener = 0.96;

	let leftChildCenterPoint = {
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
	let rightChildCenterPoint = {
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

	pythagorasTreeRoutine(order - 1, pathList, leftChildCenterPoint, leftChildOrientation, childSideLength);
	pythagorasTreeRoutine(order - 1, pathList, rightChildCenterPoint, rightChildOrientation, childSideLength);

	return pathList;
}

/*
Draws square by taking centerPoint and starting at "bottom left" corner where
"bottom left" subject to orientation.

@returns {array} pathList representing path of square.
*/
function pythagorasTreeSquare(centerPoint, orientation, sideLength) {
	// compute the points as if square was oriented up and then rotate them
	const diagonal = sideLength*Math.sqrt(2);

	let bottomLeftPoint = {
		X: centerPoint.X - (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y + (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	let bottomRightPoint = {
		X: centerPoint.X + (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y + (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	let topLeftPoint = {
		X: centerPoint.X - (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y - (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	let topRightPoint = {
		X: centerPoint.X + (1/2)*diagonal*Math.cos(RADIANS_45_DEGREES),
		Y: centerPoint.Y - (1/2)*diagonal*Math.sin(RADIANS_45_DEGREES)
	};
	bottomLeftPoint = rotatePoint(bottomLeftPoint, orientation, centerPoint);
	bottomRightPoint = rotatePoint(bottomRightPoint, orientation, centerPoint);
	topRightPoint = rotatePoint(topRightPoint, orientation, centerPoint);
	topLeftPoint = rotatePoint(topLeftPoint, orientation, centerPoint);

	return [
		// include center point so that animation can grow square from center
		["M", centerPoint.X, centerPoint.Y],
		// start from 'bottom left' point and draw counter clockwise
		["M", bottomLeftPoint.X, bottomLeftPoint.Y],
		["L", bottomRightPoint.X, bottomRightPoint.Y],
		["L", topRightPoint.X, topRightPoint.Y],
		["L", topLeftPoint.X, topLeftPoint.Y],
		["L", bottomLeftPoint.X, bottomLeftPoint.Y]
	];
}

/*
Given the paper & path, draws the path on the paper where segments
corresponding to same order draws at same time.
Recursively calls drawing function on each segment's children
*/
function drawPythagorasTree(paper, pathList, animationInterval) {
	// set default animation interval
	animationInterval = animationInterval || 1000; // unit: ms
	// Initialize the start and end values to look at entire pathList
	let start = 0;
	let end = pythagorasTreePathList.length;
	// There are this many path pieces that compose a square of the tree
	// These pieces should be drawn together
	let jump = 6;
	drawBranchedPathList(paper, pathList, start, end, jump, animationInterval);
}

/*
Draws current 'square' and then for that square, recursively draws its 2 children
*/
function drawBranchedPathList(paper, pathList, start, end, jump, interval) {
	// check base case: there is nothing more to draw in this segment of the list
	if (start + jump > end) return;

	let nextPart = pathList.slice(start, start + jump);
	// animates out from first point
	var animatePoint = paper.path(nextPart[0]);
	animatePoint.animate({path: nextPart}, interval, function() {
		let nextIndex1 = start + jump;
		let nextIndex2 = Math.floor(start + end)/2;
		nextIndex2 += (nextIndex2 % jump);

		drawBranchedPathList(paper, pathList, nextIndex1, nextIndex2, jump, interval);
		drawBranchedPathList(paper, pathList, nextIndex2, end, jump, interval);
	});
}
