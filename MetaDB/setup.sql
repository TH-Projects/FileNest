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
  `start_node_id` INT,
  `end_node_id` INT,
  `memory_limit_reached` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`cluster_id`)
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
  `content_type` VARCHAR(500),
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `Account`(`account_id`),
  FOREIGN KEY (`cluster_location_id`) REFERENCES `Cluster`(`cluster_id`)
);

CREATE TABLE `MinIOServer` (
  `minIOServer_id` INT AUTO_INCREMENT,
  `address` VARCHAR(256),
  `cluster_id` INT,
  `connection_failure_datetime` DATETIME,
  PRIMARY KEY (`minIOServer_id`),
  FOREIGN KEY (`cluster_id`) REFERENCES `Cluster`(`cluster_id`)
);


# Initial Datasets:

# Initial Roles
INSERT INTO Role (name) VALUE ('admin');
INSERT INTO Role (name) VALUE ('member');

# Initial Development Accounts
# "root" pwd: "secret"
# "testmember" pwd: "member"
INSERT INTO Account (username, password, email, role_id) VALUE ('root', '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b', 'root@supersavesecurity.com',1);
INSERT INTO Account (username, password, email, role_id) VALUE ('testmember', 'e31ab643c44f7a0ec824b59d1194d60dac334200d845e61d2d289daa0f087ea4', 'member@supersavesecurity.com',2);
INSERT INTO Cluster (start_node_id, end_node_id) VALUE (1, 4);
INSERT INTO MinIOServer (address, cluster_id) VALUE ('minio1', 1);
INSERT INTO MinIOServer (address, cluster_id) VALUE ('minio2', 1);
INSERT INTO MinIOServer (address, cluster_id) VALUE ('minio3', 1);
INSERT INTO MinIOServer (address, cluster_id) VALUE ('minio4', 1);