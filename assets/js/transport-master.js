/* =========================================
   SGC ERP TRANSPORT MASTER
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let editTransportId = null;

let transportData = [];

/* =========================================
   INITIALIZE
========================================= */

function initializeTransportMaster(){

    updateTransportUser();

    updateFinancialYear();

    displayTransport();

    setupEnterKey();

}

/* =========================================
   SAVE TRANSPORT
========================================= */

function saveTransport(){

    if(!db){

        alert(
            "Database Not Ready"
        );

        return;

    }

    /* VALUES */

    const transportName =
    document.getElementById(
        "transportName"
    ).value.trim();

    const transportMobile =
    document.getElementById(
        "transportMobile"
    ).value.trim();

    const transportGST =
    document.getElementById(
        "transportGST"
    ).value.trim().toUpperCase();

    const transportAddress =
    document.getElementById(
        "transportAddress"
    ).value.trim();

    /* VALIDATION */

    if(!transportName){

        alert(
            "Enter Transport Name"
        );

        return;

    }

    /* MOBILE */

    if(

        transportMobile

        &&

        !/^[0-9]{10}$/.test(
            transportMobile
        )

    ){

        alert(
            "Enter Valid 10 Digit Mobile"
        );

        return;

    }

    /* GST */

    if(

        transportGST

        &&

        !/^[0-9A-Z]{15}$/.test(
            transportGST
        )

    ){

        alert(
            "Enter Valid GST Number"
        );

        return;

    }

    /* TRANSACTION */

    const transaction =

    db.transaction(
        ["transport_accounts"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "transport_accounts"
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        const exists =
        request.result.find(
            item =>

                item.transportName
                .toLowerCase()

                ===

                transportName
                .toLowerCase()

                &&

                item.id !==
                editTransportId
        );

        if(exists){

            alert(
                "Transport Already Exists"
            );

            return;

        }

        /* DATA */

        const data = {

            transportName,

            transportMobile,

            transportGST,

            transportAddress,

            createdAt:

            editTransportId

            ?

            exists?.createdAt ||

            new Date()
            .toLocaleString(
                "en-GB"
            )

            :

            new Date()
            .toLocaleString(
                "en-GB"
            )

        };

        let saveRequest;

        /* UPDATE */

        if(editTransportId){

            data.id =
            editTransportId;

            saveRequest =
            store.put(data);

        }

        /* ADD */

        else{

            saveRequest =
            store.add(data);

        }

        saveRequest.onsuccess =
        function(){

            alert(

                editTransportId

                ?

                "Transport Updated Successfully"

                :

                "Transport Saved Successfully"

            );

            clearTransportForm();

            displayTransport();

        };

    };

}

/* =========================================
   DISPLAY TRANSPORT
========================================= */

function displayTransport(){

    if(!db){

        return;

    }

    const transaction =

    db.transaction(
        ["transport_accounts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "transport_accounts"
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        transportData =
        request.result.reverse();

        renderTransportTable(
            transportData
        );

    };

}

/* =========================================
   RENDER TABLE
========================================= */

function renderTransportTable(data){

    const table =

    document.getElementById(
        "transportTable"
    );

    if(!table){

        return;

    }

    let rows = "";

    /* EMPTY */

    if(data.length === 0){

        rows = `

        <tr>

            <td colspan="6">

                No Transport Records Found

            </td>

        </tr>

        `;

    }

    else{

        data.forEach((item)=>{

            rows += `

            <tr>

                <td>

                    ${limitText(
                        item.transportName,
                        30
                    )}

                </td>

                <td>

                    ${safeValue(
                        item.transportMobile
                    )}

                </td>

                <td>

                    ${safeValue(
                        item.transportGST
                    )}

                </td>

                <td>

                    ${limitText(
                        item.transportAddress,
                        40
                    )}

                </td>

                <td>

                    ${safeValue(
                        item.createdAt
                    )}

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editTransport(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteTransport(${item.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

            `;

        });

    }

    table.innerHTML =
    rows;

    /* COUNT */

    document.getElementById(
        "transportCount"
    ).innerText =
    data.length;

}

/* =========================================
   EDIT TRANSPORT
========================================= */

function editTransport(id){

    const transaction =

    db.transaction(
        ["transport_accounts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "transport_accounts"
    );

    const request =
    store.get(id);

    request.onsuccess =
    function(){

        const item =
        request.result;

        if(!item){

            return;

        }

        document.getElementById(
            "transportName"
        ).value =

        item.transportName || "";

        document.getElementById(
            "transportMobile"
        ).value =

        item.transportMobile || "";

        document.getElementById(
            "transportGST"
        ).value =

        item.transportGST || "";

        document.getElementById(
            "transportAddress"
        ).value =

        item.transportAddress || "";

        editTransportId = id;

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}

/* =========================================
   DELETE TRANSPORT
========================================= */

function deleteTransport(id){

    if(

        !confirm(
            "Delete Transport?"
        )

    ){

        return;

    }

    const transaction =

    db.transaction(
        ["transport_accounts"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "transport_accounts"
    );

    store.delete(id);

    transaction.oncomplete =
    function(){

        displayTransport();

        alert(
            "Transport Deleted"
        );

    };

}

/* =========================================
   SEARCH TRANSPORT
========================================= */

function searchTransport(){

    const value =

    document.getElementById(
        "searchTransport"
    ).value.toLowerCase();

    const filtered =

    transportData.filter((item)=>{

        const searchable = `

            ${item.transportName}
            ${item.transportMobile}
            ${item.transportGST}
            ${item.transportAddress}

        `.toLowerCase();

        return searchable.includes(
            value
        );

    });

    renderTransportTable(
        filtered
    );

}

/* =========================================
   CLEAR FORM
========================================= */

function clearTransportForm(){

    document.querySelectorAll(
        ".form-grid input"
    ).forEach((input)=>{

        input.value = "";

    });

    editTransportId = null;

}

/* =========================================
   ENTER KEY
========================================= */

function setupEnterKey(){

    document.querySelectorAll(
        ".form-grid input"
    ).forEach((input)=>{

        input.addEventListener(
            "keypress",
            function(event){

                if(event.key === "Enter"){

                    saveTransport();

                }

            }
        );

    });

}

/* =========================================
   USER INFO
========================================= */

function updateTransportUser(){

    document.getElementById(
        "loggedUser"
    ).innerText =

    "User : " +

    (

        localStorage.getItem(
            "fullName"
        )

        ||

        "-"

    );

}

/* =========================================
   FINANCIAL YEAR
========================================= */

function updateFinancialYear(){

    document.getElementById(
        "currentFY"
    ).innerText =

    "Financial Year : " +

    (

        localStorage.getItem(
            "financialYear"
        )

        ||

        "-"

    );

}

/* =========================================
   INITIALIZE
========================================= */

initializeTransportMaster();