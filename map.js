/**
 * SVG structure:
 *   <svg> - container for entire map
 *     <g> - handle zoom and drag position
 *       <rect> - overlay a transparent layer for smooth zoom and drag
 *       <g> of <path> - each `path` is a district in the map
 *       <g> of <text> - districts' name
 *     </g>
 *   </svg>
 */

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#FFFF66"

// --------------- Event handler ---------------
const zoom = d3
	.zoom()
	.scaleExtent(ZOOM_THRESHOLD)
	.on("zoom", zoomHandler);

function zoomHandler() {
	g.attr("transform", d3.event.transform);
}

function mouseOverHandler(d, i) {
	d3.select(this).attr("fill", HOVER_COLOR)
}

function mouseOutHandler(d, i) {
	d3.select(this).attr("fill", color(i))
}

function clickHandler(d, i) {
	d3.select("#map__text").text(`You've selected ${d.properties.ADMIN}`)
}


function clickToZoom(zoomStep) {
	if(zoomStep == 0){
		location.reload();
		
	}else{
	svg
		.transition()
		.duration(ZOOM_DURATION)
		.call(zoom.scaleBy, zoomStep);
	}
	
}



d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));
d3.select("#btn-zoom--return").on("click", () => clickToZoom(0));


//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
const svg = d3
	.select("#map__container")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "100%");

const g = svg.call(zoom).append("g");

g
	.append("rect")
	.attr("width", WIDTH * OVERLAY_MULTIPLIER)
	.attr("height", HEIGHT * OVERLAY_MULTIPLIER)
	.attr(
		"transform",
		`translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
	)
	.style("fill", "none")
	.style("pointer-events", "all");

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
	.geoMercator()
	.center([15.161792440000113, 48.937220764000074])
	.scale(220)
	.translate([WIDTH / 2, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

// --------------- Step 4 ---------------
// 1. Plot the map from data source `hongkong`
// 2. Place the district name in the map
renderMap(world);

function renderMap(root) {
	// Draw districts and register event listeners
	g
		.append("g")
		.selectAll("path")
		.data(root.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("fill", (d, i) => color(i))
		.attr("stroke", "#FFF")
		.attr("stroke-width", 0)
		.on("mouseover", mouseOverHandler)
		.on("mouseout", mouseOutHandler)
		.on("click", clickHandler);

	// Place name labels in the middle of a district
	// Introduce some offset (dy, dx) to adjust the position
	g
		.append("g")
		.selectAll("text")
		.data(root.features)
		.enter()
		.append("text")
		.attr("transform", d => `translate(${path.centroid(d)})`)
		.attr("text-anchor", "middle")
		.attr("font-size", 10)
		.attr("dx", d => _.get(d, "offset[0]", null))
		.attr("dy", d => _.get(d, "offset[1]", null))
	//    .text(d => d.properties.ADMIN);
	//	显示国家名字
}
