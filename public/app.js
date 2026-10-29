let cars = [
  {id:1,brand:'Peugeot',name:'208 1.2 PureTech',version:'Allure · Manual',year:2021,km:'78.500 km',fuel:'Gasolina',price:14900,image:'https://placehold.co/900x600/e9eee9/24666a?text=Peugeot+208',badge:'Destaque',payment:'Possibilidade de financiamento'},
  {id:2,brand:'Renault',name:'Clio 1.0 TCe',version:'Intens · Manual',year:2022,km:'42.100 km',fuel:'Gasolina',price:15900,image:'https://placehold.co/900x600/e9eee9/24666a?text=Renault+Clio',badge:'Novo stock',payment:'Entrada + prestações'},
  {id:3,brand:'Citroën',name:'C3 1.2 PureTech',version:'Feel · Manual',year:2020,km:'65.300 km',fuel:'Gasolina',price:12900,image:'https://placehold.co/900x600/e9eee9/24666a?text=Citroen+C3',badge:'',payment:'Possibilidade de financiamento'},
  {id:4,brand:'Volkswagen',name:'Golf 1.0 TSI',version:'Life · Manual',year:2022,km:'31.800 km',fuel:'Gasolina',price:21900,image:'https://placehold.co/900x600/e9eee9/24666a?text=Volkswagen+Golf',badge:'Oportunidade',payment:'Pagamento direto disponível'}
];
const grid=document.querySelector('#carGrid'), count=document.querySelector('#resultCount'), empty=document.querySelector('#emptyState');
const euro = value => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
function renderCars(list){
  grid.innerHTML=list.map(car=>`<article class="car-card" data-id="${car.id}" tabindex="0"><div class="car-image"><img src="${car.photos?.[0]||car.image||'https://placehold.co/900x600/e9eee9/24666a?text=IS+Autos'}" alt="${car.brand} ${car.name}" loading="lazy">${car.badge?`<span class="car-badge">${car.badge}</span>`:''}</div><div class="car-info"><span class="car-make">${car.vehicleType==='motorcycle'?'Motorizada · ':''}${car.brand}</span><h3 class="car-name">${car.name}</h3><div class="car-specs"><span>${car.year}</span><span>${car.km}</span><span>${car.fuel}</span></div><div class="car-price"><div><small>Preço</small><strong>${euro(car.price)}</strong></div><span class="card-arrow">↗</span></div></div></article>`).join('');
  count.textContent=`${list.length} ${list.length===1?'viatura disponível':'viaturas disponíveis'}`; empty.hidden=list.length>0; grid.hidden=list.length===0;
  document.querySelectorAll('.car-card').forEach(card=>{card.addEventListener('click',()=>openModal(card.dataset.id));card.addEventListener('keydown',e=>{if(e.key==='Enter')openModal(card.dataset.id)})});
}
function filtered(){const query=document.querySelector('#search').value.toLowerCase(),brand=document.querySelector('#brandFilter').value,fuel=document.querySelector('#fuelFilter').value,min=document.querySelector('#minPrice')?.value,max=document.querySelector('#maxPrice')?.value;return cars.filter(car=>(!query||`${car.brand} ${car.name} ${car.version}`.toLowerCase().includes(query))&&(!brand||car.brand===brand)&&(!fuel||car.fuel===fuel)&&(!min||car.price>=Number(min))&&(!max||car.price<=Number(max)))}
function update(){renderCars(filtered())}['search','brandFilter','fuelFilter'].forEach(id=>document.querySelector('#'+id).addEventListener('input',update));
document.querySelector('#clearFilters').addEventListener('click',()=>{document.querySelector('#search').value='';['brandFilter','fuelFilter','minPrice','maxPrice'].forEach(id=>{const field=document.querySelector('#'+id);if(field)field.value=''});update()});document.querySelector('#emptyClear').addEventListener('click',()=>document.querySelector('#clearFilters').click());
let newest=true;document.querySelector('#sortButton').addEventListener('click',()=>{newest=!newest;cars.sort((a,b)=>newest?b.year-a.year:a.price-b.price);document.querySelector('#sortButton').firstChild.textContent=newest?'Mais recentes ':'Preço mais baixo ';update()});
const modal=document.querySelector('#carModal');function openModal(id){const car=cars.find(c=>c.id===id);const photos=car.photos?.length?car.photos:(car.image?[car.image]:[]);document.querySelector('#modalImage').src=photos[0]||'https://placehold.co/900x600/e9eee9/24666a?text=IS+Autos';document.querySelector('#modalImage').alt=`${car.brand} ${car.name}`;document.querySelector('#modalType').textContent=car.brand;document.querySelector('#modalTitle').textContent=car.name;document.querySelector('#modalVersion').textContent=car.version||'';document.querySelector('#modalSpecs').innerHTML=[car.year,car.km,car.fuel].filter(Boolean).map(item=>`<span>${item}</span>`).join('');document.querySelector('#modalDescription').textContent=car.description||'Entre em contacto para receber mais informações sobre esta viatura.';document.querySelector('#modalPrice').textContent=euro(car.price);document.querySelector('#modalPayment').textContent=car.payment||'Condições de pagamento sob consulta.';document.querySelector('#modalGallery').innerHTML=photos.map((photo,index)=>`<button class="${index===0?'active':''}" type="button"><img src="${photo}" alt="Fotografia ${index+1} de ${car.brand} ${car.name}"></button>`).join('');document.querySelectorAll('#modalGallery button').forEach((button,index)=>button.addEventListener('click',()=>{document.querySelector('#modalImage').src=photos[index];document.querySelectorAll('#modalGallery button').forEach(item=>item.classList.remove('active'));button.classList.add('active')}));document.querySelector('#modalWhatsapp').href=`https://wa.me/351912939646?text=${encodeURIComponent(`Olá! Tenho interesse no ${car.brand} ${car.name} anunciado no vosso site. Gostaria de obter mais informações.`)}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}document.querySelector('.modal-close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
async function loadCars(){
  try {
    const response=await fetch('/api/cars');
    if(!response.ok) throw new Error('API indisponível');
    cars=(await response.json()).map(car=>({...car,id:String(car.id)}));
  } catch(error) {
    console.warn('A usar catálogo local:',error.message);
    cars=cars.map(car=>({...car,id:String(car.id)}));
  }
  renderCars(cars);
}
loadCars();
const priceSelect=document.querySelector('#priceFilter');if(priceSelect){const priceFields=document.createElement('div');priceFields.className='price-fields';priceFields.innerHTML='<input id="minPrice" type="number" min="0" placeholder="Preço mínimo" aria-label="Preço mínimo"><input id="maxPrice" type="number" min="0" placeholder="Preço máximo" aria-label="Preço máximo">';priceSelect.replaceWith(priceFields);priceFields.querySelectorAll('input').forEach(input=>input.addEventListener('input',update))}
function addVideosToModal(car){
  if(!car.videos?.length) return;
  const gallery=document.querySelector('#modalGallery');
  gallery.querySelectorAll('.video-thumb').forEach(item=>item.remove());
  car.videos.forEach((src,index)=>{const button=document.createElement('button');button.className='video-thumb';button.type='button';button.innerHTML='<span>▶</span><img src="https://placehold.co/100x70/152629/ffffff?text=VIDEO" alt="Vídeo '+(index+1)+'">';button.addEventListener('click',()=>{document.querySelector('#modalImage')?.remove();document.querySelector('#modalVideo')?.remove();const video=document.createElement('video');video.id='modalVideo';video.className='modal-main-video';video.controls=true;video.autoplay=true;video.playsInline=true;video.src=src;document.querySelector('.modal-image').prepend(video);document.querySelectorAll('#modalGallery button').forEach(item=>item.classList.remove('active'));button.classList.add('active')});gallery.appendChild(button)});
}
function renderPaymentDetails(car){const old=document.querySelector('#modalPaymentDetails');old?.remove();const details=document.createElement('div');details.id='modalPaymentDetails';details.className='modal-payment-details';const money=value=>value?euro(Number(value)):'Não indicado';if(car.paymentType==='direct'||car.paymentType==='both'){details.innerHTML+=`<strong>Parcelado</strong><span>Entrada: ${money(car.directEntry)}</span><span>${car.directInstallments||'Não indicado'} prestações de ${money(car.directInstallmentValue)}</span><span>Periodicidade: ${car.directPeriod||'Não indicada'}</span>`}if(car.paymentType==='bank'||car.paymentType==='both'){details.innerHTML+=`<strong>Financiado</strong><span>Entrada: ${money(car.bankEntry)}</span><span>Prazo: ${car.bankTerm||'Não indicado'}</span><span>Prestação estimada: ${money(car.bankPayment)}</span>${car.bankRate?`<span>TAEG / taxa: ${car.bankRate}</span>`:''}<small>Simulação indicativa sujeita a análise e aprovação da entidade financiadora.</small>`}if(details.innerHTML)document.querySelector('.modal-payment').after(details)}
grid.addEventListener('click',event=>{const card=event.target.closest('.car-card');if(card){const car=cars.find(item=>String(item.id)===card.dataset.id);setTimeout(()=>{addVideosToModal(car);renderPaymentDetails(car)},0)}});
document.addEventListener('click',event=>{if(event.target.closest('.car-card')&&document.querySelector('#modalVideo')){const image=document.createElement('img');image.id='modalImage';image.alt='';document.querySelector('.modal-image').prepend(image);document.querySelector('#modalVideo').remove()}},true);
document.addEventListener('click',event=>{const card=event.target.closest('.car-card');if(card){event.preventDefault();openModal(String(card.dataset.id))}},true);
const paymentCopy=document.querySelector('.payment-copy');
const campaignMessage=document.createElement('p');
campaignMessage.className='campaign-message';
campaignMessage.textContent='🚗 em até 120 vezes! Carros novos e usados! Financiado ou Parcelado! Braga📍🇵🇹';
paymentCopy.querySelector('p:not(.eyebrow)')?.remove();
paymentCopy.insertBefore(campaignMessage,paymentCopy.querySelector('.button'));
const paymentConditions=document.createElement('p');
paymentConditions.className='payment-conditions';
paymentConditions.innerHTML='Entrada a partir de 10% ✅<br>Parcelado em até 12x ✅<br>Sem burocracia';
paymentCopy.insertBefore(paymentConditions,paymentCopy.querySelector('.button'));
const paymentTitles=document.querySelectorAll('.payment-cards h3');
if(paymentTitles[0]) paymentTitles[0].textContent='Parcelado';
if(paymentTitles[1]) paymentTitles[1].textContent='Financiado';
const heroImage=document.querySelector('.hero-image-wrap');
if(heroImage) heroImage.innerHTML='<video class="hero-video" autoplay muted loop playsinline preload="auto"><source src="/hero-video.mp4" type="video/mp4">O seu navegador não suporta vídeo.</video><div class="image-gradient"></div>';
const aboutImage=document.querySelector('.about-image img');
if(aboutImage){const aboutVideo=document.createElement('video');aboutVideo.className='about-video';aboutVideo.autoplay=true;aboutVideo.muted=true;aboutVideo.loop=true;aboutVideo.playsInline=true;aboutVideo.preload='metadata';aboutVideo.innerHTML='<source src="/hero-video_02.mp4" type="video/mp4">O seu navegador não suporta vídeo.';aboutImage.replaceWith(aboutVideo)}
document.querySelectorAll('.brand').forEach(brand=>{brand.innerHTML='<img class="brand-logo-image" src="/logo_01.jpg" alt="IS Autos">'});
const instagramIcon='<svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>';
const whatsappIcon='<svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.5 4.1 1.5 5.9L0 24l6.2-1.6A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5Zm-8.4 18.4c-1.8 0-3.6-.5-5.1-1.5l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12.1 22Zm5.4-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.7.1-.2.1-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8 0 1.7 1.2 3.3 1.4 3.5.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.8.7.8.2 1.5.2 2.1.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3Z"></path></svg>';
document.querySelector('.instagram-link').innerHTML=instagramIcon+'<span>Instagram</span>';
document.querySelector('.header-actions .button-dark').insertAdjacentHTML('afterbegin',whatsappIcon);
document.querySelector('.footer-contact a:last-child').insertAdjacentHTML('afterbegin',instagramIcon);
const locationBadge=document.createElement('div');locationBadge.className='location-badge';locationBadge.innerHTML='<svg class="location-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.2"></circle></svg> Braga, Portugal';document.querySelector('.hero-copy').prepend(locationBadge);
const footerLocation=document.createElement('span');footerLocation.className='footer-location';footerLocation.innerHTML='<svg class="location-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.2"></circle></svg> Braga, Portugal';document.querySelector('.footer-contact').prepend(footerLocation);
function setHeroLayout(){document.body.classList.toggle('mobile-hero-layout',window.innerWidth<=768)}setHeroLayout();window.addEventListener('resize',setHeroLayout);
const allCarsButton=document.createElement('button');allCarsButton.className='button button-dark all-cars-button';allCarsButton.type='button';allCarsButton.innerHTML='Ver todas as viaturas <span>↗</span>';document.querySelector('.stock-section .car-grid').after(allCarsButton);allCarsButton.addEventListener('click',()=>{document.querySelector('#clearFilters').click();document.querySelector('#stock').scrollIntoView({behavior:'smooth',block:'start'})});
document.querySelector('.hero-copy h1').innerHTML='O seu carro<br><em>em Portugal.</em>';
document.querySelector('.hero-text').textContent='Chegou a hora de ter o seu carro em Portugal: soluções simples, transparentes e sem burocracia.';
document.querySelector('.payment-copy h2').innerHTML='CHEGOU A HORA<br><em>de ter o seu carro em Portugal sem burocracia.</em>';
campaignMessage.textContent='🚗 “Dirija seu sonho em Portugal com parcelas que cabem no seu orçamento!”';
paymentConditions.innerHTML='Entrada a partir de 10% ✅<br>Parcelado em até 12x ✅<br>Sem burocracia, consulte as condições ✅<br>Contrato de trabalho e autorização de residência ✅';
document.querySelector('.about-copy h2').innerHTML='Seu carro em Portugal.<br><em>Do seu jeito.</em>';
document.querySelector('.about-copy>p:not(.eyebrow)').textContent='Viaturas acessíveis e condições simples para escolher o seu carro com confiança.';
const menuToggle=document.querySelector('.menu-toggle');
menuToggle.addEventListener('click',()=>{const nav=document.querySelector('.desktop-nav');nav.classList.toggle('mobile-open');menuToggle.setAttribute('aria-expanded',nav.classList.contains('mobile-open'))});
document.querySelectorAll('.desktop-nav a').forEach(link=>link.addEventListener('click',()=>document.querySelector('.desktop-nav').classList.remove('mobile-open')));
