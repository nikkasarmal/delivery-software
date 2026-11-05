/* =========================================
   SGC ERP AUTHENTICATION SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   USERS DATABASE
========================================= */

const USERS = [

    {
        id:"SE001",
        username:"manish_sharma",
        fullName:"Manish Sharma",
        password:"Sharma@1#",
        role:"FULL_ACCESS"
    },

    {
        id:"SE002",
        username:"pradeep_bisht",
        fullName:"Pradeep Bisht",
        password:"Bisht@1#",
        role:"FULL_ACCESS"
    },

    {
        id:"SE003",
        username:"mukesh_choudhary",
        fullName:"Mukesh Choudhary",
        password:"Choudhary@1#",
        role:"FULL_ACCESS"
    },

    {
        id:"SE004",
        username:"raman_palla",
        fullName:"Raman Palla",
        password:"Palla@1#",
        role:"FULL_ACCESS"
    },

    {
        id:"SE005",
        username:"vikas_shrivastava",
        fullName:"Vikas Shrivastava",
        password:"Shrivastava@1#",
        role:"FULL_ACCESS"
    },

    {
        id:"SE006",
        username:"harsh_malinga",
        fullName:"Harsh Malinga",
        password:"Malinga@1#",
        role:"LIMITED_ACCESS"
    }

];

/* =========================================
   STORAGE KEYS
========================================= */

const STORAGE_KEYS = {

    LOGIN:"isLoggedIn",

    USERNAME:"username",

    FULLNAME:"fullName",

    USER_ID:"userId",

    USER_ROLE:"userRole",

    FINANCIAL_YEAR:"financialYear"

};

/* =========================================
   LOGIN
========================================= */

function login(){

    const username =

    document.getElementById(
        "username"
    ).value.trim().toLowerCase();

    const password =

    document.getElementById(
        "password"
    ).value.trim();

    const financialYear =

    document.getElementById(
        "financialYear"
    ).value;

    /* VALIDATION */

    if(!username){

        alert(
            "Enter Employee Username"
        );

        return;

    }

    if(!password){

        alert(
            "Enter Password"
        );

        return;

    }

    if(!financialYear){

        alert(
            "Select Financial Year"
        );

        return;

    }

    /* FIND USER */

    const user = USERS.find(

        item =>

        item.username === username

        &&

        item.password === password

    );

    /* INVALID LOGIN */

    if(!user){

        alert(
            "Invalid Username or Password"
        );

        return;

    }

    /* SAVE SESSION */

    localStorage.setItem(
        STORAGE_KEYS.LOGIN,
        "true"
    );

    localStorage.setItem(
        STORAGE_KEYS.USERNAME,
        user.username
    );

    localStorage.setItem(
        STORAGE_KEYS.FULLNAME,
        user.fullName
    );

    localStorage.setItem(
        STORAGE_KEYS.USER_ID,
        user.id
    );

    localStorage.setItem(
        STORAGE_KEYS.USER_ROLE,
        user.role
    );

    localStorage.setItem(
        STORAGE_KEYS.FINANCIAL_YEAR,
        financialYear
    );

    /* REDIRECT */

    window.location.href =
    "dashboard.html";

}

/* =========================================
   CHECK LOGIN
========================================= */

function checkLogin(){

    const isLoggedIn =

    localStorage.getItem(
        STORAGE_KEYS.LOGIN
    );

    if(isLoggedIn !== "true"){

        window.location.href =
        "index.html";

    }

}

/* =========================================
   CHECK ACCESS
========================================= */

function checkAccess(page){

    const role =

    localStorage.getItem(
        STORAGE_KEYS.USER_ROLE
    );

    /* FULL ACCESS */

    if(role === "FULL_ACCESS"){

        return;

    }

    /* LIMITED ACCESS */

    if(role === "LIMITED_ACCESS"){

        const allowedPages = [

            "dashboard.html",

            "gr-entry.html",

            "delivery-receipt.html",

            "tracking.html"

        ];

        if(

            !allowedPages.includes(
                page
            )

        ){

            alert(
                "Access Denied"
            );

            window.location.href =
            "dashboard.html";

        }

    }

}

/* =========================================
   LOGOUT
========================================= */

function logout(){

    const confirmLogout =

    confirm(
        "Are You Sure You Want To Logout?"
    );

    if(!confirmLogout){

        return;

    }

    Object.values(
        STORAGE_KEYS
    ).forEach((key)=>{

        localStorage.removeItem(
            key
        );

    });

    window.location.href =
    "index.html";

}

/* =========================================
   GET CURRENT USER
========================================= */

function getCurrentUser(){

    return {

        username:

        localStorage.getItem(
            STORAGE_KEYS.USERNAME
        ),

        fullName:

        localStorage.getItem(
            STORAGE_KEYS.FULLNAME
        ),

        userId:

        localStorage.getItem(
            STORAGE_KEYS.USER_ID
        ),

        role:

        localStorage.getItem(
            STORAGE_KEYS.USER_ROLE
        ),

        financialYear:

        localStorage.getItem(
            STORAGE_KEYS.FINANCIAL_YEAR
        )

    };

}

/* =========================================
   AUTO LOGIN CHECK
========================================= */

window.addEventListener(
    "load",
    ()=>{

        const currentPage =

        window.location.pathname
        .split("/")
        .pop();

        /* SKIP LOGIN PAGE */

        if(

            currentPage === ""

            ||

            currentPage === "index.html"

        ){

            return;

        }

        checkLogin();

        checkAccess(
            currentPage
        );

    }
);