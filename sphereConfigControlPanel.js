// sphereConfigControlPanel.js

export const SPHERE_CONFIG = {
  // tamanho da esfera
  sphereRadius: 60,

  // quantidade de pontos (antes de cortar a meia-esfera)
  totalPoints: 200000,

  // tamanho visual dos pontos
  pointSize: 0.6,

  // --- ÁREA AFETADA (campo magnético global) ---
  areaConeAngle: 0.9,           // ~50º da esfera
  numSubSpikes: 6,
  subSpikeConeAngle: 0.28,
  spikeLocalPower: 2.8,

  // alturas mínima/máxima dos spikes (modo magnet)
  spikeMinHeight: 4,
  spikeMaxHeight: 102,

  // escala global dos spikes
  spikeSizeRatio: 1.1,

  // velocidades das ondas (modo magnet)
  spikeOscSpeed1: 0.5,
  spikeOscSpeed2: 0.2,

  // quanto de “noise” vs movimento suave
  spikeNoiseAmount: 0.7,

  // intensidade máxima global
  spikeMaxIntensity: 1.0,

  // easing da intensidade (fade-in / fade-out)
  spikeEasing: 0.03,

  // decay extra (suaviza fade-out)
  spikeDecay: 0.096,

  // quão rápido a direção visual do campo segue o rato (drag)
  magnetFollowEasing: 0.12,

  // fração extra do raio projetado em que o campo já começa
  magnetExtraRadiusFactor: 1.8,

  // --- HOLLOW (PROMPT / PORTAL FORTE) ---
  hollowMaxPush: 260,
  hollowEasing: 0.08,
  hollowDurationMs: 10500,
  hollowScreenRadiusFactor: 1.2,
  promptTransitionDurationMs: 700,

  // ───────────────────────
  // DIALOG / STATIC SPIKES
  // ───────────────────────

  // tempo de leitura: segundos por caractere da resposta
  dialogSecondsPerChar: 0.08,

  // envelope temporal (0→1→0)
  dialogInDurationMs: 900,
  dialogOutDurationMs: 900,
  dialogMinHoldMs: 2000,

  // “mini-magnets” ao redor da esfera
  dialogNumSpikes: 32,       // quantos cones locais ativos
  dialogConeAngle: 0.35,     // abertura do cone
  dialogLocalPower: 2.2,     // quão rápido cai dentro do cone

  // alturas dos spikes em modo diálogo
  dialogSpikeMinHeight: 3,
  dialogSpikeMaxHeight: 28,

  // movimento dos spikes em modo diálogo
  dialogWaveSpeed1: 0.45,
  dialogWaveSpeed2: 0.18,
  dialogNoiseAmount: 0.7,
    dialogRingInnerAngle: 0.10,  // interior do anel (zona central calma)
  dialogRingOuterAngle: 0.60
};

export function initSphereConfigPanel() {
  const panel = document.getElementById("controlPanel");
  if (!panel) return;

  panel.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Animation Controls";
  panel.appendChild(title);

  const sections = [
    {
      title: "Spikes",
      fields: [
        {
          key: "spikeMaxHeight",
          label: "Spike max height",
          min: 10,
          max: 200,
          step: 1
        },
        {
          key: "spikeMinHeight",
          label: "Spike min height",
          min: 0,
          max: 50,
          step: 1
        },
        {
          key: "spikeEasing",
          label: "Spike easing",
          min: 0.05,
          max: 1.5,
          step: 0.05
        },
        {
          key: "spikeDecay",
          label: "Spike decay",
          min: 0.8,
          max: 1.0,
          step: 0.005
        },
        {
          key: "magnetFollowEasing",
          label: "Magnet drag",
          min: 0.01,
          max: 0.5,
          step: 0.01
        },
        {
          key: "spikeNoiseAmount",
          label: "Noise amount",
          min: 0.0,
          max: 1.0,
          step: 0.05
        }
      ]
    },
    {
      title: "Field & Area",
      fields: [
        {
          key: "magnetExtraRadiusFactor",
          label: "Activation radius",
          min: 0.1,
          max: 2.5,
          step: 0.05
        },
        {
          key: "areaConeAngle",
          label: "Area cone angle",
          min: 0.2,
          max: 1.4,
          step: 0.05
        },
        {
          key: "subSpikeConeAngle",
          label: "Spike cone angle",
          min: 0.05,
          max: 0.7,
          step: 0.02
        }
      ]
    },
    {
      title: "Hollow / Portal",
      fields: [
        {
          key: "hollowMaxPush",
          label: "Hollow push",
          min: 50,
          max: 500,
          step: 10
        },
        {
          key: "hollowEasing",
          label: "Hollow easing",
          min: 0.02,
          max: 0.3,
          step: 0.01
        },
        {
          key: "hollowScreenRadiusFactor",
          label: "Hollow radius",
          min: 0.2,
          max: 0.9,
          step: 0.05
        },
        {
          key: "promptTransitionDurationMs",
          label: "Center sweep (ms)",
          min: 100,
          max: 2000,
          step: 50
        }
      ]
    },
    {
      title: "Dialog / Static Spikes",
      fields: [
        {
          key: "dialogSecondsPerChar",
          label: "Seconds per char",
          min: 0.02,
          max: 0.3,
          step: 0.01
        },
        {
          key: "dialogInDurationMs",
          label: "Dialog fade-in (ms)",
          min: 100,
          max: 5000,
          step: 50
        },
        {
          key: "dialogOutDurationMs",
          label: "Dialog fade-out (ms)",
          min: 100,
          max: 5000,
          step: 50
        },
        {
          key: "dialogMinHoldMs",
          label: "Dialog min hold (ms)",
          min: 500,
          max: 10000,
          step: 100
        },
        {
          key: "dialogNumSpikes",
          label: "Dialog spikes count",
          min: 4,
          max: 64,
          step: 1
        },
        {
          key: "dialogConeAngle",
          label: "Dialog cone angle",
          min: 0.05,
          max: 1.2,
          step: 0.05
        },
        {
          key: "dialogLocalPower",
          label: "Dialog local power",
          min: 1.0,
          max: 4.0,
          step: 0.1
        },
        {
          key: "dialogSpikeMinHeight",
          label: "Static spike min",
          min: 0,
          max: 30,
          step: 1
        },
        {
          key: "dialogSpikeMaxHeight",
          label: "Static spike max",
          min: 5,
          max: 80,
          step: 1
        },
        {
          key: "dialogWaveSpeed1",
          label: "Wave speed 1",
          min: 0.05,
          max: 2,
          step: 0.05
        },
        {
          key: "dialogWaveSpeed2",
          label: "Wave speed 2",
          min: 0.02,
          max: 1,
          step: 0.02
        },
        {
          key: "dialogNoiseAmount",
          label: "Static randomness",
          min: 0.0,
          max: 1.0,
          step: 0.05
        },
           {
          key: "dialogRingInnerAngle",
          label: "Ring inner angle",
          min: 0.0,
          max: 0.9,
          step: 0.02
        },
        {
          key: "dialogRingOuterAngle",
          label: "Ring outer angle",
          min: 0.1,
          max: 1.4,
          step: 0.02
        }
      ]
    }
  ];

  sections.forEach((section) => {
    const secDiv = document.createElement("div");
    secDiv.className = "control-section";

    const secTitle = document.createElement("div");
    secTitle.className = "control-section-title";
    secTitle.textContent = section.title;
    secDiv.appendChild(secTitle);

    section.fields.forEach((field) => {
      const row = document.createElement("div");
      row.className = "control-row";

      const label = document.createElement("label");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = field.label;

      const valueSpan = document.createElement("span");
      valueSpan.className = "value";

      const current = SPHERE_CONFIG[field.key];
      valueSpan.textContent =
        typeof current === "number" && current.toFixed
          ? current.toFixed(2)
          : String(current);

      label.appendChild(nameSpan);
      label.appendChild(valueSpan);
      row.appendChild(label);

      const input = document.createElement("input");
      input.type = "range";
      input.min = String(field.min);
      input.max = String(field.max);
      input.step = String(field.step);
      input.value = String(current);

      input.addEventListener("input", () => {
        let v = parseFloat(input.value);
        SPHERE_CONFIG[field.key] = v;
        valueSpan.textContent =
          typeof v === "number" && v.toFixed
            ? v.toFixed(2)
            : String(v);
      });

      row.appendChild(input);
      secDiv.appendChild(row);
    });

    panel.appendChild(secDiv);
  });
}
