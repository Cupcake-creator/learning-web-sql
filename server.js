const express = require("express");
const app = express();
const sql = require("mssql");

async function db_query(sql_query) {
    const config = {
        user: "useradmin",
        password: "1234",
        server: "JEZYDESKTOP",
        database: "Test",
        trustServerCertificate: true,
    };

    try {
        await sql.connect(config);
        const result = await sql.query(sql_query);
        console.log(result.recordset);
        return result.recordset;
    } catch (err) {
        console.error(err);
        throw "Error retrieving users from database";
    } finally {
        sql.close();
    }
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    result = await get_employee();

    context = {employeeName: "Not Have Any Employee"};

    if (result.length > 0) {
        context.employeeName = result[0].EmpName;
    }

    res.render("index", context);
});

app.get("/employee/new", async (req, res) => {
    res.render("employee_form");
});

app.post("/employee", async (req, res) => {
    console.log(req.body);
    res.send("Success");
});

app.get("/employee", async (req, res) => {
    try {
        const id = req.query.empnum;
        const name = req.query.employeeName;
        result = await get_employee(id, name);

        context = {employeeName: "Not Found Employee"};

        if (result.length > 0) {
            context.employeeName = result[0].EmpName;
        }

        res.render("index", context);
        // res.json(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/department", async (req, res) => {
    try {
        const query = req.query.depno;
        result = await get_department(query);
        res.json(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

async function get_employee(id = null, name = null) {
    sql_query = `SELECT *
                 FROM Employee
                 ORDER BY EmpNum`;

    if (id) sql_query = `SELECT *
                         FROM Employee
                         WHERE EmpNum = '${id}'`;
    if (name) sql_query = `SELECT *
                           FROM Employee
                           WHERE EmpName = '${name}'`;

    return await db_query(sql_query);
}

async function get_department(DepNo = "") {
    sql_query = "SELECT * FROM Department";
    if (DepNo) sql_query += ` WHERE DepNo = '${DepNo}'`;

    return await db_query(sql_query);
}

app.get("/query_db", async (req, res) => {
    const result = await db_query(
        "INSERT INTO EmployeeBackup (EmpNum, EmpName, Salary , Position ) SELECT EmpNum, EmpName, Salary , Position FROM Employee WHERE DepNo in ('20', '30')"
    );
    res.json(result);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
