const API_BASE_URL = 'https://toxicshrooms.vercel.app/api/mushrooms/';

//mota izan daiteke: 
// "", 
// ":type" -> poisonous/deadly 
// "randomshromm", 
// "randompic"

async function bilatuApi(mota = '') {
  let url = API_BASE_URL

  if(mota){
    url += mota
  }

  const erantzuna = await fetch(url)

  if (!erantzuna.ok){
    throw new Error('API-arekin errorea')
  }

  return await erantzuna.json()

}
