let formEdit: HTMLFormElement;
let inputFName: HTMLInputElement;
let inputLName: HTMLInputElement;
let inputEmail: HTMLInputElement;
let inputPass: HTMLInputElement;
let inputEditFName: HTMLInputElement;
let inputEditLName: HTMLInputElement;
let inputEditEmail: HTMLInputElement;
let inputEditPass: HTMLInputElement;
let tableUser: HTMLElement;
let originalEmail: string;

// 🐾 Haustier
let formPet: HTMLFormElement;
let tablePets: HTMLElement;
let inputPetName: HTMLInputElement;
let inputPetType: HTMLInputElement;
let inputPetOwner: HTMLInputElement;

document.addEventListener("DOMContentLoaded", () => {
    // User
    tableUser = document.querySelector("#tableUser");
    formEdit = document.querySelector("#formEdit");
    inputFName = document.querySelector("#formInput [name='firstname']");
    inputLName = document.querySelector("#formInput [name='lastname']");
    inputEmail = document.querySelector("#formInput [name='email']");
    inputPass = document.querySelector("#formInput [name='password']");
    inputEditFName = document.querySelector("#formEdit [name='firstname']");
    inputEditLName = document.querySelector("#formEdit [name='lastname']");
    inputEditEmail = document.querySelector("#formEdit [name='email']");
    inputEditPass = document.querySelector("#formEdit [name='password']");

    document.querySelector("#formInput").addEventListener("submit", addUser);
    formEdit.addEventListener("submit", editUser);
    document.querySelector("#editClose").addEventListener("click", stopEdit);
    tableUser.addEventListener("click", (event: Event) => {
        let target = (event.target as HTMLElement).closest("button");
        if (target?.matches(".delete")) {
            deleteUser(target);
        } else if (target?.matches(".edit")) {
            startEdit(target);
        }
    });

    renderUserList();

    // Haustier
    formPet = document.querySelector("#formPet");
    tablePets = document.querySelector("#tablePets");
    inputPetName = document.querySelector("#formPet [name='name']");
    inputPetType = document.querySelector("#formPet [name='type']");
    inputPetOwner = document.querySelector("#formPet [name='ownerEmail']");

    formPet.addEventListener("submit", addPet);
    tablePets.addEventListener("click", (event: Event) => {
        const target = (event.target as HTMLElement).closest("button");
        if (target?.classList.contains("delete-pet")) {
            const email = target.dataset.email;
            const name = target.dataset.name;
            if (email && name) deletePet(email, name);
        }
    });

    renderPetList();
});

async function addUser(event: Event): Promise<void> {
    event.preventDefault();
    const firstName = inputFName.value;
    const lastName = inputLName.value;
    const email = inputEmail.value;
    const password = inputPass.value;

    try {
        const res = await fetch("http://localhost:8080/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        if (res.ok) {
            await renderUserList();
        } else {
            console.error("Fehler beim Hinzufügen:", res.status);
        }
    } catch (err) {
        console.error("Netzwerkfehler beim Hinzufügen des Users", err);
    }
}

async function startEdit(target: HTMLElement): Promise<void> {
    const email = target.dataset.email;
    try {
        const res = await fetch(`http://localhost:8080/user/${email}`);
        if (res.ok) {
            const user = await res.json();
            originalEmail = user.email;
            inputEditFName.value = user.firstName;
            inputEditLName.value = user.lastName;
            inputEditEmail.value = user.email;
            inputEditPass.value = user.password || "";
            formEdit.style.display = "block";
        }
    } catch (err) {
        console.error("Fehler beim Laden des Users", err);
    }
}

function stopEdit() {
    formEdit.style.display = "none";
}

async function editUser(event: Event): Promise<void> {
    event.preventDefault();
    const updatedEmail = inputEditEmail.value;
    const firstName = inputEditFName.value;
    const lastName = inputEditLName.value;
    const password = inputEditPass.value;

    try {
        const res = await fetch(`http://localhost:8080/user/${encodeURIComponent(originalEmail)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email: updatedEmail, password })
        });

        if (res.ok) {
            formEdit.style.display = "none";
            await renderUserList();
        }
    } catch (err) {
        console.error("Fehler beim Bearbeiten", err);
    }
}

async function deleteUser(target: HTMLElement): Promise<void> {
    const email = target.dataset.email;
    try {
        const res = await fetch(`http://localhost:8080/user/${email}`, {
            method: "DELETE"
        });

        if (res.ok) {
            await renderUserList();
            await renderPetList();
        }
    } catch (err) {
        console.error("Fehler beim Löschen", err);
    }
}

async function renderUserList(): Promise<void> {
    tableUser.innerHTML = "";

    try {
        const res = await fetch("http://localhost:8080/user");
        const emails: { email: string }[] = await res.json();

        for (const entry of emails) {
            const email = entry.email;
            const userRes = await fetch(`http://localhost:8080/user/${encodeURIComponent(email)}`);
            const user = await userRes.json();

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-primary delete" data-email="${user.email}"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-primary edit" data-email="${user.email}"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableUser.append(tr);
        }
    } catch (err) {
        console.error("Fehler beim Laden der Userliste:", err);
    }
}

// 🐾 Haustier hinzufügen
async function addPet(event: Event): Promise<void> {
    event.preventDefault();
    const name = inputPetName.value;
    const type = inputPetType.value;
    const ownerEmail = inputPetOwner.value;

    try {
        const res = await fetch(`http://localhost:8080/user/${encodeURIComponent(ownerEmail)}/pet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, kind: type })
        });

        if (res.ok) {
            await renderPetList();
            formPet.reset();
        } else {
            console.error("Fehler beim Hinzufügen des Haustiers:", res.status);
        }
    } catch (err) {
        console.error("Netzwerkfehler beim Haustier-Hinzufügen", err);
    }
}

// 🐾 Haustierliste laden
async function renderPetList(): Promise<void> {
    tablePets.innerHTML = "";

    try {
        const res = await fetch(`http://localhost:8080/user`);
        const users: { email: string }[] = await res.json();

        for (const u of users) {
            const email = u.email;
            const petRes = await fetch(`http://localhost:8080/user/${encodeURIComponent(email)}/pet`);
            if (!petRes.ok) continue;

            const pets: { name: string; kind: string }[] = await petRes.json();

            for (const pet of pets) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${pet.name}</td>
                    <td>${pet.kind}</td>
                    <td>${email}</td>
                    <td>
                        <button class="btn btn-danger delete-pet" data-email="${email}" data-name="${pet.name}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tablePets.appendChild(tr);
            }
        }
    } catch (err) {
        console.error("Fehler beim Laden der Haustierliste:", err);
    }
}

// 🗑️ Haustier löschen
async function deletePet(email: string, name: string): Promise<void> {
    try {
        const res = await fetch(`http://localhost:8080/user/${encodeURIComponent(email)}/pet/${encodeURIComponent(name)}`, {
            method: "DELETE"
        });

        if (res.ok) {
            await renderPetList();
        } else {
            console.error("Fehler beim Löschen des Haustiers:", res.status);
        }
    } catch (err) {
        console.error("Netzwerkfehler beim Haustierlöschen", err);
    }
}
