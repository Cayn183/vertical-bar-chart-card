class VerticalBarChartCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.attachShadow({ mode: "open" });
    // <--- angepasstes und knappes, solides CSS, Balken funktionieren mit Prozenten! --->
    this.shadowRoot.innerHTML = `
      <style>
        .bar-chart {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          gap: 24px;
          padding: 12px;
          height: 160px; /* WICHTIG: Höhe für Prozent-Balken */
        }
        .bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 60px;
        }
        .bar-value {
          font-size: 14px;
          margin-bottom: 4px;
        }
        .bar {
          width: 32px;
          background: #4285f4;
          border-radius: 6px 6px 0 0;
          transition: height 0.5s;
          margin-bottom: 8px;
          /* NEU: Damit Balken am 'foot' beginnen */
          display: flex;
          align-items: flex-end;
        }
        .bar-label {
          font-size: 12px;
          text-align: center;
          word-break: break-all;
        }
      </style>
      <div class="bar-chart"></div>
    `;
    this.chartEl = this.shadowRoot.querySelector(".bar-chart");
  }

  set hass(hass) {
    this._hass = hass;
    this._renderChart();
  }

  _renderChart() {
    if (!this._hass || !this.config || !Array.isArray(this.config.entities)) return;

    const bars = [];
    let maxValue = 0;

    // Werte analysieren
    for (const entity of this.config.entities) {
      const stateObj = this._hass.states[entity.entity];
      if (!stateObj) continue;
      const value = Number(stateObj.state);
      if (!isNaN(value)) maxValue = Math.max(maxValue, value);
    }
    if (maxValue === 0) maxValue = 1; // 0-Division vermeiden

    for (const entity of this.config.entities) {
      const stateObj = this._hass.states[entity.entity];
      if (!stateObj) continue;

      const value = Number(stateObj.state);
      const displayValue = isNaN(value) ? "-" : value;
      const barHeight = isNaN(value) ? 0 : (value / maxValue) * 100;

      bars.push(`
        <div class="bar-container">
          <div class="bar-value">${displayValue}</div>
          <div class="bar" style="height: ${barHeight}%"></div>
          <div class="bar-label">${entity.name || stateObj.attributes.friendly_name || entity.entity}</div>
        </div>
      `);
    }
    this.chartEl.innerHTML = bars.join("");
  }

  getCardSize() {
    return 3;
  }
}
customElements.define('vertical-bar-chart-card', VerticalBarChartCard);