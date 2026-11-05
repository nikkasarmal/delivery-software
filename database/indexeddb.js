/* =========================================
   SGC ERP DATABASE SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   DATABASE CONFIG
========================================= */

const DB_CONFIG = {

    NAME:
    "SGC_DATABASE",

    VERSION:
    5

};

/* =========================================
   DATABASE STORES
========================================= */

const STORES = {

    GR:
    "gr_entries",

    RECEIPTS:
    "delivery_receipts",

    TRANSPORT:
    "transport_accounts"

};

/* =========================================
   DATABASE VARIABLE
========================================= */

let db = null;

/* =========================================
   OPEN DATABASE
========================================= */

const request = indexedDB.open(

    DB_CONFIG.NAME,

    DB_CONFIG.VERSION

);

/* =========================================
   DATABASE UPGRADE
========================================= */

request.onupgradeneeded =
function(event){

    db =
    event.target.result;

    console.log(
        "Database Upgrading..."
    );

    createGRStore();

    createReceiptStore();

    createTransportStore();

};

/* =========================================
   CREATE G.R STORE
========================================= */

function createGRStore(){

    if(

        db.objectStoreNames.contains(
            STORES.GR
        )

    ){

        return;

    }

    const store =

    db.createObjectStore(

        STORES.GR,

        {

            keyPath:"id",

            autoIncrement:true

        }

    );

    /* INDEXES */

    store.createIndex(

        "grNo",

        "grNo",

        {

            unique:false

        }

    );

    store.createIndex(

        "challanNo",

        "challanNo",

        {

            unique:false

        }

    );

    store.createIndex(

        "transportName",

        "transportName",

        {

            unique:false

        }

    );

    store.createIndex(

        "createdAt",

        "createdAt",

        {

            unique:false

        }

    );

}

/* =========================================
   CREATE RECEIPT STORE
========================================= */

function createReceiptStore(){

    if(

        db.objectStoreNames.contains(
            STORES.RECEIPTS
        )

    ){

        return;

    }

    const store =

    db.createObjectStore(

        STORES.RECEIPTS,

        {

            keyPath:"id",

            autoIncrement:true

        }

    );

    /* INDEXES */

    store.createIndex(

        "receiptNo",

        "receiptNo",

        {

            unique:false

        }

    );

    store.createIndex(

        "grNo",

        "grNo",

        {

            unique:false

        }

    );

    store.createIndex(

        "paymentMode",

        "paymentMode",

        {

            unique:false

        }

    );

    store.createIndex(

        "paymentStatus",

        "paymentStatus",

        {

            unique:false

        }

    );

    store.createIndex(

        "createdAt",

        "createdAt",

        {

            unique:false

        }

    );

}

/* =========================================
   CREATE TRANSPORT STORE
========================================= */

function createTransportStore(){

    if(

        db.objectStoreNames.contains(
            STORES.TRANSPORT
        )

    ){

        return;

    }

    const store =

    db.createObjectStore(

        STORES.TRANSPORT,

        {

            keyPath:"id",

            autoIncrement:true

        }

    );

    /* INDEXES */

    store.createIndex(

        "transportName",

        "transportName",

        {

            unique:false

        }

    );

}

/* =========================================
   DATABASE SUCCESS
========================================= */

request.onsuccess =
function(event){

    db =
    event.target.result;

    console.log(
        "Database Connected Successfully"
    );

    initializePageModules();

    setupDatabaseEvents();

};

/* =========================================
   DATABASE EVENTS
========================================= */

function setupDatabaseEvents(){

    /* DATABASE ERROR */

    db.onerror =
    function(event){

        console.log(

            "Database Runtime Error:",

            event.target.error

        );

    };

    /* DATABASE CLOSE */

    db.onclose =
    function(){

        console.log(
            "Database Closed"
        );

    };

    /* VERSION CHANGE */

    db.onversionchange =
    function(){

        db.close();

        alert(

            "Database Updated. Please Reload Application."

        );

    };

}

/* =========================================
   INITIALIZE PAGE MODULES
========================================= */

function initializePageModules(){

    /* G.R ENTRY */

    if(

        typeof displayGR ===
        "function"

        &&

        document.getElementById(
            "grTableBody"
        )

    ){

        displayGR();

    }

    /* DASHBOARD */

    if(

        typeof loadDashboard ===
        "function"

    ){

        loadDashboard();

    }

    /* TRACKING */

    if(

        typeof displayTracking ===
        "function"

        &&

        document.getElementById(
            "trackingTable"
        )

    ){

        displayTracking();

    }

    /* DELIVERY RECEIPT */

    if(

        typeof loadGRNumbers ===
        "function"

    ){

        loadGRNumbers();

    }

    /* REPORTS */

    if(

        typeof loadReports ===
        "function"

    ){

        loadReports();

    }

    /* TRANSPORT MASTER */

    if(

        typeof displayTransport ===
        "function"

    ){

        displayTransport();

    }

    /* CASH BOOK */

    if(

        typeof loadCashBook ===
        "function"

    ){

        loadCashBook();

    }

    /* CHALLAN REPORT */

    if(

        typeof loadChallanDropdown ===
        "function"

    ){

        loadChallanDropdown();

    }

    /* TRANSPORT LEDGER */

    if(

        typeof loadTransportLedgerDropdown ===
        "function"

    ){

        loadTransportLedgerDropdown();

    }

}

/* =========================================
   DATABASE ERROR
========================================= */

request.onerror =
function(event){

    console.log(

        "Database Connection Error:",

        event.target.error

    );

    alert(
        "Database Connection Failed"
    );

};