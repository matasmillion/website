/* Foreign Resource — globe.js
   Lightweight orthographic canvas globe. No dependencies.
   window.FRGlobe.create(canvas, options) -> controller
     options: { autoRotate, colors: {person, place, property, you, dot, sphere, line}, onSelect }
     controller: setMarkers(list), setArcs(list), focus(lat, lng), select(id),
                 setAutoRotate(bool), destroy()
   Markers: { id, type: 'person'|'place'|'property'|'you', name, lat, lng, meta } */
(function () {
  'use strict';

  var DEG = Math.PI / 180;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var landVectors = null;

  function getLandVectors() {
    if (landVectors) return landVectors;
    var data = window.FR_GLOBE_LAND;
    if (!data || !data.length) return null;
    var count = data.length / 2;
    landVectors = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var lat = data[i * 2] * DEG;
      var lng = data[i * 2 + 1] * DEG;
      landVectors[i * 3] = Math.cos(lat) * Math.sin(lng);
      landVectors[i * 3 + 1] = Math.sin(lat);
      landVectors[i * 3 + 2] = Math.cos(lat) * Math.cos(lng);
    }
    return landVectors;
  }

  function toVector(latDeg, lngDeg) {
    var lat = latDeg * DEG;
    var lng = lngDeg * DEG;
    return [Math.cos(lat) * Math.sin(lng), Math.sin(lat), Math.cos(lat) * Math.cos(lng)];
  }

  function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function slerp(a, b, t) {
    var dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    dot = Math.min(1, Math.max(-1, dot));
    var theta = Math.acos(dot) * t;
    var rel = [b[0] - a[0] * dot, b[1] - a[1] * dot, b[2] - a[2] * dot];
    var len = Math.sqrt(rel[0] * rel[0] + rel[1] * rel[1] + rel[2] * rel[2]) || 1;
    rel = [rel[0] / len, rel[1] / len, rel[2] / len];
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    return [a[0] * cos + rel[0] * sin, a[1] * cos + rel[1] * sin, a[2] * cos + rel[2] * sin];
  }

  function create(canvas, options) {
    options = options || {};
    var ctx = canvas.getContext('2d');
    var colors = options.colors || {};
    var style = window.getComputedStyle(canvas);

    function cssVar(name, fallback) {
      var value = style.getPropertyValue(name).trim();
      return value || fallback;
    }

    var palette = {
      person: colors.person || cssVar('--color-terracotta', '#C4632A'),
      place: colors.place || cssVar('--color-sage', '#7A8B6F'),
      property: colors.property || cssVar('--color-ink', '#0A0A0A'),
      you: colors.you || cssVar('--color-terracotta', '#C4632A'),
      dot: colors.dot || cssVar('--color-ink', '#0A0A0A'),
      sphere: colors.sphere || cssVar('--color-ink', '#0A0A0A'),
      halo: colors.halo || cssVar('--color-cream', '#F5F0EB')
    };

    var state = {
      yaw: -0.6,
      pitch: 0.45,
      targetYaw: null,
      targetPitch: null,
      autoRotate: options.autoRotate !== false && !reducedMotion,
      markers: [],
      arcs: [],
      screen: [],
      hoveredId: null,
      selectedId: null,
      dragging: false,
      moved: 0,
      lastX: 0,
      lastY: 0,
      velocity: 0,
      visible: true,
      raf: null,
      lastTime: 0,
      pulse: 0,
      destroyed: false
    };

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    var resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(function () {
        resize();
      });
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    var intersectionObserver = null;
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(function (entries) {
        state.visible = entries[0] ? entries[0].isIntersecting : true;
      });
      intersectionObserver.observe(canvas);
    }

    function rotate(v) {
      var cosY = Math.cos(state.yaw);
      var sinY = Math.sin(state.yaw);
      var x1 = v[0] * cosY + v[2] * sinY;
      var z1 = -v[0] * sinY + v[2] * cosY;
      var cosP = Math.cos(state.pitch);
      var sinP = Math.sin(state.pitch);
      var y2 = v[1] * cosP - z1 * sinP;
      var z2 = v[1] * sinP + z1 * cosP;
      return [x1, y2, z2];
    }

    function radius() {
      return Math.min(width, height) / 2 - Math.max(14, Math.min(width, height) * 0.05);
    }

    function project(v) {
      var r = radius();
      var p = rotate(v);
      return {
        x: width / 2 + p[0] * r,
        y: height / 2 - p[1] * r,
        z: p[2]
      };
    }

    function markerRadius(marker) {
      return marker.type === 'you' ? 6 : 5;
    }

    function draw(time) {
      if (state.destroyed) return;
      state.raf = window.requestAnimationFrame(draw);
      if (!state.visible || !width || document.hidden) return;

      var dt = state.lastTime ? Math.min(0.05, (time - state.lastTime) / 1000) : 0.016;
      state.lastTime = time;
      state.pulse += dt;

      /* ease toward focus target */
      if (state.targetYaw !== null) {
        var dy = normalizeAngle(state.targetYaw - state.yaw);
        var dp = state.targetPitch - state.pitch;
        state.yaw += dy * Math.min(1, dt * 5);
        state.pitch += dp * Math.min(1, dt * 5);
        if (Math.abs(dy) < 0.002 && Math.abs(dp) < 0.002) {
          state.yaw = state.targetYaw;
          state.pitch = state.targetPitch;
          state.targetYaw = null;
          state.targetPitch = null;
        }
      } else if (!state.dragging) {
        if (Math.abs(state.velocity) > 0.0001) {
          state.yaw += state.velocity;
          state.velocity *= 0.94;
        } else if (state.autoRotate && !reducedMotion && state.selectedId === null) {
          state.yaw += dt * 0.12;
        }
      }
      state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch));

      var r = radius();
      var cx = width / 2;
      var cy = height / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      /* sphere */
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 10, 10, 0.035)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(10, 10, 10, 0.18)';
      ctx.stroke();

      /* land dots */
      var vectors = getLandVectors();
      if (vectors) {
        ctx.fillStyle = palette.dot;
        var dotBase = Math.max(0.8, r / 260);
        for (var i = 0; i < vectors.length; i += 3) {
          var cosY = Math.cos(state.yaw);
          var sinY = Math.sin(state.yaw);
          var x1 = vectors[i] * cosY + vectors[i + 2] * sinY;
          var z1 = -vectors[i] * sinY + vectors[i + 2] * cosY;
          var cosP = Math.cos(state.pitch);
          var sinP = Math.sin(state.pitch);
          var y2 = vectors[i + 1] * cosP - z1 * sinP;
          var z2 = vectors[i + 1] * sinP + z1 * cosP;
          if (z2 <= 0.02) continue;
          var alpha = 0.18 + z2 * 0.5;
          ctx.globalAlpha = alpha;
          var size = dotBase * (0.6 + z2 * 0.7);
          ctx.beginPath();
          ctx.arc(cx + x1 * r, cy - y2 * r, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      /* arcs */
      if (state.arcs.length) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = palette.you;
        state.arcs.forEach(function (arc) {
          var from = toVector(arc.from.lat, arc.from.lng);
          var to = toVector(arc.to.lat, arc.to.lng);
          ctx.beginPath();
          var pen = false;
          for (var s = 0; s <= 40; s++) {
            var v = slerp(from, to, s / 40);
            /* lift the arc slightly off the surface for a flight-path feel */
            var lift = 1 + Math.sin((s / 40) * Math.PI) * 0.06;
            var p = rotate([v[0] * lift, v[1] * lift, v[2] * lift]);
            if (p[2] <= 0.02) {
              pen = false;
              continue;
            }
            var sx = cx + p[0] * r;
            var sy = cy - p[1] * r;
            if (pen) {
              ctx.lineTo(sx, sy);
            } else {
              ctx.moveTo(sx, sy);
              pen = true;
            }
          }
          ctx.globalAlpha = 0.55;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }

      /* markers */
      state.screen = [];
      var ordered = state.markers
        .map(function (marker) {
          var p = project(marker.vector);
          return { marker: marker, p: p };
        })
        .sort(function (a, b) {
          return a.p.z - b.p.z;
        });

      ordered.forEach(function (entry) {
        var marker = entry.marker;
        var p = entry.p;
        if (p.z <= 0.02) return;
        state.screen.push({ id: marker.id, x: p.x, y: p.y, z: p.z });

        var color = palette[marker.type] || palette.property;
        var size = markerRadius(marker);
        var isSelected = marker.id === state.selectedId;
        var isHovered = marker.id === state.hoveredId;

        /* pulse ring for "you" + selected */
        if (marker.type === 'you' && !reducedMotion) {
          var pulseT = (state.pulse % 2.4) / 2.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size + pulseT * 16, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = (1 - pulseT) * 0.5;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size + 5, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.beginPath();
        if (marker.type === 'property') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.PI / 4);
          ctx.rect(-size + 1, -size + 1, size * 2 - 2, size * 2 - 2);
          ctx.restore();
        } else {
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = palette.halo;
        ctx.stroke();
      });

      /* hover / selected label */
      var labelTarget = null;
      for (var m = 0; m < state.screen.length; m++) {
        if (state.screen[m].id === (state.hoveredId !== null ? state.hoveredId : state.selectedId)) {
          labelTarget = state.screen[m];
        }
      }
      if (labelTarget) {
        var marker = markerById(labelTarget.id);
        if (marker) {
          var text = marker.name;
          ctx.font = '500 12px ' + (window.getComputedStyle(document.body).fontFamily || 'sans-serif');
          var metrics = ctx.measureText(text);
          var padX = 8;
          var boxW = metrics.width + padX * 2;
          var boxH = 24;
          var bx = Math.min(Math.max(labelTarget.x - boxW / 2, 4), width - boxW - 4);
          var by = labelTarget.y - markerRadius(marker) - boxH - 10;
          if (by < 4) by = labelTarget.y + markerRadius(marker) + 10;
          ctx.fillStyle = palette.property;
          ctx.fillRect(bx, by, boxW, boxH);
          ctx.fillStyle = palette.halo;
          ctx.textBaseline = 'middle';
          ctx.fillText(text, bx + padX, by + boxH / 2 + 0.5);
        }
      }
    }

    function markerById(id) {
      for (var i = 0; i < state.markers.length; i++) {
        if (state.markers[i].id === id) return state.markers[i];
      }
      return null;
    }

    function hitTest(x, y) {
      var best = null;
      var bestDist = 14;
      for (var i = state.screen.length - 1; i >= 0; i--) {
        var s = state.screen[i];
        var dist = Math.hypot(s.x - x, s.y - y);
        if (dist < bestDist) {
          bestDist = dist;
          best = s;
        }
      }
      return best ? markerById(best.id) : null;
    }

    function pointerPosition(event) {
      var rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function onPointerDown(event) {
      var pos = pointerPosition(event);
      state.dragging = true;
      state.moved = 0;
      state.lastX = pos.x;
      state.lastY = pos.y;
      state.velocity = 0;
      state.targetYaw = null;
      state.targetPitch = null;
      canvas.setPointerCapture && canvas.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      var pos = pointerPosition(event);
      if (state.dragging) {
        var r = radius();
        var dx = pos.x - state.lastX;
        var dy = pos.y - state.lastY;
        state.moved += Math.abs(dx) + Math.abs(dy);
        state.yaw += dx / r;
        state.pitch += dy / r;
        state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch));
        state.velocity = dx / r;
        state.lastX = pos.x;
        state.lastY = pos.y;
        canvas.style.cursor = 'grabbing';
      } else {
        var hovered = hitTest(pos.x, pos.y);
        state.hoveredId = hovered ? hovered.id : null;
        canvas.style.cursor = hovered ? 'pointer' : 'grab';
      }
    }

    function onPointerUp(event) {
      if (!state.dragging) return;
      state.dragging = false;
      canvas.style.cursor = 'grab';
      if (state.moved < 6) {
        var pos = pointerPosition(event);
        var hit = hitTest(pos.x, pos.y);
        state.selectedId = hit ? hit.id : null;
        if (typeof options.onSelect === 'function') options.onSelect(hit || null);
      }
    }

    function onPointerLeave() {
      state.hoveredId = null;
      if (!state.dragging) canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerLeave);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.style.cursor = 'grab';

    resize();
    state.raf = window.requestAnimationFrame(draw);

    var controller = {
      setMarkers: function (markers) {
        state.markers = (markers || [])
          .filter(function (m) {
            return m && isFinite(m.lat) && isFinite(m.lng);
          })
          .map(function (m) {
            return {
              id: m.id,
              type: m.type || 'place',
              name: m.name || '',
              lat: m.lat,
              lng: m.lng,
              meta: m.meta || {},
              vector: toVector(m.lat, m.lng)
            };
          });
        if (state.selectedId !== null && !markerById(state.selectedId)) state.selectedId = null;
      },
      setArcs: function (arcs) {
        state.arcs = (arcs || []).filter(function (arc) {
          return (
            arc &&
            arc.from && arc.to &&
            isFinite(arc.from.lat) && isFinite(arc.from.lng) &&
            isFinite(arc.to.lat) && isFinite(arc.to.lng)
          );
        });
      },
      focus: function (lat, lng) {
        state.targetYaw = -lng * DEG;
        state.targetPitch = lat * DEG;
        if (reducedMotion) {
          state.yaw = state.targetYaw;
          state.pitch = state.targetPitch;
          state.targetYaw = null;
          state.targetPitch = null;
        }
      },
      select: function (id) {
        state.selectedId = id;
        var marker = id !== null ? markerById(id) : null;
        if (marker) controller.focus(marker.lat, marker.lng);
      },
      setAutoRotate: function (value) {
        state.autoRotate = Boolean(value) && !reducedMotion;
      },
      getMarker: markerById,
      destroy: function () {
        state.destroyed = true;
        if (state.raf) window.cancelAnimationFrame(state.raf);
        if (resizeObserver) resizeObserver.disconnect();
        if (intersectionObserver) intersectionObserver.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerLeave);
        canvas.removeEventListener('pointerleave', onPointerLeave);
      }
    };

    return controller;
  }

  window.FRGlobe = { create: create };
})();
