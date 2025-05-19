import {Express, Request, Response} from 'express';
import express from 'express';
import * as mysql from 'mysql2/promise'

// Hier wird die Verbindung zur Datenbank hergestellt
let database: mysql.Connection;
mysql.createConnection({
    user: 'mark.maron@mni.thm.de',
    password: 'mmrn45',
    database: 'WebP2_mmrn45',
    host: 'ip1-dbs.mni.thm.de'
}).then(connection => {
    database = connection;
}).catch(err => {
    console.log("Fehler im Verbindungsaufbau: ", err);
});

// Standard PORT 8080
const PORT: number = 8080;
const app : Express = express();
app.listen(PORT,() => {
    console.log(`[server]: Server started: http://localhost:${PORT}`)
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/", express.static("public"));

app.get("/user/:email", getUserByEmail);
app.get("/user", getAllUser);
app.post("/user", postUserByEmail);
app.put("/user/:email", putUserByEmail);
app.delete("/user/:email", deleteUserByEmail);


async function getUserByEmail(req: Request, res: Response): Promise<void> {
    // Read data from request parameters
    const email: string = req.params.email;

    // Search user in database

    try {
        // Der query-Befehl erwartet einen SQL-Befehl als String und ggf. ein Array mit den einzusetzenden Werten
        const result: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await database.query<mysql.RowDataPacket[]>("SELECT * FROM User WHERE email = ?", [email]);
        // Das RowDataPacket enthält bei SELECT-Abfragen die gewünschten Werte
        const rows: mysql.RowDataPacket[] = result[0];
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404);
            res.send("User not found");
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

// Da nur in dieser Route keine Infos aus dem Request benötigt werden, wird der Parameter req mit einem _ als ungenutzt aber notwendig gekennzeichnet
async function getAllUser(_req: Request, res: Response): Promise<void> {
    try {
        const result: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await database.query<mysql.RowDataPacket[]>("SELECT email FROM User");
        const rows: mysql.RowDataPacket[] = result[0];
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404);
            res.send("User not found");
        }
    } catch
        (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function postUserByEmail(req: Request, res: Response): Promise<void> {
    const firstName: string = req.body.firstName;
    const email: string = req.body.email;
    const lastName: string = req.body.lastName;
    const password: string = req.body.password;

    try {
        await database.query<mysql.ResultSetHeader>("INSERT INTO User (firstName, email, lastName, password) VALUES (?, ?, ?, ?)", [firstName, email, lastName, password]);
        // Wird eine ID per Autoincrement von der Datenbank vergeben, so stünde Sie in result[0].insertId
        res.location("/user/" + encodeURI(email));
        res.sendStatus(201);
    } catch (err) {
        // Erwartbare Fehler können durch Ihre Fehlercodes speziell verarbeitet werden
        if (err.errno == 1048) {
            res.status(422);
            res.send("Values are not defined: " + err.sqlMessage);
        } else if (err.errno == 1062) {
            res.status(409);
            res.send("User already exists: " + err.sqlMessage);
        } else {
            // Unerwartete Fehler sind z.B. auf eine nicht (mehr) erreichbare Datenbank zurückzuführen und werden pauschal beantwortet
            res.sendStatus(500);
            console.log(err);
        }
    }
}


async function putUserByEmail(req: Request, res: Response): Promise<void> {

    const oldEmail: string = req.params.email;
    const newEmail: string = req.body.email;

    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const password: string = req.body.password;


    try {
        const result: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await database.query<mysql.ResultSetHeader>("UPDATE User SET firstName = ?, email = ?, lastName = ?, password = ? WHERE email = ?", [firstName, newEmail, lastName, password, oldEmail])
        // Bei anderen Befehlen als dem SELECT gibt es das Feedback der Datenbank nur als ResultSetHeader
        if (result[0].affectedRows > 0) {
            res.location("/user/" + encodeURI(newEmail));
            res.sendStatus(200);
        } else {
            res.status(404);
            res.send("User not found");
        }
    } catch (err) {
        if (err.errno == 1048) {
            res.status(422);
            res.send("Values are not defined: " + err.sqlMessage);
        } else if (err.errno == 1062) {
            res.status(409);
            res.send("User already exists: " + err.sqlMessage);
        } else {
            res.sendStatus(500);
            console.log(err);
        }
    }
}

async function deleteUserByEmail(req: Request, res: Response): Promise<void> {
    const email: string = req.params.email;
    try {
        const result: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await database.query<mysql.ResultSetHeader>("DELETE FROM User WHERE email = ?", [email])
        if (result[0].affectedRows > 0) {
            res.sendStatus(204);
        } else {
            res.status(404);
            res.send("User not found");
        }
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }

}

// Neue Routenstruktur
app.post("/user/:email/pet", createPetForUser);
app.get("/user/:email/pet", getPetsByUser);
app.delete("/user/:email/pet/:name", deletePetForUser);


// Alle Haustiere eines Users abrufen

async function getPetsByUser(req: Request, res: Response): Promise<void> {
    // Read data from request parameters
    const email: string = req.params.email;

    // Search user in database
    try {
        // Der query-Befehl erwartet einen SQL-Befehl als String und ggf. ein Array mit den einzusetzenden Werten
        const result: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await database.query<mysql.RowDataPacket[]>("SELECT * FROM Pet WHERE email = ?", [email]);
        // Das RowDataPacket enthält bei SELECT-Abfragen die gewünschten Werte
        const rows: mysql.RowDataPacket[] = result[0];
        if (rows.length > 0) {
//          res.json(rows[0]); // ❌ gibt nur ein Pet zurück
            res.json(rows);
        } else {
            res.status(404);
            res.send("User not found");
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

// Haustier für bestimmten User erstellen
async function createPetForUser(req: Request, res: Response): Promise<void> {
    const email: string = req.params.email;
    const name: string = req.body.name;
    const kind: string = req.body.kind;

    try {
        await database.query<mysql.ResultSetHeader>("INSERT INTO Pet (name, kind, email) VALUES (?, ?, ?)", [name, kind, email]);
        // Wird eine ID per Autoincrement von der Datenbank vergeben, so stünde Sie in result[0].insertId

        //     res.location("/user/" + encodeURI(email) + /pet/ + encodeURI(name)); // ❌ falsche Syntax
        res.location(`/user/${encodeURIComponent(email)}/pet/${encodeURIComponent(name)}`);
        res.sendStatus(201);
    } catch (err) {
        // Erwartbare Fehler können durch Ihre Fehlercodes speziell verarbeitet werden
        if (err.errno == 1048) {
            res.status(422);
            res.send("User email not found (foreign key)" + err.sqlMessage);
        } else if (err.errno == 1062) {
            res.status(409);
            res.send("Pet with this name already exists" + err.sqlMessage);
        } else {
            // Unerwartete Fehler sind z.B. auf eine nicht (mehr) erreichbare Datenbank zurückzuführen und werden pauschal beantwortet
            res.sendStatus(500);
            console.log(err);
        }
    }

}

// Ein bestimmtes Haustier eines Users löschen
async function deletePetForUser(req: Request, res: Response): Promise<void> {
    const email: string = req.params.email;
    const name: string = req.params.name;

    try {
        const result: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await database.query<mysql.ResultSetHeader>("DELETE FROM Pet WHERE email = ? AND name = ?", [email, name])
        if (result[0].affectedRows > 0) {
            res.sendStatus(204);
        } else {
            res.status(404);
            res.send("Pet not found for this user");
        }
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }

}