/*
- Utilisation de 'use strict' : pour que le navigateur détecte plus d'erreurs à corriger et on peut améliorer la qualité de code.
- L'attribut class est pour les styles des éléments html (CSS) vs l'attribut data-action c-à-d qu'on est connecté au code Javascript.
- Stockage local de données de type string : si on rafraîchit la page ou on la quitte puis on la réouvre on la trouve dans la même état vue la dernière fois.
- Chaque fois que l'état de l'array contenant les données de la panier se change,on doit faire le stockage local.
- On peut voir les détails de panier en créant un compte Paypal.
*/

'use strict';
// Accés au DOM
const Btns_ajout = document.querySelectorAll('[data-action="Ajouter"]');
const panier = document.querySelector('.panier');
let panierArray = [];
if(JSON.parse(localStorage.getItem('panier')) !== null){
// Pour avoir un array à partir d'objet JSON
    panierArray = JSON.parse(localStorage.getItem('panier'));
}
if(panierArray.length > 0){
    panierArray.forEach(produitObj => {
        inserer_DOM (produitObj); 
        payer();
        Btns_ajout.forEach(btn => {
            const produit = btn.parentNode;
            if(produit.querySelector('.nom_produit').innerText === produitObj.nom){
                actionBtn(btn,produitObj);
            }
        });
    });
}
Btns_ajout.forEach( btn => {
    btn.addEventListener('click',() =>{
        const produit = btn.parentNode;
        const produitObj = {
            img : produit.querySelector('.img_produit').getAttribute('src'),
            nom : produit.querySelector('.nom_produit').innerText,
            prix : produit.querySelector('.prix').innerText,
            quantité : 1
        };
            // L'article ne va pas etre afficher la 1ére fois(panierArray est vide) car ce code est éxecuté avant push()
            // monarticle.nom = l'article existant dans panier
            // produitObj.nom = l'article qu'on essaie de l'ajouter dans panier
            const existe = panierArray.filter(monarticle => (monarticle.nom === produitObj.nom)).length > 0;
            if (existe === false){
                // mettre les produits sous div de 'panier'
                inserer_DOM(produitObj); 
                panierArray.push(produitObj);
                Sauvgarder();
                actionBtn(btn,produitObj);

            }
            
    });
});

function inserer_DOM(produitObj){
    panier.insertAdjacentHTML('beforeend', `
    <div class="article_panier container">
        <img class="img_article_panier" src="${produitObj.img}" alt="${produitObj.nom}"><br><br>
        <h3 class="nom_article_panier">${produitObj.nom}</h3>
        <h3 class="prix_article_panier ">${produitObj.prix}</h3>
        <button class="btn btn--primary btn--small btn-space${(produitObj.quantité === 1 ? ' btn--danger':'')}" data-action="diminuer" style="text-align:center;border-radius:10px;width:94%;"><i class="fas fa-minus"></i></button>
        <h3 class="quantité_article">${produitObj.quantité}</h3>
        <button class="btn btn--primary btn--small btn-space " data-action="augmenter" style="text-align:center;border-radius:10px;width:94%;"><i class="fas fa-plus"></i></button>
        <button class="btn btn--danger btn--small  btn-space" data-action="supprimer" style="text-align:center;border-radius:10px;width:94%;"><i class="fas fa-times"></i></button>
    </div>
    `);
    // Si footer existe on ne le reajoute pas
    if(document.querySelector('.theFooter') === null){
        panier.insertAdjacentHTML('afterend',`
        <div class="theFooter">
        <button class="btn btn--danger" data-action="vider">Vider</button>
        <button class="btn btn--primary" data-action="payer">Payer</button>
        </div>
        `);
        document.querySelector('[data-action="vider"]').addEventListener('click',() => vider());
        document.querySelector('[data-action="payer"]').addEventListener('click',() => checkout());
    }
}
function actionBtn(btn,produitObj){
    btn.innerText = 'Article Ajouté';
    btn.disabled = true;
    const articles_panier = panier.querySelectorAll('.article_panier');
    articles_panier.forEach(article => {
        // Comparer nom_article_panier avec nom de produit car  nom_article va exister une seule fois dans panier donc le code va s'éxecuter une seule fois
        if(article.querySelector('.nom_article_panier').innerText === produitObj.nom){
            article.querySelector('[data-action="augmenter"]').addEventListener('click',() => augmenterQuantité(produitObj,article));
            article.querySelector('[data-action="diminuer"]').addEventListener('click',() => diminuerQuantité(produitObj,btn,article));
            article.querySelector('[data-action="supprimer"]').addEventListener('click',() => supprimerArticle(produitObj,btn,article));
        }
    });
}
function augmenterQuantité(produitObj,article){
    panierArray.forEach(item => {
        if(item.nom === produitObj.nom){
            article.querySelector('.quantité_article').innerText = ++item.quantité;
            article.querySelector('[data-action="diminuer"]').classList.remove('btn--danger');
            Sauvgarder();
         } 
     });
}
function diminuerQuantité(produitObj,btn,article){
    panierArray.forEach(item => {
        if(item.nom === produitObj.nom){
            if(item.quantité > 1){
             article.querySelector('.quantité_article').innerText = --item.quantité; 
             Sauvgarder();
            }else{
                supprimerArticle(produitObj,btn,article);
            }
            if(item.quantité === 1){
             article.querySelector('[data-action="diminuer"]').classList.add('btn--danger');}
             
        } 
     });
}
function supprimerArticle(produitObj,btn,article){
    article.classList.add('article__panier--diminué');
    setTimeout(() => article.remove(),230);
    panierArray = panierArray.filter(itemx => itemx.nom !== produitObj.nom);
    Sauvgarder();
    btn.innerText = 'Ajouter';
    btn.disabled = false;   
    if(panierArray.length < 1){
        document.querySelector('.theFooter').remove();
    }
}
function vider(){
    //Supprimer de DOM
    panier.querySelectorAll('.article_panier').forEach(item => {
    item.classList.add('article__panier--diminué');
    setTimeout(() => item.remove(),230);
    });
    //Supprimer de panier
    panierArray = [];
    localStorage.removeItem('panier');
        document.querySelector('.theFooter').remove();
    Btns_ajout.forEach(btnA =>{  
        btnA.innerText = 'Ajouter';
        btnA.disabled = false;
    }); 
}
function payer(){
    let total = 0;
    panierArray.forEach(item => total += item.quantité * item.prix);
    document.querySelector('[data-action="payer"]').innerText = `Payer : ${total}$`;
}
function Sauvgarder(){
    // L'array pour stockage local est un string de format JSON et pour le navigateur il est un objet de format JSON
    localStorage.setItem('panier',JSON.stringify(panierArray));
    payer();
}
function checkout(){
    let paypalFormHtml = `
        <form id="paypalForm" action="https://www.paypal.com/cgi-bin/webscr" method="post">
        <input type="hidden" name="cmd" value="_cart">
        <input type="hidden" name="upload" value="1">
        <input type="hidden" name="business" value="manelkhayat2020@gmail.com">
        `;
    panierArray.forEach((item,index) =>{
        ++index;
        paypalFormHtml += `
        <input type="hidden" name="item_name_${index}" value="${item.nom}">
        <input type="hidden" name="amount_${index}" value="${item.prix}"> 
        <input type="hidden" name="quantity_${index}" value="${item.quantité}">
        `;
    });
    paypalFormHtml += `
        <input type="submit" value="PayPal">
        </form>
        <div class="overlay"></div>
    `;
    document.querySelector('body').insertAdjacentHTML('beforeend',paypalFormHtml);
    document.getElementById('paypalForm').submit();
}