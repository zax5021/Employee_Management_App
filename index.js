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
                        choices: ["Remove Employee", "Remove Department", "Remove Role", ]
                    }).then(type => {
                        switch (type.removeType) {
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
    console.log("\n-----------------------\n")
    const query = `select employee.id, employee.first_name as "First Name", employee.last_name as "Last Name", role.title as "Role", role.salary as "Salary", concat(manager.first_name, " ", manager.last_name) as "Manager", department.name as "Department" from employee inner join role on role_id = role.id join department on role.department_id = department.id left join employee manager ON manager.id = employee.manager_id;`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log("\n-----------------------\n")
        menu();
    });
}
const viewEmployeesDepartment = () => {
    console.log("\n-----------------------\n")
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
                console.log("\n-----------------------\n")
                console.log(`Showing employees who work in ${answers.department}`)
                let query = `SELECT employee.id AS "Employee ID", employee.first_name AS "First Name", employee.last_name AS "Last Name", 
role.title AS "Title" FROM employee JOIN role 
ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE ? order by employee.id`;

                connection.query(query, {
                    name: answers.department
                }, (err, res) => {
                    if (err) throw err;
                    console.log("-----------------------\n")
                    console.table(res);
                    console.log("\n-----------------------\n")
                    menu();
                });
            });
    })
};
const viewEmployeesRole = () => {
    console.log("\n-----------------------\n")
    connection.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;
        inquirer.prompt({
                name: "role",
                type: "list",
                message: "View employees in which role?",
                choices: roles.map((role) => ({
                    value: role.title,
                    name: `${role.title}`
                }))
            })
            .then(answers => {
                // console.log(answers)
                let query = `select employee.id as ID, employee.first_name as "First Name", employee.last_name as "Last Name" from employee left join role on employee.role_id = role.id where ? order by employee.id;`;

                connection.query(query, {
                    title: answers.role
                }, (err, res) => {
                    if (err) throw err;
                    // if(res[0] === null) {
                    //     console.log(`There are currently no employees with the title ${answers.role}`)
                    //     menu();
                    // } 
                    console.log(`\nShowing employees with the title ${answers.role}`)
                    // console.log(res)
                    console.table(res);
                    console.log("\n-----------------------\n")
                    menu();
                });
            });
    })
};
const viewEmployeesManager = () => {
    connection.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;
        inquirer.prompt({
                name: "manager",
                type: "list",
                message: "See employees under which manager?",
                choices: employees.map((employee) => ({
                    value: employee.id,
                    name: `${employee.last_name}, ${employee.first_name}`
                }))
            })
            .then(answer => {
                const query = 'select id as "Employee ID", first_name as "First Name", last_name as "Last Name" from employee where manager_id = ?;';
                connection.query(query, answer.manager, (err, employees) => {
                    if (err) throw err;
                    console.log("\n-----------------------\n")
                    console.table(employees)
                    console.log("-----------------------\n")
                    menu();
                });
            });
    });
}

const addEmployee = () => {
    console.log("\n-----------------------\n")
    connection.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;
        connection.query('SELECT * FROM employee', (err, employees) => {
            if (err) throw err;
            inquirer.prompt([{
                        name: "firstName",
                        type: "input",
                        message: "What is the employee's first name?"
                    },
                    {
                        name: "lastName",
                        type: "input",
                        message: "What is the employee's last name?"
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "Select a role for the employee:",
                        choices: roles.map((role) => ({
                            value: role.id,
                            name: `${role.title}`
                        }))
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Select a manager for the employee:",
                        //how to only show employees in the same department as the role selected? Not enough time to figure out. Also, how to use null as an option.
                        choices: employees.map((employee) => ({
                            value: employee.id,
                            name: `${employee.last_name}, ${employee.first_name}`
                        }))
                    }
                ])
                .then(answer => {
                    connection.query(`insert into employee set ?`, {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: answer.role,
                        manager_id: answer.manager
                    }, (err, res) => {
                        if (err) throw err;
                        console.log("\n-----------------------\n")
                        console.log("New Employee Added!")
                        menu();
                    })
                });
        });
    });
};

const addDepartment = () => {
    inquirer
        .prompt({
            name: "departmentName",
            type: "input",
            message: "What is the name of the new department?"
        })


        .then(answer => {

            connection.query(
                "INSERT INTO department SET ?", {
                    name: answer.departmentName,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log("\n-----------------------\n")
                    console.log("New department added!")
                    console.log("\n-----------------------\n")
                    menu();
                }
            );
        });
}

const addRole = () => {
    console.log("\n-----------------------\n")
    connection.query(`SELECT id, department.name FROM department`, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([{
                    name: "name",
                    type: "input",
                    message: "What is the name of the role?"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "What is the role's salary?"
                },
                {
                    name: "department",
                    type: "list",
                    message: "Which department to add the role?",
                    choices: departments.map((department) => ({
                        value: department.id,
                        name: `${department.name}`
                    }))
                }
            ])
            .then(answer => {
                connection.query(`INSERT INTO role SET ?`, {
                        title: answer.name,
                        salary: answer.salary,
                        department_id: answer.department
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("\n-----------------------\n")
                        console.log("The role has been added!")
                        console.log("\n-----------------------\n")
                        menu();
                    }
                );
            });
    })
}

const removeEmployee = () => {

    connection.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;
        inquirer.prompt({
                name: "removedEmployee",
                type: "list",
                message: "Which employee would you like to remove?",
                choices: employees.map((employee) => ({
                    value: employee.id,
                    name: `${employee.last_name}, ${employee.first_name}`
                }))
            })
            .then(answer => {
                connection.query(`delete from employee where ?`, {
                        id: answer.removedEmployee
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("\n-----------------------\n")
                        console.log(`The employee has been deleted...`)
                        console.log("\n-----------------------\n")
                        menu();
                    }
                );
            })
    });
}
const removeRole = () => {

    connection.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;
        inquirer.prompt({
                name: "removedRole",
                type: "list",
                message: "Which role would you like to remove?",
                choices: roles.map((role) => ({
                    value: role.id,
                    name: `${role.title}`
                }))
            })
            .then(answer => {
                connection.query(`delete from role where ?`, {
                        id: answer.removedRole
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("\n-----------------------\n")
                        console.log(`The role has been deleted...`)
                        console.log("\n-----------------------\n")
                        menu();
                    }
                );
            })
    });
}
const removeDepartment = () => {

    connection.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;
        inquirer.prompt({
                name: "removedDepartment",
                type: "list",
                message: "Which department would you like to remove?",
                choices: departments.map((department) => ({
                    value: department.id,
                    name: `${department.name}`
                }))
            })
            .then(answer => {
                connection.query(`delete from department where ?`, {
                        id: answer.removedDepartment
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("\n-----------------------\n")
                        console.log(`The department has been deleted...`)
                        console.log("\n-----------------------\n")
                        menu();
                    }
                );
            })
    });
}

const updateEmployee = () => {
    console.log("\n-----------------------\n")
    connection.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;
        connection.query('SELECT * FROM employee', (err, employees) => {
            if (err) throw err;
            inquirer.prompt([{
                        name: "updatedEmployee",
                        type: "list",
                        message: "Which employee would you like to update?",
                        choices: employees.map((employee) => ({
                            value: employee.id,
                            name: `${employee.last_name}, ${employee.first_name}`
                        }))
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "Select a role for the employee:",
                        choices: roles.map((role) => ({
                            value: role.id,
                            name: `${role.title}`
                        }))
                    }
                ])
                .then(answer => {
                    connection.query(`UPDATE employee SET role_id = ? WHERE id = ?`,
                        [answer.role, answer.updatedEmployee],
                        (err, res) => {
                            if (err) throw err;
                            console.log("\n-----------------------\n")
                            console.log("The employee's role has been updated!")
                            console.log("\n-----------------------\n")
                            menu();
                        })
                });
        });
    });
};
const viewBudget = () => {
    const query = `select department.name as "Department", SUM(role.salary) as "Salary" from employee inner join role on role_id = role.id join department on role.department_id = department.id group By department.name;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nHere are the current weekly budgets.")
        console.log("-----------------------\n")
        console.table(res);
        console.log("-----------------------\n")
        menu();
    });
}

connection.connect((err) => {
    if (err) throw err;
    menu();
});