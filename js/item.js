
const IRUDI_GABE = 'https://static.wikia.nocookie.net/nintendo/images/8/87/Champi%C3%B1on.png/revision/latest?cb=20200913221143&path-prefix=es';
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

  hasImage(){
    return this.irudia && this.irudia.trim() !== '';
  }

  irudiaHTML() {
    const alt = this.izena || this.izenZientifikoa;
    const toadAktibo = localStorage.getItem('toadIrudia') !== 'false';

    if (!toadAktibo) {
      return this.irudia ? `<img src="${this.irudia}" alt="${alt}">` : '';
    }

    return `<img src="${this.irudia || IRUDI_GABE}" alt="${alt}">`;
  }

  toHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        ${this.irudiaHTML()}
        <h3>${this.izena || this.izenZientifikoa}</h3>
      </div>
    `;
  }

  balorazioaHTML(aukeratuta = null) {
    const izarrak = [5, 4, 3, 2, 1].map(balorazioa => {
      const id = `balorazioa-${this.id}-${balorazioa}`;
      const checked = Number(aukeratuta) === balorazioa ? 'checked' : '';

      return `
        <input id="${id}" type="radio" name="balorazioa" value="${balorazioa}" ${checked} required>
        <label for="${id}">
          <span aria-hidden="true">★</span>
          <span class="sr-only">${balorazioa} izar</span>
        </label>
      `;
    }).join('');

    return `
      <fieldset class="balorazio-kontrola">
        <legend><strong>Balorazioa (1-5):</strong></legend>
        <div class="izar-hautaketa">${izarrak}</div>
      </fieldset>
    `;
  }

  toXehetasunHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        ${this.irudiaHTML()}
        <p><strong>Izena:</strong> ${this.izena}</p>
        <p><strong>Izen zientifikoa:</strong> ${this.izenZientifikoa}</p>
        <p><strong>Mota:</strong> ${this.mota}</p>
        <p><strong>Agentea:</strong> ${this.agentea}</p>
        <p><strong>Distribuzioa:</strong> ${this.distribuzioa}</p>
      </div>
      <div>
          <h3>Bildumara gehitu</h3>

          <form id="form-bildumara">
              ${this.balorazioaHTML()}

              <label for="iruzkina"><strong>Iruzkina:</strong></label>
              <br>
              <input id="iruzkina" type="text" placeholder="Idatzi ezazu iruzkina" required>
              <br><br>

              <button type="submit">Bildumara gehitu</button>
          </form>
      </div>
    `
  }

  toBildumaHTML() {
    return `
      <div class="item-card" data-id="${this.id}">
        ${this.irudiaHTML()}
        <p><strong>Izena:</strong> ${this.izena}</p>
        <p><strong>Izen zientifikoa:</strong> ${this.izenZientifikoa}</p>
        <p><strong>Mota:</strong> ${this.mota}</p>
        <p><strong>Agentea:</strong> ${this.agentea}</p>
        <p><strong>Distribuzioa:</strong> ${this.distribuzioa}</p>
        <p><strong>Balorazioa:</strong> ${this.balorazioa} </p>
        <p><strong>Iruzkina:</strong> ${this.iruzkina} </p>
      </div>
    `
  }

  toKudeatuHTML() {
    return `
        <div class="item-card kudeatu-item" data-id="${this.id}">
            <h3>${this.izena || this.izenZientifikoa}</h3>

            <form class="form-editatu" data-id="${this.id}">
                ${this.balorazioaHTML(this.balorazioa)}

                <label>Iruzkina</label>
                <textarea name="iruzkina" required>${this.iruzkina || ''}</textarea>

                <button type="submit">Gorde aldaketak</button>
                <button type="button" class="botoia-ezabatu" data-id="${this.id}">
                    Ezabatu
                </button>
            </form>
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
      distribuzioa: this.distribuzioa,
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
      type: obj.mota === "pozoitsua" ? "poisonous" : "deadly",
      img: obj.irudia
    });

    item.id = obj.id;
    item.balorazioa = obj.balorazioa;
    item.distribuzioa = obj.distribuzioa;
    item.iruzkina = obj.iruzkina;
    item.gordetakoData = obj.gordetakoData;

    return item;
  }
}
