/* =========================================
   SGC ERP DASHBOARD SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   GLOBAL CACHE
========================================= */

let dashboardStats = {

    totalGR:0,

    inGodown:0,

    outForDelivery:0,

    delivered:0,

    totalFreight:0,

    totalCollection:0,

    pendingAmount:0,

    cashCollection:0,

    bharatPeCollection:0

};

/* =========================================
   INITIALIZE DASHBOARD
========================================= */

function initializeDashboard(){

    updateDashboardUser();

    updateFinancialYear();

    updateLiveClock();

    loadDashboard();

    /* AUTO REFRESH */

    setInterval(()=>{

        loadDashboard();

    },30000);

}

/* =========================================
   LOAD DASHBOARD
========================================= */

function loadDashboard(){

    if(!db){

        return;

    }

    loadGRAnalytics();

    loadReceiptAnalytics();

}

/* =========================================
   LOAD G.R ANALYTICS
========================================= */

function loadGRAnalytics(){

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

        const currentFY =

        localStorage.getItem(
            "financialYear"
        );

        const data =

        request.result.filter(
            item =>

                !item.financialYear

                ||

                item.financialYear ===
                currentFY
        ).reverse();

        /* RESET */

        dashboardStats.totalGR = 0;

        dashboardStats.inGodown = 0;

        dashboardStats.outForDelivery = 0;

        dashboardStats.delivered = 0;

        dashboardStats.totalFreight = 0;

        let recentRows = "";

        /* LOOP */

        data.forEach((item,index)=>{

            dashboardStats.totalGR++;

            dashboardStats.totalFreight +=

            Number(
                item.freight || 0
            );

            /* STATUS */

            switch(item.status){

                case "In Godown":

                    dashboardStats.inGodown++;

                break;

                case "Out For Delivery":

                    dashboardStats.outForDelivery++;

                break;

                case "Delivered":

                    dashboardStats.delivered++;

                break;

            }

            /* RECENT */

            if(index < 8){

                recentRows += `

                <tr>

                    <td>
                        ${safeValue(item.grNo)}
                    </td>

                    <td>
                        ${limitText(item.senderParty,20)}
                    </td>

                    <td>
                        ${limitText(item.receiverParty,20)}
                    </td>

                    <td>
                        ${safeValue(item.fromCity)}
                    </td>

                    <td>
                        ${safeValue(item.toCity)}
                    </td>

                    <td>
                        ${limitText(item.transportName,18)}
                    </td>

                    <td>
                        ${formatCurrency(item.freight)}
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

                </tr>

                `;

            }

        });

        /* EMPTY */

        if(data.length === 0){

            recentRows = `

            <tr>

                <td colspan="8">

                    No Recent G.R Entries Found

                </td>

            </tr>

            `;

        }

        /* UPDATE TABLE */

        document.getElementById(
            "recentTable"
        ).innerHTML =
        recentRows;

        updateDashboardCards();

    };

}

/* =========================================
   LOAD RECEIPT ANALYTICS
========================================= */

function loadReceiptAnalytics(){

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

        const currentFY =

        localStorage.getItem(
            "financialYear"
        );

        const data =

        request.result.filter(
            item =>

                !item.financialYear

                ||

                item.financialYear ===
                currentFY
        );

        /* RESET */

        dashboardStats.totalCollection = 0;

        dashboardStats.pendingAmount = 0;

        dashboardStats.cashCollection = 0;

        dashboardStats.bharatPeCollection = 0;

        /* LOOP */

        data.forEach((item)=>{

            const amount = Number(
                item.amountReceived || 0
            );

            const balance = Number(
                item.balanceAmount || 0
            );

            dashboardStats.totalCollection +=
            amount;

            dashboardStats.pendingAmount +=
            balance;

            /* PAYMENT MODE */

            if(
                item.paymentMode ===
                "Cash"
            ){

                dashboardStats.cashCollection +=
                amount;

            }

            if(
                item.paymentMode ===
                "BharatPe"
            ){

                dashboardStats.bharatPeCollection +=
                amount;

            }

        });

        updateDashboardCards();

    };

}

/* =========================================
   UPDATE CARDS
========================================= */

function updateDashboardCards(){

    setText(
        "totalGR",
        dashboardStats.totalGR
    );

    setText(
        "pendingGR",
        dashboardStats.inGodown
    );

    setText(
        "outForDeliveryGR",
        dashboardStats.outForDelivery
    );

    setText(
        "deliveredGR",
        dashboardStats.delivered
    );

    setText(
        "totalFreight",
        formatCurrency(
            dashboardStats.totalFreight
        )
    );

    setText(
        "totalCollection",
        formatCurrency(
            dashboardStats.totalCollection
        )
    );

    setText(
        "pendingAmount",
        formatCurrency(
            dashboardStats.pendingAmount
        )
    );

    setText(
        "cashCollection",
        formatCurrency(
            dashboardStats.cashCollection
        )
    );

    setText(
        "bharatPeCollection",
        formatCurrency(
            dashboardStats.bharatPeCollection
        )
    );

}

/* =========================================
   SET TEXT
========================================= */

function setText(id,value){

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
   USER INFO
========================================= */

function updateDashboardUser(){

    const fullName =

    localStorage.getItem(
        "fullName"
    ) || "-";

    setText(
        "loggedUser",
        `User : ${fullName}`
    );

}

/* =========================================
   FINANCIAL YEAR
========================================= */

function updateFinancialYear(){

    const fy =

    localStorage.getItem(
        "financialYear"
    ) || "-";

    setText(
        "dashboardFY",
        `Financial Year : ${fy}`
    );

}

/* =========================================
   LIVE CLOCK
========================================= */

function updateLiveClock(){

    const clockElement =

    document.getElementById(
        "liveClock"
    );

    if(!clockElement){

        return;

    }

    setInterval(()=>{

        const now =
        new Date();

        clockElement.innerText =

        now.toLocaleString();

    },1000);

}

/* =========================================
   EXPORT DASHBOARD
========================================= */

function exportDashboard(){

    alert(
        "Dashboard Export Coming Soon"
    );

}

/* =========================================
   INITIALIZE
========================================= */

initializeDashboard();