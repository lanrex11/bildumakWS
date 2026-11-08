import { STORAGE_KEYS } from './konstanteak.js';


export class bildumaStorage {
    static denakLortu() {
        const datuak = localStorage.getItem(STORAGE_KEYS.BILDUMA_GAKOA)

        if (!datuak) {
            return []
        }

        return JSON.parse(datuak)
    }

    static gorde(item) {
        const bilduma = this.denakLortu()
        const gordetzekoa = item.toStorageObject()

        const indizea = bilduma.findIndex(
            (elem) => elem.id === gordetzekoa.id
        )

        if (indizea === -1) {
            bilduma.push(gordetzekoa)
        } else {
            bilduma[indizea] = gordetzekoa
        }

        localStorage.setItem(STORAGE_KEYS.BILDUMA_GAKOA, JSON.stringify(bilduma))
    }

    static itemBezalaLortu() {
        const bilduma = this.denakLortu()
        return bilduma.map((obj) => Item.fromStorageObject(obj))
    }

    static ezabatu(id) {
        const bilduma = this.denakLortu()
        const bildumaBerria = bilduma.filter((item) => item.id != id)
        localStorage.setItem(STORAGE_KEYS.BILDUMA_GAKOA, JSON.stringify(bildumaBerria))
    }

    static hustu() {
        localStorage.removeItem(STORAGE_KEYS.BILDUMA_GAKOA)
    }
}
