USE filenest;

# Creating DB Structure:

CREATE TABLE `Role` (
  `role_id` INT AUTO_INCREMENT,
  `name` VARCHAR(256),
  PRIMARY KEY (`role_id`)
);

CREATE TABLE `Account` (
  `account_id` INT AUTO_INCREMENT,
  `username` VARCHAR(20),
  `password` VARCHAR(256),
  `email` VARCHAR(256),
  `role_id` INT,
  PRIMARY KEY (`account_id`),
  FOREIGN KEY (`role_id`) REFERENCES `Role`(`role_id`)
);

CREATE TABLE `Cluster` (
  `cluster_id` INT AUTO_INCREMENT,
  `name` VARCHAR(256),
  PRIMARY KEY (`cluster_id`)
);

CREATE TABLE `ServerCluster` (
  `server_cluster_id` INT AUTO_INCREMENT,
  `cluster_id` INT,
  `minIOServer_id` INT,
  PRIMARY KEY (`server_cluster_id`),
  FOREIGN KEY (`cluster_id`) REFERENCES `Cluster`(`cluster_id`),
  FOREIGN KEY ('minIOServer_id') REFERENCES 'MinIOServer'('minIOServer_id')
);

CREATE TABLE `File` (
  `file_id` INT AUTO_INCREMENT,
  `etag` VARCHAR(256),
  `name` VARCHAR(256),
  `file_type` VARCHAR(256),
  `size` VARCHAR(256),
  `last_modify` DATETIME,
  `owner_id` INT,
  `cluster_location_id` INT,
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `Account`(`account_id`),
  FOREIGN KEY (`cluster_location_id`) REFERENCES `Cluster`(`cluster_id`)
);

CREATE TABLE `MinIOServer` (
  `minIOServer_id` INT AUTO_INCREMENT,
  `name` VARCHAR(256),
  PRIMARY KEY (`minIOServer_id`)
);


# Initial Datasets:

# Initial Roles
INSERT INTO Role (name) VALUE ('admin');
INSERT INTO Role (name) VALUE ('member');

# Initial Development Accounts
INSERT INTO Account (username, password, email, role_id) VALUE ('root', 'secret', 'root@supersavesecurity.com',1);
INSERT INTO Account (username, password, email, role_id) VALUE ('testmember', 'member', 'member@supersavesecurity.com',2);