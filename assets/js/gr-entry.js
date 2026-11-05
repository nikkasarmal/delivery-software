/* =========================================
   SGC ERP G.R ENTRY SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let editId = null;

/* =========================================
   INITIALIZE PAGE
========================================= */

function initializeGREntry(){

    setDefaultDates();

    loadTransportDropdown();

    displayGR();

}

/* =========================================
   SET DEFAULT DATES
========================================= */

function setDefaultDates(){

    const today =

    new Date()
    .toISOString()
    .split("T")[0];

    if(

        !document.getElementById(
            "biltyDate"
        ).value

    ){

        document.getElementById(
            "biltyDate"
        ).value = today;

    }

    if(

        !document.getElementById(
            "receiveDate"
        ).value

    ){

        document.getElementById(
            "receiveDate"
        ).value = today;

    }

}

/* =========================================
   LOAD TRANSPORT DROPDOWN
========================================= */

function loadTransportDropdown(){

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

        let options = `

        <option value="">
            Select Transport
        </option>

        `;

        request.result.forEach((item)=>{

            options += `

            <option value="${item.transportName}">

                ${item.transportName}

            </option>

            `;

        });

        document.getElementById(
            "transportName"
        ).innerHTML =
        options;

    };

}

/* =========================================
   SAVE / UPDATE G.R
========================================= */

function saveGR(){

    if(!db){

        alert(
            "Database Not Ready"
        );

        return;

    }

    /* VALUES */

    const grNo =

    document.getElementById(
        "grNo"
    ).value.trim().toUpperCase();

    const transportName =

    document.getElementById(
        "transportName"
    ).value.trim();

    const senderParty =

    document.getElementById(
        "senderParty"
    ).value.trim();

    const receiverParty =

    document.getElementById(
        "receiverParty"
    ).value.trim();

    /* VALIDATION */

    if(!grNo){

        alert(
            "Enter G.R Number"
        );

        return;

    }

    if(!transportName){

        alert(
            "Select Transport"
        );

        return;

    }

    if(!senderParty){

        alert(
            "Enter Sender Party"
        );

        return;

    }

    if(!receiverParty){

        alert(
            "Enter Receiver Party"
        );

        return;

    }

    /* TRANSACTION */

    const transaction =

    db.transaction(
        ["gr_entries"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "gr_entries"
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        /* DUPLICATE CHECK */

        const exists =

        request.result.find((item)=>{

            return (

                item.grNo
                .toUpperCase()

                ===

                grNo

                &&

                item.transportName
                .toLowerCase()

                ===

                transportName
                .toLowerCase()

                &&

                item.id !== editId

            );

        });

        if(exists){

            alert(
                "Same Transport G.R Already Exists"
            );

            return;

        }

        /* DATA */

        const data = {

            grNo:
            grNo,

            biltyDate:
            document.getElementById(
                "biltyDate"
            ).value,

            receiveDate:
            document.getElementById(
                "receiveDate"
            ).value,

            truckNo:
            document.getElementById(
                "truckNo"
            ).value.trim().toUpperCase(),

            driverName:
            document.getElementById(
                "driverName"
            ).value.trim(),

            mobile:
            document.getElementById(
                "mobile"
            ).value.trim(),

            transportName:
            transportName,

            senderParty:
            senderParty,

            receiverParty:
            receiverParty,

            fromCity:
            document.getElementById(
                "fromCity"
            ).value.trim(),

            toCity:
            document.getElementById(
                "toCity"
            ).value.trim(),

            pvtMarka:
            document.getElementById(
                "pvtMarka"
            ).value.trim(),

            materialDetail:
            document.getElementById(
                "materialDetail"
            ).value.trim(),

            packages:
            Number(
                document.getElementById(
                    "packages"
                ).value || 0
            ),

            weight:
            Number(
                document.getElementById(
                    "weight"
                ).value || 0
            ),

            freight:
            Number(
                document.getElementById(
                    "freight"
                ).value || 0
            ),

            paymentType:
            document.getElementById(
                "paymentType"
            ).value,

            status:
            document.getElementById(
                "status"
            ).value,

            challanNo:
            document.getElementById(
                "challanNo"
            ).value.trim(),

            commissionPerQtl:
            Number(
                document.getElementById(
                    "commissionPerQtl"
                ).value || 0
            ),

            katt:
            Number(
                document.getElementById(
                    "katt"
                ).value || 0
            ),

            netFreight:
            Number(
                document.getElementById(
                    "netFreight"
                ).value || 0
            ),

            financialYear:
            localStorage.getItem(
                "financialYear"
            ),

            createdAt:
            formatDateTime()

        };

        let saveRequest;

        /* UPDATE */

        if(editId){

            data.id = editId;

            saveRequest =
            store.put(data);

        }

        /* SAVE */

        else{

            saveRequest =
            store.add(data);

        }

        /* SUCCESS */

        saveRequest.onsuccess =
        function(){

            alert(

                editId

                ?

                "G.R Updated Successfully"

                :

                "G.R Saved Successfully"

            );

            clearForm();

            displayGR();

        };

        /* ERROR */

        saveRequest.onerror =
        function(){

            alert(
                "Error Saving G.R"
            );

        };

    };

}

/* =========================================
   DISPLAY G.R
========================================= */

function displayGR(){

    if(!db){

        return;

    }

    const transaction =

    db.transaction(
        ["gr_entries"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "gr_entries"
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        const data =
        request.result.reverse();

        let rows = "";

        data.forEach((item)=>{

            rows += `

            <tr>

                <td>${safeValue(item.grNo)}</td>

                <td>${safeValue(item.biltyDate)}</td>

                <td>${safeValue(item.receiveDate)}</td>

                <td>${limitText(item.truckNo,15)}</td>

                <td>${limitText(item.transportName,20)}</td>

                <td>${limitText(item.senderParty,25)}</td>

                <td>${limitText(item.receiverParty,25)}</td>

                <td>${safeValue(item.fromCity)}</td>

                <td>${safeValue(item.toCity)}</td>

                <td>${limitText(item.pvtMarka,15)}</td>

                <td>${limitText(item.materialDetail,20)}</td>

                <td>${safeValue(item.challanNo)}</td>

                <td>${formatCurrency(item.freight)}</td>

                <td>${formatCurrency(item.katt)}</td>

                <td>${formatCurrency(item.netFreight)}</td>

                <td>${safeValue(item.paymentType)}</td>

                <td>

                    <span class="status-${

                        item.status
                        .toLowerCase()
                        .replace(/\s/g,"-")

                    }">

                        ${item.status}

                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editGR(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteGR(${item.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

            `;

        });

        /* EMPTY */

        if(data.length === 0){

            rows = `

            <tr>

                <td colspan="18">

                    No G.R Entries Found

                </td>

            </tr>

            `;

        }

        document.getElementById(
            "grTableBody"
        ).innerHTML =
        rows;

    };

}

/* =========================================
   EDIT G.R
========================================= */

function editGR(id){

    const transaction =

    db.transaction(
        ["gr_entries"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "gr_entries"
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

        /* FILL FORM */

        Object.keys(item).forEach((key)=>{

            const field =

            document.getElementById(
                key
            );

            if(field){

                field.value =
                item[key];

            }

        });

        editId = id;

        /* BUTTON CHANGE */

        const saveBtn =

        document.querySelector(
            ".save-btn"
        );

        if(saveBtn){

            saveBtn.innerText =
            "Update G.R Entry";

        }

        /* SCROLL */

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}

/* =========================================
   DELETE G.R
========================================= */

function deleteGR(id){

    const confirmDelete =

    confirm(
        "Delete G.R Entry?"
    );

    if(!confirmDelete){

        return;

    }

    const transaction =

    db.transaction(
        ["gr_entries"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "gr_entries"
    );

    store.delete(id);

    transaction.oncomplete =
    function(){

        displayGR();

    };

}

/* =========================================
   SEARCH G.R
========================================= */

function searchGR(){

    const value =

    document.getElementById(
        "searchInput"
    ).value.toLowerCase();

    const rows =

    document.querySelectorAll(
        "#grTableBody tr"
    );

    rows.forEach((row)=>{

        const text =

        row.innerText.toLowerCase();

        row.style.display =

        text.includes(value)

        ?

        ""

        :

        "none";

    });

}

/* =========================================
   CLEAR FORM
========================================= */

function clearForm(){

    document.querySelectorAll(
        ".form-grid input"
    ).forEach((input)=>{

        input.value = "";

    });

    document.querySelectorAll(
        ".form-grid select"
    ).forEach((select)=>{

        select.selectedIndex = 0;

    });

    /* RESET DATES */

    setDefaultDates();

    /* RESET BUTTON */

    const saveBtn =

    document.querySelector(
        ".save-btn"
    );

    if(saveBtn){

        saveBtn.innerText =
        "Save G.R Entry";

    }

    /* DEFAULT VALUES */

    document.getElementById(
        "paymentType"
    ).value = "Bilty Paid";

    document.getElementById(
        "status"
    ).value = "In Godown";

    editId = null;

}

/* =========================================
   CALCULATE NET FREIGHT
========================================= */

function calculateNetFreight(){

    const freight = Number(

        document.getElementById(
            "freight"
        ).value || 0

    );

    const katt = Number(

        document.getElementById(
            "katt"
        ).value || 0

    );

    document.getElementById(
        "netFreight"
    ).value =

    freight - katt;

}

/* =========================================
   INITIALIZE
========================================= */

initializeGREntry();