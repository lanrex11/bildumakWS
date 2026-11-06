class Item {
  constructor(ApiDatuak) {
    this.id = crypto.randomUUID();
    this.izena = ApiDatuak.commonname;
    this.izenZientifikoa = ApiDatuak.name;
    this.agentea = ApiDatuak.agent;
    if (ApiDatuak.type === "poisonous") {
      this.mota = "pozoitsua"
    } else {
      this.mota = "hilgarria"
    }
    this.distribuzioa = ApiDatuak.distribution;
    this.irudia = ApiDatuak.img;

    this.balorazioa = null;
    this.iruzkina = '';
    this.gordetakoData = null;
  }

  toHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${this.irudia}" alt="${this.izena}">
        <h3>${this.izena || this.izenZientifikoa}</h3>
      </div>
    `;
  }

  toXehetasunHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${this.irudia}" alt="${this.izena}">
        <p><strong>Izena:</strong> ${this.izena}</p>
        <p><strong>Izen zientifikoa:</strong> ${this.izenZientifikoa}</p>
        <p><strong>Mota:</strong> ${this.mota}</p>
        <p><strong>Agentea:</strong> ${this.agentea}</p>
        <p><strong>Distribuzioa:</strong> ${this.distribuzioa}</p>
      </div>
      <div>
        <form id="form-bildumara">
          <label>
            Balorazioa:
            <input id="balorazioa" type="number" min="1" max="5" required>
          </label>
          <br>
          <label>
            Iruzkina:
            <input id="iruzkina" type="text" required></input>
          </label>
          <br>
          <button type="submit">Gehitu bildumara</button>
        </form>
      </div>

    `

  }

  toStorageObject() {
    return {
      id: this.id,
      izena: this.izena,
      izenZientifikoa: this.izenZientifikoa,
      agentea: this.agentea,
      mota: this.mota,
      irudia: this.irudia,
      balorazioa: this.balorazioa,
      iruzkina: this.iruzkina,
      gordetakoData: this.gordetakoData
    }
  }

  static fromStorageObject(obj) {
    const item = new Item({
      commonname: obj.izena,
      name: obj.izenZientifikoa,
      agent: obj.agentea,
      type: obj.mota,
      img: obj.irudia
    });

    item.id = obj.id;
    item.balorazioa = obj.balorazioa;
    item.iruzkina = obj.iruzkina;
    item.gordetakoData = obj.gordetakoData;

    return item;
  }
}
