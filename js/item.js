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
