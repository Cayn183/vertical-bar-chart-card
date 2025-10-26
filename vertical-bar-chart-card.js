class VerticalBarChartCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.attachShadow({ mode: "open" });
    // Grundlegendes Styling
    this.shadowRoot.innerHTML = `
      <style>
        .bar-chart {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          height: 150px;
          gap: 24px;
          padding: 12px;
        }
        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bar {
          width: 32px;
          background: #4285f4;
          border-radius: 6px 6px 0 0;
          transition: height 0.5s;
          margin-bottom: 8px;
        }
        .bar-label {
          font-size: 12px;
          text-align: center;
          word-break: break-all;
        }
        .bar-value {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 4px;
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

    // Werte und max. Wert bestimmen
    for (const entity of this.config.entities) {
      const stateObj = this._hass.states[entity.entity];
      if (!stateObj) continue;
      const value = Number(stateObj.state);
      if (!isNaN(value)) maxValue = Math.max(maxValue, value);
    }
    if (maxValue === 0) maxValue = 1; // Division durch 0 vermeiden

    // Balken erzeugen
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

    // Ausgabe
    this.chartEl.innerHTML = bars.join("");
  }

  // Erforderlich für Lovelace
  getCardSize() {
    return 3;
  }
}

// Custom-Element registrieren
customElements.define('vertical-bar-chart-card', VerticalBarChartCard);