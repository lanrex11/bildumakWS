import { STORAGE_KEYS } from './konstanteak.js';

const ATALAK = ['hasiera', 'bilatzaile', 'bilduma', 'kudeatuBilduma'];

const HASIERATZAILEAK = {
	bilatzaile: bilatzaileaHasieratu,
	bilduma: () => bildumaHasieratu,
	kudeatuBilduma: () => { }
};

async function bilatzaileaHasieratu() {
	let onddo_guztiak = await bilatuApi();
	console.log("ONDOAK: " + onddo_guztiak);
	console.log(Array.isArray(onddo_guztiak));
	console.log("ONDOAK: " + onddo_guztiak.length);



	const formularioaBilatzaile = document.getElementById('form-bilatzaile');
	const inputa = document.getElementById('input-bilaketa');
	const egoera = document.getElementById('egoera-bilatzen');
	const emaitzaEremua = document.getElementById('emaitzak-bilaketa');
	const hautatutakoEremua = document.getElementById('xehetasunak-item')

	//Onddo guztiak lortu localStoragetik eta behar direnekin geratu.
	formularioaBilatzaile.addEventListener('submit', event => {
		//index.html ez berbidaltzea
		event.preventDefault();

		const izena = inputa.value.trim();
		if (izena === '') {
			egoera.textContent = 'Idatzi izen bat';
			return;
		}

		//onddo_guztiak = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILDUMAOSOA)) || [];
		const onddoak = onddo_guztiak.filter(o => o.name.toLowerCase().includes(izena.toLowerCase()));
		egoera.textContent = "";
		emaitzaEremua.textContent = "Aurkitu diren onddo kopurua: " + onddo_guztiak.length;
		let onddoItemList = [];
		onddo_guztiak.forEach(o => {
			const i = new Item(o);
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
	const itemak = bildumaStorage.itemBezalaLortu();
	console.log(itemak);
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
