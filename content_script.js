
/*
Une erreur dans le javascript de la page cible empechera le javascript injecté de s'éexecuter
*/


if(document.getElementById("first_open") != null){
    console.log("Existe déja !");
    
}else{
    console.log("n'existe pas  !");
    var body = document.getElementsByTagName('body')[0];
    var a = document.createElement('div');
    a.setAttribute("id", "first_open");
    body.after(a);

    if(document.getElementById("btn_save_close") != undefined){
        document.getElementById("btn_save_close").addEventListener("click", function (){
            if(document.getElementById("acteur-form").checkValidity()){
                console.log("VALID");
                if(localStorage.getItem('actual_user') != null){
                    chrome.runtime.sendMessage(chrome.runtime.id,{command : "user_validate", actual_user : localStorage.getItem('actual_user')});
                    localStorage.setItem('actual_user', null);

                }
            }else{
                console.log("NON VALIDE");
                //pour les tests
                if(true){
                    if(localStorage.getItem('actual_user') != null){
                        chrome.runtime.sendMessage(chrome.runtime.id,{command : "user_validate", actual_user : localStorage.getItem('actual_user')});
                        localStorage.setItem('actual_user', null);
                    }
                }
            }
                
            }, false);
    }


    if(document.getElementById("a") != null){
        document.getElementById("a").addEventListener("click", function (){
            chrome.runtime.sendMessage(chrome.runtime.id,{ command : "clean"});
        });
    }


chrome.runtime.onMessage.addListener(OnMessageListener);


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
                //var jform_ACT_dateNaissance =  document.getElementById("jform_ACT_dateNaissance").value=data.user.birthDate;
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

    function OnMessageListener(data, sender, sendResponse) {
        console.log("chrome.runtime.onMessage: "+data.command);
        switch(data.command) {
            case "copy_licence_holders" :
                console.log("La je copie");
                var text =  document.getElementById("competiteur").textContent;
                document.getElementById("init").click();

                sendResponse({
                    response: JSON.parse(text)
                });
                break; 
            case "paste_licence_holder" :
                
                localStorage.setItem('actual_user', JSON.stringify(data.user));

                inject(data);
                sendResponse({
                    status: "ok",
                    response: "Adhérent copié avec succès."
                });
        
                break;

            case "sync_added" :
                if(document.getElementById("sync")!= undefined){
                    document.getElementById("ids").textContent = JSON.stringify(data.ids);
                    document.getElementById("sync").click();

                    sendResponse({
                        status: "ok",
                    });
                }else{
                    sendResponse({
                        status: "nok",
                    });
                }
                
                
                break;

            default:
                sendResponse({
                    response: "Error"
                });
        }
    };

}
