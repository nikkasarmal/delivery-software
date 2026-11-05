/* =========================================
   SGC ERP APPLICATION SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   APP CONFIG
========================================= */

const APP_CONFIG = {

    APP_NAME:
    "SGC ERP SYSTEM",

    VERSION:
    "1.1",

    THEME_KEY:
    "theme"

};

/* =========================================
   PAGE NAVIGATION
========================================= */

function goToPage(page){

    const currentPage =

    window.location.pathname
    .split("/")
    .pop();

    /* PREVENT RELOAD */

    if(currentPage === page){

        return;

    }

    window.location.href =
    page;

}

/* =========================================
   DARK MODE
========================================= */

function toggleDarkMode(){

    document.body.classList.toggle(
        "dark-mode"
    );

    const isDark =

    document.body.classList.contains(
        "dark-mode"
    );

    localStorage.setItem(

        APP_CONFIG.THEME_KEY,

        isDark

        ?

        "dark"

        :

        "light"

    );

}

/* =========================================
   LOAD THEME
========================================= */

function loadTheme(){

    const theme =

    localStorage.getItem(
        APP_CONFIG.THEME_KEY
    );

    if(theme === "dark"){

        document.body.classList.add(
            "dark-mode"
        );

    }

}

/* =========================================
   PWA INSTALL
========================================= */

let deferredPrompt = null;

function initializePWAInstall(){

    window.addEventListener(

        "beforeinstallprompt",

        (event)=>{

            event.preventDefault();

            deferredPrompt =
            event;

            const installBtn =

            document.getElementById(
                "installBtn"
            );

            if(!installBtn){

                return;

            }

            installBtn.style.display =
            "block";

            installBtn.onclick =
            async ()=>{

                if(!deferredPrompt){

                    return;

                }

                deferredPrompt.prompt();

                const result =

                await deferredPrompt.userChoice;

                console.log(

                    "PWA Install Result:",

                    result.outcome

                );

                deferredPrompt = null;

                installBtn.style.display =
                "none";

            };

        }

    );

}

/* =========================================
   DATE FORMAT
========================================= */

function formatDate(
    date = new Date()
){

    const day =

    String(
        date.getDate()
    ).padStart(2,"0");

    const month =

    String(
        date.getMonth() + 1
    ).padStart(2,"0");

    const year =
    date.getFullYear();

    return `${day}/${month}/${year}`;

}

/* =========================================
   DATE TIME FORMAT
========================================= */

function formatDateTime(){

    const now =
    new Date();

    const day =

    String(
        now.getDate()
    ).padStart(2,"0");

    const month =

    String(
        now.getMonth() + 1
    ).padStart(2,"0");

    const year =
    now.getFullYear();

    const hours =

    String(
        now.getHours()
    ).padStart(2,"0");

    const minutes =

    String(
        now.getMinutes()
    ).padStart(2,"0");

    return `

${day}/${month}/${year}
${hours}:${minutes}

    `.replace(/\s+/g," ");

}

/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount){

    return `₹${Number(
        amount || 0
    ).toLocaleString("en-IN")}`;

}

/* =========================================
   SAFE VALUE
========================================= */

function safeValue(value){

    if(

        value === null

        ||

        value === undefined

        ||

        value === ""

    ){

        return "-";

    }

    return value;

}

/* =========================================
   LIMIT TEXT
========================================= */

function limitText(
    text,
    length = 38
){

    if(!text){

        return "-";

    }

    text =
    text.toString();

    if(text.length > length){

        return (

            text.substring(
                0,
                length
            )

            +

            "..."

        );

    }

    return text;

}

/* =========================================
   SCROLL TO TOP
========================================= */

function scrollToTop(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

/* =========================================
   SHOW LOADER
========================================= */

function showLoader(){

    const loader =

    document.getElementById(
        "pageLoader"
    );

    if(loader){

        loader.style.display =
        "flex";

    }

}

/* =========================================
   HIDE LOADER
========================================= */

function hideLoader(){

    const loader =

    document.getElementById(
        "pageLoader"
    );

    if(loader){

        loader.style.display =
        "none";

    }

}

/* =========================================
   MOBILE SIDEBAR
========================================= */

function toggleSidebar(){

    const sidebar =

    document.querySelector(
        ".sidebar"
    );

    if(!sidebar){

        return;

    }

    sidebar.classList.toggle(
        "show-sidebar"
    );

}

/* =========================================
   PAGE INITIALIZATION
========================================= */

window.addEventListener(

    "load",

    ()=>{

        /* LOAD THEME */

        loadTheme();

        /* INIT PWA */

        initializePWAInstall();

        /* HIDE LOADER */

        hideLoader();

        console.log(

            `${APP_CONFIG.APP_NAME}
             Version ${APP_CONFIG.VERSION}
             Loaded Successfully`

        );

    }

);

/* =========================================
   FORMAT DATE TIME
========================================= */

function formatDateTime(){

    const now =
    new Date();

    const day =
    String(
        now.getDate()
    ).padStart(2,"0");

    const month =
    String(
        now.getMonth() + 1
    ).padStart(2,"0");

    const year =
    now.getFullYear();

    const hours =
    String(
        now.getHours()
    ).padStart(2,"0");

    const minutes =
    String(
        now.getMinutes()
    ).padStart(2,"0");

    return `

${day}/${month}/${year}
${hours}:${minutes}

    `.replace(/\s+/g," ").trim();

}