class VerticalBarChartCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config || !config.entities || !Array.isArray(config.entities)) {
      throw new Error('VerticalBarChartCard: config.entities ist erforderlich und muss ein Array sein');
    }
    this.config = config;
    this._max = (typeof config.max === 'number') ? config.max : 1000;
    this._title = config.title ?? '';
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateBars();
  }

  getCardSize() {
    // Höhe der Karte in Lovelace (optional, je nach Layout)
    return 3;
  }

  render() {
    const rows = (this.config.entities || []).map((e, idx) => {
      const label = e.name ?? e.entity_id;
      return `
        <div class="row" data-index="${idx}">
          <div class="label" title="${e.entity_id}">${label}</div>
          <div class="bar-rail" aria-label="${e.entity_id}">
            <div class="bar" style="width: 0%; background:${e.color ?? '#4caf50'}"></div>
          </div>
          <div class="value" id="value-${idx}">0</div>
        </div>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          padding: 8px;
          border-radius: 12px;
          background: var(--ha-card-background-color, #f5f5f5);
          border: 1px solid rgba(0,0,0,.12);
        }
        .title {
          font-weight: 600;
          margin: 4px 0 8px;
        }
        .row {
          display: grid;
          grid-template-columns: 170px 1fr 60px;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
        }
        .bar-rail {
          height: 12px;
          width: 100%;
          background: #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }
        .bar {
          height: 100%;
          width: 0%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
        .label {
          font-size: 14px;
        }
        .value {
          text-align: right;
          font-family: monospace;
        }
      </style>
      <div class="card">
        ${this._title ? `<div class="title">${this._title}</div>` : ''}
        ${rows}
      </div>
    `;
    // Referenzen sammeln
    this._bars = Array.from(this.shadowRoot.querySelectorAll('.bar'));
    this._values = Array.from(this.shadowRoot.querySelectorAll('.value'));
  }

  _updateBars() {
    if (!this._hass || !this.config) return;
    const max = this._max;

    this.config.entities.forEach((e, idx) => {
      const entityId = e.entity_id;
      const stateObj = this._hass.states[entityId];
      let value = 0;
      let unit = '';

      if (stateObj) {
        const st = parseFloat(stateObj.state);
        value = Number.isFinite(st) ? st : 0;
        unit = (stateObj.attributes && stateObj.attributes.unit_of_measurement) || (e.unit || '');
      }

      const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
      if (this._bars[idx]) this._bars[idx].style.width = pct + '%';
      if (this._values[idx]) {
        const display = isNaN(value) ? '0' : value.toFixed(0);
        this._values[idx].textContent = display + (unit ? ' ' + unit : '');
      }
    });
  }
}

customElements.define('vertical-bar-chart-card', VerticalBarChartCard);