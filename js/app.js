import { STORAGE_KEYS } from './konstanteak.js';
import { bildumaStorage } from './bildumaStorage.js'

const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma', 'estatistikak', 'ezarpenak'];

const HASIERATZAILEAK = {
	hasiera: hasieratu,
	bilatzaile: bilatzaileaHasieratu,
	bilduma: bildumaHasieratu,
	kudeatuBilduma: kudeatuBildumaHasieratu,
	estatistikak: estatistikakHasieratu,
	ezarpenak: ezarpenakHasieratu
};

let hasieraKargatzen = false;
let janEfektuTenporizadorea;
let janEfektuAnimazioa = null;

function janEfektuaGelditu() {
	const root = document.documentElement;
	const oharra = document.getElementById('jan-oharra');
	const canvas = document.getElementById('jan-kaleidoskopioa');

	window.clearTimeout(janEfektuTenporizadorea);
	if (janEfektuAnimazioa) {
		window.cancelAnimationFrame(janEfektuAnimazioa);
		janEfektuAnimazioa = null;
	}
	if (canvas) canvas.remove();
	if (oharra) oharra.hidden = true;
	root.classList.remove('jan-efektua-aktiboa');
	document.removeEventListener('keydown', janEfektuaEscape);
}

function janEfektuaEscape(e) {
	if (e.key === 'Escape') janEfektuaGelditu();
}

function janEfektuaAktibatu() {
	if (localStorage.getItem(STORAGE_KEYS.JAN_AVISO) !== 'false') {
		const jarraitu = window.confirm(
			'KONTUZ: ikusmen-efektu bizidun honek ondoeza edo krisiak eragin ditzake epilepsia fotosentikorra duten pertsonengan. Jarraitu nahi duzu? Ezeztatzeak aktibatzea saihestuko du.'
		);
		if (!jarraitu) return;
	}

	const root = document.documentElement;

	// Aviso
	let oharra = document.getElementById('jan-oharra');
	if (!oharra) {
		oharra = document.createElement('div');
		oharra.id = 'jan-oharra';
		oharra.setAttribute('role', 'status');
		oharra.setAttribute('aria-live', 'polite');
		root.appendChild(oharra);
	}
	oharra.hidden = false;

	// Canvas del caleidoscopio
	janEfektuaGelditu();
	oharra.hidden = false;
	root.classList.add('jan-efektua-aktiboa');

	const canvas = document.createElement('canvas');
	canvas.id = 'jan-kaleidoskopioa';
	canvas.setAttribute('aria-hidden', 'true');
	canvas.addEventListener('click', janEfektuaGelditu);
	root.insertBefore(canvas, oharra);
	document.addEventListener('keydown', janEfektuaEscape);

	const ctx = canvas.getContext('2d');
	const RAMPA = ' .:-=+*#%@';
	const SEKTOREAK = 6; // simetría hexagonal
	const SEKTORE_ANGELUA = (Math.PI * 2) / SEKTOREAK;
	const FONT_TAMAINA = 14;
	const mugatuaMugimendua = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let zabalera = 0, altuera = 0, zutabeak = 0, errenkadak = 0, zelulaZ = 0, zelulaA = 0;

	function neurriak() {
		const dpr = window.devicePixelRatio || 1;
		zabalera = window.innerWidth;
		altuera = window.innerHeight;
		canvas.width = zabalera * dpr;
		canvas.height = altuera * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.font = `${FONT_TAMAINA}px "DM Mono", monospace`;
		ctx.textBaseline = 'alphabetic';
		zelulaZ = ctx.measureText('M').width;
		zelulaA = FONT_TAMAINA * 1.05;
		zutabeak = Math.ceil(zabalera / zelulaZ);
		errenkadak = Math.ceil(altuera / zelulaA);
	}

	function marraztu(ms) {
		if (zabalera !== window.innerWidth || altuera !== window.innerHeight) neurriak();

		const t = ms / 1000;
		const eskala = Math.min(zabalera, altuera) / 1.6;

		ctx.fillStyle = 'rgba(9, 13, 10, 0.86)'; // estela suave
		ctx.fillRect(0, 0, zabalera, altuera);

		for (let j = 0; j < errenkadak; j++) {
			for (let i = 0; i < zutabeak; i++) {
				const dx = (i - zutabeak / 2) * zelulaZ / eskala;
				const dy = (j - errenkadak / 2) * zelulaA / eskala;
				const r = Math.hypot(dx, dy);

				// Plegado del ángulo: espejo en cada sector
				let a = Math.atan2(dy, dx) + t * 0.3;
				a = ((a % SEKTORE_ANGELUA) + SEKTORE_ANGELUA) % SEKTORE_ANGELUA;
				a = Math.abs(a - SEKTORE_ANGELUA / 2);

				const px = r * Math.cos(a);
				const py = r * Math.sin(a);

				const v =
					(Math.sin(px * 7 + t * 1.4) +
						Math.sin(py * 9 - t) +
						Math.sin(r * 11 - t * 2.2) +
						Math.sin((px + py) * 5 + t * 0.7)) / 8 + 0.5;

				const k = Math.max(0, Math.min(RAMPA.length - 1, Math.floor(v * RAMPA.length)));
				if (k === 0) continue;

				ctx.fillStyle = `hsl(${(v * 300 + t * 60) % 360} 90% ${38 + v * 32}%)`;
				ctx.fillText(RAMPA[k], i * zelulaZ, (j + 1) * zelulaA);
			}
		}
	}

	neurriak();

	if (mugatuaMugimendua) {
		// Sin animación: un único fotograma estático
		ctx.fillStyle = '#090d0a';
		ctx.fillRect(0, 0, zabalera, altuera);
		marraztu(6000);
	} else {
		const hasiera = performance.now();
		const FPS_tartea = 1000 / 30;
		let azkena = 0;
		const begizta = (orain) => {
			if (orain - azkena >= FPS_tartea) {
				azkena = orain;
				marraztu(orain - hasiera);
			}
			janEfektuAnimazioa = window.requestAnimationFrame(begizta);
		};
		janEfektuAnimazioa = window.requestAnimationFrame(begizta);
	}

	janEfektuTenporizadorea = window.setTimeout(janEfektuaGelditu, 13000);
}
async function hasieratu() {

    if (hasieraKargatzen) return;

    hasieraKargatzen = true;

    const hasieraDiv = document.getElementById('hasiera-div');
    const egoera = document.getElementById('egoera');
    hasieraDiv.innerHTML = '';

    egoera.textContent = 'Kargatzen...';
    try {
        const argazkiak = await Promise.all([
			bilatuApi('randompic'),
			bilatuApi('randompic'),
			bilatuApi('randompic')
		]);
        argazkiak.forEach(argazkia => {
            hasieraDiv.insertAdjacentHTML('beforeend', `
				      <div class="random-card" role="button" tabindex="0" aria-label="Argazkia handitu" aria-expanded="false">
						<img src="${argazkia}" alt="Onddoa">
					</div>`)

		    const card = hasieraDiv.lastElementChild;
		    const handitu = () => {
		        const handituta = card.classList.toggle('handituta');
		        card.setAttribute('aria-expanded', String(handituta));
		        card.setAttribute('aria-label', handituta ? 'Argazkia txikitu' : 'Argazkia handitu');
		    };

		    card.addEventListener('click', handitu);
		    card.addEventListener('keydown', event => {
		        if (event.key === 'Enter' || event.key === ' ') {
		            event.preventDefault();
		            handitu();
		        } else if (event.key === 'Escape' && card.classList.contains('handituta')) {
		            handitu();
		        }
		    });
        });

        egoera.textContent = '';
        hasieraKargatzen = false;

    } catch (error) {
        hasieraKargatzen = false;
        console.error('Errorea API datuak lortzean:', error);
        hasieraDiv.innerHTML = '<p>Ezin izan dira datuak kargatu. Egiaztatu Internet konexioa.</p>';
        egoera.textContent = '';
    }
}

async function bilatzaileaHasieratu() {
	const formularioaBilatzaile = document.getElementById('form-bilatzaile');
	const inputa = document.getElementById('input-bilaketa');
	const egoera = document.getElementById('egoera-bilatzen');
	const emaitzaEremua = document.getElementById('emaitzak-bilaketa');
	const hautatutakoEremua = document.getElementById('xehetasunak-item');
	const bilAukeraCBox = document.getElementById('bilatu-gaia');
	const iradokizunak = document.getElementById('iradokizunak-bilaketa');

	//Izenak lortu baldien eta gordeta ez dauden
	const lStoIzena = localStorage.getItem(STORAGE_KEYS.IZEN_GUZTIAK);
	if (lStoIzena === null || lStoIzena === "") {
		try {
			const onddoak = await bilatuApi();
			localStorage.setItem(STORAGE_KEYS.IZEN_GUZTIAK, JSON.stringify(
				onddoak.map(o => ({
					izena: o.commonname || o.name,
					mota: o.type
				}))
			)
			);
		} catch (error) {
			console.error('Errorea API datuak lortzean:', error);
			return;
		}
	}

	//Iradokizunak
	inputa.addEventListener('input', iradokizunakErakutsi);

	//Iradokizunak iragazia aldatzen bada
	bilAukeraCBox.addEventListener('change', iradokizunakErakutsi);



	//Onddo guztiak lortu localStoragetik eta behar direnekin geratu.
	formularioaBilatzaile.addEventListener('submit', async event => {

		//index.html ez berbidaltzea
		event.preventDefault();

		const izena = inputa.value.trim();

		egoera.textContent = 'Bilatzen...';

		const gaia = bilAukeraCBox.value;
		let endpoint = "";
		let storageKey = ""
		switch (gaia) {
			case 'def':
				egoera.textContent = 'Aukeratu iragazki bat';
				return;

			case 'all':
				//endpoint = "";
				storageKey = STORAGE_KEYS.GUZTIAK;
				break;

			case 'tox':
				endpoint = "poisonous";
				storageKey = STORAGE_KEYS.TOXIKOAK;
				break;

			case 'dead':
				endpoint = "deadly";
				storageKey = STORAGE_KEYS.HILGARRIAK;
				break;

			default:
				egoera.textContent = 'Aukeratu iragazki bat';
				return;
		}

		let onddoak = JSON.parse(localStorage.getItem(storageKey))
		
		//Onddoak kargatu localStoragen beharrezkoa bada
		if(onddoak === null || onddoak === ""){
			try {
				//Hau egin hemen
				//const lStoIzena = localStorage.getItem(STORAGE_KEYS.IZEN_GUZTIAK);
				//if (lStoIzena === null || lStoIzena === ""){
				egoera.textContent = 'Datuak kargatzen...';
				const onddo_guztiak = await bilatuApi(endpoint);
				localStorage.setItem(storageKey, JSON.stringify(
					onddo_guztiak.map(o => new Item(o).toStorageObject())));
			} catch (error) {
				console.error('Errorea API datuak lortzean:', error);
				egoera.textContent = 'Ezin izan dira datuak kargatu. Egiaztatu Internet konexioa.';
				return;
			}
		}

		egoera.textContent = '';
		onddoak = JSON.parse(localStorage.getItem(storageKey)) || [];



		const onddo_filter = onddoak.filter(o => o.izena.toLowerCase().includes(izena.toLowerCase()) ||
												 o.izenZientifikoa.toLowerCase().includes(izena.toLowerCase()));
		emaitzaEremua.textContent = "Aurkitu diren onddo kopurua: " + onddo_filter.length;
		if(onddo_filter.length === 0) egoera.textContent = '' 
		let onddoItemList = [];
		onddo_filter.forEach(o => {
			const i = Item.fromStorageObject(o)
			onddoItemList.push(i);
			emaitzaEremua.insertAdjacentHTML('beforeend', i.toHTML());
		})



		const itemcards = document.querySelectorAll(".item-card");
		itemcards.forEach(item => {
			item.addEventListener('click', () => {
				const id = item.dataset.id;
				const hautatua = onddoItemList.find(o => o.id === id);
				//ez da event erabili item balioa lehen sortutako htm bakoitza baita, eta guk objektu osoa klikatua izan denean jakin nahi dugu, ez bere azpi elementu bat
				//.dataset erabili behar da .id soilik ordez, toHml() funtzioan data-id delako div-aren atributua
				hautatutakoEremua.innerHTML = hautatua.toXehetasunHTML();

				const formularioaBilduma = hautatutakoEremua.querySelector('#form-bildumara');

				const botoia = formularioaBilduma.querySelector('button');

				const gordetakoItemak = bildumaStorage.itemBezalaLortu();

				const dagoenekoGordeta = gordetakoItemak.some(
					item => item.izenZientifikoa === hautatua.izenZientifikoa
				);

				if (dagoenekoGordeta) {
					botoia.textContent = 'Bilduman dago';
					botoia.disabled = true;
				}

				formularioaBilduma.addEventListener('submit', event => {
					event.preventDefault();

					if (dagoenekoGordeta) return;

					const balorazioaAukeratua = formularioaBilduma.querySelector('input[name="balorazioa"]:checked');
					if (!balorazioaAukeratua) {
						formularioaBilduma.reportValidity();
						return;
					}

					hautatua.balorazioa = Number(balorazioaAukeratua.value);
					hautatua.iruzkina = formularioaBilduma.querySelector('#iruzkina').value.trim();
					hautatua.gordetakoData = new Date().toISOString();

					bildumaStorage.gorde(hautatua);
					alert('Ondo gorde da Onddo-a')

					botoia.textContent = 'Bilduman dago';
					botoia.disabled = true;

				})
			})
		})
	})

	function iradokizunakErakutsi() {

		const erabTestua = inputa.value.trim().toLowerCase();

			iradokizunak.innerHTML = '';
			if (erabTestua === '') return;

			const onddoIzenak = JSON.parse(
				localStorage.getItem(STORAGE_KEYS.IZEN_GUZTIAK)
			) || [];

			//Iragazia auekratu eta iragazi
			const gaia = bilAukeraCBox.value;
			const OnddoHautagaiak = onddoIzenak.filter(o => {

				const izenaCoincide = o.izena &&o.izena.toLowerCase().includes(erabTestua);
				const motaCoincide = gaia === 'all' || (gaia === 'tox' && o.mota === 'poisonous') ||
					(gaia === 'dead' && o.mota === 'deadly');
				return izenaCoincide && motaCoincide;
			});

			//5 iradokizun maximo aukeratu
			OnddoHautagaiak.slice(0, 5).forEach(o => {

				const iradokizuna = `
					<div class="iradokizuna">
						<p>${o.izena}<p>
					</div>
				`;

				iradokizunak.insertAdjacentHTML('beforeend', iradokizuna);
			});

			// Iradokizunetan klik egitean
			const iradokizunElementuak = iradokizunak.querySelectorAll('.iradokizuna');
			iradokizunElementuak.forEach((iradokizuna, index) => {
				iradokizuna.addEventListener('click', () => {
					inputa.value = OnddoHautagaiak[index].izena;
					iradokizunak.innerHTML = '';

					//Gertaera bat eskuz sortu: cancelable jarri preventDefault() erabiltzeko
					formularioaBilatzaile.dispatchEvent(
						new Event('submit', { cancelable: true})
					);
					
				});
			});
	}
}

function bildumaHasieratu() {
	const lista = document.getElementById('lista-bilduma');
	const bildumaForm = document.getElementById('bilduma-form');
	const hautatutakoEremua = document.getElementById('xehetasun-bilduma')
	hautatutakoEremua.innerHTML = '<p>Onddo bat aukeratu bere xehetasunak bistaratzeko.</p>';

	function erakutsiBilduma() {
		const itemak = bildumaStorage.itemBezalaLortu();
		const onddoMotaSelect = document.getElementById('onddo-mota');
		const ordenatuSelect = document.getElementById('ordenatu');
		const norantzaSelect = document.getElementById('norantza');

		//Filtratu aukeratutako motaren arabera
		const filtratuak = itemak.filter(item => {
			if (onddoMotaSelect.value === '0') return true;
			if (onddoMotaSelect.value === '1') return item.mota === 'pozoitsua';
			if (onddoMotaSelect.value === '2') return item.mota === 'hilgarria';
			return false;
		});

		lista.innerHTML = '';

		if (filtratuak.length === 0) {
			lista.innerHTML = '<p>Ez dago mota horretako onddorik.</p>';
			return;
		}

		//Ordenatu filtratutako elemetuak
		if (ordenatuSelect.value === "izena") {
			filtratuak.sort((item1, item2) => (item1.izena || item1.izenZientifikoa)
				.localeCompare(item2.izena || item2.izenZientifikoa));
		} else if (ordenatuSelect.value === "balorazioa") {
			filtratuak.sort((item1, item2) => item1.balorazioa - item2.balorazioa);
		}

		//Ordena --> Defektuz gorakorra
		if (norantzaSelect.value === "desc") {
			//Arraya aldatzen du!!!
			filtratuak.reverse();
		}
		filtratuak.forEach(item => {
			lista.insertAdjacentHTML('beforeend', item.toBildumaTxartelaHTML());
		});

		lista.querySelectorAll('.jan-botoia').forEach(botoia => {
			botoia.addEventListener('click', event => {
				event.stopPropagation();
				janEfektuaAktibatu();
			});
		});

		const itemCards = document.querySelectorAll(".item-card");
		itemCards.forEach(item => {
			item.addEventListener('click', () => {
				const id = item.dataset.id;
				const hautatua = filtratuak.find(o => o.id === id);
				hautatutakoEremua.innerHTML = hautatua.toBildumaHTML();
			})
		})
	}

	bildumaForm.addEventListener('submit', event => {
		event.preventDefault();
		erakutsiBilduma();
	});

	erakutsiBilduma();

}

function kudeatuBildumaHasieratu() {
	const botoiaHustu = document.getElementById('botoia-hustu');
	const lista = document.getElementById('lista-kudeatu')

	function erakutsiBilduma() {
		const itemak = bildumaStorage.itemBezalaLortu();

		lista.innerHTML = '';

		if (itemak.length === 0) {
			lista.innerHTML = '<p>Oraindik ez du onddorik gorde.</p>';
			return;
		}

		itemak.forEach(item => {
			lista.insertAdjacentHTML('beforeend', item.toKudeatuHTML());
		});

		lista.querySelectorAll('.form-editatu').forEach(formularioa => {
			formularioa.addEventListener('submit', event => {
				event.preventDefault();
				const id = formularioa.dataset.id;
				const balorazioaAukeratua = formularioa.querySelector('input[name="balorazioa"]:checked');

				if (!balorazioaAukeratua) {
					formularioa.reportValidity();
					return;
				}

				const item = itemak.find(elementua =>
					elementua.id === id
				);

				item.balorazioa = Number(balorazioaAukeratua.value);

				item.iruzkina = formularioa.elements.iruzkina.value;

				bildumaStorage.gorde(item);

				erakutsiBilduma();
			});
		});

		lista.querySelectorAll('.botoia-ezabatu').forEach(botoia => {
			botoia.addEventListener('click', () => {
				const id = botoia.dataset.id;

				if (!confirm('Ziur zaude onddo hau ezabatu nahi duzula?')) {
					return;
				}

				bildumaStorage.ezabatu(id);

				erakutsiBilduma();
			});
		});

	}


	botoiaHustu.onclick = () => {
		if (!confirm('Ziur zaude bilduma osoa hustu nahi duzula?')) {
			return;
		}

		bildumaStorage.hustu();
		erakutsiBilduma();
	};

	erakutsiBilduma()

}


function estatistikakHasieratu() {
	const itemak = bildumaStorage.itemBezalaLortu();
	const eremua = document.getElementById('emaitzak-estatistikak');
	const xehetasunEremua = document.getElementById('xehetasun-estatistikak');

	xehetasunEremua.innerHTML = '<p>Aukeratu onddo bat xehetasunak ikusteko.</p>';

	if (itemak.length === 0) {
		eremua.innerHTML = '<p>Oraindik ez duzu onddo-rik gorde </p>';
		return;
	}

	const elemKop = itemak.reduce(kop => kop + 1, 0);

	const balorazioTot = itemak.reduce((acc, i) => acc + i.balorazioa, 0);
	const balorazioAvg = (balorazioTot / elemKop).toFixed(2);

	const banaketa = itemak.reduce((acc, i) => {
		acc[i.balorazioa] = (acc[i.balorazioa] || 0) + 1;
		return acc;
	}, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

	const motaKop = itemak.reduce((acc, i) => {
		acc[i.mota] = (acc[i.mota] || 0) + 1;
		return acc;
	}, {});

	const onena = itemak.reduce((max, i) => i.balorazioa > max.balorazioa ? i : max);
	const txarrena = itemak.reduce((min, i) => i.balorazioa < min.balorazioa ? i : min);

	const balorazioMax = Math.max(1, ...Object.values(banaketa));
	const banaketaHTML = Object.entries(banaketa)
		.reverse()
		.map(([bal, kop]) => `
			<li class="balorazio-lerro">
				<span class="balorazio-etiketa">${bal} <span aria-hidden="true">★</span></span>
				<progress class="balorazio-barra" max="${balorazioMax}" value="${kop}" aria-label="${bal} izar, ${kop} onddo">${kop}</progress>
				<span class="balorazio-kopurua">${kop}</span>
			</li>`)
		.join('');

	const motakaHTML = Object.entries(motaKop)
		.map(([mota, kop]) => `<li>${mota}: ${kop}</li>`)
		.join('');

	eremua.innerHTML = `
		<p><strong>Gordetako onddo kopurua:</strong> ${elemKop}</p>
		<p><strong>Batez besteko balorazioa:</strong> ${balorazioAvg}</p>
		<p>
			<strong>Balorazio onena:</strong>
			<button type="button" class="estatistika-botoia" data-mota="onena">
				${onena.izena || onena.izenZientifikoa} (${onena.balorazioa})
			</button>
		</p>
		<p>
			<strong>Balorazio txarrena:</strong>
			<button type="button" class="estatistika-botoia" data-mota="txarrena">
				${txarrena.izena || txarrena.izenZientifikoa} (${txarrena.balorazioa})
			</button>
		</p>
		<h3>Balorazioen banaketa</h3>
		<ul>${banaketaHTML}</ul>
		<h3>Mota bakoitzeko kopurua</h3>
		<ul>${motakaHTML}</ul>
	`;

	const hautagaiak = { onena, txarrena };

	eremua.querySelectorAll('.estatistika-botoia').forEach(botoia => {
		botoia.addEventListener('click', () => {
			const hautatua = hautagaiak[botoia.dataset.mota];
			xehetasunEremua.innerHTML = hautatua.toBildumaHTML();
		});
	});
}

function moduaEzarri(iluna) {
	document.documentElement.classList.toggle('dark', iluna);
}

function moduaKargatu() {
	moduaEzarri(localStorage.getItem(STORAGE_KEYS.LIGHT_DARK) === 'dark');
}

function letraEzarri(tamaina) {
	document.documentElement.style.fontSize = tamaina;
}

function letraKargatu() {
	const gordeta = localStorage.getItem(STORAGE_KEYS.LETRA_TAMAINA);
	if (gordeta) {
		letraEzarri(gordeta);
	}
}

function ezarpenakHasieratu() {
	const kolorea = document.getElementById('modua-aldatu');
	const letra = document.getElementById('letra-tamaina');
	const botoiaBerrezarri = document.getElementById('botoia-berrezarri');
	const toad = document.getElementById('toad-irudia');
	const avisoJan = document.getElementById('aviso-jan');


	kolorea.checked = localStorage.getItem(STORAGE_KEYS.LIGHT_DARK) === 'dark';
	letra.value = localStorage.getItem(STORAGE_KEYS.LETRA_TAMAINA || '20px');
	toad.checked = localStorage.getItem(STORAGE_KEYS.TOAD_IRUDIA) !== 'false';
	avisoJan.checked = localStorage.getItem(STORAGE_KEYS.JAN_AVISO) !== 'false';

	kolorea.addEventListener('change', () => {
		moduaEzarri(kolorea.checked);
		localStorage.setItem(STORAGE_KEYS.LIGHT_DARK, kolorea.checked ? 'dark' : 'light');
	});

	letra.addEventListener('change', () => {
		letraEzarri(letra.value);
		localStorage.setItem(STORAGE_KEYS.LETRA_TAMAINA, letra.value);
	});

	toad.addEventListener('change', () => {
		localStorage.setItem(STORAGE_KEYS.TOAD_IRUDIA, toad.checked ? 'true' : 'false');
	});

	avisoJan.addEventListener('change', () => {
		localStorage.setItem(STORAGE_KEYS.JAN_AVISO, avisoJan.checked ? 'true' : 'false');
	});

	botoiaBerrezarri.addEventListener('click', () => {

		localStorage.removeItem(STORAGE_KEYS.LIGHT_DARK);
		localStorage.removeItem(STORAGE_KEYS.LETRA_TAMAINA);
		localStorage.removeItem(STORAGE_KEYS.TOAD_IRUDIA);
		localStorage.removeItem(STORAGE_KEYS.JAN_AVISO);


		moduaEzarri(false);
		letraEzarri('16px');

		kolorea.checked = false;
		letra.value = '16px';
		toad.checked = true;
		avisoJan.checked = true;
	});
}



async function atalaKargatu(izena) {
	const edukiontzia = document.getElementById(`atala-${izena}`);


	try {
		const emaitza = await fetch(`templates/${izena}.html`);
		if (!emaitza.ok) throw new Error(`${izena} Ezin izan da kargatu`);

		edukiontzia.innerHTML = await emaitza.text();

		if (HASIERATZAILEAK[izena]) HASIERATZAILEAK[izena]();
	} catch (error) {
		edukiontzia.innerHTML = '<p>Atal hau kargatzean errorea suertatu da.</p>';
		console.error(error);
	}
}

function erakutsiAtala(izena) {
	console.log('Erakutsi atala:', izena);
	document.querySelectorAll('.atala').forEach(sec => {
		sec.classList.remove('aktiboa');
	});

	const atala = document.getElementById(`atala-${izena}`);
	console.log('Contenedor encontrado:', atala);

	if (!atala) {
		console.error('No existe el contenedor de la sección:', izena);
		return;
	}

	atala.classList.add('aktiboa');

	if (izena === 'hasiera') {
		hasieratu();
	}

	if (izena === 'bilduma') {
		bildumaHasieratu();
	}

	if (izena === 'kudeatuBilduma') {
		kudeatuBildumaHasieratu();
	}

	if (izena === 'estatistikak') {
		estatistikakHasieratu();
	}

	console.log('Clases del contenedor:', atala.className);
	console.log('Contenido:', atala.innerHTML);

	document.querySelectorAll('#menu-nagusia button')
		.forEach(btn => btn.classList.remove('active'));

	const boton = document.querySelector(
		`#menu-nagusia button[data-seccion="${izena}"]`
	);

	if (boton) boton.classList.add('active');
}



/*document.querySelectorAll('.atala').forEach(sec => sec.classList.remove('aktiboa'));
document.getElementById(`atala-${izena}`).classList.add('aktiboa');

document.querySelectorAll('#menu-nagusia button').forEach(btn => btn.classList.remove('active'));
const boton = document.querySelector(`#menu-nagusia button[data-seccion="${izena}"]`);
if (boton) boton.classList.add('active');
}*/

async function jaurtiApp() {
	moduaKargatu();
	letraKargatu();
	await Promise.all(ATALAK.map(atalaKargatu));
	erakutsiAtala('hasiera');
}

/*document.getElementById('menu-nagusia').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-seccion]');
  if (!boton) return;
  erakutsiAtala(boton.dataset.seccion);
});*/
document.getElementById('menu-nagusia').addEventListener('click', (event) => {
	console.log('Click detectado');
	const boton = event.target.closest('button[data-seccion]');
	if (!boton) return;

	console.log('Botón pulsado:', boton.dataset.seccion);
	erakutsiAtala(boton.dataset.seccion);
});


jaurtiApp();
