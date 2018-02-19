CREATE DATABASE IF NOT EXISTS `mailkatcher` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `mailkatcher`;

CREATE TABLE IF NOT EXISTS `emails` (
  `EmailId` int(11) NOT NULL AUTO_INCREMENT,
  `Location` longtext NOT NULL,
  `From` varchar(128) DEFAULT NULL,
  `Subject` longtext,
  `CreatedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastTestId` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`EmailId`),
  KEY `From` (`From`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `emails_to` (
  `MappingId` int(11) NOT NULL AUTO_INCREMENT,
  `To` varchar(128) NOT NULL,
  `EmailId` int(11) NOT NULL,
  `CreatedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MappingId`),
  KEY `Mailbox` (`To`),
  KEY `Email` (`EmailId`),
  CONSTRAINT `Email` FOREIGN KEY (`EmailId`) REFERENCES `emails` (`EmailId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

