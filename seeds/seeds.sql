USE employees_db;

INSERT INTO department (name)
VALUES ("Electronics"), ("Candy"), ("Woodworking"), ("Toys")

INSERT INTO role (title, salary, department_id)
VALUES ("assembly", 1500, 4), ("Soldering", 2200, 1), ("carpenter", 1800, 3), ("nailer", 1500, 3), ("designer", 2500, 3), ("engineer", 2500, 1), ("fun_director", 3300, 4), ("taster", 1300, 2), ("sugarer", 2100, 2), ("Father Christmas", 5500, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Santa", "Claus", 10, 1), ("Buddy", "The Elf", 7, 1), ("Bernard", "The Elf", 5, 1), ("Hermey", "The Elf", 1, 2), ("Jingle", "Bells", 6, 1), ("Jingle", "Bells", 2, 5);