/* =========================================
   SGC ERP REPORT SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL
========================================= */

let reportsData = [];

let filteredReports = [];

/* =========================================
   INITIALIZE
========================================= */

function initializeReports(){

    updateUserInfo();

    updateFinancialYear();

    setTodayDate();

    loadReports();

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
   LOAD REPORTS
========================================= */

function loadReports(){

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

        reportsData =
        request.result.reverse();

        applyReportFilters();

    };

}

/* =========================================
   APPLY FILTERS
========================================= */

function applyReportFilters(){

    const search =
    document.getElementById(
        "reportSearch"
    ).value.toLowerCase();

    const status =
    document.getElementById(
        "reportStatusFilter"
    ).value;

    const fromDate =
    document.getElementById(
        "fromDate"
    ).value;

    const toDate =
    document.getElementById(
        "toDate"
    ).value;

    filteredReports =

    reportsData.filter((item)=>{

        /* SEARCH */

        const searchable = `

            ${item.grNo}
            ${item.truckNo}
            ${item.transportName}
            ${item.senderParty}
            ${item.receiverParty}

        `.toLowerCase();

        const searchMatch =

            searchable.includes(
                search
            );

        /* STATUS */

        const statusMatch =

            status === "All"

            ||

            item.status === status;

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

            searchMatch

            &&

            statusMatch

            &&

            dateMatch

        );

    });

    renderReportsTable(
        filteredReports
    );

}

/* =========================================
   SEARCH
========================================= */

function searchReports(){

    applyReportFilters();

}

/* =========================================
   FILTER STATUS
========================================= */

function filterReports(){

    applyReportFilters();

}

/* =========================================
   RENDER TABLE
========================================= */

function renderReportsTable(data){

    const table =
    document.getElementById(
        "reportTable"
    );

    let rows = "";

    let totalFreight = 0;

    let inGodown = 0;

    let outForDelivery = 0;

    let delivered = 0;

    /* EMPTY */

    if(data.length === 0){

        rows = `

        <tr>

            <td colspan="12">

                No Reports Available

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

            totalFreight += freight;

            if(
                item.status ===
                "In Godown"
            ){

                inGodown++;

            }

            if(
                item.status ===
                "Out For Delivery"
            ){

                outForDelivery++;

            }

            if(
                item.status ===
                "Delivered"
            ){

                delivered++;

            }

            rows += `

            <tr>

                <td>
                    ${safeValue(item.grNo)}
                </td>

                <td>
                    ${safeValue(item.truckNo)}
                </td>

                <td>
                    ${limitText(
                        item.transportName,
                        20
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
                    ${safeValue(item.fromCity)}
                </td>

                <td>
                    ${safeValue(item.toCity)}
                </td>

                <td>
                    ${safeValue(item.pvtMarka)}
                </td>

                <td>
                    ${limitText(
                        item.materialDetail,
                        25
                    )}
                </td>

                <td>
                    ${formatCurrency(freight)}
                </td>

                <td>
                    ${safeValue(
                        item.paymentType
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

            </tr>

            `;

        });

    }

    table.innerHTML = rows;

    /* SUMMARY */

    document.getElementById(
        "reportTotalGR"
    ).innerText =
    data.length;

    document.getElementById(
        "reportPending"
    ).innerText =
    inGodown;

    document.getElementById(
        "reportOutForDelivery"
    ).innerText =
    outForDelivery;

    document.getElementById(
        "reportDelivered"
    ).innerText =
    delivered;

    document.getElementById(
        "reportFreight"
    ).innerText =
    formatCurrency(
        totalFreight
    );

}

/* =========================================
   PRINT REPORT
========================================= */

function printReport(){

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
            SGC ERP REPORT
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
            REPORTS SYSTEM
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
   EXPORT CSV
========================================= */

function exportCSV(){

    if(filteredReports.length === 0){

        alert(
            "No Reports Found"
        );

        return;

    }

    let csv =

`GR No,Truck,Transport,Sender,Receiver,From,To,Material,Freight,Payment Type,Status\n`;

    filteredReports.forEach((item)=>{

        csv +=

`${item.grNo},${item.truckNo},"${item.transportName}","${item.senderParty}","${item.receiverParty}",${item.fromCity},${item.toCity},"${item.materialDetail}",${item.freight},${item.paymentType},${item.status}\n`;

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
    "sgc-reports.csv";

    a.click();

}

/* =========================================
   EXPORT EXCEL
========================================= */

function exportExcel(){

    if(filteredReports.length === 0){

        alert(
            "No Reports Found"
        );

        return;

    }

    const excelData =

    filteredReports.map((item)=>({

        "GR Number":
        item.grNo || "",

        "Truck":
        item.truckNo || "",

        "Transport":
        item.transportName || "",

        "Sender":
        item.senderParty || "",

        "Receiver":
        item.receiverParty || "",

        "From":
        item.fromCity || "",

        "To":
        item.toCity || "",

        "Material":
        item.materialDetail || "",

        "Freight":
        item.freight || "",

        "Payment Type":
        item.paymentType || "",

        "Status":
        item.status || "",

        "Created At":
        item.createdAt || ""

    }));

    const worksheet =
    XLSX.utils.json_to_sheet(
        excelData
    );

    const workbook =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "SGC Reports"

    );

    XLSX.writeFile(

        workbook,

        "SGC-Reports.xlsx"

    );

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

initializeReports();