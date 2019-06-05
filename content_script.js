//Une erreur dans le javascript de la page cible empechera le javascript injecté de s'éexecuter

//Le code ci-dessous va être injecté et éxecuter A CHAQUE FOIS QUE LE PLUGIN SERA OUVERT.
//On inject donc une balise "first_open" lors de l'injection, qui permerttra de détecter si c'est la première fois que 
//le code est injecté ou non
//il est important de ne pas injecter le code plusieurs fois car les listeners s'ajoutent aussi plusieurs fois.

//Le première étape est de tester si la balise "first_open" existe.
if (document.getElementById("first_open") != null) {
    //Dans ce cas, la balise "first_open" existe déjà, ce qui signifie que le code a déja été injecté dans la page.
    //Nous n'exécutons alors aucune action.
} else {
    //Dans ce cas, la balise n'existe pas. La première étape est de l'inséré. Nous avons choisi de l'inséré juste après la balise <body>
    var body = document.getElementsByTagName('body')[0];
    var a = document.createElement('div');
    a.setAttribute("id", "first_open");
    body.after(a);

    //si le bouton btn_save_close existe, c'est alors que l'onglet courant de l'utilisateur est sur la page d'ajout d'un adhérent sur GESTGYM
    if (document.getElementById("btn_save_close") != undefined) {
        //Dans ce cas, nous pouvons ajouter un listener pour détecter le clique de l'utilisateur. 
        document.getElementById("btn_save_close").addEventListener("click", function () {
            //Une fois le clique détecté, nous allons checker si le formulaire est valide et que donc il a été validé sur GESTGYM
            if (document.getElementById("acteur-form").checkValidity()) {
                //Ici, le formulaire est valide
                //On regarde maintenant si le localStorage contient un utilisateur (Attention !! il est différent que le local storage de l'extension, ici c'est local storage du navigateur)
                //La variable "actual_user" du local storage du navigateur contient l'adhérent qui a dernièrement été injecté dans le formulaire
                if (localStorage.getItem('actual_user') != null){
                    //Envoi un message à une extension. L'extension est ciblé grace à son ID, qui est le premier parametre
                    //Le deuxième paramètre est un tableau comprenant le type de commande à éxécuter et  les données nécéssaires à l'execution de la commande.
                    //La commande ici permet de passer le statut de l'adhérent injecté de "a copier" à "a synchroniser"
                    chrome.runtime.sendMessage(chrome.runtime.id, { command: "user_validate", actual_user: localStorage.getItem('actual_user') });
                    //L'adhérent étant maintenant inscrit sur GestGym, il faut donc remettre a zero le stockage de l'adhérent injecter sur la page
                    localStorage.setItem('actual_user', null);
                }
            } else {
                //Ici, le formulaire n'est pas valide (champs manquants ou incorrects ...). On ne fait donc rien
                //la variable for test permet de simuler la validation du formulaire
                const for_test = true;
                if(for_test){
                    if (localStorage.getItem('actual_user') != null){
                        //Envoi un message à une extension. L'extension est ciblé grace à son ID, qui est le premier parametre
                        //Le deuxième paramètre est un tableau comprenant le type de commande à éxécuter et  les données nécéssaires à l'execution de la commande.
                        //La commande ici permet de passer le statut de l'adhérent injecté de "a copier" à "a synchroniser"
                        chrome.runtime.sendMessage(chrome.runtime.id, { command: "user_validate", actual_user: localStorage.getItem('actual_user') });
                        //L'adhérent étant maintenant inscrit sur GestGym, il faut donc remettre a zero le stockage de l'adhérent injecter sur la page
                        localStorage.setItem('actual_user', null);
                    }
                }
                
            }

        }, false);
    }

    //Si la balise <a> est présente sur la page. A noté que la balise est cachée (hidden)
    if (document.getElementById("a") != null) {
        //On lui ajoute un listener, qui sera déclenchée par la page du plugin sur la web application, après une synchronisation réussie 
        //Cela va permettre de vider le tableau des adhérent "a synchroniser" puisque la synchronisation est finie
        document.getElementById("a").addEventListener("click", function () {
            //Envoi un message à une extension. L'extension est ciblé grace à son ID, qui est le premier parametre
            //Le deuxième paramètre est un tableau comprenant le type de commande à éxécuter et  les données nécéssaires à l'execution de la commande.
            //La commande ici permet de vider le tableau "a synchroniser"
            chrome.runtime.sendMessage(chrome.runtime.id, { command: "clean" });
        });
    }

    //Listener pour les message (les messages permettent de communiquer entre l'extension chrome et le javascript de la page)
    chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
        switch (data.command) {
            //Déclenche l'initialisation du plugin
            case "copy_licence_holders":
                //La premièreétape est de récupérer le contenu de la div avec la classe competiteur
                //La div commpetiteur contient tous les adhérent qui doivent être inscrits dans GestGym
                var text = document.getElementById("competiteur").textContent;
                //Une fois les adhérent récupérés, il faut indiquer à la page du plugin que l'initialisation a été faite (afin de déclencher l'animation de l'initialisation)
                //L'indiquation se fait en récupératn la balise init et en simulant un clique.
                document.getElementById("init").click();
                //Envoi de la réponse contenant tous les adhérent à ajouter au tableau "a copier"
                sendResponse({
                    response: JSON.parse(text)
                });
                break;

            //Déclenche l'injection d'un adhérent dans le forumaire de GESTGYM
            case "paste_licence_holder":
                //(Attention !! ici le local storage est différent que le local storage de l'extension, ici c'est local storage du navigateur)
                //La variable "actual_user" du local storage du navigateur contient l'adhérent qui a dernièrement été injecté dans le formulaire
                //on donne donc a "actual_user" l'adhérent qui va etre copié dans le formulaire
                localStorage.setItem('actual_user', JSON.stringify(data.user));
                //on déclenche ensuite l'injection
                inject(data);
                //Envoi de la réponse contenant une confirmation
                sendResponse({
                    status: "ok",
                    response: "Adhérent copié avec succès."
                });
                break;

            //Déclenche la synchronisation avec le plugin
            case "sync_added":
                //si la balise ave cl'id sync est présente sur la page (et donc que nous sommes sur la page plugin de l'applicaiton web)
                if (document.getElementById("sync") != undefined) {
                    //envoi des ids des adhérents à synchroniser (on les place dans la balise avec l'id "ids")
                    document.getElementById("ids").textContent = JSON.stringify(data.ids);
                    //déclenchement de l'action qui lance la synchronisation
                    document.getElementById("sync").click();
                    //Envoi de la réponse contenant une confirmation positive
                    sendResponse({
                        status: "ok",
                    });
                }else{
                    //Envoi de la réponse contenant une confirmation négative
                    sendResponse({
                        status: "nok",
                    });
                }
                break;

            default:
                //Envoi de la réponse contenant une confirmation négative (erreur dans la commande)
                sendResponse({
                    response: "Error"
                });
        }
    });

    /**
     * Fonction qui copie les données d'un adhérent dans les champs du formulaire
     * @param {*} data 
     */
    function inject(data) {
        //Les éléments qui sont commentés en dessous sont des champs qui devront être ajoutés 
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

    /**
     * Permet de d'obtenir l'age en fonction de la date de naissance
     * @param {*} born 
     */
    function get_age(born){
        var now = new Date();
        var birthday = new Date(now.getFullYear(),born.getMonth(),born.getDate());
        if(now >=birthday)
            return now.getFullYear() - born.getFullYear();
        else 
            return now.getFullYear()-born.getFullYear()-1;
    }
    

    //false text content, true value
    /**
     * Permet de comparer les éléments d'un select option avec une valeur et renvoi 
     * Renvoi en retour la valeur de l'élément du select option se rapprochant le plus de la valeur
     * si le paramètre value_or_textContent est a false , la comparaison se fera avec le textContent de chaque select option, si elle est a true, la comparaison se fera avec la "value" des select option
     * @param {*} select_element 
     * @param {*} value 
     * @param {*} value_or_textContent 
     */
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

    /**
     *  renvoi un % de similarité entre 2 chaines
     * @param {*} s1 
     * @param {*} s2 
     */
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

    /**
     * Calcul de la "distance" entre deux valeurs
     * @param {*} s1 
     * @param {*} s2 
     */
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
}
