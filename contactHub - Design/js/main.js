// 1. Select HTML Elements
var addContactBtn = document.getElementById("addContactBtn");
var contactModal = document.getElementById("contactModal");
var closeModalBtn = document.getElementById("closeModalBtn");
var cancelModalBtn = document.getElementById("cancelModalBtn");
var contactForm = document.getElementById("contactForm");
var submitModalBtn = document.getElementById("submitModalBtn");
var modalTitle = document.getElementById("modalTitle");

var contactName = document.getElementById("contactName");
var contactPhone = document.getElementById("contactPhone");
var contactEmail = document.getElementById("contactEmail");
var contactAddress = document.getElementById("contactAddress");
var contactGroup = document.getElementById("contactGroup");
var contactNotes = document.getElementById("contactNotes");
var contactFavorite = document.getElementById("contactFavorite");
var contactEmergency = document.getElementById("contactEmergency");
var contactId = document.getElementById("contactId");

var avatarInput = document.getElementById("avatarInput");
var avatarPreview = document.getElementById("avatarPreview");
var avatarPath = document.getElementById("avatarPath");

var searchInput = document.getElementById("searchInput");
var contactCardContainer = document.getElementById("contactCardContainer");

var totalContacts = document.getElementById("totalContacts");
var totalFavContacts = document.getElementById("totalFavContacts");
var totalEmergencyContacts = document.getElementById("totalEmergencyContacts");
var totalContactsSpan = document.getElementById("totalContactsSpan");

var bigFavItem = document.getElementById("bigFavItem");
var bigEmergencyItem = document.getElementById("bigEmergencyItem");

// 2. Variables
var STORAGE_KEY = "contactHubContacts";
var contacts = loadContacts();
var currentAvatar = "";
var isEditing = false;

// 3. Load Contacts From LocalStorage
function loadContacts() {
    try {
        var savedContacts = localStorage.getItem(STORAGE_KEY);

        if (savedContacts) {
            return JSON.parse(savedContacts);
        }

        return [];

    } catch (error) {
        console.error("Error loading contacts:", error);
        return [];
    }
}

// 4. Save Contacts To LocalStorage
function saveContacts() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(contacts)
        );

        return true;

    } catch (error) {
        console.error("Error saving contacts:", error);

        Swal.fire({
            icon: "error",
            title: "Storage Error",
            text: "Could not save the contact. Try using a smaller image."
        });

        return false;
    }
}

// 5. Helper Functions
function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
        var characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}


function normalizePhone(phone) {
    return String(phone || "").replace(/[\s()-]/g, "");
}


function showSuccess(title, text) {
    Swal.fire({
        icon: "success",
        title: title,
        text: text,
        timer: 1800,
        showConfirmButton: false
    });
}

// 6. Open Modal
function openModal(contact) {
    clearFormErrors();

    contactForm.reset();

    currentAvatar = "";
    avatarPath.value = "";
    contactId.value = "";

    avatarPreview.innerHTML = '<i class="fas fa-user"></i>';

    if (contact) {
        isEditing = true;

        modalTitle.textContent = "Edit Contact";

        submitModalBtn.innerHTML =
            '<i class="fas fa-check me-2"></i>Update Contact';

        contactId.value = contact.id;
        contactName.value = contact.name || "";
        contactPhone.value = contact.phone || "";
        contactEmail.value = contact.email || "";
        contactAddress.value = contact.address || "";
        contactGroup.value = contact.group || "";
        contactNotes.value = contact.notes || "";

        contactFavorite.checked = Boolean(contact.favorite);
        contactEmergency.checked = Boolean(contact.emergency);

        currentAvatar = contact.avatar || "";

        if (currentAvatar) {
            avatarPreview.innerHTML = `
                <img
                    src="${currentAvatar}"
                    alt="Contact photo"
                    class="w-100 h-100 rounded-circle object-fit-cover"
                >
            `;
        }

    } else {
        isEditing = false;

        modalTitle.textContent = "Add New Contact";

        submitModalBtn.innerHTML =
            '<i class="fas fa-check me-2"></i>Save Contact';
    }

    contactModal.classList.remove("d-none");
    contactModal.classList.add("d-flex");

    document.body.style.overflow = "hidden";

    contactName.focus();
}

// 7. Close Modal
function closeModal() {
    contactModal.classList.add("d-none");
    contactModal.classList.remove("d-flex");

    document.body.style.overflow = "";

    clearFormErrors();
}

// Modal Events
addContactBtn.addEventListener("click", function () {
    openModal(null);
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);


contactModal.addEventListener("click", function (event) {
    if (event.target === contactModal) {
        closeModal();
    }
});


document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !contactModal.classList.contains("d-none")
    ) {
        closeModal();
    }
});

// 8. Upload Contact Avatar
avatarInput.addEventListener("change", function () {
    var file = avatarInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        Swal.fire({
            icon: "warning",
            title: "Invalid File",
            text: "Please select an image."
        });

        avatarInput.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {
        Swal.fire({
            icon: "warning",
            title: "Image Too Large",
            text: "Please select an image smaller than 1 MB."
        });

        avatarInput.value = "";
        return;
    }

    var reader = new FileReader();

    reader.onload = function () {
        currentAvatar = reader.result;
        avatarPath.value = currentAvatar;

        avatarPreview.innerHTML = `
            <img
                src="${currentAvatar}"
                alt="Contact photo"
                class="w-100 h-100 rounded-circle object-fit-cover"
            >
        `;
    };

    reader.onerror = function () {
        Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "Please try another image."
        });
    };

    reader.readAsDataURL(file);
});

// 9. Validation Functions
function setFieldError(input, errorId, isInvalid, message) {
    var errorElement = document.getElementById(errorId);

    input.classList.toggle("is-invalid", isInvalid);

    input.classList.toggle(
        "is-valid",
        !isInvalid && input.value.trim() !== ""
    );

    if (errorElement) {
        if (message) {
            errorElement.textContent = message;
        }

        errorElement.classList.toggle("d-none", !isInvalid);
    }
}

// Validate Name
function validateName() {
    var value = contactName.value.trim();

    var valid = /^[\p{L}][\p{L}\s.'-]{1,49}$/u.test(value);

    setFieldError(
        contactName,
        "contactNameError",
        !valid,
        "Please enter a valid name."
    );

    return valid;
}

// Validate Phone
function validatePhone() {
    var value = normalizePhone(contactPhone.value.trim());

    var egyptianMobile = /^(?:\+?20|0)?1[0125]\d{8}$/.test(value);

    var internationalPhone = /^\+?[1-9]\d{7,14}$/.test(value);

    var valid = egyptianMobile || internationalPhone;

    setFieldError(
        contactPhone,
        "contactPhoneError",
        !valid,
        "Please enter a valid phone number."
    );

    return valid;
}

// Validate Email
function validateEmail() {
    var value = contactEmail.value.trim();

    var valid =
        value === "" ||
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    setFieldError(
        contactEmail,
        "contactEmailError",
        !valid,
        "Please enter a valid email address."
    );

    return valid;
}

// Clear Validation Errors
function clearFormErrors() {
    var inputs = [
        contactName,
        contactPhone,
        contactEmail
    ];

    inputs.forEach(function (input) {
        input.classList.remove("is-invalid", "is-valid");
    });

    var errorIds = [
        "contactNameError",
        "contactPhoneError",
        "contactEmailError"
    ];

    errorIds.forEach(function (id) {
        var element = document.getElementById(id);

        if (element) {
            element.classList.add("d-none");
        }
    });
}

// Validate While Typing
contactName.addEventListener("input", validateName);
contactPhone.addEventListener("input", validatePhone);
contactEmail.addEventListener("input", validateEmail);

// 10. Add Or Update Contact
submitModalBtn.addEventListener("click", saveContact);

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveContact();
});

function saveContact() {
    var nameIsValid = validateName();
    var phoneIsValid = validatePhone();
    var emailIsValid = validateEmail();

    if (!nameIsValid || !phoneIsValid || !emailIsValid) {
        Swal.fire({
            icon: "warning",
            title: "Check Your Details",
            text: "Please correct the highlighted fields."
        });

        return;
    }

    var editingId = contactId.value;
    var phone = contactPhone.value.trim();
    var email = contactEmail.value.trim();

    // Check Duplicate Phone Or Email
    var duplicate = contacts.find(function (contact) {
        var samePhone =
            normalizePhone(contact.phone) === normalizePhone(phone);

        var sameEmail =
            email &&
            contact.email &&
            contact.email.toLowerCase() === email.toLowerCase();

        return contact.id !== editingId && (samePhone || sameEmail);
    });

    if (duplicate) {
        Swal.fire({
            icon: "warning",
            title: "Contact Already Exists",
            text: "This phone number or email is already saved."
        });

        return;
    }

    // Create Contact Object
    var contactData = {
        id: editingId || (
            window.crypto && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString()
        ),

        name: contactName.value.trim(),
        phone: phone,
        email: email,
        address: contactAddress.value.trim(),
        group: contactGroup.value,
        notes: contactNotes.value.trim(),

        favorite: contactFavorite.checked,
        emergency: contactEmergency.checked,

        avatar: currentAvatar,
        updatedAt: new Date().toISOString()
    };

    // Update Existing Contact
    if (isEditing && editingId) {
        var index = contacts.findIndex(function (contact) {
            return contact.id === editingId;
        });

        if (index !== -1) {
            contacts[index] = Object.assign(
                {},
                contacts[index],
                contactData
            );
        } else {
            contacts.push(contactData);
        }

    } else {
        // Add New Contact
        contactData.createdAt = new Date().toISOString();
        contacts.push(contactData);
    }

    // Save And Refresh
    if (!saveContacts()) {
        return;
    }

    renderApp();
    closeModal();

    showSuccess(
        isEditing ? "Contact Updated!" : "Contact Added!",
        isEditing
            ? "The contact was updated successfully."
            : "The new contact was saved successfully."
    );
}

// 11. Render Contact Cards
function renderContacts() {
    var searchTerm = searchInput.value.trim().toLowerCase();

    var filteredContacts = contacts.filter(function (contact) {
        var name = (contact.name || "").toLowerCase();
        var phone = (contact.phone || "").toLowerCase();
        var email = (contact.email || "").toLowerCase();

        return (
            name.includes(searchTerm) ||
            phone.includes(searchTerm) ||
            email.includes(searchTerm)
        );
    });


    // Empty State
    if (filteredContacts.length === 0) {
        contactCardContainer.innerHTML = `
            <div class="col-12 text-center py-5">

                <div
                    class="d-flex align-items-center justify-content-center
                           mx-auto mb-4 bg-secondary-subtle rounded-4"
                    style="width:80px;height:80px;"
                >
                    <i class="fas fa-address-book text-secondary fs-4"></i>
                </div>

                <p class="text-muted fw-semibold mb-1">
                    ${searchTerm ? "No contacts found" : "No contacts yet"}
                </p>

                <p class="text-secondary small">
                    ${searchTerm
                ? "Try another name, phone number, or email."
                : 'Click <strong>"Add Contact"</strong> to get started.'
            }
                </p>

            </div>
        `;

        return;
    }


    // Create Cards
    contactCardContainer.innerHTML = filteredContacts.map(function (contact) {
        var avatar;

        if (contact.avatar) {
            avatar = `
                <img
                    src="${contact.avatar}"
                    alt="${escapeHTML(contact.name)}"
                    class="contact-card-avatar object-fit-cover"
                >
            `;
        } else {
            avatar = `
                <div
                    class="contact-card-avatar d-flex
                           align-items-center justify-content-center
                           rounded-3 bg-primary-subtle text-primary fw-bold"
                >
                    ${escapeHTML(contact.name.charAt(0).toUpperCase())}
                </div>
            `;
        }


        return `
        <div class="col-md-6 col-lg-12 col-xl-6 mb-4">

            <article class="contact-card">

                <div class="contact-card-header">

                    <div class="d-flex align-items-start gap-3">

                        <div class="position-relative flex-shrink-0">

                            ${avatar}

                            ${contact.emergency? `
                                    <div
                                        class="badge-icon badge-heart
                                               d-flex justify-content-center
                                               align-items-center rounded-circle"
                                        title="Emergency"
                                    >
                                        <i class="fas fa-heart-pulse"></i>
                                    </div>
                                    `: ""}

                            ${contact.favorite? `
                                    <div
                                        class="badge-icon badge-star
                                               d-flex justify-content-center
                                               align-items-center rounded-circle"
                                        title="Favorite"
                                    >
                                        <i class="fas fa-star"></i>
                                    </div>
                                    `: ""}

                        </div>


                        <div class="flex-grow-1 min-w-0 pt-1">

                            <h3 class="contact-card-name truncate m-0">
                                ${escapeHTML(contact.name)}
                            </h3>

                            <div class="d-flex align-items-center gap-2 mt-1">

                                <div class="contact-card-phone-container flex-shrink-0">
                                    <i class="contact-card-phone-icon fas fa-phone"></i>
                                </div>

                                <span class="contact-card-phone truncate">
                                    ${escapeHTML(contact.phone)}
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="contact-details">

                        ${contact.email? `
                                <div class="contact-detail-item">

                                    <div
                                        class="contact-detail-icon-container
                                               d-flex align-items-center
                                               justify-content-center violet">
                                        <i class="contact-detail-icon violet fas fa-envelope"></i>
                                    </div>

                                    <span class="contact-detail-text truncate">
                                        ${escapeHTML(contact.email)}
                                    </span>

                                </div>`: ""}


                        ${contact.address? `
                                <div class="contact-detail-item">

                                    <div
                                        class="contact-detail-icon-container
                                               d-flex align-items-center
                                               justify-content-center emerald"
                                    >
                                        <i class="contact-detail-icon emerald fas fa-location-dot"></i>
                                    </div>

                                    <span class="contact-detail-text truncate">
                                        ${escapeHTML(contact.address)}
                                    </span>

                                </div>`: ""}

                    </div>


                    <div class="contact-tags d-flex flex-wrap gap-2">

                        ${contact.group? `
                                <span class="contact-tag d-inline-flex
                                             align-items-center bg-success-subtle
                                             text-success">
                                    ${escapeHTML(contact.group)}
                                </span>
                                `: ""}

                        ${contact.emergency? `
                                <span class="contact-emergency d-inline-flex align-items-center">
                                    Emergency
                                </span>`: ""}

                    </div>


                    ${contact.notes? `
                            <p class="text-muted small mt-2 mb-0">
                                ${escapeHTML(contact.notes)}
                            </p>
                            `: ""}

                </div>


                <div class="contact-card-actions">

                    <div class="action-buttons-left">

                        <a
                            href="tel:${escapeHTML(normalizePhone(contact.phone))}"
                            class="action-button call"
                            title="Call"
                            aria-label="Call ${escapeHTML(contact.name)}"
                        >
                            <i class="fas fa-phone"></i>
                        </a>

                        ${contact.email? `
                                <a
                                    href="mailto:${escapeHTML(contact.email)}"
                                    class="action-button email"
                                    title="Email"
                                    aria-label="Email ${escapeHTML(contact.name)}"
                                >
                                    <i class="fas fa-envelope"></i>
                                </a>
                                `: ""}

                    </div>


                    <div class="action-buttons-right">

                        <button
                            type="button"
                            class="action-button favorite"
                            data-action="favorite"
                            data-id="${escapeHTML(contact.id)}"
                            title="Toggle Favorite">
                            <i class="${contact.favorite ? "fas text-warning" : "far"} fa-star"></i>
                        </button>


                        <button
                            type="button"
                            class="action-button emergency"
                            data-action="emergency"
                            data-id="${escapeHTML(contact.id)}"
                            title="Toggle Emergency">
                            <i class="${contact.emergency ? "fas text-danger" : "far"} fa-heart"></i>
                        </button>

                        <button
                            type="button"
                            class="action-button edit"
                            data-action="edit"
                            data-id="${escapeHTML(contact.id)}"
                            title="Edit"
                        >
                            <i class="fas fa-pen"></i>
                        </button>


                        <button
                            type="button"
                            class="action-button delete"
                            data-action="delete"
                            data-id="${escapeHTML(contact.id)}"
                            title="Delete"
                        >
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>

                </div>

            </article>

        </div>
        `;
    }).join("");
}

// 12. Render Favorites And Emergency Lists
function renderSidebarList(container, list, type) {
    var isFavorite = type === "favorite";

    var emptyMessage = isFavorite
        ? "No favorites yet"
        : "No emergency contacts";

    var cardClass = isFavorite
        ? "contact-item"
        : "contact-item-emergency";

    var callClass = isFavorite
        ? "call-btn"
        : "call-btn-emergency call-btn-rose";


    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <p class="text-muted mb-0">${emptyMessage}</p>
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML = list.map(function(contact) {
        var avatar;

        if (contact.avatar) {
            avatar = `
                <img
                    src="${contact.avatar}"
                    alt="${escapeHTML(contact.name)}"
                    class="contact-avatar"
                >
            `;
        } else {
            avatar = `
                <div
                    class="contact-avatar d-flex align-items-center
                           justify-content-center bg-primary-subtle
                           text-primary fw-bold"
                >
                    ${escapeHTML(contact.name.charAt(0).toUpperCase())}
                </div>
            `;
        }


        return `
            <div class="col-12">

                <div
                    class="${cardClass} d-flex align-items-center
                            justify-content-between gap-3 p-2 rounded-3 mb-3"
                >

                    <div class="flex-shrink-0">
                        ${avatar}
                    </div>

                    <div class="flex-grow-1 text-truncate">

                        <h4 class="mb-0 fw-medium text-dark small text-truncate">
                            ${escapeHTML(contact.name)}
                        </h4>

                        <p class="mb-0 text-muted small text-truncate">
                            ${escapeHTML(contact.phone)}
                        </p>

                    </div>

                    <a
                        href="tel:${escapeHTML(normalizePhone(contact.phone))}"
                        class="${callClass} d-flex align-items-center
                               justify-content-center flex-shrink-0"
                        aria-label="Call ${escapeHTML(contact.name)}"
                    >
                        <i class="fas fa-phone"></i>
                    </a>

                </div>

            </div>
        `;
    }).join("");
}

// 13. Update Statistics
function renderStats() {
    totalContacts.textContent = contacts.length;

    totalFavContacts.textContent = contacts.filter(function(contact) {
        return contact.favorite;
    }).length;

    totalEmergencyContacts.textContent = contacts.filter(function(contact) {
        return contact.emergency;
    }).length;

    totalContactsSpan.textContent = contacts.length;
}

// 14. Render Complete Application
function renderApp() {
    renderStats();

    renderContacts();

    renderSidebarList(
        bigFavItem,
        contacts.filter(function(contact) {
            return contact.favorite;
        }),
        "favorite"
    );

    renderSidebarList(
        bigEmergencyItem,
        contacts.filter(function(contact) {
            return contact.emergency;
        }),
        "emergency"
    );
}

// 15. Contact Card Buttons
contactCardContainer.addEventListener("click", async function(event) {
    var button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    var action = button.dataset.action;
    var id = button.dataset.id;

    var contact = contacts.find(function(item) {
        return item.id === id;
    });

    if (!contact) {
        return;
    }

    // Edit Contact
    if (action === "edit") {
        openModal(contact);
        return;
    }

    // Toggle Favorite
    if (action === "favorite") {
        contact.favorite = !contact.favorite;

        if (!saveContacts()) {
            contact.favorite = !contact.favorite;
            return;
        }

        renderApp();

        showSuccess(
            contact.favorite
                ? "Added To Favorites"
                : "Removed From Favorites",

            contact.favorite
                ? contact.name + " was added to your favorites."
                : contact.name + " was removed from your favorites."
        );

        return;
    }

    // Toggle Emergency
    if (action === "emergency") {
        contact.emergency = !contact.emergency;

        if (!saveContacts()) {
            contact.emergency = !contact.emergency;
            return;
        }

        renderApp();

        showSuccess(
            contact.emergency
                ? "Emergency Contact Added"
                : "Emergency Status Removed",

            contact.emergency
                ? contact.name + " is now an emergency contact."
                : contact.name + " is no longer an emergency contact."
        );

        return;
    }

    // Delete Contact
    if (action === "delete") {
        var result = await Swal.fire({
            title: "Are You Sure?",
            text: "Do you want to delete " + contact.name + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Delete It!",
            cancelButtonText: "Cancel",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            var oldContacts = contacts;

            contacts = contacts.filter(function(item) {
                return item.id !== id;
            });

            if (!saveContacts()) {
                contacts = oldContacts;
                renderApp();
                return;
            }

            renderApp();

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "The contact has been deleted.",
                timer: 1800,
                showConfirmButton: false
            });
        }
    }
});

// 16. Search Contacts
searchInput.addEventListener("input", function() {
    renderContacts();
});

// 17. Start Application
renderApp();