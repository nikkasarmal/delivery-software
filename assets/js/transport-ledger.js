/* =========================================
   SGC ERP TRANSPORT LEDGER
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let ledgerData = [];

let filteredLedgerData = [];

/* =========================================
   INITIALIZE
========================================= */

function initializeTransportLedger(){

    updateUserInfo();

    updateFinancialYear();

    setTodayDate();

    loadLedgerData();

}

/* =========================================
   SET TODAY DATE
========================================= */

function setTodayDate(){

    const today =
    new Date()
    .toISOString()
    .split("T")[0];

    document.getElementById(
        "fromDate"
    ).value = today;

    document.getElementById(
        "toDate"
    ).value = today;

}

/* =========================================
   LOAD LEDGER DATA
========================================= */

function loadLedgerData(){

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

        ledgerData =
        request.result.reverse();

        loadTransportDropdown();

        applyLedgerFilters();

    };

}

/* =========================================
   LOAD TRANSPORT DROPDOWN
========================================= */

function loadTransportDropdown(){

    const uniqueTransport =

    [...new Set(

        ledgerData
        .map(item => item.transportName)
        .filter(Boolean)

    )];

    let options = `

    <option value="">
        All Transport
    </option>

    `;

    uniqueTransport.forEach((transport)=>{

        options += `

        <option value="${transport}">

            ${transport}

        </option>

        `;

    });

    document.getElementById(
        "transportLedgerFilter"
    ).innerHTML = options;

}

/* =========================================
   APPLY FILTERS
========================================= */

function applyLedgerFilters(){

    const transport =
    document.getElementById(
        "transportLedgerFilter"
    ).value;

    const search =
    document.getElementById(
        "ledgerSearch"
    ).value.toLowerCase();

    const fromDate =
    document.getElementById(
        "fromDate"
    ).value;

    const toDate =
    document.getElementById(
        "toDate"
    ).value;

    filteredLedgerData =

    ledgerData.filter((item)=>{

        /* TRANSPORT */

        const transportMatch =

            !transport

            ||

            item.transportName ===
            transport;

        /* SEARCH */

        const searchable = `

            ${item.challanNo}
            ${item.grNo}
            ${item.senderParty}
            ${item.receiverParty}

        `.toLowerCase();

        const searchMatch =

            searchable.includes(
                search
            );

        /* DATE */

        let dateMatch = true;

        if(
            fromDate
            &&
            toDate
            &&
            item.createdAt
        ){

            const onlyDate =
            item.createdAt.split(" ")[0];

            const parts =
            onlyDate.split("/");

            if(parts.length === 3){

                const itemDate =
                new Date(

                    Number(parts[2]),

                    Number(parts[1]) - 1,

                    Number(parts[0])

                );

                const from =
                new Date(fromDate);

                const to =
                new Date(toDate);

                dateMatch =

                    itemDate >= from

                    &&

                    itemDate <= to;

            }

        }

        return (

            transportMatch

            &&

            searchMatch

            &&

            dateMatch

        );

    });

    renderLedgerTable(
        filteredLedgerData
    );

}

/* =========================================
   RENDER TABLE
========================================= */

function renderLedgerTable(data){

    const table =
    document.getElementById(
        "ledgerTable"
    );

    let rows = "";

    let totalFreight = 0;

    let totalKatt = 0;

    let totalWeight = 0;

    let totalCommission = 0;

    /* EMPTY */

    if(data.length === 0){

        rows = `

        <tr>

            <td colspan="10">

                No Ledger Records Found

            </td>

        </tr>

        `;

    }

    else{

        data.forEach((item)=>{

            const freight =
            Number(
                item.freight || 0
            );

            const katt =
            Number(
                item.katt || 0
            );

            const weight =
            Number(
                item.weight || 0
            );

            const commission =

                weight *

                Number(
                    item.commissionPerQtl || 0
                );

            totalFreight += freight;

            totalKatt += katt;

            totalWeight += weight;

            totalCommission += commission;

            rows += `

            <tr>

                <td>
                    ${safeValue(item.challanNo)}
                </td>

                <td>
                    ${safeValue(item.grNo)}
                </td>

                <td>
                    ${limitText(
                        item.senderParty,
                        25
                    )}
                </td>

                <td>
                    ${limitText(
                        item.receiverParty,
                        25
                    )}
                </td>

                <td>
                    ${weight}
                </td>

                <td>
                    ${formatCurrency(freight)}
                </td>

                <td>
                    ${formatCurrency(katt)}
                </td>

                <td>
                    ${formatCurrency(
                        freight - katt
                    )}
                </td>

                <td>

                    <span class="status-badge ${

                        (item.status || "")
                        .toLowerCase()
                        .replace(/\s/g,"-")

                    }">

                        ${safeValue(
                            item.status
                        )}

                    </span>

                </td>

                <td>
                    ${safeValue(
                        item.transportName
                    )}
                </td>

            </tr>

            `;

        });

    }

    table.innerHTML = rows;

    /* SUMMARY */

    document.getElementById(
        "ledgerTotalGR"
    ).innerText =
    data.length;

    document.getElementById(
        "ledgerFreight"
    ).innerText =
    formatCurrency(
        totalFreight
    );

    document.getElementById(
        "ledgerKatt"
    ).innerText =
    formatCurrency(
        totalKatt
    );

    document.getElementById(
        "ledgerNet"
    ).innerText =
    formatCurrency(
        totalFreight - totalKatt
    );

    document.getElementById(
        "ledgerWeight"
    ).innerText =
    totalWeight;

    document.getElementById(
        "ledgerCommission"
    ).innerText =
    formatCurrency(
        totalCommission
    );

}

/* =========================================
   SEARCH
========================================= */

function searchTransportLedger(){

    applyLedgerFilters();

}

/* =========================================
   EXPORT CSV
========================================= */

function exportLedgerCSV(){

    if(filteredLedgerData.length === 0){

        alert(
            "No Ledger Data Found"
        );

        return;

    }

    let csv =

`Challan,GR No,Sender,Receiver,Weight,Freight,Katt,Net Freight,Status,Transport\n`;

    filteredLedgerData.forEach((item)=>{

        csv +=

`${item.challanNo},${item.grNo},"${item.senderParty}","${item.receiverParty}",${item.weight},${item.freight},${item.katt},${Number(item.freight || 0)-Number(item.katt || 0)},${item.status},"${item.transportName}"\n`;

    });

    const blob =
    new Blob([csv],{

        type:"text/csv"

    });

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "transport-ledger.csv";

    a.click();

}

/* =========================================
   PRINT LEDGER
========================================= */

function printTransportLedger(){

    const table =
    document.querySelector(
        ".table-container table"
    );

    const cards =
    document.querySelector(
        ".cards"
    );

    const printWindow =
    window.open(
        "",
        "_blank",
        "width=1400,height=900"
    );

    printWindow.document.write(`

    <html>

    <head>

        <title>
            Transport Ledger
        </title>

        <style>

            body{

                font-family:
                Arial,sans-serif;

                padding:20px;

            }

            h1,
            h3{

                text-align:center;

            }

            table{

                width:100%;

                border-collapse:
                collapse;

                margin-top:20px;

            }

            table,
            th,
            td{

                border:1px solid #000;

            }

            th,
            td{

                padding:8px;

                font-size:12px;

                text-align:left;

            }

            th{

                background:#f2f2f2;

            }

        </style>

    </head>

    <body>

        <h1>
            SHIVAM GOLDEN CARRIERS REGD.
        </h1>

        <h3>
            TRANSPORT LEDGER
        </h3>

        ${cards.outerHTML}

        ${table.outerHTML}

    </body>

    </html>

    `);

    printWindow.document.close();

    setTimeout(()=>{

        printWindow.print();

    },500);

}

/* =========================================
   USER INFO
========================================= */

function updateUserInfo(){

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

initializeTransportLedger();