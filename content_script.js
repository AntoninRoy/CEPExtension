
/*
Une erreur dans le javascript de la page cible empechera le javascript injecté de s'éexecuter
*/


if (document.getElementById("first_open") != null) {
    console.log("Existe déja !");

} else {
    console.log("n'existe pas  !");
    var body = document.getElementsByTagName('body')[0];
    var a = document.createElement('div');
    a.setAttribute("id", "first_open");
    body.after(a);

    if (document.getElementById("btn_save_close") != undefined) {
        document.getElementById("btn_save_close").addEventListener("click", function () {
            if (document.getElementById("acteur-form").checkValidity()) {
                console.log("VALID");
                if (localStorage.getItem('actual_user') != null) {
                    chrome.runtime.sendMessage(chrome.runtime.id, { command: "user_validate", actual_user: localStorage.getItem('actual_user') });
                    localStorage.setItem('actual_user', null);
                }
            } else {
                console.log("NON VALIDE");
                //pour les tests
                if (true) {
                    if (localStorage.getItem('actual_user') != null) {
                        chrome.runtime.sendMessage(chrome.runtime.id, { command: "user_validate", actual_user: localStorage.getItem('actual_user') });
                        localStorage.setItem('actual_user', null);
                    }
                }
            }

        }, false);
    }


    if (document.getElementById("a") != null) {
        document.getElementById("a").addEventListener("click", function () {
            chrome.runtime.sendMessage(chrome.runtime.id, { command: "clean" });
        });
    }


    chrome.runtime.onMessage.addListener(OnMessageListener);


    function inject(data) {
        console.log(data);
        console.log("Les informations du licencié sont ajoutées ");
        document.getElementById("jform_ACT_nom").value = data.user.lastName;
        document.getElementById("jform_ACT_prenom").value = data.user.firstName;
        document.getElementById("jform_ACT_adr1").value = data.user.addressRep1;
        document.getElementById("jform_ACT_adr2").value = "";
        document.getElementById("jform_ACT_adr3").value = "";

        //le pays, select option
        document.getElementById("jform_ACT_cp").value = data.user.zipCodeRep1;
        //ville, select option (dynamique)
        //document.getElementById("jform_ACT_dateNaissance").value=data.user.birthDate;
        document.getElementById("jform_ACT_tel1").value = data.user.phoneRep1;
        document.getElementById("jform_ACT_tel2").value = data.user.phoneRep2;
        document.getElementById("jform_ACT_mail").value = data.user.emailRep1;
        document.getElementById("jform_ACT_nomEpouse").value = "";
        document.getElementById("jform_ACT_num_licence").value = "";
        document.getElementById("jform_ACT_sexe").value = compare_select_value(document.getElementById("jform_ACT_sexe"), data.user.sex, true);
        //discipline pratiquée. x3 Select option 
        //sous discipline select option

        
        document.getElementById("jform_AAD_rl1_nom").value = data.user.firstNameRep1 + " " + data.user.lastNameRep1;
        document.getElementById("jform_AAD_rl1_tel").value = data.user.phoneRep1;
        document.getElementById("jform_AAD_rl1_mail").value = data.user.emailRep1;
        
        if(data.user.firstNameRep2 != null && data.user.lastNameRep2 != null){
            document.getElementById("jform_AAD_rl2_nom").value = data.user.firstNameRep2+ " " + data.user.lastNameRep2;
            document.getElementById("jform_AAD_rl2_tel").value = data.user.phoneRep2;
            document.getElementById("jform_AAD_rl2_mail").value = data.user.emailRep2;
        }


        if(data.user.hasMedicalCertificate)
            document.getElementById("jform_AAD_CM0").checked = true;

        if(data.user.health_questionnaire_file)
            document.getElementById("jform_AAD_CM_questionnaire0").checked = true;


        if(data.user.imageRight)
            document.getElementById("jform_AAD_droit_image").value = 1;
        else
            document.getElementById("jform_AAD_droit_image").value = 0;


        document.getElementById("jform_AAD_date_inscription").value = data.user.jform_AAD_date_inscription;
        document.getElementById("jform_ACT_pays").value = compare_select_value(document.getElementById("jform_ACT_pays"), data.user.nationality, false)

        document.getElementById("jform_AAD_CM_date").value = data.user.registrationDate;
        if(data.user.has_bulletin_n2allianz)
            document.getElementById("jform_AAD_ass_FFG0").checked = true;
        //Radio input Bloquer les envois par email
        //Radio input Licencié autre club
        //role dans l'association x5
        document.getElementById("jform_AAD_comment").value = "";
        document.getElementById("jform_18086_0171002").value = "";
        document.getElementById("jform_18086_0171003").value = "";
        document.getElementById("jform_18086_0171004").value = "";
        document.getElementById("jform_18086_0171005").value = "";
        document.getElementById("jform_18086_0171006").value = "";
        document.getElementById("jform_18086_0171007").value = "";
        document.getElementById("jform_18086_0171008").value = "";
        document.getElementById("jform_18086_0171009").value = "";
        document.getElementById("jform_18086_0171010").value = "";
        document.getElementById("jform_18086_0171011").value = "";
        document.getElementById("jform_18086_0171012").value = "";
        document.getElementById("jform_18086_0171013").value = "";
        document.getElementById("jform_18086_0171014").value = "";
        document.getElementById("jform_18086_0171015").value = "";

    }


    function get_age(born){
        var now = new Date();
        var birthday = new Date(now.getFullYear(),born.getMonth(),born.getDate());
        if(now >=birthday)
            return now.getFullYear() - born.getFullYear();
        else 
            return now.getFullYear()-born.getFullYear()-1;
        
    }
    
    console.log(get_age(new Date(2001,05-1,25)));

    //false text content, true value
    function compare_select_value(select_element, value, value_or_textContent) {
        var retrn_value = null;
        var percentage_find = 0;
        for (i = 0; i < select_element.length; i++) {

            var percentage_similarity = similarity(select_element.options[i].textContent, value);
            if (value_or_textContent) percentage_similarity = similarity(select_element.options[i].value, value);

            if (percentage_similarity > 0.5) {
                if (percentage_similarity > percentage_find) {
                    retrn_value = select_element.options[i].value;
                    percentage_find = percentage_similarity
                }
            }

        }
        return retrn_value;
    }
    function similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;

        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    function OnMessageListener(data, sender, sendResponse) {
        console.log("chrome.runtime.onMessage: " + data.command);
        switch (data.command) {
            case "copy_licence_holders":
                console.log("La je copie");
                var text = document.getElementById("competiteur").textContent;
                console.log("text : ", text);
                console.log("text2 : ", JSON.parse(text));
                document.getElementById("init").click();

                sendResponse({
                    response: JSON.parse(text)
                });
                break;
            case "paste_licence_holder":

                localStorage.setItem('actual_user', JSON.stringify(data.user));

                inject(data);
                sendResponse({
                    status: "ok",
                    response: "Adhérent copié avec succès."
                });

                break;

            case "sync_added":
                if (document.getElementById("sync") != undefined) {
                    document.getElementById("ids").textContent = JSON.stringify(data.ids);
                    document.getElementById("sync").click();

                    sendResponse({
                        status: "ok",
                    });
                } else {
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
