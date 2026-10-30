class Item {
  constructor(ApiDatuak) {
    this.id = crypto.randomUUID();
    this.izena = ApiDatuak.commonname;
    this.izenZientifikoa = ApiDatuak.name;
    this.agentea = ApiDatuak.agent;
    this.mota = ApiDatuak.type;   //poisonus or deadly
    this.irudia = ApiDatuak.img;

    this.balorazioa = null;
    this.iruzkina = '';
    this.gordetakoData = null;
  }

  toHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        <img src="${this.irudia}" alt="${this.izena}">
        <h3>${this.izena}</h3>
      </div>
    `;
  }

  toStorageObject() {
    // TODO
  }

  static fromStorageObject(obj) {
    // TODO
  }
}
