chrome.runtime.onMessage.addListener(async function(data, sender, sendResponse) {
    console.log("chrome.runtime.onMessage: "+data.command);
    switch(data.command) {
        case "copy_licence_holders" :
            console.log("La je copie");
            var text =  document.getElementById("competiteur").textContent;
            sendResponse({
                response: JSON.parse(text)
            });
            break; 
        case "paste_licence_holder" :
           await getVilles();
           inject(data);


           sendResponse({
            response: "Adhérent copié avec succès."
            });
    
            break;

        default:
            sendResponse({
                response: "Error"
            });
    }
});

function getVilles() {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://datanova.legroupe.laposte.fr/api/records/1.0/search/?dataset=laposte_hexasmal&sort=code_postal&facet=nom_de_la_commune&facet=code_postal&refine.code_postal=79000", true);
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                let setArr = new Set();
                const villes = JSON.parse(xhr.responseText)
                //console.log(villes);
                villes.records.forEach(element => {
                    console.log(element.fields.nom_de_la_commune);
                    setArr.add(element.fields.nom_de_la_commune);
                }); 
                console.log("fini");
                resolve(setArr);            
            }
            else if (status == 400) {
                reject(status);
            }
            else {
                reject(status);
            }
            return true;
        };
        xhr.send();
    });
}

function inject(data){
            //console.log(data.user);
            console.log("Les informations du licencié sont ajoutées ");
            var jform_ACT_nom =  document.getElementById("jform_ACT_nom").value=data.user.lastName;
            var jform_ACT_prenom =  document.getElementById("jform_ACT_prenom").value= data.user.firstName;
            var jform_ACT_adr1 =  document.getElementById("jform_ACT_adr1").value=data.user.addressRep1;
            var jform_ACT_adr2 =  document.getElementById("jform_ACT_adr2").value="";
            var jform_ACT_adr3 =  document.getElementById("jform_ACT_adr3").value="";
            //le pays, select option
            var jform_ACT_cp =  document.getElementById("jform_ACT_cp").value=data.user.zipCodeRep1;
            //ville, select option (dynamique)
            var jform_ACT_dateNaissance =  document.getElementById("jform_ACT_dateNaissance").value=data.user.birthDate;
            var jform_ACT_tel1 =  document.getElementById("jform_ACT_tel1").value=data.user.phoneRep1;
            var jform_ACT_tel2 =  document.getElementById("jform_ACT_tel2").value=data.user.phoneRep2;
            var jform_ACT_mail =  document.getElementById("jform_ACT_mail").value=data.user.emailRep1;
            var jform_ACT_nomEpouse =  document.getElementById("jform_ACT_nomEpouse").value="";
            var jform_ACT_num_licence =  document.getElementById("jform_ACT_num_licence").value="";
            //sexe, select option
            //saison, select option
            //discipline pratiquée. x3 Select option 
            //sous discipline select option
            var jform_AAD_rl1_nom =  document.getElementById("jform_AAD_rl1_nom").value=data.user.firstNameRep1;
            var jform_AAD_rl1_tel =  document.getElementById("jform_AAD_rl1_tel").value=data.user.phoneRep1;
            var jform_AAD_rl1_mail =  document.getElementById("jform_AAD_rl1_mail").value=data.user.emailRep1;
            var jform_AAD_rl2_nom =  document.getElementById("jform_AAD_rl2_nom").value=data.user.firstNameRep2;
            var jform_AAD_rl2_tel =  document.getElementById("jform_AAD_rl2_tel").value=data.user.phoneRep2;
            var jform_AAD_rl2_mail =  document.getElementById("jform_AAD_rl2_mail").value=data.user.emailRep2;
            //select radio Certificat médical de santé
            //select radio Questionnaire de santé
            //Select option droit à l'image
           var jform_AAD_date_inscription =  document.getElementById("jform_AAD_date_inscription").value=data.user.jform_AAD_date_inscription;
            //select list nationalité
           var jform_AAD_CM_date =  document.getElementById("jform_AAD_CM_date").value=data.user.registrationDate;
            //Radio input Bordereau assurance FFG
            //Radio input Bloquer les envois par email
            //Radio input Licencié autre club
            //role dans l'association x5
            var jform_AAD_comment =  document.getElementById("jform_AAD_comment").value="";
            var jform_18086_0171002 =  document.getElementById("jform_18086_0171002").value="";
            var jform_18086_0171003 =  document.getElementById("jform_18086_0171003").value="";
            var jform_18086_0171004 =  document.getElementById("jform_18086_0171004").value="";
            var jform_18086_0171005 =  document.getElementById("jform_18086_0171005").value="";
            var jform_18086_0171006 =  document.getElementById("jform_18086_0171006").value="";
            var jform_18086_0171007 =  document.getElementById("jform_18086_0171007").value="";
            var jform_18086_0171008 =  document.getElementById("jform_18086_0171008").value="";
            var jform_18086_0171009 =  document.getElementById("jform_18086_0171009").value="";
            var jform_18086_0171010 =  document.getElementById("jform_18086_0171010").value="";
            var jform_18086_0171011 =  document.getElementById("jform_18086_0171011").value="";
            var jform_18086_0171012 =  document.getElementById("jform_18086_0171012").value="";
            var jform_18086_0171013 =  document.getElementById("jform_18086_0171013").value="";
            var jform_18086_0171014 =  document.getElementById("jform_18086_0171014").value="";
            var jform_18086_0171015 =  document.getElementById("jform_18086_0171015").value="";

}


