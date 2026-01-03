// sphere.js
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";

// Single place to control dot color
const DOT_COLOR = new THREE.Color("rgba(206, 211, 214, 1)");

export class MagneticSphere {
  constructor(scene, camera) {

    this._lastDialogIntensity = 0;

    this.scene = scene;
    this.camera = camera;
    this.config = CONFIG;

    this.R = this.config.sphereRadius;

    this.baseDirections = [];
    this.jitterPhases = [];
    this.basePositionsArr = [];

    this.mouseNDC = new THREE.Vector2(0, 0);
    this.mouseHasMoved = false;

    this.currentSpikeIntensity = 0;
    this.targetSpikeIntensity = 0;

    this.magnetDir = new THREE.Vector3(0, 0, 1);
    this.magnetVisualDir = new THREE.Vector3(0, 0, 1);
    this.magnetActive = false;

    this.tmpVec = new THREE.Vector3();
    this.tmpDir = new THREE.Vector3();
    this.tmpEdge = new THREE.Vector3();

    this.lightDir = new THREE.Vector3(0.4, 0.9, 0.7).normalize();

    this.subSpikes = [];
    this.tmpW = new THREE.Vector3();
    this.tmpU = new THREE.Vector3();
    this.tmpV = new THREE.Vector3();

    // dialog mode (AI static)
    this.dialogMode = false;
    this.dialogSpikes = [];

    this._buildPointSphere();
  }

  setDotColor(color) {
    if (this.material) {
      this.material.color.set(color);
    }
  }

  // ---------- API pública ----------

  setMouseNDC(x, y) {
    this.mouseNDC.set(x, y);
    this.mouseHasMoved = true;
  }

  update(time, { enableMagnet, hollowFactor, dialogMode = false }) {
    this.dialogMode = dialogMode;

    let proximity = 0;

    if (!dialogMode) {
      // comportamento normal com magnet
      proximity = this._updateMagnetDirection(time, enableMagnet);

      if (enableMagnet) {
        this.targetSpikeIntensity =
          proximity * this.config.spikeMaxIntensity;
      } else {
        this.targetSpikeIntensity = 0;
        this.magnetActive = false;
      }

      this.currentSpikeIntensity +=
        (this.targetSpikeIntensity - this.currentSpikeIntensity) *
        this.config.spikeEasing;

      if (!this.magnetActive) {
        this.currentSpikeIntensity *= this.config.spikeDecay;
      }

      if (this.magnetActive) {
        this._maybeRespawnSubSpikes(time);
      }
    } else {
      // MODO DIALOG: magnet local desligado
      this.targetSpikeIntensity = 0;
      this.currentSpikeIntensity +=
        (0 - this.currentSpikeIntensity) * this.config.spikeEasing;
      this.magnetActive = false;

      // gerir os "mini-magnets" do modo diálogo
      if (this.dialogSpikes.length === 0) {
        this._initDialogSpikes(time);
      } else {
        this._maybeRespawnDialogSpikes(time);
      }
    }

    this._updatePointsBuffers(time, hollowFactor);

    if (dialogMode) {
      this._lastDialogIntensity = hollowFactor;
    } else {
      this._lastDialogIntensity = 0;
    }

  }

  // ---------- Internos ----------

  _buildPointSphere() {
    const R = this.R;
    const total = this.config.totalPoints;

    for (let i = 0; i < total; i++) {
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;

      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);

      if (z < 0) continue; // só hemisfério frontal

      const dir = new THREE.Vector3(x, y, z).normalize();
      this.baseDirections.push(dir);

      this.basePositionsArr.push(dir.x * R);
      this.basePositionsArr.push(dir.y * R);
      this.basePositionsArr.push(dir.z * R);

      this.jitterPhases.push(Math.random() * Math.PI * 2);
    }

    this.numberOfPoints = this.baseDirections.length;
    this.positions = new Float32Array(this.basePositionsArr);
    this.jitterPhasesArray = new Float32Array(this.jitterPhases);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );

    const circleTexture = this._createCircleTexture(128);

    this.material = new THREE.PointsMaterial({
      color: DOT_COLOR,
      size: this.config.pointSize,
      sizeAttenuation: true,
      map: circleTexture,
      vertexColors: false,
      transparent: true,
      alphaTest: 0.05,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.pointsMesh);

    this.positionsAttr = this.geometry.getAttribute("position");

    this._initSubSpikes(0);
    this._initDialogSpikes(0);
  }

  _createCircleTexture(size = 128) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.45;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);

    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.9, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = 8;
    return texture;
  }

  _updateMagnetDirection(time, enableMagnet) {
    if (!enableMagnet || !this.mouseHasMoved) {
      this.magnetActive = false;
      return 0;
    }

    this.tmpEdge.set(this.R, 0, 0);
    this.tmpEdge.project(this.camera);
    const sphereRadiusNDC = Math.abs(this.tmpEdge.x);

    const rMouse = Math.sqrt(
      this.mouseNDC.x * this.mouseNDC.x + this.mouseNDC.y * this.mouseNDC.y
    );
    const extra = this.config.magnetExtraRadiusFactor;
    const activationRadius = sphereRadiusNDC * (1 + extra);

    let proximity = 0;

    if (rMouse < activationRadius) {
      const distFromEdge = Math.max(0, rMouse - sphereRadiusNDC);
      const denom = sphereRadiusNDC * extra || 1e-6;
      const norm = 1 - distFromEdge / denom;
      proximity = THREE.MathUtils.clamp(norm, 0, 1);
    } else {
      proximity = 0;
    }

    this.magnetActive = proximity > 0.001;

    this.tmpVec.set(this.mouseNDC.x, this.mouseNDC.y, 0);
    this.tmpVec.unproject(this.camera);

    const origin = this.camera.position.clone();
    this.tmpDir.copy(this.tmpVec).sub(origin).normalize();

    const C = origin;
    const RR = this.R;
    const b = 2 * C.dot(this.tmpDir);
    const c = C.lengthSq() - RR * RR;
    const disc = b * b - 4 * c;

    let hitValid = false;

    if (disc >= 0) {
      const sqrtDisc = Math.sqrt(disc);
      const t = (-b - sqrtDisc) / 2;
      if (t > 0) {
        const hit = this.tmpVec.copy(C).add(this.tmpDir.multiplyScalar(t));
        if (hit.z >= 0) {
          this.magnetDir.copy(hit).normalize();
          hitValid = true;
        }
      }
    }

    if (!hitValid) {
      const tClosest = -origin.dot(this.tmpDir);
      let closest = this.tmpVec
        .copy(origin)
        .add(this.tmpDir.multiplyScalar(tClosest));
      let dist = closest.length();

      if (dist < 1e-6) {
        this.magnetDir.set(0, 0, 1);
      } else {
        closest.multiplyScalar(this.R / dist);
        this.magnetDir.copy(closest).normalize();
      }
    }

    if (this.magnetDir.z < 0) this.magnetDir.z *= -1;
    this.magnetDir.normalize();

    this.magnetVisualDir.lerp(
      this.magnetDir,
      this.config.magnetFollowEasing
    );

    return proximity;
  }

  // ---------- SubSpikes (modo magnet) ----------

  _initSubSpikes(time) {
    this.subSpikes.length = 0;
    for (let i = 0; i < this.config.numSubSpikes; i++) {
      this.subSpikes.push(this._createSubSpike(time));
    }
  }

  _createSubSpike(time) {
    const maxAlpha = this.config.areaConeAngle * 0.7;
    const alpha = Math.random() * maxAlpha;
    const beta = Math.random() * Math.PI * 2;

    const life = THREE.MathUtils.lerp(0.9, 1.8, Math.random());
    const phase = Math.random() * Math.PI * 2;

    return { alpha, beta, startTime: time, life, phase };
  }

  _maybeRespawnSubSpikes(time) {
    for (let i = 0; i < this.subSpikes.length; i++) {
      const s = this.subSpikes[i];
      const tNorm = (time - s.startTime) / s.life;
      if (tNorm > 1) {
        this.subSpikes[i] = this._createSubSpike(time);
      }
    }
  }

  _getSpikeDirection(spike, baseDir) {
    this.tmpW.copy(baseDir).normalize();

    const arbitrary =
      Math.abs(this.tmpW.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    this.tmpU.crossVectors(arbitrary, this.tmpW).normalize();
    this.tmpV.crossVectors(this.tmpW, this.tmpU).normalize();

    const alpha = spike.alpha;
    const beta = spike.beta;
    const sinAlpha = Math.sin(alpha);

    const dir = new THREE.Vector3()
      .addScaledVector(this.tmpW, Math.cos(alpha))
      .addScaledVector(this.tmpU, sinAlpha * Math.cos(beta))
      .addScaledVector(this.tmpV, sinAlpha * Math.sin(beta));

    if (dir.z < 0) dir.z *= -1;
    return dir.normalize();
  }

  // ---------- Dialog Spikes (modo AI static) ----------

  _initDialogSpikes(time) {
    this.dialogSpikes.length = 0;
    const count = Math.max(1, Math.floor(this.config.dialogNumSpikes || 16));

    for (let i = 0; i < count; i++) {
      this.dialogSpikes.push(this._createDialogSpike(time));
    }
  }

  _createDialogSpike(time) {
    // direção aleatória na meia-esfera frontal
    let dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
    dir.normalize();
    if (dir.z < 0) dir.z *= -1;

    const life = THREE.MathUtils.lerp(1.2, 3.4, Math.random()); // em segundos
    const phase = Math.random() * Math.PI * 2;

    return {
      dir,
      startTime: time,
      life,
      phase
    };
  }

  _maybeRespawnDialogSpikes(time) {
    const count = Math.max(1, Math.floor(this.config.dialogNumSpikes || 16));

    if (this.dialogSpikes.length !== count) {
      this._initDialogSpikes(time);
      return;
    }

    for (let i = 0; i < this.dialogSpikes.length; i++) {
      const s = this.dialogSpikes[i];
      const tNorm = (time - s.startTime) / s.life;
      if (tNorm > 1) {
        this.dialogSpikes[i] = this._createDialogSpike(time);
      }
    }
  }

  // ---------- Atualização dos pontos ----------

  _updatePointsBuffers(time, hollowFactor) {


    function smoothstep(edge0, edge1, x) {
      const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }


    const posArray = this.positionsAttr.array;

    // configs magnet
    const areaAngle = this.config.areaConeAngle;
    const subAngle = this.config.subSpikeConeAngle;
    const localPow = this.config.spikeLocalPower;
    const hMin = this.config.spikeMinHeight;
    const hMax = this.config.spikeMaxHeight;
    const sizeRatio = this.config.spikeSizeRatio;
    const s1 = this.config.spikeOscSpeed1;
    const s2 = this.config.spikeOscSpeed2;
    const noiseAmt = this.config.spikeNoiseAmount;
    const hollowMax = this.config.hollowMaxPush;

    // configs dialog
    const dialogMode = this.dialogMode === true;
    const dCone = this.config.dialogConeAngle;
    const dLocalPow = this.config.dialogLocalPower;
    const dMin = this.config.dialogSpikeMinHeight;
    const dMax = this.config.dialogSpikeMaxHeight;
    const dSpeed1 = this.config.dialogWaveSpeed1;
    const dSpeed2 = this.config.dialogWaveSpeed2;
    const dNoise = this.config.dialogNoiseAmount;
    // 🔔 ring zone em torno do centro
    const ringInner = this.config.dialogRingInnerAngle || 0.0;
    const ringOuter = this.config.dialogRingOuterAngle || 1.0;
    const forward = new THREE.Vector3(0, 0, 1);
    const projected = new THREE.Vector3();

    this.tmpEdge.set(this.R, 0, 0);
    this.tmpEdge.project(this.camera);
    const edgeNdcX = this.tmpEdge.x;

    const aspect = this.camera.aspect;
    const sphereRadiusPxLike = Math.abs(edgeNdcX) * aspect;
    const hollowRadiusPxLike =
      sphereRadiusPxLike * this.config.hollowScreenRadiusFactor;
    // antes do for(...)
    const camFwd = new THREE.Vector3();
    this.camera.getWorldDirection(camFwd); // direção para onde a câmara "olha"
    const hiddenPos = new THREE.Vector3()
      .copy(this.camera.position)
      .addScaledVector(camFwd, 1000);

    for (let i = 0; i < this.numberOfPoints; i++) {
      const baseIndex = i * 3;
      const dir = this.baseDirections[i];

      let spikeOffset = 0;
      if (dialogMode) {
        const intensity = THREE.MathUtils.clamp(hollowFactor, 0, 1);

        // detectar saída (refill) quando a intensidade começa a descer
        const isRefill = intensity < (this._lastDialogIntensity - 1e-4);
        const refillProgress = isRefill ? (1 - intensity) : 0; // 0→1 durante saída

        // suavidade da frente de refill (0.05..0.15)
        const refillFeather = 0.10;

        // spikes: fade-out no início do refill (evita corte brusco)
        // 0..spikeFadeOutPortion => decai de 1 para 0
        const spikeFadeOutPortion = 0.18;

        const smoothstep = (e0, e1, x) => {
          const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
          return t * t * (3 - 2 * t);
        };

        // 1 quando não é refill; durante refill cai para 0 nos primeiros ~18%
        const spikeFade = isRefill
          ? (1 - smoothstep(0, spikeFadeOutPortion, refillProgress))
          : 1;

        const angleCenter = dir.angleTo(forward); // 0 no centro, ~PI/2 na borda

        // ---------- CENTRO (<= ringInner) ----------
        // Em vez de "esconder para fora do ecrã", empurra para a linha ringInner na esfera
        if (angleCenter <= ringInner) {
          // base normal (no sítio)
          const bx = dir.x * this.R;
          const by = dir.y * this.R;
          const bz = dir.z * this.R;

          // construir direção no ringInner mantendo azimute:
          // vecXY define o azimute (theta). Se estiver mesmo no centro, escolhe um theta qualquer.
          const lenXY = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
          let ux = 1, uy = 0;
          if (lenXY > 1e-6) {
            ux = dir.x / lenXY;
            uy = dir.y / lenXY;
          }

          const sinPhi = Math.sin(ringInner);
          const cosPhi = Math.cos(ringInner);

          // target na circunferência interna do anel, na esfera
          const tx = ux * sinPhi * this.R;
          const ty = uy * sinPhi * this.R;
          const tz = cosPhi * this.R;

          // refill outside-in: ringInner aparece primeiro, centro por último
          const t = THREE.MathUtils.clamp(angleCenter / ringInner, 0, 1); // 0..1
          const threshold = 1 - t; // ringInner -> 0 ; centro -> 1

          // durante dialog (não refill), mantém no ringInner (reveal=0)
          // durante refill, revela ringInner -> base
          const reveal = isRefill
            ? smoothstep(threshold - refillFeather, threshold + refillFeather, refillProgress)
            : 0;

          // lerp ringInner -> base (isto faz “vir da esfera”, não do ecrã)
          posArray[baseIndex] = tx + (bx - tx) * reveal;
          posArray[baseIndex + 1] = ty + (by - ty) * reveal;
          posArray[baseIndex + 2] = tz + (bz - tz) * reveal;

          continue;
        }

        // ---------- FORA DO CENTRO ----------
        // spikes só na ring zone e com spikeFade (para morrer suave no refill)
        let ringWeight = 0;
        if (angleCenter < ringOuter) {
          const tRing = (angleCenter - ringInner) / (ringOuter - ringInner);
          const tClamped = THREE.MathUtils.clamp(tRing, 0, 1);

          // se queres energia mais colada à borda: ringWeight = Math.pow(tClamped, 1.8);
          ringWeight = Math.sin(tClamped * Math.PI); // 0→1→0
        }

        if (ringWeight <= 0.001 || intensity <= 0.001 || this.dialogSpikes.length === 0) {
          spikeOffset = 0;
        } else {
          let bestLocal = 0;
          let bestEnvelope = 0;
          let bestPhase = 0;

          for (let s = 0; s < this.dialogSpikes.length; s++) {
            const spike = this.dialogSpikes[s];
            const centerDir = spike.dir;

            const angle = dir.angleTo(centerDir);
            if (angle >= dCone) continue;

            let locality = 1 - angle / dCone;
            locality = Math.pow(locality, dLocalPow);

            const tNorm = THREE.MathUtils.clamp((time - spike.startTime) / spike.life, 0, 1);
            const lifeEnvelope = Math.sin(tNorm * Math.PI);

            const combined = locality * lifeEnvelope;
            if (combined > bestLocal) {
              bestLocal = combined;
              bestEnvelope = lifeEnvelope;
              bestPhase = spike.phase;
            }
          }

          if (bestLocal > 0) {
            const pointPhase = this.jitterPhasesArray[i];

            const osc1 = Math.sin(time * dSpeed1 + pointPhase + bestPhase);
            const osc2 = Math.sin(time * dSpeed2 + pointPhase * 1.37 - bestPhase * 0.6);
            const oscMix = (osc1 + osc2) * 0.5;
            const oscNorm = 0.5 + 0.5 * oscMix;

            const localIntensity = bestLocal * intensity * ringWeight;

            if (localIntensity > 0.001) {
              const baseHeight = dMin + (dMax - dMin) * localIntensity;
              const mixNoise = (1 - dNoise) * 1.0 + dNoise * oscNorm;

              // 🔑 spikeFade mata spikes suavemente durante refill
              spikeOffset = baseHeight * mixNoise * bestEnvelope * spikeFade;
            } else {
              spikeOffset = 0;
            }
          } else {
            spikeOffset = 0;
          }
        }
      }

      else if (this.currentSpikeIntensity > 0.001 && this.magnetActive) {
        // 🔥 COMPORTAMENTO MAGNET ANTIGO (local em volta do rato)
        let bestLocal = 0;
        let bestSpikeEnvelope = 0;

        const angleArea = dir.angleTo(this.magnetVisualDir);
        if (angleArea < areaAngle) {
          for (let s = 0; s < this.subSpikes.length; s++) {
            const spike = this.subSpikes[s];
            const spikeDir = this._getSpikeDirection(
              spike,
              this.magnetVisualDir
            );

            const angleToSpike = dir.angleTo(spikeDir);
            const pointPhase = this.jitterPhasesArray[i];

            const noiseBase =
              Math.sin(pointPhase * 3.17 + spike.phase * 1.31) +
              0.6 * Math.sin(pointPhase * 5.11 - spike.phase * 0.73);

            const noiseNorm = noiseBase * 0.5;
            const radiusJitter = 1 + 0.35 * noiseNorm;
            const effSubAngle = subAngle * radiusJitter;

            if (angleToSpike < effSubAngle) {
              let locality = 1 - angleToSpike / effSubAngle;
              locality = Math.pow(locality, localPow);

              const tNorm = THREE.MathUtils.clamp(
                (time - spike.startTime) / spike.life,
                0,
                1
              );
              const lifeEnvelope = Math.sin(tNorm * Math.PI);

              const combined = locality * lifeEnvelope;

              if (combined > bestLocal) {
                bestLocal = combined;
                bestSpikeEnvelope = lifeEnvelope;
              }
            }
          }

          if (bestLocal > 0) {
            const phase = this.jitterPhasesArray[i];

            const localIntensity =
              bestLocal * this.currentSpikeIntensity;

            const osc1 = Math.sin(time * s1 + phase);
            const osc2 = Math.sin(time * s2 + phase * 1.37);
            const oscMix = (osc1 + osc2) * 0.5;
            const oscNorm = 0.5 + 0.5 * oscMix;

            const mix = (1 - noiseAmt) * 1.0 + noiseAmt * oscNorm;

            const baseHeight =
              hMin + (hMax - hMin) * localIntensity * sizeRatio;

            spikeOffset =
              baseHeight * mix * (0.5 + 0.5 * bestSpikeEnvelope);
          }
        }
      }

      // HOLLOW GEOMÉTRICO: só no modo "control"
      let hollowOffset = 0;
      if (!dialogMode && hollowFactor > 0.001) {
        projected.set(dir.x * this.R, dir.y * this.R, dir.z * this.R);
        projected.project(this.camera);

        const rPxLike = Math.sqrt(
          projected.x * aspect * projected.x * aspect +
          projected.y * projected.y
        );

        if (rPxLike < hollowRadiusPxLike) {
          const t = 1 - rPxLike / hollowRadiusPxLike;
          const shaped = t * t;
          hollowOffset = hollowFactor * hollowMax * shaped;
        }
      }

      const finalRadius = this.R + spikeOffset + hollowOffset;

      posArray[baseIndex] = dir.x * finalRadius;
      posArray[baseIndex + 1] = dir.y * finalRadius;
      posArray[baseIndex + 2] = dir.z * finalRadius;
    }

    this.positionsAttr.needsUpdate = true;
  }
}
