/* =========================================
   SGC ERP TRACKING SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL CACHE
========================================= */

let trackingData = [];

/* =========================================
   INITIALIZE TRACKING
========================================= */

function initializeTracking(){

    updateTrackingUser();

    updateTrackingFY();

    loadTrackingData();

}

/* =========================================
   LOAD TRACKING DATA
========================================= */

function loadTrackingData(){

    if(!db){

        return;

    }

    const currentFY =

    localStorage.getItem(
        "financialYear"
    );

    /* TRANSACTION */

    const transaction =

    db.transaction(

        [

            "gr_entries",

            "delivery_receipts"

        ],

        "readonly"

    );

    const grStore =

    transaction.objectStore(
        "gr_entries"
    );

    const receiptStore =

    transaction.objectStore(
        "delivery_receipts"
    );

    const grRequest =
    grStore.getAll();

    const receiptRequest =
    receiptStore.getAll();

    Promise.all([

        new Promise((resolve)=>{

            grRequest.onsuccess =
            ()=> resolve(grRequest.result);

        }),

        new Promise((resolve)=>{

            receiptRequest.onsuccess =
            ()=> resolve(receiptRequest.result);

        })

    ]).then(([grData,receiptData])=>{

        /* FILTER */

        const filteredGR =

        grData.filter((item)=>{

            return (

                !item.financialYear

                ||

                item.financialYear ===
                currentFY

            );

        }).reverse();

        trackingData = [];

        /* JOIN DATA */

        filteredGR.forEach((gr)=>{

            const receipt =

            receiptData.find((r)=>{

                return (

                    r.grId === gr.id

                    ||

                    r.grNo === gr.grNo

                );

            });

            trackingData.push({

                ...gr,

                receiptNo:
                receipt?.receiptNo || "-",

                paymentMode:
                receipt?.paymentMode || "-",

                amountReceived:
                receipt?.amountReceived || 0,

                balanceAmount:
                receipt?.balanceAmount || 0,

                paymentStatus:
                receipt?.paymentStatus || "-",

                receivedBy:
                receipt?.receivedBy || "-",

                deliveryVehicle:
                receipt?.deliveryVehicle || "-",

                deliveredAt:
                receipt?.createdAt || "-"

            });

        });

        renderTrackingTable(
            trackingData
        );

    });

}

/* =========================================
   RENDER TABLE
========================================= */

function renderTrackingTable(data){

    const table =

    document.getElementById(
        "trackingTable"
    );

    if(!table){

        return;

    }

    /* EMPTY */

    if(data.length === 0){

        table.innerHTML = `

        <tr>

            <td colspan="18">

                No Tracking Data Found

            </td>

        </tr>

        `;

        return;

    }

    let rows = "";

    data.forEach((item)=>{

        rows += `

        <tr>

            <td>
                ${safeValue(item.grNo)}
            </td>

            <td>
                ${limitText(item.truckNo,14)}
            </td>

            <td>
                ${limitText(item.senderParty,22)}
            </td>

            <td>
                ${limitText(item.receiverParty,22)}
            </td>

            <td>
                ${safeValue(item.fromCity)}
            </td>

            <td>
                ${safeValue(item.toCity)}
            </td>

            <td>
                ${limitText(item.pvtMarka,15)}
            </td>

            <td>
                ${limitText(item.materialDetail,18)}
            </td>

            <td>
                ${safeValue(item.paymentType)}
            </td>

            <td>
                ${safeValue(item.receiptNo)}
            </td>

            <td>
                ${limitText(item.receivedBy,18)}
            </td>

            <td>
                ${limitText(item.deliveryVehicle,15)}
            </td>

            <td>

                <span class="status-badge ${

                    item.status
                    .toLowerCase()
                    .replace(/\s/g,"-")

                }">

                    ${item.status}

                </span>

            </td>

            <td>
                ${safeValue(item.paymentMode)}
            </td>

            <td>
                ${formatCurrency(
                    item.amountReceived
                )}
            </td>

            <td>
                ${formatCurrency(
                    item.balanceAmount
                )}
            </td>

            <td>
                ${safeValue(
                    item.paymentStatus
                )}
            </td>

            <td>
                ${safeValue(
                    item.deliveredAt
                )}
            </td>

        </tr>

        `;

    });

    table.innerHTML =
    rows;

}

/* =========================================
   SEARCH TRACKING
========================================= */

function searchTracking(){

    applyTrackingFilters();

}

/* =========================================
   FILTER STATUS
========================================= */

function filterStatus(){

    applyTrackingFilters();

}

/* =========================================
   APPLY FILTERS
========================================= */

function applyTrackingFilters(){

    const search =

    document.getElementById(
        "trackingSearch"
    ).value.toLowerCase();

    const status =

    document.getElementById(
        "statusFilter"
    ).value;

    const filtered =

    trackingData.filter((item)=>{

        /* SEARCH */

        const searchable = `

            ${item.grNo}
            ${item.truckNo}
            ${item.senderParty}
            ${item.receiverParty}
            ${item.transportName}
            ${item.receiptNo}

        `.toLowerCase();

        const matchSearch =

            searchable.includes(
                search
            );

        /* STATUS */

        const matchStatus =

            status === "All"

            ||

            item.status === status;

        return (

            matchSearch

            &&

            matchStatus

        );

    });

    renderTrackingTable(
        filtered
    );

}

/* =========================================
   USER INFO
========================================= */

function updateTrackingUser(){

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

function updateTrackingFY(){

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

initializeTracking();