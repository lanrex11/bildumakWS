import { STORAGE_KEYS } from './konstanteak.js';
import { bildumaStorage } from './bildumaStorage.js'

const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma', 'estatistikak', 'ezarpenak'];

const HASIERATZAILEAK = {
	bilatzaile: bilatzaileaHasieratu,
	bilduma: bildumaHasieratu,
	kudeatuBilduma: kudeatuBildumaHasieratu,
	estatistikak: estatistikakHasieratu,
	ezarpenak: ezarpenakHasieratu
};

function bilatzaileaHasieratu() {
	const formularioaBilatzaile = document.getElementById('form-bilatzaile');
	const inputa = document.getElementById('input-bilaketa');
	const egoera = document.getElementById('egoera-bilatzen');
	const emaitzaEremua = document.getElementById('emaitzak-bilaketa');
	const hautatutakoEremua = document.getElementById('xehetasunak-item')
	const bilAukeraCBox = document.getElementById('bilatu-gaia');



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

		try {
			egoera.textContent = 'Datuak kargatzen...';
			const onddo_guztiak = await bilatuApi(endpoint);
			localStorage.setItem(storageKey, JSON.stringify(
				onddo_guztiak.map(o => new Item(o).toStorageObject())));
			egoera.textContent = '';
		} catch (error) {
			console.error('Errorea API datuak lortzean:', error);
			egoera.textContent = 'Ezin izan dira datuak kargatu. Egiaztatu Internet konexioa.';
			return;
		}

		let onddoak = JSON.parse(localStorage.getItem(storageKey)) || [];


		const onddo_filter = onddoak.filter(o => o.izena.toLowerCase().includes(izena.toLowerCase()));
		emaitzaEremua.textContent = "Aurkitu diren onddo kopurua: " + onddo_filter.length;
		let onddoItemList = [];
		onddo_filter.forEach(o => {
			const i = Item.fromStorageObject(o)
			onddoItemList.push(i);
			emaitzaEremua.insertAdjacentHTML('beforeend', i.toHTML());
		})



		const itemcards = document.querySelectorAll(".item-card");
		console.log(itemcards)
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


					hautatua.balorazioa = Number(formularioaBilduma.querySelector('#balorazioa').value);
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
}

function bildumaHasieratu() {
	const lista = document.getElementById('lista-bilduma');
	const bildumaForm = document.getElementById('bilduma-form');
	const hautatutakoEremua = document.getElementById('xehetasun-bilduma')

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
			lista.insertAdjacentHTML('beforeend', item.toHTML());
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

	botoiaHustu.addEventListener('click', () => {
		if (!confirm('Ziur zaude bilduma osoa hustu nahi duzula?')) {
			return;
		}

		bildumaStorage.hustu();
		erakutsiBilduma();
	});

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

	const banaketaHTML = Object.entries(banaketa)
		.map(([bal, kop]) => `<li>${'★'.repeat(Number(bal))}: ${kop}</li>`)
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

function letraEzarri(tamaina){
	document.documentElement.style.fontSize = tamaina;
}

function letraKargatu(){
	const gordeta = localStorage.getItem(STORAGE_KEYS.LETRA_TAMAINA);
	if(gordeta){
		letraEzarri(gordeta);
	}
}

function ezarpenakHasieratu() {
	const kolorea = document.getElementById('modua-aldatu');
	const letra = document.getElementById('letra-tamaina');

	kolorea.checked = localStorage.getItem(STORAGE_KEYS.LIGHT_DARK) === 'dark';
	letra.value = localStorage.getItem(STORAGE_KEYS.LETRA_TAMAINA || '20px');

	kolorea.addEventListener('change', () => {
		moduaEzarri(kolorea.checked);
		localStorage.setItem(STORAGE_KEYS.LIGHT_DARK, kolorea.checked ? 'dark' : 'light');
	});

	letra.addEventListener('change', () =>{
		letraEzarri(letra.value);
		localStorage.setItem(STORAGE_KEYS.LETRA_TAMAINA, letra.value);
	})
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

	if (izena === 'bilduma') {
		bildumaHasieratu()
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
