/* =========================================
   SGC ERP DELIVERY RECEIPT SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let selectedGR = null;

let editReceiptId = null;

/* =========================================
   INITIALIZE
========================================= */

function initializeDeliveryReceipt(){

    generateReceiptNumber();

    loadGRNumbers();

    displayReceipts();

}

/* =========================================
   GENERATE RECEIPT NUMBER
========================================= */

function generateReceiptNumber(){

    if(!db){

        return;

    }

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        const data =
        request.result;

        let maxNumber = 0;

        data.forEach((item)=>{

            const number = parseInt(

                String(item.receiptNo)
                .replace("REC-","")

            ) || 0;

            if(number > maxNumber){

                maxNumber = number;

            }

        });

        document.getElementById(
            "receiptNo"
        ).value =

        `REC-${maxNumber + 1}`;

    };

}

/* =========================================
   LOAD G.R NUMBERS
========================================= */

function loadGRNumbers(){

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
        request.result;

        let options = `

        <option value="">
            Select G.R Number
        </option>

        `;

        data.forEach((item)=>{

            options += `

            <option value="${item.id}">

                ${item.grNo}

            </option>

            `;

        });

        document.getElementById(
            "grSelect"
        ).innerHTML =
        options;

    };

}

/* =========================================
   SEARCH G.R
========================================= */

function searchGRDropdown(){

    const value =

    document.getElementById(
        "grSearch"
    ).value.toLowerCase();

    const select =

    document.getElementById(
        "grSelect"
    );

    const options =
    select.options;

    for(

        let i = 0;

        i < options.length;

        i++

    ){

        const text =

        options[i]
        .text
        .toLowerCase();

        options[i].hidden =

        !text.includes(value);

    }

}

/* =========================================
   SELECT G.R
========================================= */

document.getElementById(
    "grSelect"
).addEventListener(
    "change",
    function(){

        const id =
        Number(this.value);

        if(!id){

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
        store.get(id);

        request.onsuccess =
        function(){

            selectedGR =
            request.result;

            if(!selectedGR){

                return;

            }

            fillGRData();

        };

    }
);

/* =========================================
   FILL G.R DATA
========================================= */

function fillGRData(){

    document.getElementById(
        "senderParty"
    ).value =
    selectedGR.senderParty || "";

    document.getElementById(
        "receiverParty"
    ).value =
    selectedGR.receiverParty || "";

    document.getElementById(
        "fromCity"
    ).value =
    selectedGR.fromCity || "";

    document.getElementById(
        "toCity"
    ).value =
    selectedGR.toCity || "";

    document.getElementById(
        "pvtMarka"
    ).value =
    selectedGR.pvtMarka || "";

    document.getElementById(
        "materialDetail"
    ).value =
    selectedGR.materialDetail || "";

    /* PAYMENT */

    if(
        selectedGR.paymentType ===
        "To Pay"
    ){

        document.getElementById(
            "freightStatus"
        ).value =
        "TO PAY";

        document.getElementById(
            "freightAmount"
        ).value =

        selectedGR.freight || 0;

    }

    else{

        document.getElementById(
            "freightStatus"
        ).value =

        selectedGR.paymentType || "";

        document.getElementById(
            "freightAmount"
        ).value = 0;

    }

    calculateReceiptTotal();

}

/* =========================================
   CALCULATE TOTAL
========================================= */

function calculateReceiptTotal(){

    const freight = Number(

        document.getElementById(
            "freightAmount"
        ).value || 0

    );

    const delivery = Number(

        document.getElementById(
            "deliveryCharge"
        ).value || 0

    );

    const labour = Number(

        document.getElementById(
            "labour"
        ).value || 0

    );

    const other = Number(

        document.getElementById(
            "other"
        ).value || 0

    );

    const dumrage = Number(

        document.getElementById(
            "dumrageCharges"
        ).value || 0

    );

    const received = Number(

        document.getElementById(
            "amountReceived"
        ).value || 0

    );

    const total =

        freight +
        delivery +
        labour +
        other +
        dumrage;

    let balance =
    total - received;

    if(balance < 0){

        balance = 0;

    }

    document.getElementById(
        "totalAmount"
    ).value = total;

    document.getElementById(
        "balanceAmount"
    ).value = balance;

    /* AUTO STATUS */

    const paymentStatus =

    document.getElementById(
        "paymentStatus"
    );

    if(balance === 0){

        paymentStatus.value =
        "Paid";

    }

    else if(received > 0){

        paymentStatus.value =
        "Partial";

    }

    else{

        paymentStatus.value =
        "Pending";

    }

}

/* =========================================
   GENERATE RECEIPT
========================================= */

function generateReceipt(){

    if(!selectedGR){

        alert(
            "Select G.R Number"
        );

        return;

    }

    const receivedBy =

    document.getElementById(
        "receivedBy"
    ).value.trim();

    const receiverMobile =

    document.getElementById(
        "receiverMobile"
    ).value.trim();

    if(!receivedBy){

        alert(
            "Enter Receiver Name"
        );

        return;

    }

    if(!receiverMobile){

        alert(
            "Enter Receiver Mobile"
        );

        return;

    }

    const receiptData = {

        receiptNo:
        document.getElementById(
            "receiptNo"
        ).value,

        grId:
        selectedGR.id,

        grNo:
        selectedGR.grNo,

        senderParty:
        selectedGR.senderParty,

        receiverParty:
        selectedGR.receiverParty,

        fromCity:
        selectedGR.fromCity,

        toCity:
        selectedGR.toCity,

        pvtMarka:
        selectedGR.pvtMarka,

        materialDetail:
        selectedGR.materialDetail,

        freightStatus:
        document.getElementById(
            "freightStatus"
        ).value,

        freight:
        Number(
            document.getElementById(
                "freightAmount"
            ).value || 0
        ),

        deliveryCharge:
        Number(
            document.getElementById(
                "deliveryCharge"
            ).value || 0
        ),

        labour:
        Number(
            document.getElementById(
                "labour"
            ).value || 0
        ),

        other:
        Number(
            document.getElementById(
                "other"
            ).value || 0
        ),

        dumrageCharges:
        Number(
            document.getElementById(
                "dumrageCharges"
            ).value || 0
        ),

        totalAmount:
        Number(
            document.getElementById(
                "totalAmount"
            ).value || 0
        ),

        paymentMode:
        document.getElementById(
            "paymentMode"
        ).value,

        amountReceived:
        Number(
            document.getElementById(
                "amountReceived"
            ).value || 0
        ),

        balanceAmount:
        Number(
            document.getElementById(
                "balanceAmount"
            ).value || 0
        ),

        paymentStatus:
        document.getElementById(
            "paymentStatus"
        ).value,

        receivedBy:
        receivedBy,

        receiverMobile:
        receiverMobile,

        deliveryVehicle:
        document.getElementById(
            "deliveryVehicle"
        ).value.trim().toUpperCase(),

        financialYear:
        localStorage.getItem(
            "financialYear"
        ),

        createdAt:
        formatDateTime()

    };

    /* EDIT */

    if(editReceiptId){

        updateReceipt(
            editReceiptId,
            receiptData
        );

        return;

    }

    saveReceipt(receiptData);

}

/* =========================================
   SAVE RECEIPT
========================================= */

function saveReceipt(data){

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
    );

    const request =
    store.add(data);

    request.onsuccess =
    function(){

        /* UPDATE G.R */

        selectedGR.status =
        "Delivered";

        const grTransaction =

        db.transaction(
            ["gr_entries"],
            "readwrite"
        );

        const grStore =

        grTransaction.objectStore(
            "gr_entries"
        );

        grStore.put(selectedGR);

        renderReceipt(data);

        displayReceipts();

        clearReceiptForm();

        generateReceiptNumber();

        alert(
            "Receipt Generated Successfully"
        );

    };

}

/* =========================================
   DISPLAY RECEIPTS
========================================= */

function displayReceipts(){

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
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

                <td>${item.receiptNo}</td>

                <td>${item.grNo}</td>

                <td>${limitText(item.receiverParty,20)}</td>

                <td>${item.paymentMode}</td>

                <td>${formatCurrency(item.amountReceived)}</td>

                <td>${formatCurrency(item.balanceAmount)}</td>

                <td>${item.paymentStatus}</td>

                <td>${item.createdAt}</td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            onclick="editReceipt(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteReceipt(${item.id})"
                        >
                            Delete
                        </button>

                        <button
                            class="backup-btn"
                            onclick="printReceipt(${item.id})"
                        >
                            Print
                        </button>

                    </div>

                </td>

            </tr>

            `;

        });

        if(data.length === 0){

            rows = `

            <tr>

                <td colspan="9">

                    No Receipts Found

                </td>

            </tr>

            `;

        }

        document.getElementById(
            "receiptTable"
        ).innerHTML =
        rows;

    };

}

/* =========================================
   CLEAR FORM
========================================= */

function clearReceiptForm(){

    document.querySelectorAll(
        ".form-grid input"
    ).forEach((input)=>{

        if(!input.readOnly){

            input.value = "";

        }

    });

    document.querySelectorAll(
        ".form-grid select"
    ).forEach((select)=>{

        select.selectedIndex = 0;

    });

    selectedGR = null;

    editReceiptId = null;

    generateReceiptNumber();

    /* RESET BUTTON */

    const saveBtn =

    document.querySelector(
        ".save-btn"
    );

    saveBtn.innerText =
    "Generate Receipt";

    saveBtn.onclick =
    generateReceipt;

}

/* =========================================
   DELETE RECEIPT
========================================= */

function deleteReceipt(id){

    const confirmDelete =

    confirm(
        "Delete Receipt?"
    );

    if(!confirmDelete){

        return;

    }

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
    );

    store.delete(id);

    transaction.oncomplete =
    function(){

        displayReceipts();

        alert(
            "Receipt Deleted"
        );

    };

}

/* =========================================
   PRINT RECEIPT
========================================= */

function printReceipt(id){

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
    );

    const request =
    store.get(id);

    request.onsuccess =
    function(){

        renderReceipt(
            request.result
        );

    };

}

/* =========================================
   RENDER RECEIPT
   A4 SIZE - 2 COPIES
========================================= */

function renderReceipt(data){

    if(!data){

        alert(
            "Receipt Data Not Found"
        );

        return;

    }

    /* RECEIPT HTML */

    function receiptTemplate(){

        return `

        <div class="receipt">

            <!-- TOP -->

            <div class="top-line">

                <div>

                    GSTIN :
                    09ACFFS6299E2ZL

                </div>

                <div>

                    Contact :
                    +91 95600 16650

                </div>

            </div>

            <!-- COMPANY -->

            <div class="company">

                <h1>
                    SHIVAM GOLDEN
                    CARRIERS REGD.
                </h1>

                <p>
                    Machhli Godown,Meerut Road
                    Ghaziabad,
                    U.P.201003
                </p>

            </div>

            <!-- HEADER -->

            <table>

                <tr>

                    <td colspan="2">

                        Sender :
                        <b>
                            ${data.senderParty || "-"}

                        </b>

                    </td>

                    <td>

                        Date :
                        ${data.createdAt || "-"}

                    </td>

                </tr>

                <tr>

                    <td>

                        Receipt No :
                        <b>
                            ${data.receiptNo || "-"}

                        </b>

                    </td>

                    <td>

                        G.R No :
                        <b>
                            ${data.grNo || "-"}

                        </b>

                    </td>

                    <td>

                        Time :
                        ${new Date().toLocaleTimeString()}

                    </td>

                </tr>

                <tr>

                    <td colspan="2">

                        Receiver :
                        <b>
                            ${data.receiverParty || "-"}

                        </b>

                    </td>

                    <td>

                        From :
                        ${data.fromCity || "-"}

                        <br>

                        To :
                        ${data.toCity || "-"}

                    </td>

                </tr>

            </table>

            <!-- DETAILS -->

            <div class="details-title">

                DETAILS

            </div>

            <table>

                <tr>

                    <td width="50%">

                        Remarks

                    </td>

                    <td>

                        Freight

                    </td>

                    <td class="right">

                        ₹${data.freight || 0}

                    </td>

                </tr>

                <tr>

                    <td rowspan="7">

                        ${data.materialDetail || "-"}

                    </td>

                    <td>

                        Delivery Charges

                    </td>

                    <td class="right">

                        ₹${data.deliveryCharge || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        Labour Charges

                    </td>

                    <td class="right">

                        ₹${data.labour || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        Other Charges

                    </td>

                    <td class="right">

                        ₹${data.other || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        Demurage Charges

                    </td>

                    <td class="right">

                        ₹${data.dumrageCharges || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        Sub Total

                    </td>

                    <td class="right">

                        ₹${data.totalAmount || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        GST Charge

                    </td>

                    <td class="right">

                        No

                    </td>

                </tr>

                <tr>

                    <td class="bold">

                        Total

                    </td>

                    <td class="right bold">

                        ₹${data.totalAmount || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        E-Way Bill :
                        ${data.ewaybill || "-"}

                    </td>

                    <td>

                        Received

                    </td>

                    <td class="right">

                        ₹${data.amountReceived || 0}

                    </td>

                </tr>

                <tr>

                    <td>

                        Payment Mode :
                        ${data.paymentMode || "-"}

                    </td>

                    <td>

                        Balance

                    </td>

                    <td class="right">

                        ₹${data.balanceAmount || 0}

                    </td>

                </tr>

            </table>

            <!-- BOTTOM -->

            <table style="margin-top:8px;">

                <tr>

                    <td>

                        Received By :
                        ${data.receivedBy || "-"}

                    </td>

                    <td>

                        Mobile :
                        ${data.receiverMobile || "-"}

                    </td>

                    <td>

                        Vehicle :
                        ${data.deliveryVehicle || "-"}

                    </td>

                </tr>

            </table>

            <!-- SIGN -->

            <div class="company-sign">

                For :
                SHIVAM GOLDEN
                CARRIERS REGD.

            </div>

            <div class="signature">

                <div class="sign-box">

                    <div class="line">

                        Receiver Signature

                    </div>

                </div>

                <div class="sign-box">

                    <div class="line">

                        Authorized Signature

                    </div>

                </div>

            </div>

        </div>

        `;

    }

    /* PRINT WINDOW */

    const printWindow =
    window.open(
        "",
        "_blank",
        "width=900,height=1200"
    );

    printWindow.document.write(`

    <html>

    <head>

        <title>
            Delivery Receipt
        </title>

        <style>

            @page{

                size:A4;

                margin:8mm;

            }

            body{

                font-family:
                Arial,sans-serif;

                margin:0;

                padding:0;

                color:#000;

            }

            .receipt{

                border:2px solid #000;

                padding:8px;

                height:48%;

                margin-bottom:10px;

                box-sizing:border-box;

            }

            .receipt:first-child{

                border-bottom:
                2px dashed #000;

            }

            .top-line{

                display:flex;

                justify-content:space-between;

                font-size:10px;

                margin-bottom:4px;

            }

            .company{

                text-align:center;

                margin-bottom:5px;

            }

            .company h1{

                margin:0;

                font-size:20px;

            }

            .company p{

                margin:2px 0;

                font-size:10px;

            }

            table{

                width:100%;

                border-collapse:
                collapse;

                margin-top:5px;

            }

            table,
            td{

                border:1px solid #000;

            }

            td{

                padding:4px;

                font-size:11px;

                vertical-align:top;

            }

            .details-title{

                text-align:center;

                font-size:15px;

                font-weight:bold;

                margin:6px 0;

            }

            .right{

                text-align:right;

            }

            .bold{

                font-weight:bold;

            }

            .company-sign{

                text-align:right;

                margin-top:20px;

                font-size:11px;

                font-weight:bold;

            }

            .signature{

                margin-top:25px;

                display:flex;

                justify-content:space-between;

            }

            .sign-box{

                width:200px;

                text-align:center;

                font-size:11px;

            }

            .line{

                border-top:1px solid #000;

                margin-top:25px;

                padding-top:4px;

            }

        </style>

    </head>

    <body>

        ${receiptTemplate()}

        ${receiptTemplate()}

    </body>

    </html>

    `);

    printWindow.document.close();

    setTimeout(()=>{

        printWindow.print();

    },500);

}

/* =========================================
   EDIT RECEIPT
========================================= */

function editReceipt(id){

    editReceiptId = id;

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readonly"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
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

        /* BUTTON */

        const saveBtn =

        document.querySelector(
            ".save-btn"
        );

        saveBtn.innerText =
        "Update Receipt";

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}

/* =========================================
   UPDATE RECEIPT
========================================= */

function updateReceipt(
    id,
    updatedData
){

    updatedData.id = id;

    const transaction =

    db.transaction(
        ["delivery_receipts"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "delivery_receipts"
    );

    const request =
    store.put(updatedData);

    request.onsuccess =
    function(){

        displayReceipts();

        clearReceiptForm();

        alert(
            "Receipt Updated Successfully"
        );

    };

}

/* =========================================
   MARK OUT FOR DELIVERY
========================================= */

function markOutForDelivery(){

    if(!selectedGR){

        alert(
            "Select G.R First"
        );

        return;

    }

    selectedGR.status =
    "Out For Delivery";

    updateGRStatus();

}

/* =========================================
   MARK DELIVERED
========================================= */

function markDelivered(){

    if(!selectedGR){

        alert(
            "Select G.R First"
        );

        return;

    }

    selectedGR.status =
    "Delivered";

    updateGRStatus();

}

/* =========================================
   UPDATE G.R STATUS
========================================= */

function updateGRStatus(){

    const transaction =

    db.transaction(
        ["gr_entries"],
        "readwrite"
    );

    const store =

    transaction.objectStore(
        "gr_entries"
    );

    store.put(selectedGR);

    alert(
        "Status Updated Successfully"
    );

}

/* =========================================
   INITIALIZE
========================================= */

initializeDeliveryReceipt();