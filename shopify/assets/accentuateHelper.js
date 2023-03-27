//ACTIVATE ACCOUNT FORM
Accentuate(jQuery("#metafields_form"), function (data) {
    console.log("send acc form");
    var submitted = new CustomEvent('accentuate:submitted', { detail: data });
    $("#metafields_form")[0].dispatchEvent(submitted);
    console.log(data.status);
    if (data.status == "OK") {
        const activateForm = document.getElementById("hidden-activate-form");//check if on activate account page
        if (activateForm) activateForm.submit();
        const editForm = document.getElementById("open-complete-modal");//check if on edit account info page
        if (editForm) editForm.click();
    } else {
        console.log(data.message);
    }
});

Accentuate(jQuery("#edit_form"), function (data) {
    console.log("send edit form");
    var submitted = new CustomEvent('accentuate:submitted', { detail: data });
    $("#edit_form")[0].dispatchEvent(submitted);
    console.log(data.status);
    if (data.status == "OK") {
        const editForm = document.getElementById("open-complete-modal");//check if on edit account info page
        if (editForm) editForm.click();
    } else {
        console.log(data.message);
    }
});

Accentuate(jQuery("#edit_default_address_form"), function (data) {
    console.log("send edit default address form");
    var submitted = new CustomEvent('accentuate:submitted', { detail: data });
    $("#edit_default_address_form")[0].dispatchEvent(submitted);
    console.log(data.status);
    if (data.status == "OK") {
        console.log("default address updated")
    } else {
        console.log(data.message);
    }
});

Accentuate(jQuery("#edit_address_form"), function (data) {
    console.log("send edit address form");
    var submitted = new CustomEvent('accentuate:submitted', { detail: data });
    $("#edit_address_form")[0].dispatchEvent(submitted);
    if (data.status == "OK") {
        console.log("edit address updated")
        const confirmButton = document.getElementById("confirm-edit-add-button");
        if (confirmButton) confirmButton.click();
    } else {
        console.log(data.message);
    }
});

Accentuate(jQuery("#child_form"), function (data) {
    console.log("send child form");
    var submitted = new CustomEvent('accentuate:submitted', { detail: data });
    $("#child_form")[0].dispatchEvent(submitted);
    if (data.status == "OK") {
        console.log("child updated")
        const confirmButton = document.getElementById("confirm-child-button");
        if (confirmButton) confirmButton.click();
        const completeDeleteButton = document.getElementById("complete-delete-child-button");
        if (completeDeleteButton) completeDeleteButton.click();
    } else {
        console.log(data.message);
    }
});
