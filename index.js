const mysql = require('mysql');
const inquirer = require("inquirer");
require('dotenv').config();
require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const menu = () => {
    inquirer.prompt([{
            name: "selection",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Employees", "Add to Database", "Remove from Database", "Update Employee Role", "View Department Budgets (BETA)", "Exit"]
        }])
        .then(choice => {
            switch (choice.selection) {
                case "View Employees":
                    inquirer.prompt({
                        name: "employeeView",
                        type: "list",
                        message: "Would you like to:",
                        choices: ["View All Employees", "View Employees by Department", "View Employees by Role", "View Employees by Manager"]
                    }).then(type => {
                        switch (type.employeeView) {
                            case "View All Employees":
                                viewEmployees()
                                break;
                            case "View Employees by Department":
                                viewEmployeesDepartment()
                                break;
                            case "View Employees by Role":
                                viewEmployeesRole()
                                break;
                            case "View Employees by Manager":
                                viewEmployeesManager()
                                break;
                        }
                    })
                    break;
                case "Add to Database":
                    inquirer.prompt({
                        name: "addType",
                        type: "list",
                        message: "Would you like to:",
                        choices: ["Add Employee", "Add Department", "Add Role", ]
                    }).then(type => {
                        switch (type.addType) {
                            case "Add Employee":
                                addEmployee()
                                break;
                            case "Add Department":
                                addDepartment()
                                break;
                            case "Add Role":
                                addRole()
                                break;
                        }
                    })
                    break;
                case "Remove from Database":
                    inquirer.prompt({
                        name: "removeType",
                        type: "list",
                        message: "Would you like to:",
                        choices: ["Add Employee", "Add Department", "Add Role", ]
                    }).then(type => {
                        switch (type.addType) {
                            case "Remove Employee":
                                removeEmployee()
                                break;
                            case "Remove Department":
                                removeDepartment()
                                break;
                            case "Remove Role":
                                removeRole()
                                break;
                        }
                    })
                    break;
                case "Update Employee Role":
                    updateEmployee()
                    break;
                case "View Department Budgets (BETA)":
                    viewBudget()
                    break;
                case "Exit":
                    console.log("Thanks for using the employee manager!")
                    process.exit();
                    break;
            }
        })
}

const viewEmployees = () => {
    const query = `select employee.id, employee.first_name as "First Name", employee.last_name as "Last Name", role.title as "Role", role.salary as "Salary", concat(manager.first_name, " ", manager.last_name) as "Manager", department.name as "Department" from employee inner join role on role_id = role.id join department on role.department_id = department.id left join employee manager ON manager.id = employee.manager_id;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        menu();
    });
}
const viewEmployeesDepartment = () => { 
    connection.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;
    inquirer.prompt({
            name: "department",
            type: "list",
            message: "View employees in which department?",
            choices: departments.map((department) => ({
                value: department.name,
                name: `${department.name}`
            }))
    })
    .then(answers => {
        console.log(`Showing employees who work in ${answers.department}`)
        let query = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, 
role.title AS title FROM employee JOIN role 
ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE ? order by id`;

        connection.query(query, { name: answers.department }, function (err, res) {
            if (err) throw err;
            
                console.table(res);
            menu();
        });
    });
})};
connection.connect((err) => {
    if (err) throw err;
    menu();
});