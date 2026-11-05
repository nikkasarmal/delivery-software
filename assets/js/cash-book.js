/* =========================================
   SGC ERP CASH BOOK SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let cashBookData = [];

/* =========================================
   INITIALIZE
========================================= */

function initializeCashBook(){

    updateCashBookUser();

    updateCashBookFY();

    setTodayDateFilter();

    loadCashBook();

}

/* =========================================
   SET TODAY FILTER
========================================= */

function setTodayDateFilter(){

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
   LOAD CASH BOOK
========================================= */

function loadCashBook(){

    if(!db){

        return;

    }

    /* TODAY */

    const today = new Date();

    const yyyy =
    today.getFullYear();

    const mm =
    String(
        today.getMonth() + 1
    ).padStart(2,"0");

    const dd =
    String(
        today.getDate()
    ).padStart(2,"0");

    const todayInput =
    `${yyyy}-${mm}-${dd}`;

    /* SET FILTER */

    document.getElementById(
        "fromDate"
    ).value = todayInput;

    document.getElementById(
        "toDate"
    ).value = todayInput;

    /* DB */

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
        request.result || [];

        cashBookData =
        data.reverse();

        /* AUTO TODAY FILTER */

        filterCashBookByDate();

    };

}   

/* =========================================
   FILTER BY DATE
========================================= */

function filterCashBookByDate(){

    const fromDate =
    document.getElementById(
        "fromDate"
    ).value;

    const toDate =
    document.getElementById(
        "toDate"
    ).value;

    const search =
    document.getElementById(
        "cashSearch"
    ).value.toLowerCase();

    let filtered =
    [...cashBookData];

    /* DATE FILTER */

    if(fromDate && toDate){

        /* INPUT FORMAT FIX */

        const from =
        new Date(fromDate);

        const to =
        new Date(toDate);

        filtered =
        filtered.filter((item)=>{

            if(!item.createdAt){

                return true;

            }

            /* FORMAT:
               23/05/2026 15:40
            */

            const onlyDate =
            item.createdAt.split(" ")[0];

            const parts =
            onlyDate.split("/");

            if(parts.length !== 3){

                return true;

            }

            /* REAL DATE */

            const itemDate =
            new Date(

                Number(parts[2]),

                Number(parts[1]) - 1,

                Number(parts[0])

            );

            return (

                itemDate >= from

                &&

                itemDate <= to

            );

        });

    }

    /* SEARCH FILTER */

    if(search){

        filtered =
        filtered.filter((item)=>{

            const searchable = `

                ${item.receiptNo}
                ${item.grNo}
                ${item.receiverParty}
                ${item.paymentMode}

            `.toLowerCase();

            return searchable.includes(
                search
            );

        });

    }

    renderCashBookTable(
        filtered
    );

}

/* =========================================
   RENDER TABLE
========================================= */

function renderCashBookTable(data){

    const table =

    document.getElementById(
        "cashBookTable"
    );

    if(!table){

        return;

    }

    let rows = "";

    /* SUMMARY */

    let receiptCount = 0;

    let cashTotal = 0;

    let bharatPeTotal = 0;

    let pendingTotal = 0;

    let addToBillTotal = 0;

    let grandCollection = 0;

    /* LOOP */

    data.forEach((item)=>{

        receiptCount++;

        const amount = Number(
            item.amountReceived || 0
        );

        const balance = Number(
            item.balanceAmount || 0
        );

        grandCollection += amount;

        pendingTotal += balance;

        /* PAYMENT MODE */

        if(item.paymentMode === "Cash"){

            cashTotal += amount;

        }

        else if(
            item.paymentMode ===
            "BharatPe"
        ){

            bharatPeTotal += amount;

        }

        else if(
            item.paymentMode ===
            "Add To Bill"
        ){

            addToBillTotal += amount;

        }

        /* ROW */

        rows += `

        <tr>

            <td>
                ${safeValue(item.receiptNo)}
            </td>

            <td>
                ${safeValue(item.grNo)}
            </td>

            <td>
                ${limitText(
                    item.receiverParty,
                    25
                )}
            </td>

            <td>
                ${safeValue(
                    item.paymentMode
                )}
            </td>

            <td>
                ${formatCurrency(amount)}
            </td>

            <td>
                ${formatCurrency(balance)}
            </td>

            <td>

                <span class="status-badge ${

                    (item.paymentStatus || "")
                    .toLowerCase()
                    .replace(/\s/g,"-")

                }">

                    ${safeValue(
                        item.paymentStatus
                    )}

                </span>

            </td>

            <td>
                ${safeValue(
                    item.createdAt
                )}
            </td>

        </tr>

        `;

    });

    /* EMPTY */

    if(data.length === 0){

        rows = `

        <tr>

            <td colspan="8">

                No Cash Book Records Found

            </td>

        </tr>

        `;

    }

    table.innerHTML =
    rows;

    /* UPDATE SUMMARY */

    updateCashSummary({

        receiptCount,

        cashTotal,

        bharatPeTotal,

        pendingTotal,

        addToBillTotal,

        grandCollection

    });

}

/* =========================================
   UPDATE SUMMARY
========================================= */

function updateCashSummary(data){

    setValue(
        "cashReceiptCount",
        data.receiptCount
    );

    setValue(
        "cashTotal",
        formatCurrency(
            data.cashTotal
        )
    );

    setValue(
        "bharatPeTotal",
        formatCurrency(
            data.bharatPeTotal
        )
    );

    setValue(
        "pendingTotal",
        formatCurrency(
            data.pendingTotal
        )
    );

    setValue(
        "addToBillTotal",
        formatCurrency(
            data.addToBillTotal
        )
    );

    setValue(
        "grandCollection",
        formatCurrency(
            data.grandCollection
        )
    );

}

/* =========================================
   SET VALUE
========================================= */

function setValue(id,value){

    const element =

    document.getElementById(
        id
    );

    if(element){

        element.innerText =
        value;

    }

}

/* =========================================
   EXPORT CSV
========================================= */

function exportCashCSV(){

    if(cashBookData.length === 0){

        alert(
            "No Data Found"
        );

        return;

    }

    let csv =

`Receipt No,GR No,Party,Payment Mode,Received,Balance,Status,Date\n`;

    cashBookData.forEach((item)=>{

        csv +=

`${item.receiptNo},${item.grNo},"${item.receiverParty}",${item.paymentMode},${item.amountReceived},${item.balanceAmount},${item.paymentStatus},${item.createdAt}\n`;

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
    "cash-book-report.csv";

    a.click();

}

/* =========================================
   PRINT CASH BOOK
========================================= */

function printCashBook(){

    const table =

    document.querySelector(
        ".table-container table"
    );

    if(!table){

        return;

    }

    const printWindow =

    window.open(
        "",
        "_blank",
        "width=1200,height=800"
    );

    printWindow.document.write(`

    <html>

    <head>

        <title>
            Daily Cash Book
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

                padding:10px;

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
            DAILY CASH BOOK REPORT
        </h3>

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

function updateCashBookUser(){

    const user =

    localStorage.getItem(
        "fullName"
    ) || "-";

    document.getElementById(
        "loggedUser"
    ).innerText =

    `User : ${user}`;

}

/* =========================================
   FINANCIAL YEAR
========================================= */

function updateCashBookFY(){

    const fy =

    localStorage.getItem(
        "financialYear"
    ) || "-";

    document.getElementById(
        "currentFY"
    ).innerText =

    `Financial Year : ${fy}`;

}

/* =========================================
   INITIALIZE
========================================= */

initializeCashBook();