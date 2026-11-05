/* =========================================
   SGC ERP BACKUP SYSTEM
   VERSION 1.1 ENTERPRISE
========================================= */

/* =========================================
   INITIALIZE
========================================= */

function initializeBackupSystem(){

    updateUserInfo();

    updateFinancialYear();

    updateBackupStats();

}

/* =========================================
   UPDATE STATS
========================================= */

function updateBackupStats(){

    if(!db){

        return;

    }

    let totalRecords = 0;

    getStoreData(
        "gr_entries",
        (gr)=>{

        totalRecords += gr.length;

        getStoreData(
            "delivery_receipts",
            (receipts)=>{

            totalRecords +=
            receipts.length;

            getStoreData(
                "transport_accounts",
                (transport)=>{

                totalRecords +=
                transport.length;

                document.getElementById(
                    "backupRecords"
                ).innerText =
                totalRecords;

            });

        });

    });

}

/* =========================================
   EXPORT FULL BACKUP
========================================= */

function exportFullBackup(){

    if(!db){

        alert(
            "Database Not Ready"
        );

        return;

    }

    const backupData = {

        system:
        "SGC ERP",

        version:
        "1.1",

        backupDate:
        formatDateTime(),

        financialYear:
        localStorage.getItem(
            "financialYear"
        ),

        backupBy:
        localStorage.getItem(
            "fullName"
        ) || "-"

    };

    /* G.R */

    getStoreData(
        "gr_entries",
        (grData)=>{

        backupData.gr_entries =
        grData;

        /* RECEIPTS */

        getStoreData(
            "delivery_receipts",
            (receiptData)=>{

            backupData.delivery_receipts =
            receiptData;

            /* TRANSPORT */

            getStoreData(
                "transport_accounts",
                (transportData)=>{

                backupData.transport_accounts =
                transportData;

                /* TOTAL */

                backupData.totalRecords =

                    grData.length +

                    receiptData.length +

                    transportData.length;

                downloadBackup(
                    backupData
                );

            });

        });

    });

}

/* =========================================
   GET STORE DATA
========================================= */

function getStoreData(
    storeName,
    callback
){

    const transaction =
    db.transaction(
        [storeName],
        "readonly"
    );

    const store =
    transaction.objectStore(
        storeName
    );

    const request =
    store.getAll();

    request.onsuccess =
    function(){

        callback(
            request.result || []
        );

    };

}

/* =========================================
   DOWNLOAD BACKUP
========================================= */

function downloadBackup(data){

    const jsonData =
    JSON.stringify(
        data,
        null,
        2
    );

    const blob =
    new Blob(

        [jsonData],

        {
            type:
            "application/json"
        }

    );

    const url =
    URL.createObjectURL(
        blob
    );

    const a =
    document.createElement("a");

    const now =
    new Date();

    const fileName =

    `SGC-ERP-Backup-${

        now.getFullYear()

    }-${
        String(
            now.getMonth()+1
        ).padStart(2,"0")
    }-${
        String(
            now.getDate()
        ).padStart(2,"0")
    }-${
        String(
            now.getHours()
        ).padStart(2,"0")
    }-${
        String(
            now.getMinutes()
        ).padStart(2,"0")
    }.json`;

    a.href = url;

    a.download = fileName;

    a.click();

    URL.revokeObjectURL(
        url
    );

    alert(
        "Backup Downloaded Successfully"
    );

}

/* =========================================
   RESTORE BACKUP
========================================= */

function restoreBackup(){

    if(!db){

        alert(
            "Database Not Ready"
        );

        return;

    }

    const file =
    document.getElementById(
        "restoreFile"
    ).files[0];

    if(!file){

        alert(
            "Select Backup File"
        );

        return;

    }

    /* FILE SIZE */

    if(
        file.size >
        50 * 1024 * 1024
    ){

        alert(
            "Backup File Too Large"
        );

        return;

    }

    const confirmRestore =
    confirm(

        "WARNING\n\n" +

        "Current System Data Will Be Deleted.\n\n" +

        "Continue Restore?"

    );

    if(!confirmRestore){

        return;

    }

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        try{

            const backup =
            JSON.parse(
                e.target.result
            );

            /* VALIDATION */

            if(

                !backup

                ||

                typeof backup !==
                "object"

            ){

                alert(
                    "Invalid Backup File"
                );

                return;

            }

            if(
                !Array.isArray(
                    backup.gr_entries
                )
            ){

                alert(
                    "Invalid GR Data"
                );

                return;

            }

            if(
                !Array.isArray(
                    backup.delivery_receipts
                )
            ){

                alert(
                    "Invalid Receipt Data"
                );

                return;

            }

            if(
                !Array.isArray(
                    backup.transport_accounts
                )
            ){

                alert(
                    "Invalid Transport Data"
                );

                return;

            }

            alert(
                "Restoring Backup...\nPlease Wait"
            );

            /* CLEAR */

            clearStore(
                "gr_entries",
                ()=>{

                clearStore(
                    "delivery_receipts",
                    ()=>{

                    clearStore(
                        "transport_accounts",
                        ()=>{

                        restoreData(
                            backup
                        );

                    });

                });

            });

        }

        catch(error){

            console.log(error);

            alert(
                "Invalid JSON Backup File"
            );

        }

    };

    reader.readAsText(file);

}

/* =========================================
   CLEAR STORE
========================================= */

function clearStore(
    storeName,
    callback
){

    const transaction =
    db.transaction(
        [storeName],
        "readwrite"
    );

    const store =
    transaction.objectStore(
        storeName
    );

    const request =
    store.clear();

    request.onsuccess =
    function(){

        callback();

    };

}

/* =========================================
   RESTORE DATA
========================================= */

function restoreData(backup){

    restoreStoreData(
        "gr_entries",
        backup.gr_entries || []
    );

    restoreStoreData(
        "delivery_receipts",
        backup.delivery_receipts || []
    );

    restoreStoreData(
        "transport_accounts",
        backup.transport_accounts || []
    );

    setTimeout(()=>{

        alert(

            "Backup Restored Successfully\n\n" +

            "GR Entries : " +

            (backup.gr_entries || []).length +

            "\nReceipts : " +

            (backup.delivery_receipts || []).length +

            "\nTransport : " +

            (backup.transport_accounts || []).length

        );

        location.reload();

    },1500);

}

/* =========================================
   RESTORE STORE DATA
========================================= */

function restoreStoreData(
    storeName,
    data
){

    const transaction =
    db.transaction(
        [storeName],
        "readwrite"
    );

    const store =
    transaction.objectStore(
        storeName
    );

    data.forEach((item)=>{

        store.add(item);

    });

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

initializeBackupSystem();