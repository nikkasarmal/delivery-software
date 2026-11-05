/* =========================================
   SGC ERP CHALLAN REPORT
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let challanData = [];

let filteredChallanData = [];

/* =========================================
   INITIALIZE
========================================= */

function initializeChallanReport(){

    updateUserInfo();

    updateFinancialYear();

    setTodayDate();

    loadChallanData();

}

/* =========================================
   TODAY DATE
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
   LOAD DATA
========================================= */

function loadChallanData(){

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

        challanData =
        request.result.reverse();

        loadChallanDropdown();

        applyChallanFilters();

    };

}

/* =========================================
   LOAD CHALLAN DROPDOWN
========================================= */

function loadChallanDropdown(){

    const uniqueChallans =

    [...new Set(

        challanData
        .map(item => item.challanNo)
        .filter(Boolean)

    )];

    let options = `

    <option value="">
        All Challans
    </option>

    `;

    uniqueChallans.forEach((challan)=>{

        options += `

        <option value="${challan}">

            ${challan}

        </option>

        `;

    });

    document.getElementById(
        "challanFilter"
    ).innerHTML = options;

}

/* =========================================
   APPLY FILTERS
========================================= */

function applyChallanFilters(){

    const challanNo =
    document.getElementById(
        "challanFilter"
    ).value;

    const search =
    document.getElementById(
        "challanSearch"
    ).value.toLowerCase();

    const fromDate =
    document.getElementById(
        "fromDate"
    ).value;

    const toDate =
    document.getElementById(
        "toDate"
    ).value;

    filteredChallanData =

    challanData.filter((item)=>{

        /* CHALLAN */

        const challanMatch =

            !challanNo

            ||

            item.challanNo ===
            challanNo;

        /* SEARCH */

        const searchable = `

            ${item.grNo}
            ${item.transportName}
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

            challanMatch

            &&

            searchMatch

            &&

            dateMatch

        );

    });

    renderChallanTable(
        filteredChallanData
    );

}

/* =========================================
   RENDER TABLE
========================================= */

function renderChallanTable(data){

    const table =
    document.getElementById(
        "challanTable"
    );

    let rows = "";

    let totalFreight = 0;

    let totalKatt = 0;

    let totalWeight = 0;

    let totalCommission = 0;

    let deliveredCount = 0;

    /* EMPTY */

    if(data.length === 0){

        rows = `

        <tr>

            <td colspan="10">

                No Challan Records Found

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

            if(
                item.status ===
                "Delivered"
            ){

                deliveredCount++;

            }

            rows += `

            <tr>

                <td>
                    ${safeValue(item.grNo)}
                </td>

                <td>
                    ${limitText(
                        item.transportName,
                        25
                    )}
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
                        item.challanNo
                    )}
                </td>

            </tr>

            `;

        });

    }

    table.innerHTML = rows;

    /* SUMMARY */

    document.getElementById(
        "totalGRCount"
    ).innerText =
    data.length;

    document.getElementById(
        "totalFreightAmount"
    ).innerText =
    formatCurrency(
        totalFreight
    );

    document.getElementById(
        "totalKatt"
    ).innerText =
    formatCurrency(
        totalKatt
    );

    document.getElementById(
        "netFreightAmount"
    ).innerText =
    formatCurrency(
        totalFreight - totalKatt
    );

    document.getElementById(
        "totalWeight"
    ).innerText =
    totalWeight;

    document.getElementById(
        "totalCommission"
    ).innerText =
    formatCurrency(
        totalCommission
    );

}

/* =========================================
   SEARCH
========================================= */

function searchChallanReport(){

    applyChallanFilters();

}

/* =========================================
   EXPORT CSV
========================================= */

function exportChallanCSV(){

    if(filteredChallanData.length === 0){

        alert(
            "No Data Found"
        );

        return;

    }

    let csv =

`GR No,Transport,Sender,Receiver,Weight,Freight,Katt,Net Freight,Status,Challan\n`;

    filteredChallanData.forEach((item)=>{

        csv +=

`${item.grNo},"${item.transportName}","${item.senderParty}","${item.receiverParty}",${item.weight},${item.freight},${item.katt},${Number(item.freight || 0)-Number(item.katt || 0)},${item.status},${item.challanNo}\n`;

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
    "challan-report.csv";

    a.click();

}

/* =========================================
   PRINT REPORT
========================================= */

function printChallanReport(){

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
            Challan Report
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
            CHALLAN REPORT
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

initializeChallanReport();