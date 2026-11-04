const BILDUMA_GAKOA = 'bilduma';

class bildumaStorage {
    static denakLortu() {
        const datuak = localStorage.getItem(BILDUMA_GAKOA)

        if (!datuak) {
            return []
        }

        return JSON.parse(datuak)
    }

    static gorde(item) {
        const bilduma = this.denakLortu()
        const godetzekoa = item.toStorageObject()

        const indizea = bilduma.findIndex(
            (elem) => elem.id === gordetzekoa.id
        )

        if (indizea === -1) {
            bilduma.push(gordetzekoa)
        } else {
            bilduma[indizea] = gordetzekoa
        }

        localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bilduma))
    }

    static itemBezalaLortu() {
        const bilduma = this.denakLortu()
        return bilduma.map((obj) => Item.fromStorageObject(obj))
    }

    static ezabatu(id) {
        const bilduma = this.denakLortu()
        const bildumaBerria = bilduma.filter((item) => item.id != id)
        localStorage.setItem(BILDUMA_GAKOA, JSON.stringify(bildumaBerria))
    }

    static hustu() {
        localStorage.removeItem(BILDUMA_GAKOA)
    }
}
