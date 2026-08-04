(() => {
  "use strict";

  const canvas = document.querySelector("#globe-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;

  const continentPolygons = [
    [[-168, 72], [-135, 70], [-110, 72], [-74, 58], [-52, 47], [-64, 25], [-82, 8], [-106, 17], [-118, 30], [-142, 48]],
    [[-82, 12], [-66, 10], [-48, 2], [-35, -8], [-46, -33], [-54, -55], [-70, -50], [-78, -23]],
    [[-74, 83], [-18, 82], [-19, 62], [-48, 58], [-66, 64]],
    [[-12, 72], [30, 72], [48, 58], [40, 43], [24, 35], [-10, 36]],
    [[-18, 36], [17, 38], [52, 28], [46, 4], [35, -34], [15, -36], [-5, -16], [-18, 10]],
    [[27, 74], [95, 78], [178, 67], [170, 44], [142, 35], [123, 8], [103, -9], [75, 8], [56, 25], [43, 42]],
    [[110, -10], [154, -9], [154, -39], [132, -45], [113, -34]],
    [[43, -12], [51, -16], [49, -28], [44, -25]],
    [[129, 46], [146, 45], [146, 30], [132, 31]],
    [[166, -34], [179, -37], [174, -48], [166, -46]]
  ];

  const beacons = [
    { lon: 118.8, lat: 32.1, label: "NANJING", phase: 0.2 },
    { lon: 103.8, lat: 1.35, label: "SINGAPORE", phase: 1.4 },
    { lon: -0.1, lat: 51.5, label: "LONDON", phase: 2.2 },
    { lon: -122.4, lat: 37.8, label: "SAN FRANCISCO", phase: 3.1 },
    { lon: 151.2, lat: -33.9, label: "SYDNEY", phase: 4.2 }
  ];

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    radius: 0,
    rotation: -106,
    tilt: -18,
    dragging: false,
    pointerId: null,
    previousX: 0,
    previousY: 0,
    lastFrame: performance.now()
  };

  function mulberry32(seed) {
    return function random() {
      let value = (seed += 0x6d2b79f5);
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pointInPolygon(lon, lat, polygon) {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
      const [xi, yi] = polygon[index];
      const [xj, yj] = polygon[previous];
      const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function isLand(lon, lat) {
    return continentPolygons.some((polygon) => pointInPolygon(lon, lat, polygon));
  }

  function createLandPoints() {
    const random = mulberry32(20260804);
    const points = [];
    let attempts = 0;

    while (points.length < 2400 && attempts < 42000) {
      attempts += 1;
      const lon = random() * 360 - 180;
      const lat = Math.asin(random() * 2 - 1) / DEG;
      if (!isLand(lon, lat)) continue;

      points.push({
        lon,
        lat,
        size: 0.55 + random() * 1.25,
        phase: random() * TAU,
        speed: 0.55 + random() * 1.45,
        hot: random() > 0.955
      });
    }

    return points;
  }

  const landPoints = createLandPoints();

  function project(lon, lat) {
    const lambda = (lon + state.rotation) * DEG;
    const phi = lat * DEG;
    const pitch = state.tilt * DEG;

    const x = Math.cos(phi) * Math.sin(lambda);
    const y = Math.sin(phi);
    const z = Math.cos(phi) * Math.cos(lambda);

    const rotatedY = y * Math.cos(pitch) - z * Math.sin(pitch);
    const rotatedZ = y * Math.sin(pitch) + z * Math.cos(pitch);

    return {
      x: state.width / 2 + x * state.radius,
      y: state.height / 2 - rotatedY * state.radius,
      z: rotatedZ,
      visible: rotatedZ > 0
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height);
    state.radius = Math.min(state.width, state.height) * 0.335;

    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function drawAtmosphere(time) {
    const centerX = state.width / 2;
    const centerY = state.height / 2;
    const pulse = 1 + Math.sin(time * 0.0012) * 0.018;

    context.save();
    context.globalCompositeOperation = "lighter";

    const outer = context.createRadialGradient(
      centerX,
      centerY,
      state.radius * 0.72,
      centerX,
      centerY,
      state.radius * 1.38 * pulse
    );
    outer.addColorStop(0, "rgba(33, 184, 235, 0.02)");
    outer.addColorStop(0.62, "rgba(49, 202, 255, 0.10)");
    outer.addColorStop(0.82, "rgba(57, 179, 255, 0.08)");
    outer.addColorStop(1, "rgba(36, 129, 255, 0)");
    context.fillStyle = outer;
    context.beginPath();
    context.arc(centerX, centerY, state.radius * 1.4, 0, TAU);
    context.fill();

    context.shadowColor = "rgba(70, 220, 255, 0.85)";
    context.shadowBlur = 24 + Math.sin(time * 0.0015) * 5;
    context.strokeStyle = "rgba(103, 229, 255, 0.5)";
    context.lineWidth = 1.1;
    context.beginPath();
    context.arc(centerX, centerY, state.radius + 1, 0, TAU);
    context.stroke();
    context.restore();
  }

  function drawSphere() {
    const centerX = state.width / 2;
    const centerY = state.height / 2;
    const sphere = context.createRadialGradient(
      centerX - state.radius * 0.28,
      centerY - state.radius * 0.34,
      state.radius * 0.04,
      centerX,
      centerY,
      state.radius
    );

    sphere.addColorStop(0, "rgba(17, 79, 111, 0.72)");
    sphere.addColorStop(0.43, "rgba(7, 39, 65, 0.92)");
    sphere.addColorStop(0.78, "rgba(3, 23, 43, 0.97)");
    sphere.addColorStop(1, "rgba(1, 10, 23, 1)");

    context.save();
    context.fillStyle = sphere;
    context.beginPath();
    context.arc(centerX, centerY, state.radius, 0, TAU);
    context.fill();

    const shade = context.createLinearGradient(
      centerX - state.radius,
      centerY,
      centerX + state.radius,
      centerY
    );
    shade.addColorStop(0, "rgba(0, 0, 0, 0.28)");
    shade.addColorStop(0.46, "rgba(0, 0, 0, 0)");
    shade.addColorStop(1, "rgba(0, 6, 17, 0.48)");
    context.fillStyle = shade;
    context.fill();
    context.restore();
  }

  function drawProjectedPolyline(coordinates, strokeStyle, lineWidth) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.beginPath();

    let drawing = false;
    let previous = null;
    for (const [lon, lat] of coordinates) {
      const point = project(lon, lat);
      const discontinuous = previous && Math.hypot(point.x - previous.x, point.y - previous.y) > state.radius * 0.22;

      if (!point.visible || discontinuous) {
        drawing = false;
        previous = point;
        continue;
      }

      if (!drawing) {
        context.moveTo(point.x, point.y);
        drawing = true;
      } else {
        context.lineTo(point.x, point.y);
      }
      previous = point;
    }
    context.stroke();
  }

  function drawGrid() {
    context.save();
    context.globalCompositeOperation = "screen";

    for (let lat = -60; lat <= 60; lat += 30) {
      const coordinates = [];
      for (let lon = -180; lon <= 180; lon += 3) coordinates.push([lon, lat]);
      drawProjectedPolyline(coordinates, "rgba(89, 204, 236, 0.115)", 0.75);
    }

    for (let lon = -150; lon <= 180; lon += 30) {
      const coordinates = [];
      for (let lat = -88; lat <= 88; lat += 2) coordinates.push([lon, lat]);
      drawProjectedPolyline(coordinates, "rgba(89, 204, 236, 0.095)", 0.7);
    }

    context.restore();
  }

  function drawLand(time) {
    const visible = [];
    for (const point of landPoints) {
      const projected = project(point.lon, point.lat);
      if (projected.visible) visible.push({ point, projected });
    }
    visible.sort((a, b) => a.projected.z - b.projected.z);

    context.save();
    context.globalCompositeOperation = "lighter";

    for (const { point, projected } of visible) {
      const twinkle = 0.56 + Math.sin(time * 0.001 * point.speed + point.phase) * 0.34;
      const depth = 0.25 + projected.z * 0.75;
      const alpha = Math.max(0.06, twinkle * depth);
      const radius = point.size * (0.58 + projected.z * 0.82);

      context.fillStyle = point.hot
        ? `rgba(143, 255, 222, ${Math.min(1, alpha + 0.24)})`
        : `rgba(85, 226, 255, ${alpha})`;

      if (point.hot) {
        context.shadowColor = "rgba(93, 241, 255, 0.95)";
        context.shadowBlur = 8 + twinkle * 10;
      } else {
        context.shadowBlur = 0;
      }

      context.beginPath();
      context.arc(projected.x, projected.y, radius, 0, TAU);
      context.fill();
    }

    context.restore();
  }

  function drawBeacon(beacon, time) {
    const point = project(beacon.lon, beacon.lat);
    if (!point.visible || point.z < 0.14) return;

    const wave = (time * 0.00035 + beacon.phase) % 1;
    const pulse = 0.68 + Math.sin(time * 0.0022 + beacon.phase) * 0.24;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.strokeStyle = `rgba(112, 246, 207, ${0.55 * (1 - wave)})`;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(point.x, point.y, 4 + wave * 19, 0, TAU);
    context.stroke();

    context.fillStyle = `rgba(188, 255, 238, ${pulse})`;
    context.shadowColor = "rgba(105, 255, 222, 1)";
    context.shadowBlur = 14;
    context.beginPath();
    context.arc(point.x, point.y, 2.1, 0, TAU);
    context.fill();
    context.restore();

    if (state.width > 560 && point.z > 0.52) {
      context.save();
      context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillStyle = `rgba(161, 230, 237, ${Math.min(0.75, point.z)})`;
      context.fillText(beacon.label, point.x + 8, point.y - 8);
      context.restore();
    }
  }

  function drawOrbitalArc(time, offset, speed, tilt) {
    context.save();
    context.translate(state.width / 2, state.height / 2);
    context.rotate(tilt);
    context.scale(1, 0.33);
    context.strokeStyle = "rgba(98, 224, 255, 0.11)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, state.radius * 1.16, 0, TAU);
    context.stroke();

    const angle = time * speed + offset;
    const x = Math.cos(angle) * state.radius * 1.16;
    const y = Math.sin(angle) * state.radius * 1.16;
    context.fillStyle = "rgba(118, 242, 255, 0.9)";
    context.shadowColor = "rgba(74, 220, 255, 1)";
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(x, y, 2.2, 0, TAU);
    context.fill();
    context.restore();
  }

  function render(time) {
    const delta = Math.min(40, time - state.lastFrame);
    state.lastFrame = time;

    if (!state.dragging && !prefersReducedMotion.matches) {
      state.rotation += delta * 0.00325;
    }

    context.clearRect(0, 0, state.width, state.height);
    drawOrbitalArc(time, 0.3, 0.00023, -0.38);
    drawOrbitalArc(time, 2.1, -0.00018, 0.55);
    drawAtmosphere(time);
    drawSphere();
    drawGrid();
    drawLand(time);
    beacons.forEach((beacon) => drawBeacon(beacon, time));

    requestAnimationFrame(render);
  }

  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.previousX = event.clientX;
    state.previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;
    const dx = event.clientX - state.previousX;
    const dy = event.clientY - state.previousY;
    state.rotation += dx * 0.28;
    state.tilt = Math.max(-52, Math.min(52, state.tilt - dy * 0.22));
    state.previousX = event.clientX;
    state.previousY = event.clientY;
  });

  function endDrag(event) {
    if (event.pointerId !== state.pointerId) return;
    state.dragging = false;
    state.pointerId = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  requestAnimationFrame(render);
})();
