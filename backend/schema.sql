CREATE DATABASE IF NOT EXISTS day_planner;
USE day_planner;
CREATE TABLE IF NOT EXISTS admins(
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL);
CREATE TABLE IF NOT EXISTS places(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(100) NOT NULL,
  distance DECIMAL(5,1) NOT NULL,
  description TEXT, opening_times VARCHAR(80), travel_tips TEXT,
  latitude DECIMAL(9,6), longitude DECIMAL(9,6), image VARCHAR(255));
